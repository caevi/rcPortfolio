"use client";

import { useEffect, useId, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { RC_ORB, RC_PATHS, RC_STROKE } from "./rcMark";

const DEPTH = 18; // number of extrusion layers

/**
 * Glossy, extruded 3D "RC" monogram with a red plasma orb.
 * Pure SVG + Framer Motion — no 3D library needed.
 *
 * - Floats gently and tilts toward the cursor; the extrusion shifts with the tilt.
 * - A light sheen sweeps across the face every few seconds.
 * - The plasma orb churns (animated SVG turbulence) and its glow pulses.
 * - Fully static for visitors who prefer reduced motion.
 */
export function RcLogo3D({ className = "", interactive = true }: { className?: string; interactive?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `rc-${name}-${uid}`;
  const ref = useRef<HTMLDivElement>(null);

  // Pointer position relative to the logo, -1..1, smoothed with springs.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 80, damping: 18, mass: 0.6 });

  const rotateY = useTransform(sx, (v) => v * 16);
  const rotateX = useTransform(sy, (v) => v * -12);
  // Extrusion direction: light from top-left by default, shifts opposite the tilt.
  const dx = useTransform(sx, (v) => 0.5 - v * 0.45);
  const dy = useTransform(sy, (v) => 0.8 - v * 0.45);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)) * 1.4;
      const ny = ((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)) * 1.4;
      px.set(Math.max(-1, Math.min(1, nx)));
      py.set(Math.max(-1, Math.min(1, ny)));
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [interactive, reduce, px, py]);

  const glyph = (stroke: string) =>
    RC_PATHS.map((d, i) => (
      <path
        key={i}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={RC_STROKE}
        strokeLinejoin="miter"
        strokeMiterlimit={2.2}
        strokeLinecap="butt"
      />
    ));

  const { cx, cy, r } = RC_ORB;

  return (
    <motion.div
      ref={ref}
      className={`relative select-none ${className}`}
      style={{ perspective: 900 }}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <motion.svg
        viewBox="-6 6 216 196"
        className="h-full w-full overflow-visible"
        style={reduce ? undefined : { rotateX, rotateY }}
      >
        <defs>
          <linearGradient id={id("face")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#383838" />
            <stop offset=".4" stopColor="#141414" />
            <stop offset="1" stopColor="#040404" />
          </linearGradient>

          {/* Thin bright outline around the silhouette only (not internal overlaps) */}
          <filter id={id("rim")} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="0.55" result="d" />
            <feComposite in="d" in2="SourceAlpha" operator="out" result="edge" />
            <feFlood floodColor="#fff" floodOpacity="0.5" />
            <feComposite in2="edge" operator="in" result="rim" />
            <feMerge>
              <feMergeNode in="rim" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={id("rimBack")} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="0.6" result="d" />
            <feComposite in="d" in2="SourceAlpha" operator="out" result="edge" />
            <feFlood floodColor="#fff" floodOpacity="0.18" />
            <feComposite in2="edge" operator="in" result="rim" />
            <feMerge>
              <feMergeNode in="rim" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".2" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={id("redglow")}>
            <stop offset="0" stopColor="#ff2d2d" stopOpacity=".9" />
            <stop offset="1" stopColor="#ff0000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("orbShade")} cx=".38" cy=".35" r=".7">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset=".35" stopColor="#fff" stopOpacity="0" />
            <stop offset=".7" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".8" />
          </radialGradient>
          <radialGradient id={id("spark")}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={id("faceMask")}>{glyph("#fff")}</mask>

          {/* Plasma: swirled turbulence tinted deep red with bright filaments, clipped to the orb */}
          <filter id={id("plasma")} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="turbulence" baseFrequency="0.07 0.11" numOctaves={3} seed={11} result="n">
              {!reduce && (
                <animate attributeName="baseFrequency" dur="9s" repeatCount="indefinite" values="0.07 0.11;0.09 0.08;0.07 0.11" />
              )}
            </feTurbulence>
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={1} seed={3} result="warp">
              {!reduce && (
                <animate attributeName="baseFrequency" dur="5s" repeatCount="indefinite" values="0.035;0.05;0.035" />
              )}
            </feTurbulence>
            <feDisplacementMap in="n" in2="warp" scale="22" xChannelSelector="R" yChannelSelector="G" result="swirl" />
            <feColorMatrix
              in="swirl"
              type="matrix"
              values="2.2 0 0 0 0.05  2.6 0 0 0 -0.95  2.4 0 0 0 -0.95  0 0 0 0 1"
              result="tint"
            />
            <feComposite in="tint" in2="SourceAlpha" operator="in" />
          </filter>
          <filter id={id("blur6")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={id("blur2")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="108" cy="196" rx="72" ry="7" fill="#000" opacity=".9" filter={`url(#${id("blur6")})`} />

        {/* Extrusion: stacked layers, darker toward the back */}
        {Array.from({ length: DEPTH }, (_, i) => DEPTH - i).map((k) => {
          const c = Math.round(20 - 14 * (k / DEPTH));
          return (
            <Layer key={k} k={k} dx={dx} dy={dy} filter={k === DEPTH ? `url(#${id("rimBack")})` : undefined}>
              {glyph(`rgb(${c},${c},${c})`)}
            </Layer>
          );
        })}

        {/* Front face */}
        <g filter={`url(#${id("rim")})`}>{glyph(`url(#${id("face")})`)}</g>

        {/* Light effects clipped to the face */}
        <g mask={`url(#${id("faceMask")})`}>
          {/* Motion on the wrapper so its CSS transform doesn't replace the rect's skew */}
          <motion.g
            initial={{ x: reduce ? 90 : -120 }}
            animate={reduce ? undefined : { x: [-120, 300] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.5 }}
          >
            <rect y="0" width="60" height="220" fill={`url(#${id("sheen")})`} transform="skewX(-20)" />
          </motion.g>
          <motion.circle
            cx="160"
            cy="132"
            r="38"
            fill={`url(#${id("redglow")})`}
            initial={{ opacity: 0.6 }}
            animate={reduce ? undefined : { opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* Energy trail along the leg */}
        <path d="M146,130 L180,138" stroke="#ff2a2a" strokeWidth="7" strokeLinecap="round" opacity=".55" filter={`url(#${id("blur2")})`} />

        {/* Plasma orb */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r + 10}
          fill={`url(#${id("redglow")})`}
          filter={`url(#${id("blur6")})`}
          initial={{ opacity: 0.55 }}
          animate={reduce ? undefined : { opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx={cx} cy={cy} r={r} fill="#000" filter={`url(#${id("plasma")})`} />
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id("orbShade")})`} />
        <circle cx={cx - 4} cy={cy - 4} r="4" fill={`url(#${id("spark")})`} opacity=".9" />
      </motion.svg>
    </motion.div>
  );
}

/** One extrusion layer, offset k steps along the (animated) depth direction. */
function Layer({
  k,
  dx,
  dy,
  filter,
  children,
}: {
  k: number;
  dx: MotionValue<number>;
  dy: MotionValue<number>;
  filter?: string;
  children: React.ReactNode;
}) {
  const x = useTransform(dx, (v) => v * k);
  const y = useTransform(dy, (v) => v * k);
  return (
    <motion.g style={{ x, y }} filter={filter}>
      {children}
    </motion.g>
  );
}

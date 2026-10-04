"use client";

import { useId, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { RC_PATHS, RC_STROKE, RC_VIEWBOX } from "./rcMark";

const SLOW = 70; // degrees per second (one turn every ~5s)
const FAST = 420; // while hovered
const TILT = -12; // constant tilt toward the viewer, shows the top edge
const LAYERS = 12; // extrusion slices between front and back faces
const DEPTH = 0.3; // total thickness as a fraction of the logo's size

/**
 * Real 3D "RC" model built from stacked SVG slices in CSS 3D space
 * (front face, red extruded sides, back face), spinning on its Y axis.
 * Speeds up smoothly on hover. Holds a static angled pose for visitors
 * who prefer reduced motion. Only the parent transform animates,
 * so it's GPU-composited and cheap.
 */
export function RcLogo3D({ size = 44, className = "" }: { size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const faceId = `rc-face-${uid}`;
  const backId = `rc-back-${uid}`;

  const rotateY = useMotionValue(0);
  const speed = useRef(SLOW);
  const target = useRef(SLOW);

  useAnimationFrame((_, delta) => {
    if (reduce) {
      // Static three-quarter pose so the depth is still visible.
      if (rotateY.get() !== -28) rotateY.set(-28);
      return;
    }
    speed.current += (target.current - speed.current) * Math.min(1, delta / 250);
    rotateY.set((rotateY.get() + (speed.current * delta) / 1000) % 360);
  });

  const depth = size * DEPTH;
  const step = depth / LAYERS;

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, perspective: size * 12 }}
      onMouseEnter={() => (target.current = FAST)}
      onMouseLeave={() => (target.current = SLOW)}
      aria-hidden
    >
      {/* Shared gradients for every slice */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={faceId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".45" stopColor="#d4d4d4" />
            <stop offset="1" stopColor="#8a8a8a" />
          </linearGradient>
          <linearGradient id={backId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e5e5e5" />
            <stop offset="1" stopColor="#737373" />
          </linearGradient>
        </defs>
      </svg>

      <motion.span
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ rotateX: TILT, rotateY }}
      >
        {Array.from({ length: LAYERS + 1 }, (_, k) => {
          const t = k / LAYERS;
          const fill =
            k === 0
              ? `url(#${faceId})`
              : k === LAYERS
                ? `url(#${backId})`
                : `rgb(${Math.round(185 - 120 * t)},${Math.round(18 - 10 * t)},${Math.round(18 - 10 * t)})`;
          return (
            <span
              key={k}
              className="absolute inset-0"
              style={{ transform: `translateZ(${(depth / 2 - k * step).toFixed(2)}px)` }}
            >
              <Glyph stroke={fill} />
            </span>
          );
        })}
      </motion.span>
    </span>
  );
}

function Glyph({ stroke }: { stroke: string }) {
  return (
    <svg viewBox={RC_VIEWBOX} className="block h-full w-full">
      {RC_PATHS.map((d, i) => (
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
      ))}
    </svg>
  );
}

"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { RC_ORB, RC_PATHS, RC_STROKE } from "./rcMark";

const SLOW = 90; // degrees per second (one turn every 4s)
const FAST = 540; // on hover

/**
 * Coin-style spinning badge with the RC monogram.
 * Front: white mark + red orb on black with a red ring.
 * Back: white mark on solid red, so it flashes red every half-turn.
 * Smoothly speeds up on hover; holds still for reduced-motion users.
 */
export function SpinningLogo({ size = 40 }: { size?: number }) {
  const reduce = useReducedMotion();
  const rotateY = useMotionValue(0);
  const speed = useRef(SLOW);
  const target = useRef(SLOW);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    speed.current += (target.current - speed.current) * Math.min(1, delta / 250);
    rotateY.set((rotateY.get() + (speed.current * delta) / 1000) % 360);
  });

  const face = "absolute inset-0 flex items-center justify-center rounded-full [backface-visibility:hidden]";

  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size, perspective: 400 }}
      onMouseEnter={() => (target.current = FAST)}
      onMouseLeave={() => (target.current = SLOW)}
    >
      <motion.span className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateY }}>
        <span className={`${face} border-2 border-red-600 bg-black shadow-[0_0_18px_rgba(220,38,38,0.35)]`}>
          <RcGlyph orb="#dc2626" />
        </span>
        <span className={`${face} border-2 border-white bg-red-600 [transform:rotateY(180deg)]`}>
          <RcGlyph orb="#fff" />
        </span>
      </motion.span>
    </span>
  );
}

/** Flat version of the monogram, sized to fit inside the badge. */
function RcGlyph({ orb }: { orb: string }) {
  return (
    <svg viewBox="14 8 200 190" className="h-[66%] w-[66%]" aria-hidden>
      {RC_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth={RC_STROKE + 3}
          strokeLinejoin="miter"
          strokeMiterlimit={2.2}
          strokeLinecap="butt"
        />
      ))}
      <circle cx={RC_ORB.cx} cy={RC_ORB.cy} r={RC_ORB.r + 2} fill={orb} />
    </svg>
  );
}

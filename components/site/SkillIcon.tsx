"use client";

import { useState } from "react";

/**
 * Renders a skill's `icon` value, which can be:
 *  - an image URL (https://…)
 *  - an emoji or 1–2 characters
 *  - a Simple Icons slug (e.g. "react") → https://simpleicons.org
 * Falls back to the skill's first letter if the icon is missing or fails to load.
 */
export function SkillIcon({ icon, name }: { icon: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const fallback = (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-neutral-800 font-mono text-[10px] font-semibold text-neutral-300">
      {name.charAt(0).toUpperCase()}
    </span>
  );

  if (!icon || failed) return fallback;

  if (/^\p{Extended_Pictographic}/u.test(icon) || icon.length <= 2) {
    return <span className="flex h-5 w-5 items-center justify-center text-base leading-none">{icon}</span>;
  }

  const src = /^https?:\/\//.test(icon) ? icon : `https://cdn.simpleicons.org/${encodeURIComponent(icon)}/ffffff`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={20} height={20} loading="lazy" onError={() => setFailed(true)} className="h-5 w-5 object-contain" />
  );
}

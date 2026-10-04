/**
 * Tech-stack badge styling for the black / white / red theme.
 * Badges are generated from each project's tech_stack array, so new
 * technologies added in the admin dashboard appear automatically.
 *
 * All badges share one monochrome style so the red accent stays special;
 * hovering a card tints its badges red (see ProjectCard's `group`).
 */
const BASE =
  "bg-white/[0.04] text-neutral-300 ring-white/10 transition-colors group-hover:ring-red-500/30 group-hover:text-white";

export function techBadgeClass(_tech: string): string {
  return BASE;
}

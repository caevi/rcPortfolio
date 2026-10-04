/**
 * Geometry of the RC monogram (200-unit design space).
 * A chamfered hexagonal "C" wraps an angular "R" whose leg stays inside the C.
 * Shared by the 3D nav logo, the favicon (app/icon.svg) and public/brand/*.
 */
export const RC_PATHS = [
  // C: open hexagon
  "M143,47 L100,22 L33,61 L33,139 L100,178 L143,153",
  // R: stem, angular bowl, short leg
  "M70,148 L70,66 L112,66 L124,78 L124,98 L112,110 L70,110 M98,110 L118,142",
] as const;

export const RC_STROKE = 19;

/** Square viewBox centred on the stroked mark (bounds ≈ x 23.5–148, y 11–189). */
export const RC_VIEWBOX = "-7.4 7 186 186";

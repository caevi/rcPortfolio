/**
 * Geometry of the RC monogram, in a 200×200 coordinate space.
 * A chamfered hexagonal "C" wraps an "R" whose leg breaks out
 * through the C's opening, ending in a plasma orb.
 *
 * Shared by the 3D hero logo, the spinning nav badge and the favicon.
 */
export const RC_PATHS = [
  // C: open hexagon
  "M143,47 L100,22 L33,61 L33,139 L100,178 L143,153",
  // R: stem + triangular bowl, then the leg that exits the C
  "M70,148 L70,66 L124,96 L70,126 M90,117 L178,137",
] as const;

export const RC_STROKE = 19;

/** Where the R's leg ends — the orb sits just past it. */
export const RC_ORB = { cx: 190, cy: 140, r: 16 } as const;

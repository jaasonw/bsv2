// Per-person accent colors. Hues are assigned by position in the people list so
// the same person keeps the same color everywhere (matrix, chips, breakdown).
//
// Everything is expressed as oklch with an alpha channel for the soft variants,
// which keeps the tints readable on both the light and dark surfaces without
// needing a second palette.
const PERSON_HUES = [280, 340, 200, 155, 30, 95, 250, 15];

export function personHue(index: number): number {
  return PERSON_HUES[
    ((index % PERSON_HUES.length) + PERSON_HUES.length) % PERSON_HUES.length
  ];
}

/** Solid accent — avatars, active cell text. */
export function personColor(index: number): string {
  return `oklch(0.62 0.17 ${personHue(index)})`;
}

/** Translucent accent — active cell / chip backgrounds. */
export function personSoft(index: number, alpha = 0.16): string {
  return `oklch(0.62 0.17 ${personHue(index)} / ${alpha})`;
}

export function personInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}

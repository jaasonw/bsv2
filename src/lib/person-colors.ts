// Per-person accent colors. A slot is assigned by position in the people list
// so the same person keeps the same color everywhere (matrix, chips,
// breakdown).
//
// The actual values live in globals.css as `--person-0` … `--person-7`, which
// carry Catppuccin Latte in light mode and Macchiato in dark. Referencing them
// through CSS variables keeps inline styles theme-aware.
const PERSON_SLOTS = 8;

export function personSlot(index: number): number {
  return ((index % PERSON_SLOTS) + PERSON_SLOTS) % PERSON_SLOTS;
}

/** Solid accent — avatars, chip borders. */
export function personColor(index: number): string {
  return `hsl(var(--person-${personSlot(index)}))`;
}

/** Translucent accent — active cell / chip backgrounds. */
export function personSoft(index: number, alpha = 0.18): string {
  return `hsl(var(--person-${personSlot(index)}) / ${alpha})`;
}

/** Text color that stays legible on top of a solid accent. */
export function personInk(): string {
  return "hsl(var(--person-ink))";
}

export function personInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}

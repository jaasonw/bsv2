import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Item {
  /** Stable across renames and reorders, so list keys don't remount rows. */
  id: string;
  name: string;
  price: number;
  buyers: string[];
}

let itemSequence = 0;

export function createItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${itemSequence++}`;
}

/**
 * Back-fills ids on items that arrive without them — receipts saved before ids
 * existed, and the parser's response.
 */
export function withItemIds(items: Item[]): Item[] {
  return items.map((item) =>
    item.id ? item : { ...item, id: createItemId() }
  );
}

/**
 * Bill maths lives in `computeSummary` in `@/hooks/use-bill-summary`, which
 * derives every figure the UI shows in a single pass. The per-person helpers
 * that used to live here each re-walked the item list on every call, and had
 * drifted into being a second, slower definition of the same rules.
 */

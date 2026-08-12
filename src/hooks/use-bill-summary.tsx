"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useBill } from "@/components/BillProvider";
import type { Item } from "@/lib/utils";
import {
  personColor,
  personInitial,
  personInk,
  personSoft,
} from "@/lib/person-colors";

export interface PersonLine {
  name: string;
  ways: number;
  amount: number;
}

export interface PersonSummary {
  index: number;
  name: string;
  initial: string;
  color: string;
  soft: string;
  ink: string;
  subtotal: number;
  tax: number;
  tip: number;
  taxTip: number;
  total: number;
  lines: PersonLine[];
  settled: boolean;
}

export interface BillSummary {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  taxPercent: string;
  tipPercent: string;
  people: PersonSummary[];
  itemCount: number;
  unassignedCount: number;
  balanced: boolean;
}

// A cent of slack: you can't split a penny, so someone absorbs the rounding.
const EPSILON = 0.01;

/**
 * Everything the layouts display, derived in a single pass.
 *
 * The rules are unchanged from the helpers in `@/lib/utils`: tax is always
 * proportional to a person's subtotal, and tip is either proportional or split
 * across every person on the tab. The difference is that the bill subtotal and
 * each person's subtotal are computed once here and then reused, rather than
 * `getPartialAmount` re-walking every item on each of its calls.
 */
function computeSummary(
  items: Item[],
  people: string[],
  tip: number,
  tax: number,
  tipAsProportion: boolean,
  tipTheTax: boolean,
  settled: Record<string, boolean>
): BillSummary {
  const subtotals = new Map<string, number>();
  const lines = new Map<string, PersonLine[]>();
  for (const name of people) {
    subtotals.set(name, 0);
    lines.set(name, []);
  }

  let subtotal = 0;
  let unassignedCount = 0;

  // One pass over items fills the bill subtotal, every person's subtotal, and
  // every person's line list.
  for (const item of items) {
    subtotal += item.price;
    if (item.buyers.length === 0) {
      unassignedCount += 1;
      continue;
    }
    const share = item.price / item.buyers.length;
    for (const buyer of item.buyers) {
      if (!subtotals.has(buyer)) continue; // buyer no longer on the tab
      subtotals.set(buyer, subtotals.get(buyer)! + share);
      lines.get(buyer)!.push({
        name: item.name,
        ways: item.buyers.length,
        amount: share,
      });
    }
  }

  const total = subtotal + tip + tax;
  const tipBase = tipTheTax ? subtotal + tax : subtotal;
  const evenTipShare = people.length > 0 ? tip / people.length : 0;

  let peopleTotal = 0;
  const peopleSummaries: PersonSummary[] = people.map((name, index) => {
    const personSubtotal = subtotals.get(name) ?? 0;
    const fraction = subtotal > 0 ? personSubtotal / subtotal : 0;
    const personTax = tax * fraction;
    const personTip = tipAsProportion ? tip * fraction : evenTipShare;
    const personTotal = personSubtotal + personTax + personTip;
    peopleTotal += personTotal;

    return {
      index,
      name,
      initial: personInitial(name),
      color: personColor(index),
      soft: personSoft(index),
      ink: personInk(),
      subtotal: personSubtotal,
      tax: personTax,
      tip: personTip,
      taxTip: personTax + personTip,
      total: personTotal,
      lines: lines.get(name) ?? [],
      settled: !!settled[name],
    };
  });

  return {
    subtotal,
    tax,
    tip,
    total,
    taxPercent: subtotal > 0 ? ((tax / subtotal) * 100).toFixed(1) : "0.0",
    tipPercent: tipBase > 0 ? ((tip / tipBase) * 100).toFixed(1) : "0.0",
    people: peopleSummaries,
    itemCount: items.length,
    unassignedCount,
    // Same check `validateTotals` performed, using the totals already summed.
    balanced: people.length === 0 || Math.abs(peopleTotal - total) < EPSILON,
  };
}

const BillSummaryContext = createContext<BillSummary | undefined>(undefined);

/**
 * Computes the summary once for the whole tree.
 *
 * Every panel used to call the hook independently, so a bill with N items and
 * M people was walked once per consuming component on every render.
 */
export function BillSummaryProvider({ children }: { children: ReactNode }) {
  const { items, people, tip, tax, tipAsProportion, tipTheTax, settled } =
    useBill();

  const summary = useMemo(
    () =>
      computeSummary(
        items,
        people,
        tip,
        tax,
        tipAsProportion,
        tipTheTax,
        settled
      ),
    [items, people, tip, tax, tipAsProportion, tipTheTax, settled]
  );

  return (
    <BillSummaryContext.Provider value={summary}>
      {children}
    </BillSummaryContext.Provider>
  );
}

export function useBillSummary(): BillSummary {
  const summary = useContext(BillSummaryContext);
  if (!summary) {
    throw new Error("useBillSummary must be used within a BillSummaryProvider");
  }
  return summary;
}

export function money(value: number): string {
  return value.toFixed(2);
}

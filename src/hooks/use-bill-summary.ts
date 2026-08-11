"use client";

import { useMemo } from "react";
import { useBill } from "@/components/BillProvider";
import {
  getPartialAmount,
  getPartialSubtotal,
  getSubtotal,
  getTotal,
  validateTotals,
} from "@/lib/utils";
import { personColor, personInitial, personSoft } from "@/lib/person-colors";

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

/**
 * Single source of truth for everything the redesigned layouts display.
 *
 * Deliberately delegates to the helpers in `@/lib/utils` so the numbers here
 * are the same ones `createTable` and `validateTotals` produce — tax is always
 * proportional to a person's subtotal, tip is either proportional or split
 * across every person on the tab.
 */
export function useBillSummary(): BillSummary {
  const { items, people, tip, tax, tipAsProportion, tipTheTax, settled } =
    useBill();

  return useMemo(() => {
    const subtotal = getSubtotal(items);
    const total = getTotal(tip, tax, items);
    const tipBase = tipTheTax ? subtotal + tax : subtotal;

    const peopleSummaries: PersonSummary[] = people.map((name, index) => {
      const personSubtotal = getPartialSubtotal(name, items);
      const personTax = getPartialAmount(name, tax, items);
      const personTip = tipAsProportion
        ? getPartialAmount(name, tip, items)
        : people.length > 0
          ? tip / people.length
          : 0;

      return {
        index,
        name,
        initial: personInitial(name),
        color: personColor(index),
        soft: personSoft(index),
        subtotal: personSubtotal,
        tax: personTax,
        tip: personTip,
        taxTip: personTax + personTip,
        total: personSubtotal + personTax + personTip,
        lines: items
          .filter((item) => item.buyers.includes(name))
          .map((item) => ({
            name: item.name,
            ways: item.buyers.length,
            amount: item.price / item.buyers.length,
          })),
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
      unassignedCount: items.filter((item) => item.buyers.length === 0).length,
      balanced:
        people.length === 0 ||
        validateTotals(people, tip, tax, tipAsProportion, items),
    };
  }, [items, people, tip, tax, tipAsProportion, tipTheTax, settled]);
}

export function money(value: number): string {
  return value.toFixed(2);
}

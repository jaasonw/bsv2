"use client";

import React from "react";
import { Check, Plus } from "lucide-react";
import { useBill } from "@/components/BillProvider";
import { cn } from "@/lib/utils";
import {
  useBillSummary,
  money,
  type PersonSummary,
} from "@/hooks/use-bill-summary";

interface PersonBreakdownProps {
  onAddPerson: () => void;
  onEditPerson: (index: number) => void;
  /** `cards` gives every person their own surface (mobile split tab). */
  variant?: "list" | "cards";
}

export default function PersonBreakdown({
  onAddPerson,
  onEditPerson,
  variant = "list",
}: PersonBreakdownProps) {
  const { people, taxPercent, tipPercent } = useBillSummary();
  const { tipAsProportion, tipTheTax } = useBill();

  const taxLabel = `Tax (${taxPercent}%)`;
  const tipLabel = `Tip (${tipPercent}%${tipTheTax ? " incl. tax" : ""}${
    tipAsProportion ? "" : ", split evenly"
  })`;

  if (variant === "cards") {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onAddPerson}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed py-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-4 w-4" /> Add person
        </button>
        {people.map((person) => (
          <div key={person.name} className="rounded-lg bg-card p-4 shadow-sm">
            <PersonRow
              person={person}
              onEditPerson={onEditPerson}
              taxLabel={taxLabel}
              tipLabel={tipLabel}
            />
          </div>
        ))}
        {people.length === 0 && (
          <p className="px-1 text-[12.5px] text-muted-foreground">
            Nobody on the tab yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold">Individual breakdown</h2>
        <button
          type="button"
          onClick={onAddPerson}
          className="flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Person
        </button>
      </div>
      {people.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground">
          Add people to see who owes what.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {people.map((person) => (
            <PersonRow
              key={person.name}
              person={person}
              onEditPerson={onEditPerson}
              taxLabel={taxLabel}
              tipLabel={tipLabel}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PersonRow({
  person,
  onEditPerson,
  taxLabel,
  tipLabel,
}: {
  person: PersonSummary;
  onEditPerson: (index: number) => void;
  taxLabel: string;
  tipLabel: string;
}) {
  const { toggleSettled } = useBill();

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEditPerson(person.index)}
          title={`Edit ${person.name}`}
          className="flex cursor-pointer items-center gap-2"
        >
          <span
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: person.color, color: person.ink }}
          >
            {person.initial}
          </span>
          <span className="text-[13px] font-bold">{person.name}</span>
        </button>
        <button
          type="button"
          onClick={() => toggleSettled(person.name)}
          aria-pressed={person.settled}
          className={cn(
            "ml-auto flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-[10.5px] font-bold transition-colors",
            person.settled
              ? "border-positive bg-positive/15 text-positive"
              : "border-border hover:bg-accent"
          )}
        >
          {person.settled && <Check className="h-3 w-3" />}
          {person.settled ? "Paid" : "Mark paid"}
        </button>
      </div>

      {person.lines.length === 0 ? (
        <div className="pl-[30px] text-[11.5px] italic text-muted-foreground">
          No items yet
        </div>
      ) : (
        person.lines.map((line, index) => (
          <div
            key={`${line.name}-${index}`}
            className="flex justify-between gap-2 py-0.5 pl-[30px] text-[11.5px] leading-snug text-muted-foreground"
          >
            <span className="min-w-0 truncate">
              {line.name}{" "}
              <span className="text-muted-foreground/60">
                ({line.ways === 1 ? "full" : `split ${line.ways} ways`})
              </span>
            </span>
            <span className="shrink-0 tabular-nums">${money(line.amount)}</span>
          </div>
        ))
      )}

      <div className="flex justify-between gap-2 py-0.5 pl-[30px] text-[11.5px] text-muted-foreground">
        <span className="min-w-0 truncate">{taxLabel}</span>
        <span className="shrink-0 tabular-nums">${money(person.tax)}</span>
      </div>
      <div className="flex justify-between gap-2 py-0.5 pl-[30px] text-[11.5px] text-muted-foreground">
        <span className="min-w-0 truncate">{tipLabel}</span>
        <span className="shrink-0 tabular-nums">${money(person.tip)}</span>
      </div>

      <div className="flex justify-between pl-[30px] pt-1.5 text-[13px] font-bold">
        <span>Total</span>
        <span
          className={cn(
            "tabular-nums text-primary",
            person.settled && "text-muted-foreground line-through"
          )}
        >
          ${money(person.total)}
        </span>
      </div>
    </div>
  );
}

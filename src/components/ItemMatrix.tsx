"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useBill } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBillSummary, money } from "@/hooks/use-bill-summary";

interface ItemMatrixProps {
  onEditItem: (index: number) => void;
  onEditPerson: (index: number) => void;
  onAddItem: () => void;
  onAddPerson: () => void;
}

/**
 * The desktop item × person grid. Each cell toggles whether that person is on
 * the hook for that item; the cell shows their share once they are.
 */
export default function ItemMatrix({
  onEditItem,
  onEditPerson,
  onAddItem,
  onAddPerson,
}: ItemMatrixProps) {
  const { items, setItems } = useBill();
  const summary = useBillSummary();
  const people = summary.people;

  function toggleBuyer(itemIndex: number, person: string) {
    setItems((prev) =>
      prev.map((item, index) =>
        index !== itemIndex
          ? item
          : {
              ...item,
              buyers: item.buyers.includes(person)
                ? item.buyers.filter((buyer) => buyer !== person)
                : [...item.buyers, person],
            }
      )
    );
  }

  if (items.length === 0 && people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Scan a receipt, or add people and items by hand.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onAddPerson}>
            <Plus className="h-4 w-4" /> Add person
          </Button>
          <Button size="sm" onClick={onAddItem}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
        </div>
      </div>
    );
  }

  const columns = `minmax(140px,1.8fr) repeat(${Math.max(people.length, 1)}, minmax(64px,1fr)) 84px`;

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-full gap-x-1.5 gap-y-1.5"
        style={{ gridTemplateColumns: columns }}
      >
        <HeadCell>Item</HeadCell>
        {people.length === 0 ? (
          <button
            type="button"
            onClick={onAddPerson}
            className="cursor-pointer pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            + person
          </button>
        ) : (
          people.map((person) => (
            <button
              key={person.name}
              type="button"
              onClick={() => onEditPerson(person.index)}
              title={`Edit ${person.name}`}
              className="flex cursor-pointer flex-col items-center gap-1 pb-2"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] font-bold"
                style={{ backgroundColor: person.color, color: person.ink }}
              >
                {person.initial}
              </span>
              <span className="max-w-full truncate text-[11px] font-bold">
                {person.name}
              </span>
            </button>
          ))
        )}
        <HeadCell className="text-right">Price</HeadCell>

        {items.map((item, index) => {
          const striped = index % 2 === 0;
          const rowBg = striped ? "bg-muted/40" : "bg-transparent";
          const unassigned = item.buyers.length === 0;

          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                onClick={() => onEditItem(index)}
                title={`Edit ${item.name}`}
                className={cn(
                  "flex min-w-0 cursor-pointer items-center rounded-l-sm py-2.5 pl-2.5 text-left text-[13px] font-semibold",
                  rowBg
                )}
              >
                <span className="truncate">{item.name}</span>
              </button>

              {people.length === 0 ? (
                <div className={cn("py-2.5", rowBg)} />
              ) : (
                people.map((person) => {
                  const active = item.buyers.includes(person.name);
                  return (
                    <button
                      key={person.name}
                      type="button"
                      title={`${item.name} — ${person.name}`}
                      aria-pressed={active}
                      onClick={() => toggleBuyer(index, person.name)}
                      className={cn(
                        "cursor-pointer rounded-md py-2.5 text-center text-xs font-bold tabular-nums transition-colors",
                        active
                          ? "text-foreground"
                          : cn(
                              rowBg,
                              "text-muted-foreground/50 hover:bg-accent"
                            )
                      )}
                      style={
                        active ? { backgroundColor: person.soft } : undefined
                      }
                    >
                      {active
                        ? `$${money(item.price / item.buyers.length)}`
                        : "–"}
                    </button>
                  );
                })
              )}

              <div
                className={cn(
                  "flex items-center justify-end rounded-r-sm py-2.5 pr-2.5 text-[13px] font-bold tabular-nums",
                  rowBg,
                  unassigned && "text-destructive"
                )}
              >
                ${money(item.price)}
              </div>
            </React.Fragment>
          );
        })}

        <TotalRow
          label="subtotal"
          people={people.map((p) => money(p.subtotal))}
          total={money(summary.subtotal)}
          bordered
          columnCount={Math.max(people.length, 1)}
        />
        <TotalRow
          label="tax + tip"
          muted
          people={people.map((p) => money(p.taxTip))}
          total={money(summary.tax + summary.tip)}
          columnCount={Math.max(people.length, 1)}
        />
        <TotalRow
          label="total"
          emphasis
          invalid={!summary.balanced}
          people={people.map((p) => money(p.total))}
          total={money(summary.total)}
          columnCount={Math.max(people.length, 1)}
        />
      </div>
    </div>
  );
}

function HeadCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

function TotalRow({
  label,
  people,
  total,
  columnCount,
  bordered = false,
  muted = false,
  emphasis = false,
  invalid = false,
}: {
  label: string;
  people: string[];
  total: string;
  columnCount: number;
  bordered?: boolean;
  muted?: boolean;
  emphasis?: boolean;
  invalid?: boolean;
}) {
  const cell = cn(
    "text-center tabular-nums",
    bordered && "border-t",
    muted ? "py-1 text-[11.5px] text-muted-foreground" : "py-1.5",
    emphasis ? "text-sm font-extrabold text-primary" : "text-xs font-bold",
    invalid && "text-destructive"
  );

  const padded = people.length
    ? people
    : Array.from({ length: columnCount }, () => "");

  return (
    <>
      <div
        className={cn(
          "text-[11px] font-bold text-muted-foreground",
          bordered && "border-t",
          muted ? "py-1" : "py-1.5",
          emphasis && "text-[13px] text-foreground"
        )}
      >
        {label}
      </div>
      {padded.map((value, index) => (
        <div key={index} className={cell}>
          {value}
        </div>
      ))}
      <div className={cn(cell, "text-right")}>{total ? `$${total}` : ""}</div>
    </>
  );
}

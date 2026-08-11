"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useBill } from "@/components/BillProvider";
import { tapFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { useBillSummary, money } from "@/hooks/use-bill-summary";

interface ItemAssignListProps {
  onEditItem: (index: number) => void;
  onAddItem: () => void;
  onAddPerson: () => void;
}

/** Mobile assignment view: one card per item, a chip per person. */
export default function ItemAssignList({
  onEditItem,
  onAddItem,
  onAddPerson,
}: ItemAssignListProps) {
  const { items, setItems } = useBill();
  const { people } = useBillSummary();

  function toggleBuyer(itemIndex: number, person: string) {
    tapFeedback();
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

  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-[12.5px] text-muted-foreground">
        {people.length === 0
          ? "Add someone to the tab, then tap their name on each item."
          : "Tap a name to add or remove them from an item."}
      </p>

      {people.length === 0 && (
        <DashedButton onClick={onAddPerson}>
          <Plus className="h-4 w-4" /> Add person
        </DashedButton>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="animate-in rounded-lg bg-card p-4 shadow-sm duration-300 fade-in slide-in-from-bottom-2"
          style={{
            animationDelay: `${Math.min(index, 8) * 40}ms`,
            animationFillMode: "both",
          }}
        >
          <div className="mb-2.5 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onEditItem(index)}
              className="cursor-pointer truncate pt-px text-left text-[14.5px] font-bold"
            >
              {item.name}
            </button>
            <div className="shrink-0 text-right">
              <div
                className={cn(
                  "text-[14.5px] font-bold tabular-nums",
                  item.buyers.length === 0 && "text-destructive"
                )}
              >
                ${money(item.price)}
              </div>
              {item.buyers.length > 1 && (
                <div className="text-[11.5px] tabular-nums text-muted-foreground">
                  ${money(item.price / item.buyers.length)} each
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {people.map((person) => {
              const active = item.buyers.includes(person.name);
              return (
                <button
                  key={person.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleBuyer(index, person.name)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-md border py-1 pl-1 pr-3 text-[12.5px] font-semibold transition-all duration-200 active:scale-95",
                    active
                      ? "text-foreground"
                      : "border-border bg-card text-muted-foreground"
                  )}
                  style={
                    active
                      ? {
                          borderColor: person.color,
                          backgroundColor: person.soft,
                        }
                      : undefined
                  }
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10.5px] font-bold"
                    style={
                      active
                        ? { backgroundColor: person.color, color: person.ink }
                        : {
                            backgroundColor:
                              "hsl(var(--muted-foreground) / 0.25)",
                            color: "hsl(var(--muted-foreground))",
                          }
                    }
                  >
                    {person.initial}
                  </span>
                  {person.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <DashedButton onClick={onAddItem}>
        <Plus className="h-4 w-4" />
        {items.length === 0 ? "Add an item" : "Add another item"}
      </DashedButton>
    </div>
  );
}

function DashedButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed py-3.5 text-[13.5px] font-semibold text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

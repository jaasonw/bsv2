"use client";

import React from "react";
import { Camera, HandCoins, ReceiptText, RotateCcw } from "lucide-react";
import { useBill } from "@/components/BillProvider";
import BillTotalCard from "@/components/BillTotalCard";
import Footer from "@/components/Footer";
import ItemAssignList from "@/components/ItemAssignList";
import PersonBreakdown from "@/components/PersonBreakdown";
import PhotoUpload from "@/components/PhotoUpload";
import TaxTipPanel from "@/components/TaxTipPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBillSummary } from "@/hooks/use-bill-summary";

export type MobileTab = "scan" | "items" | "split";

interface MobileLayoutProps {
  tab: MobileTab;
  setTab: (tab: MobileTab) => void;
  setEditingItemIndex: (index: number | null) => void;
  setEditingPersonIndex: (index: number | null) => void;
  onAddItem: () => void;
  onAddPerson: () => void;
}

const TABS: { id: MobileTab; label: string; icon: typeof Camera }[] = [
  { id: "scan", label: "Scan", icon: Camera },
  { id: "items", label: "Items", icon: ReceiptText },
  { id: "split", label: "Split", icon: HandCoins },
];

export default function MobileLayout({
  tab,
  setTab,
  setEditingItemIndex,
  setEditingPersonIndex,
  onAddItem,
  onAddPerson,
}: MobileLayoutProps) {
  const { reset } = useBill();
  const { itemCount, people } = useBillSummary();

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col lg:hidden">
      {/* Gradient hero */}
      <div className="bg-linear-135 from-brand-from to-brand-to px-5 pb-32 pt-5 text-white">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <ReceiptText className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[15px] font-bold">current bill</div>
            <div className="text-[11.5px] text-white/65">
              {itemCount} item{itemCount === 1 ? "" : "s"} · {people.length}{" "}
              {people.length === 1 ? "person" : "people"}
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping total card + quick actions */}
      <div className="-mt-28 px-4">
        <BillTotalCard>
          <div className="mt-4 flex gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="flex flex-1 cursor-pointer flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    tab === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            ))}
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold tabular-nums">
                {itemCount}
              </span>
              <span className="text-[11px] font-semibold">On tab</span>
            </div>
          </div>
        </BillTotalCard>
      </div>

      {/* Tab content */}
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-32 pt-4">
        {tab === "scan" && (
          <>
            <div className="rounded-lg bg-card p-5 shadow-sm">
              <PhotoUpload />
            </div>
            <TaxTipPanel />
            <Button variant="secondary" className="w-full" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset bill
            </Button>
          </>
        )}

        {tab === "items" && (
          <ItemAssignList
            onEditItem={setEditingItemIndex}
            onAddItem={onAddItem}
            onAddPerson={onAddPerson}
          />
        )}

        {tab === "split" && (
          <PersonBreakdown
            variant="cards"
            onAddPerson={onAddPerson}
            onEditPerson={setEditingPersonIndex}
          />
        )}

        <Footer />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] rounded-t-lg bg-card px-2 pb-3.5 pt-2.5 shadow-[0_-4px_20px_hsl(var(--brand)/0.12)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className="flex flex-1 cursor-pointer flex-col items-center gap-1.5 py-1.5"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                tab === id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span
              className={cn(
                "text-[10.5px]",
                tab === id
                  ? "font-bold text-primary"
                  : "font-medium text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

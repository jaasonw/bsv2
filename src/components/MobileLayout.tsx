"use client";

import React, { useCallback, useLayoutEffect, useRef } from "react";
import { Camera, HandCoins, ReceiptText, RotateCcw } from "lucide-react";
import { useBill } from "@/components/BillProvider";
import { tapFeedback } from "@/lib/haptics";
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

  // Native tab bars return you to where you left a tab. Panels stay mounted so
  // their state survives, and the window offset is stashed per tab on the way
  // out and restored on the way in.
  const scrollOffsets = useRef<Record<MobileTab, number>>({
    scan: 0,
    items: 0,
    split: 0,
  });
  const previousTab = useRef<MobileTab>(tab);

  useLayoutEffect(() => {
    if (previousTab.current === tab) return;
    previousTab.current = tab;
    window.scrollTo({ top: scrollOffsets.current[tab], behavior: "instant" });
  }, [tab]);

  const selectTab = useCallback(
    (next: MobileTab) => {
      scrollOffsets.current[tab] = window.scrollY;
      tapFeedback();
      if (next === tab) {
        // Re-tapping the active tab scrolls it to top, as on iOS. Some engines
        // ignore `smooth` entirely, so fall back to a jump if nothing moved.
        scrollOffsets.current[tab] = 0;
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          if (window.scrollY > 0) window.scrollTo(0, 0);
        }, 400);
        return;
      }
      setTab(next);
    },
    [tab, setTab]
  );

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col">
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

      {/* Overlapping total card */}
      <div className="-mt-28 px-4">
        <BillTotalCard className="animate-in fade-in slide-in-from-bottom-4 duration-500" />
      </div>

      {/*
        All three panels stay mounted and are toggled with `hidden`, so state
        (a half-typed tip, the scanner's preview) survives a tab switch. The
        entrance animation is re-triggered by keying on the tab, which is cheap
        now that it only wraps the visible panel's own children.
      */}
      <div className="flex flex-1 flex-col px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-4">
        <TabPanel active={tab === "scan"}>
          <div className="rounded-lg bg-card p-5 shadow-sm">
            <PhotoUpload />
          </div>
          <TaxTipPanel />
          <Button variant="secondary" className="w-full" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset bill
          </Button>
        </TabPanel>

        <TabPanel active={tab === "items"}>
          <ItemAssignList
            onEditItem={setEditingItemIndex}
            onAddItem={onAddItem}
            onAddPerson={onAddPerson}
          />
        </TabPanel>

        <TabPanel active={tab === "split"}>
          <PersonBreakdown
            variant="cards"
            onAddPerson={onAddPerson}
            onEditPerson={setEditingPersonIndex}
          />
        </TabPanel>

        <Footer />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] rounded-t-lg bg-card px-2 pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_20px_hsl(var(--brand)/0.12)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className="flex flex-1 cursor-pointer flex-col items-center gap-1.5 py-1.5 transition-transform active:scale-95"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                tab === id
                  ? "scale-110 bg-primary/15 text-primary"
                  : "scale-100 text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span
              className={cn(
                "text-[10.5px] transition-colors duration-200",
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

/**
 * Stays mounted when inactive, so a half-typed tip or the scanner's preview
 * survives a tab switch.
 *
 * The entrance animation plays only the first time a panel is revealed.
 * Replaying it on every switch added 300ms of perceived latency to a movement
 * that is instant on a native tab bar.
 */
function TabPanel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const [seen, setSeen] = React.useState(false);

  useLayoutEffect(() => {
    if (active && !seen) setSeen(true);
  }, [active, seen]);

  return (
    <div
      className={cn(
        active ? "flex flex-col gap-3.5" : "hidden",
        active &&
          !seen &&
          "animate-in duration-300 fade-in slide-in-from-bottom-3"
      )}
    >
      {children}
    </div>
  );
}

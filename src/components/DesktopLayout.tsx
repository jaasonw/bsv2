"use client";

import React from "react";
import { Plus, RotateCcw } from "lucide-react";
import { useBill } from "@/components/BillProvider";
import BillTotalCard from "@/components/BillTotalCard";
import Footer from "@/components/Footer";
import ItemMatrix from "@/components/ItemMatrix";
import PersonBreakdown from "@/components/PersonBreakdown";
import PhotoUpload from "@/components/PhotoUpload";
import SavedBillsPanel from "@/components/SavedBillsPanel";
import TaxTipPanel from "@/components/TaxTipPanel";
import { Button } from "@/components/ui/button";
import { useBillSummary } from "@/hooks/use-bill-summary";

interface DesktopLayoutProps {
  setEditingItemIndex: (index: number | null) => void;
  setEditingPersonIndex: (index: number | null) => void;
  onAddItem: () => void;
  onAddPerson: () => void;
}

export default function DesktopLayout({
  setEditingItemIndex,
  setEditingPersonIndex,
  onAddItem,
  onAddPerson,
}: DesktopLayoutProps) {
  const { reset } = useBill();
  const { itemCount, people } = useBillSummary();

  return (
    <div className="hidden p-7 lg:block">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid grid-cols-[240px_minmax(480px,1fr)_300px] items-start gap-5">
          {/* Left rail */}
          <div className="sticky top-6 flex flex-col gap-4">
            <BillTotalCard variant="gradient" />

            <div className="rounded-xl bg-card p-4 shadow-sm">
              <PhotoUpload dense />
            </div>

            <TaxTipPanel dense />

            <SavedBillsPanel />

            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset bill
            </Button>
          </div>

          {/* Matrix */}
          <div className="min-w-0 overflow-hidden rounded-xl bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <div>
                <h1 className="text-[19px] font-bold">current bill</h1>
                <p className="text-xs text-muted-foreground">
                  {itemCount} item{itemCount === 1 ? "" : "s"} · {people.length}{" "}
                  {people.length === 1 ? "person" : "people"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onAddPerson}>
                  <Plus className="h-4 w-4" /> Add person
                </Button>
                <Button size="sm" onClick={onAddItem}>
                  <Plus className="h-4 w-4" /> Add item
                </Button>
              </div>
            </div>

            <ItemMatrix
              onEditItem={setEditingItemIndex}
              onEditPerson={setEditingPersonIndex}
              onAddItem={onAddItem}
              onAddPerson={onAddPerson}
            />
          </div>

          {/* Right rail */}
          <div className="sticky top-6 min-w-0">
            <PersonBreakdown
              onAddPerson={onAddPerson}
              onEditPerson={setEditingPersonIndex}
            />
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[1360px]">
          <Footer />
        </div>
      </div>
    </div>
  );
}

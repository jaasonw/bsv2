"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBill } from "@/components/BillProvider";
import { getReceipts, type Receipt } from "@/lib/receipts";
import { cn } from "@/lib/utils";

/** "Your bills" — the saved receipts list in the desktop sidebar. */
export default function SavedBillsPanel() {
  const { isAuthenticated } = useAuth();
  const { loadReceipt } = useBill();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setReceipts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setReceipts(await getReceipts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your bills");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section className="rounded-xl bg-card p-4 shadow-sm">
      <h2 className="mb-2.5 text-sm font-bold">Your bills</h2>

      {!isAuthenticated ? (
        <p className="text-[11.5px] text-muted-foreground">
          Sign in to save bills and pick them back up later.
        </p>
      ) : loading ? (
        <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <p className="text-[11.5px] text-destructive">{error}</p>
      ) : receipts.length === 0 ? (
        <p className="text-[11.5px] text-muted-foreground">
          Nothing saved yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {receipts.map((receipt) => {
            const total =
              receipt.items.reduce((sum, item) => sum + item.price, 0) +
              receipt.tax +
              receipt.tip;
            const active = receipt.id === activeId;

            return (
              <button
                key={receipt.id}
                type="button"
                onClick={() => {
                  setActiveId(receipt.id);
                  loadReceipt(receipt);
                }}
                className={cn(
                  "cursor-pointer rounded-lg border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent"
                )}
              >
                <div className="truncate text-[12.5px] font-bold">
                  {receipt.title}
                </div>
                <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    {new Date(receipt.created).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

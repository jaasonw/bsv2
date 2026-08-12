"use client";

import React, { use, useCallback } from "react";
import { BillContext, BillContextType } from "@/components/BillProvider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBillSummary, money } from "@/hooks/use-bill-summary";
import { useDeferredAmount } from "@/hooks/use-deferred-amount";

const TIP_PRESETS = ["10", "15", "18", "20"];

/**
 * Tax and tip controls, matching the redesign's single "Tax & tip" card.
 *
 * Amounts stay in dollars — that is what the receipt parser returns and what
 * PocketBase stores — with the equivalent percentage shown alongside.
 */
export default function TaxTipPanel({ dense = false }: { dense?: boolean }) {
  const context = use(BillContext) as BillContextType;
  const {
    tax,
    setTax,
    taxInput,
    setTaxInput,
    tip,
    setTip,
    tipInput,
    setTipInput,
    tipTheTax,
    setTipTheTax,
    tipAsProportion,
    setTipAsProportion,
    selectedTipPercentage,
    setSelectedTipPercentage,
  } = context;
  const { subtotal, taxPercent, tipPercent } = useBillSummary();

  const tipBase = tipTheTax ? subtotal + tax : subtotal;

  const commitTax = useCallback(
    (amount: number) => {
      setTax(amount);
      setTaxInput(amount);
    },
    [setTax, setTaxInput]
  );

  const commitTip = useCallback(
    (amount: number) => {
      setTip(amount);
      setTipInput(amount);
      setSelectedTipPercentage("custom");
    },
    [setTip, setTipInput, setSelectedTipPercentage]
  );

  const taxField = useDeferredAmount(taxInput, commitTax);
  const tipField = useDeferredAmount(tipInput, commitTip);

  function applyPreset(percentage: string) {
    const amount =
      Math.round(tipBase * (parseFloat(percentage) / 100) * 100) / 100;
    setTip(amount);
    setTipInput(amount);
    setSelectedTipPercentage(percentage);
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-lg bg-card shadow-sm",
        dense ? "p-4" : "p-5"
      )}
    >
      <h2 className="text-sm font-bold">Tax &amp; tip</h2>

      <div className={cn("flex gap-2.5", dense && "flex-col gap-3")}>
        <Field label={`Tax paid (${taxPercent}%)`}>
          <Input
            aria-label="Tax paid"
            value={taxField.draft}
            onChange={(event) => taxField.onChange(event.target.value)}
            onBlur={taxField.onBlur}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            className="tabular-nums"
          />
        </Field>
        <Field label={`Tip paid (${tipPercent}%)`}>
          <Input
            aria-label="Tip paid"
            value={tipField.draft}
            onChange={(event) => tipField.onChange(event.target.value)}
            onBlur={tipField.onBlur}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            className="tabular-nums"
          />
        </Field>
      </div>

      <div className="flex gap-1.5">
        {TIP_PRESETS.map((preset) => (
          <SegmentButton
            key={preset}
            active={selectedTipPercentage === preset}
            onClick={() => applyPreset(preset)}
            className="flex-col gap-0 py-2"
          >
            <span className="tabular-nums">{preset}%</span>
            <span
              className={cn(
                "text-[10px] font-semibold tabular-nums",
                selectedTipPercentage === preset
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              $
              {money(
                Math.round(tipBase * (parseFloat(preset) / 100) * 100) / 100
              )}
            </span>
          </SegmentButton>
        ))}
      </div>

      <Group label="Tip calculated on">
        <SegmentButton active={!tipTheTax} onClick={() => setTipTheTax(false)}>
          Subtotal only
        </SegmentButton>
        <SegmentButton active={tipTheTax} onClick={() => setTipTheTax(true)}>
          Subtotal + tax
        </SegmentButton>
      </Group>

      <Group label="Split tip">
        <SegmentButton
          active={!tipAsProportion}
          onClick={() => setTipAsProportion(false)}
        >
          Evenly
        </SegmentButton>
        <SegmentButton
          active={tipAsProportion}
          onClick={() => setTipAsProportion(true)}
        >
          By meal size
        </SegmentButton>
      </Group>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
        {label}
      </div>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-xs font-bold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent",
        className
      )}
    >
      {children}
    </button>
  );
}

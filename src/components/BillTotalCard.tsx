"use client";

import React from "react";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillSummary, money } from "@/hooks/use-bill-summary";

/**
 * The headline "total bill" figure.
 *
 * `hero` is the white card that overlaps the gradient on mobile; `gradient` is
 * the compact card that sits at the top of the desktop sidebar.
 */
export default function BillTotalCard({
  variant = "hero",
  children,
  className,
}: {
  variant?: "hero" | "gradient";
  children?: React.ReactNode;
  className?: string;
}) {
  const { total, subtotal, tax, tip, itemCount, unassignedCount, balanced } =
    useBillSummary();

  const hasProblem = unassignedCount > 0 || !balanced;
  const statusText =
    unassignedCount > 0
      ? `${unassignedCount} item${unassignedCount === 1 ? "" : "s"} not assigned`
      : !balanced
        ? "totals don't add up"
        : itemCount > 0
          ? "everything is split"
          : "nothing on the tab yet";

  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "rounded-xl bg-linear-150 from-brand-from to-brand-to p-5 text-white",
          className
        )}
      >
        <div className="text-[11px] uppercase tracking-wider text-white/65">
          Total bill
        </div>
        <div className="mt-0.5 text-[26px] font-extrabold tabular-nums">
          ${money(total)}
        </div>
        <dl className="mt-3 space-y-1 rounded-lg bg-white/10 p-2.5 text-[11px]">
          <Row label="Subtotal" value={subtotal} />
          <Row label="Tax" value={tax} />
          <Row label="Tip" value={tip} />
        </dl>
        <Status hasProblem={hasProblem} text={statusText} onDark />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-card p-5 shadow-[0_10px_24px_hsl(var(--brand)/0.14)]",
        className
      )}
    >
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Total bill
      </div>
      <div className="mt-0.5 text-[32px] font-extrabold leading-none tabular-nums">
        ${money(total)}
      </div>
      <Status hasProblem={hasProblem} text={statusText} />
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-white/65">{label}</dt>
      <dd className="font-semibold tabular-nums">${money(value)}</dd>
    </div>
  );
}

function Status({
  hasProblem,
  text,
  onDark = false,
}: {
  hasProblem: boolean;
  text: string;
  onDark?: boolean;
}) {
  const Icon = hasProblem ? AlertTriangle : Check;
  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-1.5 text-xs font-bold",
        onDark
          ? hasProblem
            ? "text-amber-300"
            : "text-white/70"
          : hasProblem
            ? "text-destructive"
            : "text-positive"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {text}
    </div>
  );
}

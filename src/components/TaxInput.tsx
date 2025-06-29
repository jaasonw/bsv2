// components/TaxInput.tsx
import { BillContext, BillContextType } from "@/components/BillProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { use } from "react";

export default function TaxInput() {
  const context = use(BillContext) as BillContextType;
  const { items, tax, setTax, taxInput } = context;

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxPercentage =
    subtotal > 0 ? ((tax / subtotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="w-1/3">Tax paid ({taxPercentage}%)</Label>
      <Input
        value={tax}
        onChange={(event) => setTax(parseFloat(event.target.value))}
        type="number"
      />
    </div>
  );
}

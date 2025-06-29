import { BillContext, BillContextType } from "@/components/BillProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import React, { use } from "react";

export default function TipInput() {
  const context = use(BillContext) as BillContextType;
  const {
    items,
    tax,
    tip,
    setTip,
    tipInput,
    setTipInput,
    tipTheTax,
    selectedTipPercentage,
    setSelectedTipPercentage,
  } = context;

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + tax;

  function handleTipPercentageClick(percentage: string) {
    if (percentage === "custom") {
      setTip(0);
      setTipInput(0);
      setSelectedTipPercentage("custom");
    } else {
      const baseAmount = tipTheTax ? total : subtotal;
      const calculatedTip =
        Math.round(baseAmount * (parseFloat(percentage) / 100) * 100) / 100;
      setTip(calculatedTip);
      setTipInput(calculatedTip);
      setSelectedTipPercentage(percentage);
    }
  }

  function handleTipInputChange(value: number) {
    const roundedValue = Math.round(value * 100) / 100;
    setTip(roundedValue);
    setTipInput(roundedValue);
    setSelectedTipPercentage("custom");
  }

  return (
    <>
      <div className="flex flex-col gap-1 w-full">
        <Label className="w-1/3">Tip paid</Label>
        <Input
          value={tipInput}
          onChange={(event) =>
            handleTipInputChange(parseFloat(event.target.value))
          }
          type="number"
          step="0.01"
        />
      </div>

      <div>
        <ToggleGroup
          variant="outline"
          type="single"
          className="gap-0"
          value={selectedTipPercentage}
          onValueChange={(value) => value && handleTipPercentageClick(value)}
        >
          <ToggleGroupItem
            value="10"
            className="rounded-none rounded-l-lg text-sm p-4 flex flex-col gap-0"
          >
            <span className="font-bold">10%</span>
            <span className="text-xs text-gray-600">
              $
              {(
                Math.round((tipTheTax ? total : subtotal) * 0.1 * 100) / 100
              ).toFixed(2)}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="15"
            className="rounded-none text-sm p-4 flex flex-col gap-0"
          >
            <span className="font-bold">15%</span>
            <span className="text-xs text-gray-600">
              $
              {(
                Math.round((tipTheTax ? total : subtotal) * 0.15 * 100) / 100
              ).toFixed(2)}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="18"
            className="rounded-none text-sm p-4 flex flex-col gap-0"
          >
            <span className="font-bold">18%</span>
            <span className="text-xs text-gray-600">
              $
              {(
                Math.round((tipTheTax ? total : subtotal) * 0.18 * 100) / 100
              ).toFixed(2)}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="custom"
            className="rounded-none rounded-r-lg text-sm p-4 flex flex-col gap-0"
          >
            <span className="font-bold">Custom</span>
            <span className="text-xs text-gray-600">${tip.toFixed(2)}</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </>
  );
}

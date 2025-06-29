import { BillContext, BillContextType } from "@/components/BillProvider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React, { use } from "react";

export default function TipSettings() {
  const context = use(BillContext) as BillContextType;
  const { tipAsProportion, setTipAsProportion, tipTheTax, setTipTheTax } =
    context;

  return (
    <>
      <div className="flex w-full items-center justify-between">
        {tipTheTax ? (
          <div className="flex flex-col">
            <Label>Tip the tax</Label>
            <Label className="text-gray-400">Tip includes tax</Label>
          </div>
        ) : (
          <div className="flex flex-col">
            <Label>No tip for tax</Label>
            <Label className="text-gray-400">Tip only includes subtotal</Label>
          </div>
        )}
        <Switch
          checked={tipTheTax}
          onCheckedChange={(checked) => setTipTheTax(checked)}
        />
      </div>

      <div className="flex w-full items-center justify-between">
        {tipAsProportion ? (
          <div className="flex flex-col">
            <Label>Tip as percent of subtotal</Label>
            <Label className="text-gray-400">
              Everyone tips proportional to their meal
            </Label>
          </div>
        ) : (
          <div className="flex flex-col">
            <Label>Tip split evenly</Label>
            <Label className="text-gray-400">Everyone tips the same</Label>
          </div>
        )}
        <Switch
          checked={tipAsProportion}
          onCheckedChange={(checked) => setTipAsProportion(checked)}
        />
      </div>
    </>
  );
}

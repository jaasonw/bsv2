import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React, { use } from "react";
import PersonInput from "./PersonInput";
import ItemInput from "./ItemInput";
import PhotoUpload from "./PhotoUpload";
import TaxInput from "./TaxInput";
import TipInput from "./TipInput";
import TipSettings from "./TipSettings";

export default function DataInput() {
  const context = use(BillContext) as BillContextType;
  const {
    setItems,
    setPeople,
    setCurrentItem,
    setCurrentPrice,
    setCurrentPerson,
    setTipInput,
    setTaxInput,
    setTipAsProportion,
    setTipTheTax,
    setSelectedTipPercentage,
  } = context;

  function reset() {
    setItems([]);
    setPeople([]);
    setCurrentItem("");
    setCurrentPrice(0);
    setCurrentPerson("");
    setTipInput(0);
    setTaxInput(0);
    setTipAsProportion(true);
    setTipTheTax(false);
    setSelectedTipPercentage("");
  }

  return (
    <>
      <PersonInput />
      <Separator />
      <ItemInput />
      <PhotoUpload />
      <TaxInput />
      <TipInput />
      <TipSettings />
      <Button variant="secondary" className="w-full" onClick={reset}>
        reset
      </Button>
    </>
  );
}

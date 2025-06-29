import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use } from "react";

export default function ItemInput() {
  const context = use(BillContext) as BillContextType;
  const {
    items,
    setItems,
    currentItem,
    setCurrentItem,
    currentPrice,
    setCurrentPrice,
  } = context;

  function addItem() {
    setItems([
      ...items,
      {
        name: currentItem !== "" ? currentItem : `item ${items.length + 1}`,
        price: Number(currentPrice),
        buyers: [],
      },
    ]);
    setCurrentItem("");
    setCurrentPrice(0);
  }

  return (
    <form
      className="w-full flex gap-2 flex-col justify-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex">
        <Input
          className="w-full"
          value={currentItem}
          onChange={(event) => setCurrentItem(event.target.value)}
          placeholder="Item name"
        />
        <Input
          className="w-28"
          value={currentPrice}
          onChange={(event) => setCurrentPrice(parseFloat(event.target.value))}
          type="number"
          placeholder="Price"
        />
      </div>
      <Button className="w-full" type="submit" onClick={addItem}>
        add item
      </Button>
    </form>
  );
}

import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use, useState } from "react";

export default function ItemInput() {
  const context = use(BillContext) as BillContextType;
  const { addItem: addItemToContext } = context;

  const [currentItem, setCurrentItem] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);

  function addItem() {
    addItemToContext(currentItem, currentPrice);
    setCurrentItem("");
    setCurrentPrice(0);
  }

  return (
    <form
      className="w-full flex gap-2 flex-col justify-center"
      onSubmit={(event) => {
        event.preventDefault();
        addItem();
      }}
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
      <Button className="w-full" type="submit">
        add item
      </Button>
    </form>
  );
}

import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { use, useEffect, useState } from "react";

interface EditItemDialogProps {
  editingItemIndex: number | null;
  onClose: () => void;
}

export default function EditItemDialog({
  editingItemIndex,
  onClose,
}: EditItemDialogProps) {
  const context = use(BillContext) as BillContextType;
  const { items, setItems } = context;

  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemPrice, setEditingItemPrice] = useState(0);

  useEffect(() => {
    if (editingItemIndex !== null) {
      const item = items[editingItemIndex];
      setEditingItemName(item.name);
      setEditingItemPrice(item.price);
    }
  }, [editingItemIndex, items]);

  function handleSaveEdit() {
    if (editingItemIndex === null) return;
    const newItems = [...items];
    newItems[editingItemIndex] = {
      ...newItems[editingItemIndex],
      name: editingItemName,
      price: editingItemPrice,
    };
    setItems(newItems);
    onClose();
  }

  return (
    <Dialog
      open={editingItemIndex !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editingItemName}
              onChange={(e) => setEditingItemName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={editingItemPrice}
              onChange={(e) => setEditingItemPrice(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleSaveEdit}>Save Changes</Button>
      </DialogContent>
    </Dialog>
  );
}

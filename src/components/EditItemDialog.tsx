"use client";

import { BillContext, BillContextType } from "@/components/BillProvider";
import ResponsiveModal, { ModalField } from "@/components/ResponsiveModal";
import { noAutofill } from "@/lib/no-autofill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use, useEffect, useState } from "react";

interface EditItemDialogProps {
  editingItemIndex: number | null;
  onClose: () => void;
  onDeleteItem: (index: number) => void;
  onSaveItem: (
    index: number,
    newItem: {
      name: string;
      price: number;
    }
  ) => void;
}

export default function EditItemDialog({
  editingItemIndex,
  onClose,
  onDeleteItem,
  onSaveItem,
}: EditItemDialogProps) {
  const context = use(BillContext) as BillContextType;
  const { items } = context;

  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemPrice, setEditingItemPrice] = useState("");

  useEffect(() => {
    if (editingItemIndex !== null) {
      const item = items[editingItemIndex];
      setEditingItemName(item.name);
      setEditingItemPrice(String(item.price));
    }
  }, [editingItemIndex, items]);

  function handleSaveEdit(event?: React.FormEvent) {
    event?.preventDefault();
    if (editingItemIndex === null) return;
    onSaveItem(editingItemIndex, {
      name: editingItemName,
      price: parseFloat(editingItemPrice) || 0,
    });
    onClose();
  }

  function handleDeleteItem() {
    if (editingItemIndex === null) return;
    onDeleteItem(editingItemIndex);
    onClose();
  }

  return (
    <ResponsiveModal
      open={editingItemIndex !== null}
      onClose={onClose}
      title="Edit item"
      onSubmit={handleSaveEdit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDeleteItem}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
          >
            Delete item
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ModalField label="Name" htmlFor="edit-item-name">
          <Input
            id="edit-item-name"
            value={editingItemName}
            onChange={(event) => setEditingItemName(event.target.value)}
            enterKeyHint="next"
            {...noAutofill}
            autoCapitalize="sentences"
          />
        </ModalField>
        <ModalField label="Price" htmlFor="edit-item-price">
          <Input
            id="edit-item-price"
            type="number"
            step="0.01"
            inputMode="decimal"
            value={editingItemPrice}
            onChange={(event) => setEditingItemPrice(event.target.value)}
            enterKeyHint="done"
            {...noAutofill}
            className="tabular-nums"
          />
        </ModalField>
      </div>
    </ResponsiveModal>
  );
}

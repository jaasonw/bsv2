"use client";

import React, { useEffect, useState } from "react";
import { useBill } from "@/components/BillProvider";
import ResponsiveModal, { ModalField } from "@/components/ResponsiveModal";
import { noAutofill } from "@/lib/no-autofill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AddEntryKind = "person" | "item";

interface AddEntryDialogProps {
  kind: AddEntryKind | null;
  onClose: () => void;
}

/** "Add person" / "Add item" form. */
export default function AddEntryDialog({ kind, onClose }: AddEntryDialogProps) {
  const { addItem, addPerson } = useBill();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const open = kind !== null;
  const isItem = kind === "item";

  useEffect(() => {
    if (open) {
      setName("");
      setPrice("");
    }
  }, [open, kind]);

  function submit(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = name.trim();
    if (isItem) {
      addItem(trimmed, parseFloat(price) || 0);
    } else {
      if (!trimmed) return;
      addPerson(trimmed);
    }
    onClose();
  }

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title={isItem ? "Add item" : "Add person"}
      onSubmit={submit}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ModalField label="Name" htmlFor="add-entry-name">
          <Input
            id="add-entry-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            enterKeyHint={isItem ? "next" : "done"}
            placeholder={isItem ? "e.g. Truffle pasta" : "e.g. Alex"}
            {...noAutofill}
            autoCapitalize={isItem ? "sentences" : "words"}
          />
        </ModalField>
        {isItem && (
          <ModalField label="Price" htmlFor="add-entry-price">
            <Input
              id="add-entry-price"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              enterKeyHint="done"
              placeholder="0.00"
              {...noAutofill}
              className="tabular-nums"
            />
          </ModalField>
        )}
      </div>
    </ResponsiveModal>
  );
}

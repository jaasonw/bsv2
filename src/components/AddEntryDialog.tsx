"use client";

import React, { useEffect, useState } from "react";
import { useBill } from "@/components/BillProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AddEntryKind = "person" | "item";

interface AddEntryDialogProps {
  kind: AddEntryKind | null;
  onClose: () => void;
}

/**
 * "Add person" / "Add item" form. Centered dialog on desktop, bottom sheet on
 * mobile — the two shapes the redesign specifies.
 */
export default function AddEntryDialog({ kind, onClose }: AddEntryDialogProps) {
  const { addItem, addPerson } = useBill();
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const open = kind !== null;
  const isItem = kind === "item";
  const title = isItem ? "Add item" : "Add person";

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

  const fields = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-entry-name">Name</Label>
        <Input
          id="add-entry-name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={isItem ? "e.g. Truffle pasta" : "e.g. Alex"}
        />
      </div>
      {isItem && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-entry-price">Price</Label>
          <Input
            id="add-entry-price"
            type="number"
            step="0.01"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0.00"
            className="tabular-nums"
          />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
        <DrawerContent>
          <form onSubmit={submit}>
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">{fields}</div>
            <DrawerFooter>
              <Button type="submit" size="lg">
                Add
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={onClose}>
                Cancel
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[380px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">{fields}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

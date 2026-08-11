"use client";

import React, { use, useEffect, useState } from "react";
import { BillContext, BillContextType } from "@/components/BillProvider";
import AddEntryDialog, { type AddEntryKind } from "@/components/AddEntryDialog";
import DesktopLayout from "@/components/DesktopLayout";
import EditItemDialog from "@/components/EditItemDialog";
import EditPersonDialog from "@/components/EditPersonDialog";
import MobileLayout, { type MobileTab } from "@/components/MobileLayout";
import { createTable } from "@/lib/utils";

export default function BillSplitter() {
  const context = use(BillContext) as BillContextType;
  const {
    items,
    people,
    tip,
    tax,
    tipAsProportion,
    tipTheTax,
    setTable,
    deleteItem,
    deletePerson,
    savePerson,
    saveItem,
  } = context;

  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(
    null
  );
  const [addEntryKind, setAddEntryKind] = useState<AddEntryKind | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("scan");

  useEffect(() => {
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }, [items, people, tip, tax, tipAsProportion, tipTheTax]);

  return (
    <div className="w-full">
      <MobileLayout
        tab={mobileTab}
        setTab={setMobileTab}
        setEditingItemIndex={setEditingItemIndex}
        setEditingPersonIndex={setEditingPersonIndex}
        onAddItem={() => setAddEntryKind("item")}
        onAddPerson={() => setAddEntryKind("person")}
      />
      <DesktopLayout
        setEditingItemIndex={setEditingItemIndex}
        setEditingPersonIndex={setEditingPersonIndex}
        onAddItem={() => setAddEntryKind("item")}
        onAddPerson={() => setAddEntryKind("person")}
      />

      <AddEntryDialog
        kind={addEntryKind}
        onClose={() => setAddEntryKind(null)}
      />
      <EditItemDialog
        editingItemIndex={editingItemIndex}
        onClose={() => setEditingItemIndex(null)}
        onDeleteItem={deleteItem}
        onSaveItem={saveItem}
      />
      <EditPersonDialog
        editingPersonIndex={editingPersonIndex}
        onClose={() => setEditingPersonIndex(null)}
        onDeletePerson={deletePerson}
        onSavePerson={savePerson}
      />
    </div>
  );
}

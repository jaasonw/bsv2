"use client";

import { BillContext, BillContextType } from "@/components/BillProvider";
import EditPersonDialog from "@/components/EditPersonDialog";
import { createTable } from "@/lib/utils";
import React, { use, useEffect, useState } from "react";
import EditItemDialog from "@/components/EditItemDialog";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

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

  const [editingItemIndex, setEditingItemIndex] = React.useState<number | null>(
    null,
  );
  const [editingPersonIndex, setEditingPersonIndex] = React.useState<
    number | null
  >(null);
  const [mobileView, setMobileView] = useState<"table" | "tabs" | "compact">(
    "table",
  );

  useEffect(() => {
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }, [items, people, tip, tax, tipAsProportion, tipTheTax]);

  const placeholderText = "Add some people or items to the tab to begin";

  return (
    <div className="max-w-(--breakpoint-2xl)">
      <MobileLayout
        mobileView={mobileView}
        setMobileView={setMobileView}
        items={items}
        people={people}
        setEditingItemIndex={setEditingItemIndex}
        setEditingPersonIndex={setEditingPersonIndex}
        placeholderText={placeholderText}
      />
      <DesktopLayout
        items={items}
        people={people}
        setEditingItemIndex={setEditingItemIndex}
        setEditingPersonIndex={setEditingPersonIndex}
        placeholderText={placeholderText}
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

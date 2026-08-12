"use client";

import React, { use, useState } from "react";
import { BillContext, BillContextType } from "@/components/BillProvider";
import AddEntryDialog, { type AddEntryKind } from "@/components/AddEntryDialog";
import DesktopLayout from "@/components/DesktopLayout";
import EditItemDialog from "@/components/EditItemDialog";
import EditPersonDialog from "@/components/EditPersonDialog";
import MobileLayout, { type MobileTab } from "@/components/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BillSplitter() {
  const context = use(BillContext) as BillContextType;
  const { deleteItem, deletePerson, savePerson, saveItem } = context;
  const isMobile = useIsMobile();

  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(
    null
  );
  const [addEntryKind, setAddEntryKind] = useState<AddEntryKind | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("scan");

  const openAddItem = () => setAddEntryKind("item");
  const openAddPerson = () => setAddEntryKind("person");

  // Only one tree is mounted. Rendering both and hiding one with CSS meant
  // phones still built the desktop matrix and fired the saved-bills request.
  return (
    <div className="w-full">
      {isMobile ? (
        <MobileLayout
          tab={mobileTab}
          setTab={setMobileTab}
          setEditingItemIndex={setEditingItemIndex}
          setEditingPersonIndex={setEditingPersonIndex}
          onAddItem={openAddItem}
          onAddPerson={openAddPerson}
        />
      ) : (
        <DesktopLayout
          setEditingItemIndex={setEditingItemIndex}
          setEditingPersonIndex={setEditingPersonIndex}
          onAddItem={openAddItem}
          onAddPerson={openAddPerson}
        />
      )}

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

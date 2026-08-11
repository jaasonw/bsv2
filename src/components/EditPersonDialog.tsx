"use client";

import { BillContext, BillContextType } from "@/components/BillProvider";
import ResponsiveModal, { ModalField } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use, useEffect, useState } from "react";

interface EditPersonDialogProps {
  editingPersonIndex: number | null;
  onClose: () => void;
  onDeletePerson: (index: number) => void;
  onSavePerson: (index: number, newName: string) => void;
}

export default function EditPersonDialog({
  editingPersonIndex,
  onClose,
  onDeletePerson,
  onSavePerson,
}: EditPersonDialogProps) {
  const context = use(BillContext) as BillContextType;
  const { people } = context;

  const [editingPersonName, setEditingPersonName] = useState("");

  useEffect(() => {
    if (editingPersonIndex !== null) {
      setEditingPersonName(people[editingPersonIndex]);
    }
  }, [editingPersonIndex, people]);

  function handleSaveEdit(event?: React.FormEvent) {
    event?.preventDefault();
    if (editingPersonIndex === null) return;
    const name = editingPersonName.trim();
    if (!name) return;
    onSavePerson(editingPersonIndex, name);
    onClose();
  }

  function handleDeletePerson() {
    if (editingPersonIndex === null) return;
    onDeletePerson(editingPersonIndex);
    onClose();
  }

  return (
    <ResponsiveModal
      open={editingPersonIndex !== null}
      onClose={onClose}
      title="Edit person"
      onSubmit={handleSaveEdit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDeletePerson}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
          >
            Remove person
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </>
      }
    >
      <ModalField label="Name" htmlFor="edit-person-name">
        <Input
          id="edit-person-name"
          value={editingPersonName}
          onChange={(event) => setEditingPersonName(event.target.value)}
          enterKeyHint="done"
        />
      </ModalField>
    </ResponsiveModal>
  );
}

import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { use, useEffect, useState } from "react";

interface EditPersonDialogProps {
  editingPersonIndex: number | null;
  onClose: () => void;
  onDeletePerson: (index: number) => void;
}

export default function EditPersonDialog({
  editingPersonIndex,
  onClose,
  onDeletePerson,
}: EditPersonDialogProps) {
  const context = use(BillContext) as BillContextType;
  const { people, setPeople } = context;

  const [editingPersonName, setEditingPersonName] = useState("");

  useEffect(() => {
    if (editingPersonIndex !== null) {
      const person = people[editingPersonIndex];
      setEditingPersonName(person);
    }
  }, [editingPersonIndex, people]);

  function handleSaveEdit() {
    if (editingPersonIndex === null) return;
    const newPeople = [...people];
    newPeople[editingPersonIndex] = editingPersonName;
    setPeople(newPeople);
    onClose();
  }

  function handleDeletePerson() {
    if (editingPersonIndex === null) return;
    onDeletePerson(editingPersonIndex);
    onClose();
  }

  return (
    <Dialog
      open={editingPersonIndex !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editingPersonName}
              onChange={(e) => setEditingPersonName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDeletePerson}>
            Delete Person
          </Button>
          <Button onClick={handleSaveEdit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

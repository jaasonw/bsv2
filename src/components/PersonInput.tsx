import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use, useState } from "react";

export default function PersonInput() {
  const context = use(BillContext) as BillContextType;
  const { addPerson: addPersonToContext } = context;
  const [currentPerson, setCurrentPerson] = useState("");

  function addPerson() {
    addPersonToContext(currentPerson);
    setCurrentPerson("");
  }

  return (
    <form
      className="w-full flex gap-2 flex-col justify-center"
      onSubmit={(event) => {
        event.preventDefault();
        addPerson();
      }}
    >
      <Input
        value={currentPerson}
        onChange={(event) => setCurrentPerson(event.target.value)}
        placeholder="Enter person's name"
      />
      <Button className="w-full" type="submit">
        add person
      </Button>
    </form>
  );
}

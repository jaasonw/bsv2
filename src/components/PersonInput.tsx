import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use } from "react";

export default function PersonInput() {
  const context = use(BillContext) as BillContextType;
  const { people, setPeople, currentPerson, setCurrentPerson } = context;

  function addPerson() {
    setPeople([
      ...people,
      currentPerson !== "" ? currentPerson : `person ${people.length + 1}`,
    ]);
    setCurrentPerson("");
  }

  return (
    <form
      className="w-full flex gap-2 flex-col justify-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <Input
        value={currentPerson}
        onChange={(event) => setCurrentPerson(event.target.value)}
        placeholder="Enter person's name"
      />
      <Button className="w-full" type="submit" onClick={addPerson}>
        add person
      </Button>
    </form>
  );
}

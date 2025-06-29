"use client";
import { BillContext, BillContextType } from "@/components/BillProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTable } from "@/lib/utils";
import Link from "next/link";
import React, { use, useEffect } from "react";
import BillTable from "@/components/BillTable";
import DataInput from "@/components/DataInput";
import EditItemDialog from "@/components/EditItemDialog";
import Footer from "@/components/Footer";

export default function Form() {
  const context = use(BillContext) as BillContextType;
  const { items, people, tip, tax, tipAsProportion, tipTheTax, setTable } =
    context;

  const [editingItemIndex, setEditingItemIndex] = React.useState<number | null>(
    null,
  );

  useEffect(() => {
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }, [items, people, tip, tax, tipAsProportion, tipTheTax]);

  return (
    <Card className="w-6xl">
      <CardHeader>
        <CardTitle>bill splitter v2</CardTitle>
        <CardDescription>created by jasonw</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {(items.length !== 0 || people.length !== 0) && (
          <BillTable onEditItem={setEditingItemIndex} />
        )}
      </CardContent>
      <CardFooter className="flex flex-col w-full">
        <div className="flex flex-col w-full border rounded-md p-5 gap-5">
          <h3 className="w-full font-lg font-bold">Add a person or item to the tab to begin</h3>
          <DataInput />
          <span className="block mt-4 underline">
            <Link href="/mobile">Try the new mobile UI</Link>
          </span>
          <Footer />
        </div>
      </CardFooter>
      <EditItemDialog
        editingItemIndex={editingItemIndex}
        onClose={() => setEditingItemIndex(null)}
      />
    </Card>
  );
}

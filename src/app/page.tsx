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
import ListView from "@/components/ListView";

export default function Form() {
  const context = use(BillContext) as BillContextType;
  const { items, people, tip, tax, tipAsProportion, tipTheTax, setTable } = context;

  const [editingItemIndex, setEditingItemIndex] = React.useState<number | null>(null);

  useEffect(() => {
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }, [items, people, tip, tax, tipAsProportion, tipTheTax]);

  const placeholderText = "Add some people or items to the tab to begin";

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>bill splitter v2</CardTitle>
            <CardDescription>created by jasonw</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {(items.length !== 0 || people.length !== 0) && (
              <BillTable onEditItem={setEditingItemIndex} />
            )}
          </CardContent>
          <div className="p-6">
            <div className="flex flex-col w-full border rounded-md p-5 gap-5">
              <h3 className="w-full font-lg font-bold">{placeholderText}</h3>
              <DataInput />
              <span className="block mt-4 underline">
                <Link href="/mobile">Try the new mobile UI</Link>
              </span>
              <Footer />
            </div>
          </div>
        </Card>
      </div>

      {/* Desktop Layout - 1/5 + 3/5 + 1/5 */}
      <div className="hidden lg:flex w-full h-screen gap-4">
        {/* Sidebar - 1/5 (20%) */}
        <div className="w-1/5 min-w-[280px] overflow-y-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>bill splitter v2</CardTitle>
              <CardDescription>created by jasonw</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="flex flex-col w-full gap-5">
                <h3 className="w-full font-lg font-bold">{placeholderText}</h3>
                <DataInput />
                <span className="block mt-4 underline">
                  <Link href="/mobile">Try the new mobile UI</Link>
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content/Table - 3/5 (60%) */}
        <div className="w-3/5 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardContent className="flex-1 p-6 overflow-hidden">
              {(items.length !== 0 || people.length !== 0) ? (
                <div className="h-full overflow-auto">
                  <BillTable onEditItem={setEditingItemIndex} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Add people and items to see the bill breakdown</p>
                </div>
              )}
            </CardContent>
            {/* Footer at bottom of table section - desktop only */}
            <div className="border-t p-4">
              <Footer />
            </div>
          </Card>
        </div>

        {/* ListView - 1/5 (20%) */}
        <div className="w-1/5 min-w-[280px] overflow-hidden">
          <ListView />
        </div>
      </div>

      <EditItemDialog
        editingItemIndex={editingItemIndex}
        onClose={() => setEditingItemIndex(null)}
      />
    </div>
  );
}

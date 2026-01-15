"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BillTable from "@/components/BillTable";
import DataInput from "@/components/DataInput";
import Footer from "@/components/Footer";
import ListView from "@/components/ListView";
import { Item } from "@/lib/utils";

interface DesktopLayoutProps {
  items: Item[];
  people: string[];
  setEditingItemIndex: (index: number | null) => void;
  setEditingPersonIndex: (index: number | null) => void;
  placeholderText: string;
}

export default function DesktopLayout({
  items,
  people,
  setEditingItemIndex,
  setEditingPersonIndex,
  placeholderText,
}: DesktopLayoutProps) {
  return (
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
              <h3 className="w-full font-lg font-bold text-foreground">
                {placeholderText}
              </h3>
              <DataInput />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content/Table - 3/5 (60%) */}
      <div className="w-3/5 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 p-6 overflow-hidden">
            {items.length !== 0 || people.length !== 0 ? (
              <div className="h-full overflow-auto">
                <BillTable
                  onEditItem={setEditingItemIndex}
                  onEditPerson={setEditingPersonIndex}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
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
  );
}

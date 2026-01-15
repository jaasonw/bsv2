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
import MobileCompactList from "@/components/MobileCompactList";
import { Button } from "@/components/ui/button";
import MobilePersonTabs from "@/components/MobilePersonTabs";
import { Item } from "@/lib/utils";

interface MobileLayoutProps {
  mobileView: "table" | "tabs" | "compact";
  setMobileView: (view: "table" | "tabs" | "compact") => void;
  items: Item[];
  people: string[];
  setEditingItemIndex: (index: number | null) => void;
  setEditingPersonIndex: (index: number | null) => void;
  placeholderText: string;
}

export default function MobileLayout({
  mobileView,
  setMobileView,
  items,
  people,
  setEditingItemIndex,
  setEditingPersonIndex,
  placeholderText,
}: MobileLayoutProps) {
  return (
    <div className="block lg:hidden">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>bill splitter v2</CardTitle>
          <CardDescription>created by jasonw</CardDescription>
        </CardHeader>

        {/* Mobile View Toggle */}
        <div className="px-6 pb-4">
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={mobileView === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMobileView("table")}
              className="flex-1 h-8 text-xs"
            >
              Table
            </Button>
            <Button
              variant={mobileView === "tabs" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMobileView("tabs")}
              className="flex-1 h-8 text-xs"
            >
              By Person
            </Button>
          </div>
        </div>

        <CardContent className="grid gap-4">
          {(items.length !== 0 || people.length !== 0) && (
            <>
              {mobileView === "table" && (
                <BillTable
                  onEditItem={setEditingItemIndex}
                  onEditPerson={setEditingPersonIndex}
                />
              )}
              {mobileView === "tabs" && <MobilePersonTabs />}
              {mobileView === "compact" && <MobileCompactList />}
            </>
          )}
        </CardContent>

        <div className="p-6">
          <div className="flex flex-col w-full border rounded-md p-5 gap-5">
            <h3 className="w-full font-lg font-bold text-foreground">
              {placeholderText}
            </h3>
            <DataInput />
            <Footer />
          </div>
        </div>
      </Card>
    </div>
  );
}

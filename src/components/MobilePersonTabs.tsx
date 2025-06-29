import { BillContext, BillContextType } from "@/components/BillProvider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { List, Users } from "lucide-react";
import { createTable } from "@/lib/utils";
import ListView from "./ListView";
import React, { use, useState } from "react";

export default function MobilePersonTabs() {
  const context = use(BillContext) as BillContextType;
  const { items, setItems, people, tip, tax, tipAsProportion, setTable } = context;
  const [activeTab, setActiveTab] = useState(0);
  const [showListView, setShowListView] = useState(false);

  function toggleBuyer(itemIndex: number, person: string) {
    const newItems = [...items];
    if (newItems[itemIndex].buyers.includes(person)) {
      newItems[itemIndex].buyers = newItems[itemIndex].buyers.filter((p: string) => p !== person);
    } else {
      newItems[itemIndex].buyers = [...newItems[itemIndex].buyers, person];
    }
    setItems(newItems);
    setTable(createTable(newItems, people, tip, tax, tipAsProportion));
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Add some people to start assigning items</p>
      </div>
    );
  }

  // If showing list view, render ListView component
  if (showListView) {
    return (
      <div>
        <ListView />
        {/* Toggle button at bottom for list view */}
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowListView(false)}
            className="w-full"
          >
            <Users className="mr-2 h-4 w-4" />
            Back to Person Tabs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Tabs
        value={people[activeTab]}
        onValueChange={(value) => setActiveTab(people.indexOf(value))}
      >
        {people.map(person => (
          <TabsContent key={person} value={person} className="mt-4">
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground mb-3">
                Select items for {person}:
              </div>
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
                      {item.buyers.includes(person) && item.buyers.length > 1 && (
                        <span className="text-blue-600 dark:text-blue-400 ml-1">
                          (split {item.buyers.length} ways: ${(item.price / item.buyers.length).toFixed(2)})
                        </span>
                      )}
                      {item.buyers.includes(person) && item.buyers.length === 1 && (
                        <span className="text-green-600 dark:text-green-400 ml-1">(full amount)</span>
                      )}
                    </div>
                    {item.buyers.length > 1 && item.buyers.includes(person) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Shared with: {item.buyers.filter(b => b !== person).join(', ')}
                      </div>
                    )}
                  </div>
                  <Switch
                    checked={item.buyers.includes(person)}
                    onCheckedChange={() => toggleBuyer(index, person)}
                  />
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items added yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
        <TabsList
          className="grid w-full mb-4"
          style={{ gridTemplateColumns: `repeat(${people.length}, 1fr)` }}
        >
          {people.map(person => (
            <TabsTrigger key={person} value={person} className="text-xs px-2">
              {person}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Toggle button at bottom for person tabs */}
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowListView(true)}
          className="w-full"
        >
          <List className="mr-2 h-4 w-4" />
          Show Summary View
        </Button>
      </div>
    </div>
  );
}

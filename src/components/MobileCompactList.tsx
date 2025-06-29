import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { createTable } from "@/lib/utils";
import React, { use, useState } from "react";

export default function MobileCompactList() {
  const context = use(BillContext) as BillContextType;
  const { items, setItems, people, tip, tax, tipAsProportion, setTable } =
    context;
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  function toggleBuyer(itemIndex: number, person: string) {
    const newItems = [...items];
    if (newItems[itemIndex].buyers.includes(person)) {
      newItems[itemIndex].buyers = newItems[itemIndex].buyers.filter(
        (p: string) => p !== person,
      );
    } else {
      newItems[itemIndex].buyers = [...newItems[itemIndex].buyers, person];
    }
    setItems(newItems);
    setTable(createTable(newItems, people, tip, tax, tipAsProportion));
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Add some items to start assigning them</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border rounded-lg bg-card shadow-sm">
          <div
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() =>
              setExpandedItem(expandedItem === index ? null : index)
            }
          >
            <div className="flex-1">
              <div className="font-medium text-foreground">{item.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {item.buyers.length > 0 ? (
                  <>
                    <span className="font-medium text-foreground">
                      {item.buyers.join(", ")}
                    </span>
                    <span className="text-muted-foreground"> • </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ${(item.price / item.buyers.length).toFixed(2)} each
                    </span>
                  </>
                ) : (
                  <span className="text-destructive">No one selected</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-semibold text-foreground">
                  ${item.price.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.buyers.length} of {people.length}
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                  expandedItem === index ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {expandedItem === index && (
            <div className="border-t bg-muted/30 p-4">
              <div className="text-sm font-medium text-foreground mb-3">
                Who paid for this item?
              </div>
              <div className="grid grid-cols-1 gap-2">
                {people.map((person) => (
                  <Button
                    key={person}
                    variant={
                      item.buyers.includes(person) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleBuyer(index, person)}
                    className="justify-start h-10"
                  >
                    <Check
                      className={`h-4 w-4 mr-2 transition-opacity ${
                        item.buyers.includes(person)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span className="flex-1 text-left">{person}</span>
                    {item.buyers.includes(person) && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ${(item.price / item.buyers.length).toFixed(2)}
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              {item.buyers.length > 1 && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
                  Split {item.buyers.length} ways: $
                  {(item.price / item.buyers.length).toFixed(2)} per person
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { BillContext, BillContextType } from "@/components/BillProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { use } from "react";

export default function ListView() {
  const context = use(BillContext) as BillContextType;
  const { items, people, table, tip, tax, tipAsProportion } = context;

  // Extract individual totals from the table (last row)
  const getPersonTotal = (personIndex: number) => {
    if (table.length === 0) return "0.00";
    const lastRow = table[table.length - 1];
    // Person totals are in positions 1 to people.length in the last row
    const total = lastRow[personIndex + 1];
    if (typeof total === 'string') {
      return total.replace('$', '');
    }
    return "0.00";
  };

  // Get items that a person is buying
  const getPersonItems = (personName: string) => {
    return items.filter(item => item.buyers.includes(personName));
  };

  // Calculate item cost per person for a specific item
  const getItemCostForPerson = (item: any, personName: string) => {
    if (!item.buyers.includes(personName)) return 0;
    return item.price / item.buyers.length;
  };

  // Calculate subtotal for a person (items only)
  const getPersonSubtotal = (personName: string) => {
    const personItems = getPersonItems(personName);
    return personItems.reduce((sum, item) => sum + getItemCostForPerson(item, personName), 0);
  };

  // Calculate tip amount for a person
  const getPersonTip = (personName: string) => {
    if (tip === 0) return 0;

    if (tipAsProportion) {
      // Tip proportional to their subtotal
      const subtotal = items.reduce((sum, item) => sum + item.price, 0);
      const personSubtotal = getPersonSubtotal(personName);
      return subtotal > 0 ? (tip * personSubtotal) / subtotal : 0;
    } else {
      // Tip split evenly
      return tip / people.length;
    }
  };

  // Calculate tax amount for a person 
  const getPersonTax = (personName: string) => {
    if (tax === 0) return 0;

    // Tax is always proportional to subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const personSubtotal = getPersonSubtotal(personName);
    return subtotal > 0 ? (tax * personSubtotal) / subtotal : 0;
  };

  // Calculate percentages
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxPercentage = subtotal > 0 ? ((tax / subtotal) * 100).toFixed(1) : "0.0";
  const tipPercentage = subtotal > 0 ? ((tip / subtotal) * 100).toFixed(1) : "0.0";

  if (people.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Individual Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center">
            Add people to see individual breakdowns
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Individual Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        <div className="space-y-4">
          {people.map((person, index) => {
            const personItems = getPersonItems(person);
            const total = getPersonTotal(index);
            const personSubtotal = getPersonSubtotal(person);
            const personTip = getPersonTip(person);
            const personTax = getPersonTax(person);

            return (
              <div key={person} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-base">{person}</h3>
                  <span className="font-bold text-green-600">${total}</span>
                </div>

                {personItems.length > 0 ? (
                  <div className="space-y-1 text-sm">
                    {/* Items breakdown */}
                    {personItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between text-gray-600">
                        <span className="truncate">
                          {item.name}
                          {item.buyers.length > 1 && (
                            <span className="text-gray-400">
                              {" "}(split {item.buyers.length} ways)
                            </span>
                          )}
                        </span>
                        <span>${getItemCostForPerson(item, person).toFixed(2)}</span>
                      </div>
                    ))}

                    {/* Subtotal */}
                    <div className="flex justify-between text-gray-700 font-medium pt-1 border-t border-gray-200">
                      <span>Subtotal</span>
                      <span>${personSubtotal.toFixed(2)}</span>
                    </div>

                    {/* Tax breakdown */}
                    {personTax > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Tax ({taxPercentage}%)</span>
                        <span>${personTax.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Tip breakdown */}
                    {personTip > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>
                          Tip ({tipPercentage}%)
                          {!tipAsProportion && <span className="text-gray-400"> - split evenly</span>}
                        </span>
                        <span>${personTip.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">No items selected</p>

                    {/* Still show tip if split evenly */}
                    {personTip > 0 && !tipAsProportion && (
                      <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-200">
                        <span>Tip ({tipPercentage}%) - split evenly</span>
                        <span>${personTip.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {index < people.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 

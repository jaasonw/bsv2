import { BillContext, BillContextType } from "@/components/BillProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { use } from "react";

export default function ListView() {
  const context = use(BillContext) as BillContextType;
  const { items, people, table, tip, tax, tipAsProportion, tipTheTax } = context;

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

  // Calculate percentages based on tipTheTax setting
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + tax;
  const baseAmount = tipTheTax ? total : subtotal;

  const taxPercentage = subtotal > 0 ? ((tax / subtotal) * 100).toFixed(1) : "0.0";
  const tipPercentage = baseAmount > 0 ? ((tip / baseAmount) * 100).toFixed(1) : "0.0";

  if (people.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Individual Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
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
        <div className="space-y-6">
          {people.map((person, index) => {
            const personItems = getPersonItems(person);
            const total = getPersonTotal(index);
            const personSubtotal = getPersonSubtotal(person);
            const personTip = getPersonTip(person);
            const personTax = getPersonTax(person);

            return (
              <div key={person} className="space-y-3">
                {/* Person name */}
                <h3 className="font-semibold text-base text-foreground">{person}</h3>

                {/* Items */}
                <div className="space-y-2 text-sm">
                  {personItems.length > 0 ? (
                    personItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between">
                        <div className="flex-1">
                          <span className="text-foreground">{item.name}</span>
                          {item.buyers.length > 1 && (
                            <span className="text-muted-foreground/70 text-xs ml-1">
                              (split {item.buyers.length} ways)
                            </span>
                          )}
                        </div>
                        <span className="text-foreground font-mono">
                          ${getItemCostForPerson(item, person).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground italic">
                      No items selected
                    </div>
                  )}
                </div>

                {/* Calculations */}
                {personItems.length > 0 && (
                  <div className="space-y-1 text-sm">
                    <Separator />

                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span className="text-foreground">Subtotal:</span>
                      <span className="text-foreground font-mono">
                        ${personSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Tax */}
                    {personTax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({taxPercentage}%):</span>
                        <span className="text-muted-foreground font-mono">
                          ${personTax.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Tip */}
                    {personTip > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Tip ({tipPercentage}%{tipTheTax ? ' incl. tax' : ''})
                          {!tipAsProportion && <span className="text-xs"> - split evenly</span>}:
                        </span>
                        <span className="text-muted-foreground font-mono">
                          ${personTip.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-lg font-bold pt-2 border-t-2">
                  <span className="text-foreground">Total:</span>
                  <span className="text-green-600 dark:text-green-400 font-mono">
                    ${total}
                  </span>
                </div>

                {/* Show tip for people with no items but split evenly */}
                {personItems.length === 0 && personTip > 0 && !tipAsProportion && (
                  <div className="space-y-1 text-sm">
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tip ({tipPercentage}%{tipTheTax ? ' incl. tax' : ''}) - split evenly:
                      </span>
                      <span className="text-muted-foreground font-mono">
                        ${personTip.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {index < people.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

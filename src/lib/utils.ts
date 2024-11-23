import { type ClassValue, clsx } from "clsx";
import DataFrame from "dataframe-js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Item {
  name: string;
  price: number;
  buyers: string[];
}

export function createTable(
  items: Item[],
  people: string[],
  tip: number,
  tax: number,
  tipAsProportion: boolean,
): (string | { id: string; buyer: string })[][] {
  let df = new DataFrame([["", ...people, "price"]]);
  Object.entries(items).map((item) => {
    let [id, { name, price, buyers }] = item;
    let row = [
      name,
      ...people.map((person) => {
        return { id: id, buyer: person };
      }),
      `$${price.toFixed(2)}`,
    ];
    df = df.push(row);
  });
  df = df.push([
    "subtotal",
    ...people.map((name) => getPartialSubtotal(name, items).toFixed(2)),
    `$${getSubtotal(items).toFixed(2)}`,
  ]);
  df = df.push([
    "tax",
    ...people.map((name) => getPartialAmount(name, tax, items).toFixed(2)),
    `$${tax.toFixed(2)}`,
  ]);
  df = df.push([
    "tip",
    ...(tipAsProportion
      ? people.map((name) => getPartialAmount(name, tip, items).toFixed(2))
      : people.map(() => (tip / people.length).toFixed(2))),
    `$${tip.toFixed(2)}`,
  ]);
  df = df.push([
    "total",
    ...people.map((name) =>
      getPartialTotal(name, tip, tax, tipAsProportion, people, items).toFixed(
        2,
      ),
    ),
    `$${getTotal(tip, tax, items).toFixed(2)}`,
  ]);
  return df.toArray();
}

// returns the price of a specific item for a person
export function getPartialPrice(items: Item[], itemId: number, person: string) {
  if (items[itemId].buyers.includes(person)) {
    return (items[itemId].price / items[itemId].buyers.length).toFixed(2);
  }
  return "0.00";
}

export function getTotal(tip: number, tax: number, items: Item[]) {
  return getSubtotal(items) + tip + tax;
}

// returns the subtotal of all items on the bill (no tip no tax)
export function getSubtotal(items: Item[]) {
  return Object.entries(items).reduce((acc, [name, { price, buyers }]) => {
    return acc + price;
  }, 0);
}

// returns the total of the entire bill
export function getPartialTotal(
  person: string,
  tip: number,
  tax: number,
  tipAsProportion: boolean,
  people: string[],
  items: Item[],
) {
  let partialTip = tipAsProportion
    ? getPartialAmount(person, tip, items)
    : tip / people.length;

  return (
    getPartialSubtotal(person, items) +
    partialTip +
    getPartialAmount(person, tax, items)
  );
}

// returns the individual subtotal for a person
export function getPartialSubtotal(person: string, items: Item[]) {
  return Object.entries(items).reduce((acc, [name, { price, buyers }]) => {
    if (buyers.includes(person)) {
      return acc + price / buyers.length;
    }
    return acc;
  }, 0);
}

// returns the individual percentage amount (tip/tax) for a person
export function getPartialAmount(person: string, total: number, items: Item[]) {
  const subtotal = getSubtotal(items);
  if (subtotal === 0) return 0;
  const percentage = total / getSubtotal(items);
  return getPartialSubtotal(person, items) * percentage;
}

export function validateTotals(
  people: string[],
  tip: number,
  tax: number,
  tipAsProportion: boolean,
  items: Item[],
) {
  // sum all partial subtotals
  let calculated = people.reduce((acc, person) => {
    return (
      acc + getPartialTotal(person, tip, tax, tipAsProportion, people, items)
    );
  }, 0);

  // 0.01 epislon because you can't split the a cent, someones just gunna have to get taxed 1 cent
  return Math.abs(calculated - getTotal(tip, tax, items)) < 0.01;
}

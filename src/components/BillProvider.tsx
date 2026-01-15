"use client";
import { Item, createTable } from "@/lib/utils";
import React, { createContext, ReactNode, useState, useEffect } from "react";

export interface BillContextType {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  people: string[];
  setPeople: React.Dispatch<React.SetStateAction<string[]>>;
  currentItem: string;
  setCurrentItem: React.Dispatch<React.SetStateAction<string>>;
  currentPrice: number;
  setCurrentPrice: React.Dispatch<React.SetStateAction<number>>;
  currentPerson: string;
  setCurrentPerson: React.Dispatch<React.SetStateAction<string>>;
  tipInput: number;
  setTipInput: React.Dispatch<React.SetStateAction<number>>;
  taxInput: number;
  setTaxInput: React.Dispatch<React.SetStateAction<number>>;
  tipAsProportion: boolean;
  setTipAsProportion: React.Dispatch<React.SetStateAction<boolean>>;
  tipTheTax: boolean;
  setTipTheTax: React.Dispatch<React.SetStateAction<boolean>>;
  table: (string | { id: string; buyer: string })[][];
  setTable: React.Dispatch<
    React.SetStateAction<(string | { id: string; buyer: string })[][]>
  >;
  tip: number;
  setTip: React.Dispatch<React.SetStateAction<number>>;
  tax: number;
  setTax: React.Dispatch<React.SetStateAction<number>>;
  selectedTipPercentage: string;
  setSelectedTipPercentage: React.Dispatch<React.SetStateAction<string>>;
  deleteItem: (index: number) => void;
  deletePerson: (index: number) => void;
  savePerson: (index: number, newName: string) => void;
  saveItem: (
    index: number,
    newItem: {
      name: string;
      price: number;
    },
  ) => void;
  createTable: typeof createTable;
}

// Create the context with a default value
export const BillContext = createContext<BillContextType | undefined>(
  undefined,
);

// Create a provider component
export const BillProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentPerson, setCurrentPerson] = useState<string>("");
  const [tipInput, setTipInput] = useState<number>(0);
  const [taxInput, setTaxInput] = useState<number>(0);
  const [tipAsProportion, setTipAsProportion] = useState<boolean>(true);
  const [tipTheTax, setTipTheTax] = useState<boolean>(false);
  const [table, setTable] = useState<
    (string | { id: string; buyer: string })[][]
  >([[]]);
  const [tip, setTip] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [selectedTipPercentage, setSelectedTipPercentage] =
    useState<string>("custom");

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasData =
        items.length > 0 || people.length > 0 || tipInput > 0 || taxInput > 0;

      if (hasData) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [items, people, tipInput, taxInput]);

  const deleteItem = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const deletePerson = (index: number) => {
    const personToDelete = people[index];
    const newPeople = people.filter((_, i) => i !== index);
    const newItems = items.map((item) => ({
      ...item,
      buyers: item.buyers.filter((buyer) => buyer !== personToDelete),
    }));
    setPeople(newPeople);
    setItems(newItems);
  };

  const savePerson = (index: number, newName: string) => {
    const oldName = people[index];
    const newPeople = [...people];
    newPeople[index] = newName;

    const newItems = items.map((item) => ({
      ...item,
      buyers: item.buyers.map((buyer) => (buyer === oldName ? newName : buyer)),
    }));

    setPeople(newPeople);
    setItems(newItems);
  };

  const saveItem = (
    index: number,
    newItem: {
      name: string;
      price: number;
    },
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      name: newItem.name,
      price: newItem.price,
    };
    setItems(newItems);
  };

  const value: BillContextType = {
    items,
    setItems,
    people,
    setPeople,
    currentItem,
    setCurrentItem,
    currentPrice,
    setCurrentPrice,
    currentPerson,
    setCurrentPerson,
    tipInput,
    setTipInput,
    taxInput,
    setTaxInput,
    tipAsProportion,
    setTipAsProportion,
    tipTheTax,
    setTipTheTax,
    table,
    setTable,
    tip,
    setTip,
    tax,
    setTax,
    selectedTipPercentage,
    setSelectedTipPercentage,
    deleteItem,
    deletePerson,
    savePerson,
    saveItem,
    createTable,
  };

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
};

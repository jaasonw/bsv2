"use client";
import { Item } from '@/lib/utils';
import React, { createContext, ReactNode, useContext, useState } from 'react';



// Define the shape of your context state
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
  table: (string | { id: string; buyer: string })[][];
  setTable: React.Dispatch<React.SetStateAction<(string | { id: string; buyer: string })[][]>>;
  tip: number;
  setTip: React.Dispatch<React.SetStateAction<number>>;
  tax: number;
  setTax: React.Dispatch<React.SetStateAction<number>>;
}

// Create the context with a default value
export const BillContext = createContext<BillContextType | undefined>(undefined);

// Create a provider component
export const BillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentPerson, setCurrentPerson] = useState<string>("");
  const [tipInput, setTipInput] = useState<number>(0);
  const [taxInput, setTaxInput] = useState<number>(0);
  const [tipAsProportion, setTipAsProportion] = useState<boolean>(true);
  const [table, setTable] = useState<(string | { id: string; buyer: string })[][]>([
    [],
  ]);
  const [tip, setTip] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

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
    table,
    setTable,
    tip,
    setTip,
    tax,
    setTax,
  };

  return (
    <BillContext.Provider value={value}>
      {children}
    </BillContext.Provider>
  );
};

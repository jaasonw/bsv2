"use client";
import { Item, createTable } from "@/lib/utils";
import { Receipt } from "@/lib/receipts";
import { getPocketBase } from "@/lib/pocketbase";
import React, {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";

export interface BillContextType {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  people: string[];
  setPeople: React.Dispatch<React.SetStateAction<string[]>>;
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
  receiptImage: File | null;
  setReceiptImage: React.Dispatch<React.SetStateAction<File | null>>;
  receiptImageUrl: string | null;
  setReceiptImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
  deleteItem: (index: number) => void;
  deletePerson: (index: number) => void;
  savePerson: (index: number, newName: string) => void;
  saveItem: (
    index: number,
    newItem: {
      name: string;
      price: number;
    }
  ) => void;
  addItem: (name: string, price: number) => void;
  addPerson: (name: string) => void;
  createTable: typeof createTable;
  loadReceipt: (receipt: Receipt) => void;
}

// Create the context with a default value
export const BillContext = createContext<BillContextType | undefined>(
  undefined
);

// Create a provider component
export const BillProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [people, setPeople] = useState<string[]>([]);
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
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

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
    }
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      name: newItem.name,
      price: newItem.price,
    };
    setItems(newItems);
  };

  const addItem = (name: string, price: number) => {
    setItems((prevItems) => [
      ...prevItems,
      {
        name: name !== "" ? name : `item ${prevItems.length + 1}`,
        price: Number(price),
        buyers: [],
      },
    ]);
  };

  const addPerson = (name: string) => {
    setPeople((prevPeople) => [
      ...prevPeople,
      name !== "" ? name : `person ${prevPeople.length + 1}`,
    ]);
  };

  const loadReceipt = (receipt: Receipt) => {
    setItems(receipt.items);
    setPeople(receipt.people);
    setTaxInput(receipt.tax);
    setTax(receipt.tax);
    setTipInput(receipt.tip);
    setTip(receipt.tip);
    setTipAsProportion(receipt.tip_as_proportion);
    setTipTheTax(receipt.tip_the_tax);

    // Set receipt image if available
    if (receipt.receipt_image) {
      const pb = getPocketBase();

      // Request a short-lived file token for protected file access
      pb.files
        .getToken()
        .then((fileToken) => {
          const imageUrl = pb.files.getURL(
            receipt as any,
            receipt.receipt_image!,
            { token: fileToken }
          );
          setReceiptImageUrl(imageUrl);
        })
        .catch((err) => {
          console.error("Error loading receipt image:", err);
          setReceiptImageUrl(null);
        });
    } else {
      setReceiptImageUrl(null);
    }
    setReceiptImage(null); // Can't set File from cloud storage
  };

  const value: BillContextType = {
    items,
    setItems,
    people,
    setPeople,
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
    receiptImage,
    setReceiptImage,
    receiptImageUrl,
    setReceiptImageUrl,
    deleteItem,
    deletePerson,
    savePerson,
    saveItem,
    addItem,
    addPerson,
    createTable,
    loadReceipt,
  };

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
};

export function useBill() {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error("useBill must be used within a BillProvider");
  }
  return context;
}

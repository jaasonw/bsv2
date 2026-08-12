"use client";
import { Item, createItemId, withItemIds } from "@/lib/utils";
import { Receipt } from "@/lib/receipts";
import { getPocketBase } from "@/lib/pocketbase";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
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
  /** Who has already paid you back. UI-only, not persisted to PocketBase. */
  settled: Record<string, boolean>;
  toggleSettled: (person: string) => void;
  reset: () => void;
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
  const [tip, setTip] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [selectedTipPercentage, setSelectedTipPercentage] =
    useState<string>("custom");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [settled, setSettled] = useState<Record<string, boolean>>({});

  // Read through a ref so the listener is registered once instead of being
  // torn down and re-added on every edit.
  const hasDataRef = useRef(false);
  hasDataRef.current =
    items.length > 0 || people.length > 0 || tipInput > 0 || taxInput > 0;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasDataRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const toggleSettled = useCallback((person: string) => {
    setSettled((prev) => ({ ...prev, [person]: !prev[person] }));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setPeople([]);
    setTipInput(0);
    setTip(0);
    setTaxInput(0);
    setTax(0);
    setTipAsProportion(true);
    setTipTheTax(false);
    setSelectedTipPercentage("custom");
    setSettled({});
    setReceiptImage(null);
    setReceiptImageUrl(null);
  }, []);

  const deleteItem = useCallback((index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  }, []);

  const deletePerson = useCallback(
    (index: number) => {
      const personToDelete = people[index];
      const newPeople = people.filter((_, i) => i !== index);
      const newItems = items.map((item) => ({
        ...item,
        buyers: item.buyers.filter((buyer) => buyer !== personToDelete),
      }));
      setPeople(newPeople);
      setItems(newItems);
      setSettled((prev) => {
        const { [personToDelete]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [items, people]
  );

  const savePerson = useCallback(
    (index: number, newName: string) => {
      const oldName = people[index];
      const newPeople = [...people];
      newPeople[index] = newName;

      const newItems = items.map((item) => ({
        ...item,
        buyers: item.buyers.map((buyer) =>
          buyer === oldName ? newName : buyer
        ),
      }));

      setPeople(newPeople);
      setItems(newItems);
      setSettled((prev) => {
        if (!(oldName in prev)) return prev;
        const { [oldName]: wasSettled, ...rest } = prev;
        return { ...rest, [newName]: wasSettled };
      });
    },
    [items, people]
  );

  const saveItem = useCallback(
    (
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
    },
    [items]
  );

  const addItem = useCallback((name: string, price: number) => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: createItemId(),
        name: name !== "" ? name : `item ${prevItems.length + 1}`,
        price: Number(price),
        buyers: [],
      },
    ]);
  }, []);

  const addPerson = useCallback((name: string) => {
    setPeople((prevPeople) => [
      ...prevPeople,
      name !== "" ? name : `person ${prevPeople.length + 1}`,
    ]);
  }, []);

  const loadReceipt = useCallback((receipt: Receipt) => {
    // Receipts saved before items carried ids need them back-filled.
    setItems(withItemIds(receipt.items));
    setPeople(receipt.people);
    setTaxInput(receipt.tax);
    setTax(receipt.tax);
    setTipInput(receipt.tip);
    setTip(receipt.tip);
    setTipAsProportion(receipt.tip_as_proportion);
    setTipTheTax(receipt.tip_the_tax);
    setSettled({});

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
  }, []);

  const value: BillContextType = useMemo(
    () => ({
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
      settled,
      toggleSettled,
      reset,
      deleteItem,
      deletePerson,
      savePerson,
      saveItem,
      addItem,
      addPerson,
      loadReceipt,
    }),
    [
      items,
      people,
      tipInput,
      taxInput,
      tipAsProportion,
      tipTheTax,
      tip,
      tax,
      selectedTipPercentage,
      receiptImage,
      receiptImageUrl,
      settled,
      toggleSettled,
      reset,
      deleteItem,
      deletePerson,
      savePerson,
      saveItem,
      addItem,
      addPerson,
      loadReceipt,
    ]
  );

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
};

export function useBill() {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error("useBill must be used within a BillProvider");
  }
  return context;
}

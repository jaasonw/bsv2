import { getPocketBase } from "@/lib/pocketbase";
import type { Item } from "@/lib/utils";

export interface Receipt {
  id: string;
  user: string;
  title: string;
  items: Item[];
  people: string[];
  tax: number;
  tip: number;
  tip_as_proportion: boolean;
  tip_the_tax: boolean;
  receipt_image?: string;
  created: string;
  updated: string;
}

export interface CreateReceiptData {
  title: string;
  items: Item[];
  people: string[];
  tax: number;
  tip: number;
  tip_as_proportion: boolean;
  tip_the_tax: boolean;
  receipt_image?: File;
}

export async function saveReceipt(data: CreateReceiptData): Promise<Receipt> {
  const pb = getPocketBase();

  if (!pb.authStore.isValid) {
    throw new Error("Must be authenticated to save receipts");
  }

  const formData = new FormData();
  formData.append("user", pb.authStore.model!.id);
  formData.append("title", data.title);
  formData.append("items", JSON.stringify(data.items));
  formData.append("people", JSON.stringify(data.people));
  formData.append("tax", data.tax.toString());
  formData.append("tip", data.tip.toString());
  formData.append("tip_as_proportion", data.tip_as_proportion.toString());
  formData.append("tip_the_tax", data.tip_the_tax.toString());

  if (data.receipt_image) {
    formData.append("receipt_image", data.receipt_image);
  }

  const record = await pb.collection("receipts").create(formData);

  return record as unknown as Receipt;
}

export async function updateReceipt(
  id: string,
  data: Partial<CreateReceiptData>
): Promise<Receipt> {
  const pb = getPocketBase();

  if (!pb.authStore.isValid) {
    throw new Error("Must be authenticated to update receipts");
  }

  const record = await pb.collection("receipts").update(id, data);

  return record as unknown as Receipt;
}

export async function getReceipts(): Promise<Receipt[]> {
  const pb = getPocketBase();

  if (!pb.authStore.isValid) {
    return [];
  }

  const records = await pb.collection("receipts").getFullList({
    sort: "-created",
  });

  return records as unknown as Receipt[];
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  const pb = getPocketBase();

  if (!pb.authStore.isValid) {
    return null;
  }

  try {
    const record = await pb.collection("receipts").getOne(id);
    return record as unknown as Receipt;
  } catch {
    return null;
  }
}

export async function deleteReceipt(id: string): Promise<void> {
  const pb = getPocketBase();

  if (!pb.authStore.isValid) {
    throw new Error("Must be authenticated to delete receipts");
  }

  await pb.collection("receipts").delete(id);
}

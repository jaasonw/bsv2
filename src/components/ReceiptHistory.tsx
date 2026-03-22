"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getReceipts,
  deleteReceipt,
  type Receipt as ReceiptType,
} from "@/lib/receipts";
import { AuthenticatedImage } from "./AuthenticatedImage";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  History,
  Trash2,
  Receipt,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface ReceiptHistoryProps {
  onLoadReceipt: (receipt: ReceiptType) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ReceiptHistory({
  onLoadReceipt,
  open: controlledOpen,
  onOpenChange,
}: ReceiptHistoryProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (open && isAuthenticated) {
      loadReceipts();
    }
  }, [open, isAuthenticated]);

  const loadReceipts = async () => {
    setIsLoading(true);
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (err) {
      toast.error("Failed to load receipts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (receipt: ReceiptType) => {
    onLoadReceipt(receipt);
    setOpen(false);
    toast.success(`Loaded "${receipt.title}"`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteReceipt(deleteId);
      setReceipts(receipts.filter((r) => r.id !== deleteId));
      toast.success("Receipt deleted");
    } catch (err) {
      toast.error("Failed to delete receipt");
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Saved Receipts</SheetTitle>
            <SheetDescription>
              View and load your previously saved receipts.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved receipts yet.</p>
                <p className="text-sm">Save a receipt to see it here.</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4 pr-4">
                  {receipts.map((receipt) => {
                    return (
                      <div
                        key={receipt.id}
                        onClick={() => handleLoad(receipt)}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {receipt.title}
                            </h4>
                            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(receipt.created)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {receipt.people.length} people
                              </span>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">
                                $
                                {(
                                  receipt.items.reduce(
                                    (sum: number, item: { price: number }) =>
                                      sum + item.price,
                                    0
                                  ) +
                                  receipt.tax +
                                  receipt.tip
                                ).toFixed(2)}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                ({receipt.items.length} items)
                              </span>
                            </div>
                          </div>
                          {receipt.receipt_image && (
                            <div className="ml-3 flex-shrink-0">
                              <AuthenticatedImage
                                record={receipt}
                                filename={receipt.receipt_image}
                                className="w-20 h-20 object-cover rounded border"
                                alt="Receipt"
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-2 ml-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(receipt.id);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This receipt will be permanently
              deleted from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

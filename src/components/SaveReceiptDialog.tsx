"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBill } from "@/components/BillProvider";
import { saveReceipt } from "@/lib/receipts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Cloud, ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function SaveReceiptDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeImage, setIncludeImage] = useState(false);
  const { isAuthenticated } = useAuth();
  const {
    items,
    people,
    taxInput,
    tipInput,
    tipAsProportion,
    tipTheTax,
    receiptImage,
  } = useBill();

  const hasData = items.length > 0 || people.length > 0;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title for this receipt");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await saveReceipt({
        title: title.trim(),
        items,
        people,
        tax: taxInput,
        tip: tipInput,
        tip_as_proportion: tipAsProportion,
        tip_the_tax: tipTheTax,
        receipt_image: includeImage && receiptImage ? receiptImage : undefined,
      });

      toast.success("Receipt saved to cloud!");
      setOpen(false);
      setTitle("");
      setIncludeImage(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save receipt");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          // Reset includeImage to false when dialog closes
          setIncludeImage(false);
          setTitle("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasData}>
          <Cloud className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Receipt</DialogTitle>
          <DialogDescription>
            Save this receipt to your account so you can access it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="receipt-title">Receipt Title</Label>
            <Input
              id="receipt-title"
              placeholder="e.g., Dinner at Italian Place"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>This will save:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>{items.length} items</li>
              <li>{people.length} people</li>
              <li>Tax: ${taxInput.toFixed(2)}</li>
              <li>Tip: ${tipInput.toFixed(2)}</li>
            </ul>
          </div>

          {receiptImage && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="include-image"
                    className="text-sm font-medium"
                  >
                    Include receipt image
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Save the receipt photo with your data
                  </p>
                </div>
              </div>
              <Switch
                id="include-image"
                checked={includeImage}
                onCheckedChange={setIncludeImage}
              />
            </div>
          )}

          {receiptImage && includeImage && (
            <div className="border rounded-md p-2">
              <p className="text-xs text-muted-foreground mb-2">
                Receipt Image Preview:
              </p>
              <img
                src={URL.createObjectURL(receiptImage)}
                alt="Receipt preview"
                className="w-full h-32 object-contain rounded"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Receipt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

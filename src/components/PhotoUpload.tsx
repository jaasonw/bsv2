"use client";
import React, { use, useRef, useState } from "react";
import { BillContext } from "@/components/BillProvider";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const PhotoUpload: React.FC = () => {
  const context = use(BillContext);
  if (!context) {
    throw new Error("useBill must be used within a BillProvider");
  }
  const { setItems, setTax, setTip } = context; // Added setTip

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTaxAlert, setShowTaxAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/v1/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: "Failed to upload image and parse error response",
          }));
        throw new Error(
          errorData.error || `Failed to upload image: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const taxAmount = data.tax || 0;
      const tipAmount = data.tip || 0;

      setItems(data.items || []);
      setTax(taxAmount);
      setTip(tipAmount);

      if (taxAmount === 0 && tipAmount === 0) {
        setAlertMessage(
          "Neither tax nor tip information could be extracted or they were zero. Please verify these amounts manually.",
        );
        setShowTaxAlert(true);
      } else if (taxAmount === 0) {
        setAlertMessage(
          "Tax information could not be extracted or was zero. Please verify the amount manually.",
        );
        setShowTaxAlert(true);
      } else if (tipAmount === 0) {
        setAlertMessage(
          "Tip information could not be extracted or was zero. Please verify the amount manually.",
        );
        setShowTaxAlert(true);
      }
    } catch (error) {
      console.error("Error uploading image", error);
      // TODO: Consider setting an error state to display to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {/* Camera controls */}
          <Button
            onClick={handleTakePhoto}
            className="w-full"
            variant="outline"
          >
            <Camera className="mr-2 h-4 w-4" />
            Open Camera
          </Button>

          {/* Desktop camera preview */}
          <video
            ref={videoRef}
            className="rounded-lg border w-full aspect-video hidden"
          />

          {/* Preview */}
          {imageFile && (
            <div className="flex flex-col items-center gap-2">
              <Label>Preview</Label>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Receipt preview"
                className="rounded-md object-cover h-48 w-full"
              />
            </div>
          )}

          {/* Process button */}
          <Button
            onClick={uploadImage}
            disabled={isLoading || !imageFile}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Receipt"
            )}
          </Button>
        </CardContent>
      </Card>
      {showTaxAlert && (
        <AlertDialog open={showTaxAlert} onOpenChange={setShowTaxAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Information</AlertDialogTitle>
              <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowTaxAlert(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

function extractJSONFromResponse(response: string) {
  const match = response.match(/\{.*\}/s);

  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  }

  console.error("No JSON found");

  return { items: [], tax: 0 };
}

export default PhotoUpload;

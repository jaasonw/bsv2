"use client";
import React, { use, useRef, useState } from "react";
import { BillContext } from "@/components/BillProvider";
import { Camera, Loader2, Upload, X, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Separator } from "./ui/separator";

const PhotoUpload: React.FC = () => {
  const context = use(BillContext);
  if (!context) {
    throw new Error("useBill must be used within a BillProvider");
  }

  const { setItems, setTax, setTip, setTipInput, setSelectedTipPercentage } =
    context;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTaxAlert, setShowTaxAlert] = useState(false);
  const [showImageConfirm, setShowImageConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null,
  );
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Separate refs for camera and gallery
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadFromGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setShowImageConfirm(true);
    }
  };

  const handleConfirmUpload = () => {
    setShowImageConfirm(false);
    uploadImage();
  };

  const handleCancelUpload = () => {
    setShowImageConfirm(false);
    setImageFile(null);
    // Reset both file inputs
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleNewUpload = () => {
    setProcessedImageUrl(null);
    setImageFile(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
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
        const errorData = await response.json().catch(() => ({
          message: "Failed to upload image and parse error response",
        }));
        throw new Error(
          errorData.error || `Failed to upload image: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const taxAmount = data.tax || 0;
      const tipAmount = data.tip || 0;

      if (imageFile) {
        setProcessedImageUrl(URL.createObjectURL(imageFile));
      }

      setItems(data.items || []);
      setTax(taxAmount);
      setTip(tipAmount);
      setTipInput(tipAmount);
      setSelectedTipPercentage("custom");

      // Clear the selected image after successful upload
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }

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
      setAlertMessage(
        "Failed to process the receipt. Please try again or enter the information manually.",
      );
      setShowTaxAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-0">
      <div className="text-lg flex items-center gap-2 font-semibold mb-4">
        <Camera className="h-5 w-5" />
        Receipt Scanner
      </div>

      {/* Hidden file inputs */}
      {/* Camera input with capture attribute */}
      <Input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Gallery input without capture attribute */}
      <Input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Upload buttons */}
      {!processedImageUrl ? (
        <div className="grid grid-cols-1 gap-1">
          <Button
            onClick={handleTakePhoto}
            variant="outline"
            className="h-12 text-sm"
            disabled={isLoading}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>

          <Button
            onClick={handleUploadFromGallery}
            variant="outline"
            className="h-12 text-sm"
            disabled={isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload from Gallery
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1">
          <Button
            onClick={handleNewUpload}
            variant="outline"
            className="h-12 text-sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload a New Photo
          </Button>
          <Button
            onClick={() => setShowReviewDialog(true)}
            className="h-12 text-sm"
          >
            <Check className="mr-2 h-4 w-4" />
            Review Receipt
          </Button>
        </div>
      )}

      {/* Status indicator */}
      {imageFile && !isLoading && !processedImageUrl && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md mt-3">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-muted-foreground">
            Image ready to process
          </span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md mt-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Processing receipt...
          </span>
        </div>
      )}

      <Separator className="my-4" />

      <p className="text-xs text-muted-foreground text-center">
        {!processedImageUrl
          ? "Upload a clear image of your receipt to automatically extract items, tax, and tip information."
          : "Your receipt has been processed"}
      </p>

      {/* Image confirmation dialog */}
      <AlertDialog open={showImageConfirm} onOpenChange={setShowImageConfirm}>
        <AlertDialogContent className="max-w-3xl w-[90vw] h-[90vh] flex flex-col p-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Review Receipt</AlertDialogTitle>
          </AlertDialogHeader>

          {/* Image preview in dialog */}
          {imageFile && (
            <div className="my-4 flex-1 flex items-center justify-center overflow-hidden">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Receipt preview"
                className="rounded-md object-contain max-h-full max-w-full border"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpload}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpload}>
              <Check className="mr-2 h-4 w-4" />
              Process Receipt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tax/Tip alert dialog */}
      <AlertDialog open={showTaxAlert} onOpenChange={setShowTaxAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processing Complete</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowTaxAlert(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review receipt dialog */}
      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent className="max-w-3xl w-[90vw] h-[90vh] flex flex-col p-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Uploaded Receipt</AlertDialogTitle>
          </AlertDialogHeader>

          {processedImageUrl && (
            <div className="my-4 flex-1 flex items-center justify-center overflow-hidden">
              <img
                src={processedImageUrl}
                alt="Uploaded receipt"
                className="rounded-md object-contain max-h-full max-w-full border"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowReviewDialog(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhotoUpload;

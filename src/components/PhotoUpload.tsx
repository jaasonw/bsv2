"use client";
import React, { use, useRef, useState } from "react";
import { BillContext } from "@/components/BillProvider";
import { processImageFile, formatFileSize } from "@/lib/image-processing";
import {
  Camera,
  Loader2,
  Upload,
  X,
  Check,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
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

interface PhotoUploadProps {
  /** Drops the preview thumbnail and tightens spacing for the desktop rail. */
  dense?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ dense = false }) => {
  const context = use(BillContext);
  if (!context) {
    throw new Error("useBill must be used within a BillProvider");
  }

  const {
    setItems,
    setTax,
    setTaxInput,
    setTip,
    setTipInput,
    setSelectedTipPercentage,
    receiptImageUrl,
    setReceiptImage,
    setReceiptImageUrl,
  } = context;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTaxAlert, setShowTaxAlert] = useState(false);
  const [showImageConfirm, setShowImageConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertIsError, setAlertIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Process image: resize and convert to JPEG
    try {
      console.log(
        `Processing image: ${file.name} (${formatFileSize(file.size)})`
      );
      const processedFile = await processImageFile(file, {
        maxWidth: 1200,
        maxHeight: 2000,
        quality: 0.85,
        format: "image/jpeg",
      });
      console.log(
        `Image processed: ${processedFile.name} (${formatFileSize(processedFile.size)})`
      );
      setImageFile(processedFile);
      setShowImageConfirm(true);
    } catch (error) {
      console.error("Error processing image:", error);
      // Fallback to original file if processing fails
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
    // The "has a photo" check reads both the local preview and the one held in
    // context, so clearing only the local copy leaves the button inert.
    if (processedImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(processedImageUrl);
    }
    setProcessedImageUrl(null);
    setImageFile(null);
    setReceiptImage(null);
    setReceiptImageUrl(null);
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
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.error ||
          `Receipt scanning failed (HTTP ${response.status} ${response.statusText}).`;
        // `details` carries the raw upstream text; keep it out of the headline
        // but show it so nobody has to open devtools to see what broke.
        setErrorDetails(errorData?.details || null);
        throw new Error(message);
      }
      setErrorDetails(null);

      const data = await response.json();
      const taxAmount = data.tax || 0;
      const tipAmount = data.tip || 0;

      if (imageFile) {
        const imageUrl = URL.createObjectURL(imageFile);
        setProcessedImageUrl(imageUrl);
        setReceiptImage(imageFile);
        setReceiptImageUrl(imageUrl);
      }

      setItems(data.items || []);
      setTax(taxAmount);
      setTaxInput(taxAmount);
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

      setAlertIsError(false);
      if (taxAmount === 0 && tipAmount === 0) {
        setAlertMessage(
          "Neither tax nor tip information could be extracted or they were zero. Please verify these amounts manually."
        );
        setShowTaxAlert(true);
      } else if (taxAmount === 0) {
        setAlertMessage(
          "Tax information could not be extracted or was zero. Please verify the amount manually."
        );
        setShowTaxAlert(true);
      } else if (tipAmount === 0) {
        setAlertMessage(
          "Tip information could not be extracted or was zero. Please verify the amount manually."
        );
        setShowTaxAlert(true);
      }
    } catch (error) {
      console.error("Error uploading image", error);
      setAlertIsError(true);
      setAlertMessage(
        error instanceof Error
          ? error.message
          : "Failed to process the receipt. Please try again or enter the information manually."
      );
      setShowTaxAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const previewUrl = processedImageUrl || receiptImageUrl;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Camera className="h-4 w-4" />
        Scan a receipt
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

      {/* Preview */}
      {!dense && (
        <button
          type="button"
          onClick={
            previewUrl ? () => setShowReviewDialog(true) : handleTakePhoto
          }
          className="mb-3 flex aspect-4/3 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed bg-muted/50 text-xs text-muted-foreground"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Scanned receipt"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="flex flex-col items-center gap-1.5">
              <ImageIcon className="h-5 w-5" />
              receipt photo
            </span>
          )}
        </button>
      )}

      {/* Upload buttons */}
      {!previewUrl ? (
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={handleTakePhoto}
            className={dense ? "h-10 text-[13px]" : "h-12 text-sm"}
            disabled={isLoading}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take photo of receipt
          </Button>

          <Button
            onClick={handleUploadFromGallery}
            variant="outline"
            className={dense ? "h-9 text-xs" : "h-11 text-[13px]"}
            disabled={isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload from gallery
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => setShowReviewDialog(true)}
            className={dense ? "h-10 text-[13px]" : "h-12 text-sm"}
          >
            <Check className="mr-2 h-4 w-4" />
            Review receipt
          </Button>
          <Button
            onClick={handleNewUpload}
            variant="outline"
            className={dense ? "h-9 text-xs" : "h-11 text-[13px]"}
          >
            <Upload className="mr-2 h-4 w-4" />
            Scan a new photo
          </Button>
        </div>
      )}

      {/* Status indicator */}
      {imageFile && !isLoading && !processedImageUrl && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/60 p-3">
          <Check className="h-4 w-4 text-positive" />
          <span className="text-xs text-muted-foreground">
            Image ready to process
          </span>
        </div>
      )}

      {isLoading && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-primary/10 p-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-semibold text-primary">
            Processing receipt…
          </span>
        </div>
      )}

      {!dense && (
        <>
          <Separator className="my-3" />
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {!previewUrl
              ? "We'll read items, tax, and tip straight off the photo."
              : "Your receipt has been processed."}
          </p>
        </>
      )}

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

      {/* Tax/Tip + failure alert dialog */}
      <AlertDialog open={showTaxAlert} onOpenChange={setShowTaxAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alertIsError && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {alertIsError ? "Receipt Scan Failed" : "Processing Complete"}
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>

          {alertIsError && errorDetails && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none">
                Technical details
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-2">
                {errorDetails}
              </pre>
            </details>
          )}

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

          {(processedImageUrl || receiptImageUrl) && (
            <div className="my-4 flex-1 flex items-center justify-center overflow-hidden">
              <img
                src={processedImageUrl || receiptImageUrl || ""}
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

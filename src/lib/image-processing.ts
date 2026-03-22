/**
 * Image processing utilities for receipt uploads
 * Optimizes images for storage and AI processing
 */

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

const DEFAULT_OPTIONS: ProcessImageOptions = {
  maxWidth: 1200,
  maxHeight: 2000,
  quality: 0.85,
  format: "image/jpeg",
};

/**
 * Process an image file: resize and convert to JPEG
 * Returns a Blob that can be converted to File
 */
export async function processImage(
  file: File,
  options: ProcessImageOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > opts.maxWidth!) {
        width = opts.maxWidth!;
        height = width / aspectRatio;
      }

      if (height > opts.maxHeight!) {
        height = opts.maxHeight!;
        width = height * aspectRatio;
      }

      // Round to integers
      width = Math.round(width);
      height = Math.round(height);

      // Create canvas and draw image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Use better quality downsampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill white background (for JPEG)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        opts.format,
        opts.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Convert a Blob to a File with the original name but new extension
 */
export function blobToFile(blob: Blob, originalFile: File): File {
  const extension = blob.type === "image/jpeg" ? "jpg" : "png";
  const newName = originalFile.name.replace(/\.[^/.]+$/, `.${extension}`);
  return new File([blob], newName, { type: blob.type });
}

/**
 * Process image and return as File ready for upload
 */
export async function processImageFile(
  file: File,
  options?: ProcessImageOptions
): Promise<File> {
  const blob = await processImage(file, options);
  return blobToFile(blob, file);
}

/**
 * Get file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

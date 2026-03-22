"use client";

import React, { useEffect, useState } from "react";
import { getPocketBase } from "@/lib/pocketbase";
import { Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthenticatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  record: any;
  filename: string;
  fallback?: React.ReactNode;
}

export function AuthenticatedImage({
  record,
  filename,
  className,
  fallback,
  alt,
  ...props
}: AuthenticatedImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const pb = getPocketBase();

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // Request a short-lived file token (valid ~2 min)
        const fileToken = await pb.files.getToken();

        // Build URL with the file token as query param
        const url = pb.files.getURL(record, filename, {
          token: fileToken,
        });

        if (active) {
          setSrc(url);
        }
      } catch (err) {
        console.error("Error loading image:", err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (filename && record?.id) {
      loadImage();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [record?.id, filename]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        {fallback || <ImageIcon className="h-6 w-6 opacity-50" />}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted", className)}
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={src || ""}
      alt={alt || "Receipt"}
      className={className}
      {...props}
    />
  );
}

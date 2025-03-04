"use client"
import React, { use, useRef, useState } from 'react';
import { BillContext } from '@/components/BillProvider';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';

const PhotoUpload: React.FC = () => {
  const context = use(BillContext);
  if (!context) {
    throw new Error('useBill must be used within a BillProvider');
  }
  const { setItems, setTax } = context;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      formData.append('file', imageFile);

      const response = await fetch('/api/v1/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      const table = extractJSONFromResponse(data['choices'][0]['message']['content']);
      setItems(table.items);
      setTax(table.tax);

    } catch (error) {
      console.error('Error uploading image', error);
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
            ) : 'Process Receipt'}
          </Button>
        </CardContent>
      </Card>
    </div >
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

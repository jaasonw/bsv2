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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  // const takePicture = async () => {
  //   if (videoRef.current && canvasRef.current) {
  //     const canvas = canvasRef.current;
  //     const context = canvas.getContext('2d');
  //     if (context) {
  //       context.drawImage(videoRef.current, 0, 0);
  //       const dataUrl = canvas.toDataURL('image/png');
  //       setImageFile(dataURLtoFile(dataUrl, 'image.png'));
  //       stopCamera();
  //     }
  //   }
  // };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // const stopCamera = () => {
  //   if (videoRef.current && videoRef.current.srcObject) {
  //     const stream = videoRef.current.srcObject as MediaStream;
  //     const tracks = stream.getTracks();
  //     tracks.forEach(track => track.stop());
  //   }
  //   if (videoRef.current) {
  //     videoRef.current.srcObject = null;
  //   }
  // };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('/api/v1/parse', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', imageFile); // Must match the field name expected by the API
          return formData;
        })(),
        // Don't set Content-Type header - browser will set it automatically with boundary
      });


      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      // console.log('Image uploaded successfully', data);
      // console.log('Image uploaded successfully', data['choices'][0]['message']['content']);
      const table = extractJSONFromResponse(data['choices'][0]['message']['content'])
      console.log('Image uploaded successfully table', table);
      setItems(table.items);
      setTax(table.tax);
    } catch (error) {
      console.error('Error uploading image', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert dataURL to File
  // const dataURLtoFile = (dataUrl: string, filename: string): File => {
  //   const arr = dataUrl.split(',');
  //   const mime = arr[0].match(/:(.*?);/)![1];
  //   const bstr = atob(arr[1]);
  //   let n = bstr.length;
  //   const u8arr = new Uint8Array(n);
  //
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }
  //
  //   return new File([u8arr], filename, { type: mime });
  // };

  return (
    <div className="">
      <Card className='w-full'>
        <CardContent className="flex flex-col gap-3">
          <div className="pt-6">
            <Button onClick={startCamera} className='w-full' variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
          </div>

          <video
            ref={videoRef}
            className="rounded-lg border w-full aspect-video hidden"
          ></video>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">Upload Receipt</Label>
            <Input
              id="picture"
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            {imageFile && (
              <Card className="w-full">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">Preview</span>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="rounded-md object-cover h-48"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

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
                'Process Receipt'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


function extractJSONFromResponse(response: string) {
  // const response = `Here is your response: {"key": "value", "anotherKey": 123} Thank you!`; // Example mixed response

  const match = response.match(/\{.*\}/s); // Find JSON-like content
  if (match) {
    try {
      const json = JSON.parse(match[0]); // Parse the extracted JSON
      return json;
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  } else {
    console.error("No JSON found");
  }
}

export default PhotoUpload;

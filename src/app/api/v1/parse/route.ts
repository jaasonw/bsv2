// app/api/parse-receipt/route.ts
import { NextResponse } from "next/server";

// Function to resize image
async function resizeImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob and then to base64
      canvas
        .convertToBlob({
          type: "image/jpeg",
          quality: quality,
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.onerror = () =>
            reject(new Error("Failed to convert to base64"));
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    // Create object URL for the image
    const objectURL = URL.createObjectURL(file);
    img.src = objectURL;
  });
}

// Fallback function for server-side or when OffscreenCanvas is not available
async function fallbackResize(
  file: File,
  maxSizeKB: number = 500,
): Promise<{ base64: string; mimeType: string }> {
  const buffer = await file.arrayBuffer();
  let base64File = Buffer.from(buffer).toString("base64");
  let mimeType = file.type;

  // If file is too large, we'll just compress it by reducing quality
  // This is a simple approach - in production you might want to use a more sophisticated image processing library
  const sizeKB = (base64File.length * 3) / 4 / 1024;

  if (sizeKB > maxSizeKB) {
    // For very large files, we can try to estimate a quality reduction
    // This is approximate and may not work perfectly for all images
    console.log(
      `File size ${sizeKB.toFixed(2)}KB exceeds limit, using original size`,
    );
  }

  return { base64: base64File, mimeType };
}

export async function POST(request: Request) {
  try {
    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    let base64File: string;
    let mimeType: string;

    try {
      // Try to use client-side resizing (this will work in Edge runtime)
      if (typeof OffscreenCanvas !== "undefined") {
        base64File = await resizeImage(file, 1024, 1024, 0.8);
        mimeType = "image/jpeg"; // We convert to JPEG for better compression
      } else {
        // Fallback for environments without OffscreenCanvas
        const result = await fallbackResize(file, 500);
        base64File = result.base64;
        mimeType = result.mimeType;
      }
    } catch (resizeError) {
      console.warn("Image resizing failed, using original:", resizeError);
      // If resizing fails, use original file
      const buffer = await file.arrayBuffer();
      base64File = Buffer.from(buffer).toString("base64");
      mimeType = file.type;
    }

    // Log the approximate size for debugging
    const sizeKB = (base64File.length * 3) / 4 / 1024;
    console.log(`Processed image size: ${sizeKB.toFixed(2)}KB`);

    // Prepare messages with image
    const messages = [
      {
        role: "system",
        content:
          "Read receipt information and return JSON with items, tip, and tax. If tax information is present, you must extract it. If it is truly absent, set tax to 0. Leave buyers blank. If there is a service charge, you may consider it as part of the tip. Here is the response format for the JSON: { items: [{ name: string, price: number, buyers: [string] }], tip: number, tax: number } do not include anything except the json structure, the output should contain zero mixed content, only json. If an item is 0 dollars, do not include it. Discounts should be put as a negative item. Sometimes there will be an option to select the tip from a checkbox, if one of these is checked, use that as the tip.",
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64File}`,
            },
          },
        ],
      },
    ];

    // Call OpenRouter API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": request.headers.get("origin") || "localhost:3000",
          "X-Title": "Bill Splitter",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages,
          response_format: { type: "json_object" },
          schema: {
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    price: { type: "number" },
                    buyers: { type: "array", items: { type: "string" } },
                  },
                },
              },
              tip: { type: "number" },
              tax: { type: "number" },
            },
          },
        }),
      },
    );

    const openRouterResponse = await response.json();

    // Ensure the response structure is as expected
    if (
      !openRouterResponse.choices ||
      !openRouterResponse.choices[0] ||
      !openRouterResponse.choices[0].message ||
      !openRouterResponse.choices[0].message.content
    ) {
      console.error(
        "Invalid OpenRouter response structure:",
        openRouterResponse,
      );
      return NextResponse.json(
        {
          error: `Failed to process receipt due to invalid AI response structure: ${openRouterResponse}`,
        },
        { status: 500 },
      );
    }

    const jsonContentString = openRouterResponse.choices[0].message.content;
    let jsonData;

    try {
      jsonData = JSON.parse(jsonContentString);
    } catch (parseError) {
      console.error("Error parsing JSON content from AI:", parseError);
      console.error("Content that failed to parse:", jsonContentString);
      return NextResponse.json(
        { error: "Failed to process receipt due to invalid JSON from AI" },
        { status: 500 },
      );
    }

    console.log("Receipt data:", jsonData);
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error processing receipt:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 },
    );
  }
}

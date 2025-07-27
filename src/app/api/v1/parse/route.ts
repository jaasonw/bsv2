// app/api/parse-receipt/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";

// Function to resize image using Sharp
async function resizeImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 90,
): Promise<string> {
  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Process image with Sharp
    const resizedBuffer = await sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: "inside", // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale smaller images
      })
      .jpeg({
        quality: quality,
        progressive: true, // Better for web
      })
      .toBuffer();

    // Convert to base64
    const base64 = resizedBuffer.toString("base64");

    return base64;
  } catch (error) {
    console.error("Sharp resize error:", error);
    throw error;
  }
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

    // Resize image using Sharp
    const base64File = await resizeImage(file, 1024, 1024, 90);
    const mimeType = "image/jpeg"; // Always convert to JPEG

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

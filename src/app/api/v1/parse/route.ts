// app/api/parse-receipt/route.ts
import { NextResponse } from "next/server";

// export const runtime = 'edge' // Optional for Edge runtime

export async function POST(request: Request) {
  try {
    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Base64
    const buffer = await file.arrayBuffer();
    const base64File = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;

    // Prepare messages with image
    const messages = [
      {
        role: "system",
        content:
          "Read receipt information and return JSON with items, tip, and tax. If tax information is present, you must extract it. If it is truly absent, set tax to 0. Leave buyers blank. If there is a service charge, you may consider it as part of the tip. The written_total to display the total that is printed on the receipt. Use this written total field to validate that the combined price of all the items is correct. As much as possible try to preserve the original order of the items displayed on the receipt. Here is the response format for the JSON: { items: [{ name: string, price: number, buyers: [string] }], tip: number, tax: number, written_total } do not include anything except the json structure, the output should contain zero mixed content, only json. If an item is 0 dollars, do not include it. Discounts should be put as a negative item. Sometimes there will be an option to select the tip from a checkbox, if one of these is checked, use that as the tip. Take extra care to make sure the price is associated with the correct item as not all rows necessarily have a pricem, some of them are details for a given item like a modification or add on or the item in a different language. If there is one of these, just put it in parenthesis next to the item name",
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
          model: "google/gemini-2.5-flash-lite",
          messages,
          // "provider": {
          //   "order": ["Together"],
          //   "allow_fallbacks": false
          // },
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

    // const data = (await response.json())
    // console.log('Receipt data:', data)
    // return NextResponse.json(data)
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

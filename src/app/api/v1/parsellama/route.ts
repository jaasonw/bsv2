// app/api/parse-receipt/route.ts
import { NextResponse } from 'next/server'

// export const runtime = 'edge' // Optional for Edge runtime

export async function POST(request: Request) {
  try {
    // Get the uploaded file from FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Convert file to Base64
    const buffer = await file.arrayBuffer()
    const base64File = Buffer.from(buffer).toString('base64')
    const mimeType = file.type

    // Prepare messages with image
    const messages = [{
      role: "system",
      content: "Read receipt information and return JSON with items, tip, and tax. Leave tip and tax as 0 if you cannot find it Leave buyers blank. Here is the response format for the JSON: { items: [{ name: string, price: number, buyers: [string] }], tip: number, tax: number } do not include anything except the json structure, the output should contain zero mixed content, only json"
    }, {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64File}`
          }
        }
      ]
    }]

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': request.headers.get('origin') || 'localhost:3000',
        'X-Title': 'Bill Splitter',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages,
        // "provider": {
        //   "order": ["Together"],
        //   "allow_fallbacks": false
        // },
        response_format: { type: "json_object" },
        schema: {
          "properties": {
            "items": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "price": { "type": "number" },
                  "buyers": { "type": "array", "items": { "type": "string" } }
                }
              }
            },
            "tip": { "type": "number" },
            "tax": { "type": "number" }
          }
        }
      })
    })

    const data = (await response.json())
    console.log('Receipt data:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error processing receipt:', error)
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500 }
    )
  }
}

function extractJSONFromResponse(response) {
  // const response = `Here is your response: {"key": "value", "anotherKey": 123} Thank you!`; // Example mixed response

  const match = response.match(/\{.*\}/s); // Find JSON-like content
  if (match) {
    try {
      const json = JSON.parse(match[0]); // Parse the extracted JSON
      console.log(json);
      return json;
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  } else {
    console.error("No JSON found");
  }
}


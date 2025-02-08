
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  try {
    // Get file buffer and content type from the request
    const fileBuffer = await req.arrayBuffer();
    const contentType = req.headers.get('content-type');

    // Step 1: Upload file to Google API directly
    const uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Command': 'start, upload, finalize',
          'X-Goog-Upload-Header-Content-Length': fileBuffer.byteLength,
          'X-Goog-Upload-Header-Content-Type': contentType,
          'Content-Type': contentType,
        },
        body: Buffer.from(fileBuffer),
      }
    );

    const uploadData = await uploadResponse.json();
    const fileUri = uploadData?.file?.uri;

    if (!fileUri) {
      throw new Error('File URI not returned from upload API.');
    }

    // Step 2: Generate content with the uploaded file
    const generationResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  fileData: {
                    fileUri,
                    mimeType: contentType,
                  },
                },
              ],
            },
            {
              role: 'user',
              parts: [
                {
                  text: '', // You can add specific instructions or commands.
                },
              ],
            },
          ],
          systemInstruction: {
            role: 'user',
            parts: [
              {
                text: 'read the information in the receipt and give it to me in json format, just return an empty json structure if theres nothing to parse. you should always leave the buyers field blank',
              },
            ],
          },
          generationConfig: {
            temperature: 0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      price: {
                        type: 'number',
                      },
                      buyers: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                      },
                    },
                    required: ['name', 'price', 'buyers'],
                  },
                },
                tip: {
                  type: 'number',
                },
                tax: {
                  type: 'number',
                },
              },
              required: ['items', 'tip', 'tax'],
            },
          },
        }),
      }
    );
    const generationData = await generationResponse.json();
    const responseText = generationData.candidates[0]?.content?.parts[0]?.text;
    const jsonResponse = responseText ? JSON.parse(responseText) : {};

    // Return only the parsed JSON response
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error occurred:', error); // Log the complete error
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}

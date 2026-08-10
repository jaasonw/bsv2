// app/api/parse-receipt/route.ts
import { NextResponse } from "next/server";

// export const runtime = 'edge' // Optional for Edge runtime

// Benchmarked against 11 real receipts in receipt_samples/ (mixed CN/KR/EN,
// angled photos, auto-gratuity, hand-circled tips, discount lines).
// gpt-5-mini was the only sub-cent model that got all 11 fully correct.
const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-5-mini";

// OpenRouter reports upstream failures in a few different shapes: a top-level
// `error`, an error nested on the chosen choice, or (rarely) a bare string.
// Flatten whatever we got into something a human can read in a dialog.
function describeOpenRouterError(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const err = (payload as Record<string, unknown>).error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const message = (err as Record<string, unknown>).message;
      const code = (err as Record<string, unknown>).code;
      if (typeof message === "string") {
        return code ? `${message} (code ${code})` : message;
      }
    }
    const message = (payload as Record<string, unknown>).message;
    if (typeof message === "string") return message;
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

// Turn an HTTP status from OpenRouter into advice the user can act on.
function friendlyForStatus(status: number, message: string): string {
  if (status === 404 || /no endpoints found/i.test(message)) {
    return `The model "${MODEL}" is unavailable on OpenRouter. Set OPENROUTER_MODEL to a supported vision model. (${message})`;
  }
  if (status === 401 || status === 403) {
    return `The AI service rejected the request — check that OPENROUTER_API_KEY is set and valid. (${message})`;
  }
  if (status === 402) {
    return `Your OpenRouter account is out of credits. (${message})`;
  }
  if (status === 429) {
    return `Rate limited by OpenRouter — wait a moment and try again. (${message})`;
  }
  if (status >= 500) {
    return `OpenRouter or the "${MODEL}" provider is having an outage. Try again shortly. (${message})`;
  }
  return `The AI service failed to read the receipt: ${message}`;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Receipt scanning is not configured: OPENROUTER_API_KEY is missing on the server.",
        },
        { status: 500 }
      );
    }

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
          "Read receipt information and return JSON with items, tip, and tax. If tax information is " +
          "present, you must extract it. If it is truly absent, set tax to 0. buyers must always be " +
          "an empty array. If there is a mandatory service charge or auto-gratuity (for example " +
          "\"16% Fee\", \"15% Auto Gratuity\", \"Service Charge\"), you must count its amount as the tip. " +
          "written_total is the final amount due printed on the receipt, including tax and any " +
          "service charge or auto-gratuity; if several totals are printed use the last, largest " +
          "one. Use this written total field to validate that the combined price of all the items " +
          "plus tax plus tip is correct. If it does not reconcile, re-read the receipt and correct " +
          "whichever value you misread; never invent, pad or drop items to force the arithmetic. As " +
          "much as possible try to preserve the original order of the items displayed on the " +
          "receipt. Here is the response format for the JSON: { items: [{ name: string, price: " +
          "number, buyers: [string] }], tip: number, tax: number, written_total: number } do not " +
          "include anything except the json structure, the output should contain zero mixed " +
          "content, only json. All amounts must be plain numbers with no currency symbols and no " +
          "thousands separators. Never add markdown such as ** to item names. If an item is 0 " +
          "dollars, do not include it. Never emit Subtotal, Tax, Tip, Gratuity, Service Charge, " +
          "Total, Total Due, Payment, Card, Change or Balance rows as items. Discounts should be " +
          "put as a negative item. Sometimes there will be an option to select the tip from a " +
          "checkbox, if one of these is checked, circled or otherwise marked by hand, use that as " +
          "the tip. If a line shows a quantity greater than 1 with a single amount, that amount is " +
          "the price for the whole line; do not divide it by the quantity. Take extra care to make " +
          "sure the price is associated with the correct item as not all rows necessarily have a " +
          "price, some of them are details for a given item like a modification or add on or the " +
          "item in a different language, or a component of a set meal such as salad, soup, rice or " +
          "pickles. If there is one of these, just put it in parenthesis next to the item name " +
          "rather than emitting it as its own item.",
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
    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": request.headers.get("origin") || "localhost:3000",
          "X-Title": "Bill Splitter",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
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
      });
    } catch (networkError) {
      console.error("Could not reach OpenRouter:", networkError);
      return NextResponse.json(
        {
          error: `Could not reach the AI service (${MODEL}). Check your network connection and try again.`,
          details:
            networkError instanceof Error
              ? networkError.message
              : String(networkError),
          model: MODEL,
        },
        { status: 502 }
      );
    }

    // OpenRouter can reject early (bad key, dead model) and tear down the
    // connection while we are still streaming the image up, which makes the
    // body read — not the fetch — throw. We still have the status, so use it.
    let rawBody: string;
    try {
      rawBody = await response.text();
    } catch (bodyError) {
      const detail =
        bodyError instanceof Error
          ? bodyError.cause instanceof Error
            ? bodyError.cause.message
            : bodyError.message
          : String(bodyError);
      console.error(
        `OpenRouter connection dropped (HTTP ${response.status}) for model ${MODEL}:`,
        bodyError
      );
      return NextResponse.json(
        {
          error: response.ok
            ? `The connection to the AI service dropped while reading the response. Try again. (${detail})`
            : friendlyForStatus(response.status, detail),
          details: `HTTP ${response.status}: ${detail}`,
          model: MODEL,
        },
        { status: response.ok ? 502 : response.status }
      );
    }

    let openRouterResponse: unknown;
    try {
      openRouterResponse = JSON.parse(rawBody);
    } catch {
      console.error(
        `OpenRouter returned non-JSON (HTTP ${response.status}):`,
        rawBody.slice(0, 2000)
      );
      return NextResponse.json(
        {
          error: `The AI service returned an unreadable response (HTTP ${response.status} ${response.statusText}).`,
          details: rawBody.slice(0, 500),
          model: MODEL,
        },
        { status: 502 }
      );
    }

    // Non-2xx, or a 200 that still carries an error payload (OpenRouter does
    // this for upstream provider failures).
    const hasError =
      !!openRouterResponse &&
      typeof openRouterResponse === "object" &&
      "error" in openRouterResponse;

    if (!response.ok || hasError) {
      const message = describeOpenRouterError(openRouterResponse);
      console.error(
        `OpenRouter request failed (HTTP ${response.status}) for model ${MODEL}:`,
        openRouterResponse
      );

      return NextResponse.json(
        {
          error: friendlyForStatus(response.status, message),
          details: message,
          model: MODEL,
        },
        { status: response.status >= 400 ? response.status : 502 }
      );
    }

    // Ensure the response structure is as expected
    const choice = (openRouterResponse as any)?.choices?.[0];
    const jsonContentString = choice?.message?.content;

    if (!jsonContentString) {
      console.error(
        "Invalid OpenRouter response structure:",
        openRouterResponse
      );
      // A finish_reason of "length"/"content_filter" is the usual culprit here.
      const finishReason = choice?.finish_reason;
      return NextResponse.json(
        {
          error: finishReason
            ? `The AI returned no receipt data (stopped early: ${finishReason}). Try a clearer or smaller photo.`
            : "The AI returned an empty response. Please try again.",
          details: JSON.stringify(openRouterResponse).slice(0, 500),
          model: MODEL,
        },
        { status: 502 }
      );
    }

    let jsonData;
    try {
      jsonData = JSON.parse(jsonContentString);
    } catch (parseError) {
      console.error("Error parsing JSON content from AI:", parseError);
      console.error("Content that failed to parse:", jsonContentString);
      return NextResponse.json(
        {
          error:
            "The AI did not return valid receipt JSON. Please try again or enter the items manually.",
          details: String(jsonContentString).slice(0, 500),
          model: MODEL,
        },
        { status: 502 }
      );
    }

    console.log("Receipt data:", jsonData);
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error processing receipt:", error);
    return NextResponse.json(
      {
        error: "Failed to process receipt.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

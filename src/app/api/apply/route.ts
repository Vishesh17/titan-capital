/*
  API Route: POST /api/apply
  Receives the GetInvestment form as multipart FormData.
  - Text fields → forwarded to a Google Apps Script web app that writes a row to Google Sheets.
  - Pitch deck file → base64-encoded and sent in the same payload; the Apps Script saves it to Google Drive.

  Required env var:
    GOOGLE_SHEET_WEBHOOK_URL  — the "Deploy as web app" URL from the Apps Script.
*/

import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL ?? "";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    /* ── Extract text fields ── */
    const fields: Record<string, string> = {};
    const textKeys = [
      // Stable across retries of the same application — the Apps Script uses it
      // to update the existing row rather than append a second one.
      "submissionId",
      "firstName",
      "lastName",
      "email",
      "phoneCountry",
      "phoneDial",
      "phone",
      "linkedin",
      "companyName",
      "websiteUrl",
      "oneLiner",
      "problem",
      "industries",
      "currentStage",
      "raisingAmount",
      "raisedBefore",
      "hearAbout",
      "anythingElse",
    ];

    for (const key of textKeys) {
      const val = formData.get(key);
      if (typeof val === "string") fields[key] = val;
    }

    /* ── Extract pitch deck file (if any) ── */
    let filePayload: { name: string; mimeType: string; base64: string } | null =
      null;

    const file = formData.get("pitchDeck");
    if (file && file instanceof Blob) {
      const buffer = Buffer.from(await file.arrayBuffer());
      filePayload = {
        name: (file as File).name ?? "pitch-deck",
        mimeType: file.type || "application/octet-stream",
        base64: buffer.toString("base64"),
      };
    }

    /* ── Build payload for the Apps Script ── */
    const payload = {
      ...fields,
      timestamp: new Date().toISOString(),
      ...(filePayload
        ? {
            fileName: filePayload.name,
            fileMimeType: filePayload.mimeType,
            fileBase64: filePayload.base64,
          }
        : {}),
    };

    /* ── Forward to Google Sheet webhook ── */
    if (!WEBHOOK_URL) {
      // If webhook isn't configured yet, just log and succeed (dev mode)
      console.log("[/api/apply] No GOOGLE_SHEET_WEBHOOK_URL set. Payload:", {
        ...fields,
        fileAttached: !!filePayload,
      });
      return NextResponse.json({ success: true, message: "Saved (dev mode — no webhook configured)" });
    }

    /* Google Apps Script returns a 302 redirect whose target contains
       the actual JSON response. We follow the redirect manually to
       avoid losing the POST body (default fetch converts POST→GET on 302). */
    const sheetRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    /* Apps Script 302 → googleusercontent.com is a success if we land on 200.
       A true error is a non-2xx/3xx status with no redirect. */
    if (!sheetRes.ok && sheetRes.status !== 302) {
      const text = await sheetRes.text();
      console.error("[/api/apply] Webhook error:", sheetRes.status, text);
      return NextResponse.json(
        { success: false, message: "Failed to save submission" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    console.error("[/api/apply] Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

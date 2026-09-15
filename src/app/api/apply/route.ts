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

/** Base64 adds ~33%, and the platform caps request bodies near 4.5MB, so 3MB of
 *  file is roughly the real ceiling. Kept just under it. */
const MAX_DECK_MB = 3;
const MAX_DECK_BYTES = MAX_DECK_MB * 1024 * 1024;

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
      /* The deck is base64-encoded below, which inflates it by a third, and the
         platform rejects request bodies over ~4.5MB. So anything much past 3MB
         never even reaches this handler — the applicant just watches it hang
         and then fail. Refusing it here with a clear reason is the honest
         version of a limit that already exists. */
      if (file.size > MAX_DECK_BYTES) {
        return NextResponse.json(
          {
            success: false,
            message: `That pitch deck is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please upload a file under ${MAX_DECK_MB} MB, or send it to us by email.`,
          },
          { status: 413 }
        );
      }
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

    /* ── Server-side validation ──
       The form validates in the browser, but this endpoint is a public URL —
       anything can POST to it. Without this, an empty POST wrote an empty row
       and a bot could fill the sheet with junk. Mirrors the form's own
       required list, so the two cannot disagree. */
    const REQUIRED = [
      "firstName", "lastName", "email", "linkedin", "companyName",
      "websiteUrl", "oneLiner", "problem", "industries", "currentStage",
      "raisedBefore", "hearAbout",
    ];
    const missing = REQUIRED.filter((k) => !fields[k]?.trim());
    if (missing.length) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

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

    /* THE STATUS CODE IS NOT THE ANSWER. Apps Script replies 200 even when its
       own handler threw — the failure is reported in the BODY as
       {success:false,error:...}. Checking only the status meant a script-side
       failure was passed back to the applicant as a success, and their
       application was silently lost. */
    const raw = await sheetRes.text();
    let upstream: { success?: boolean; error?: string } | null = null;
    try {
      upstream = JSON.parse(raw);
    } catch {
      /* Not JSON — Apps Script served an HTML error page, which is what it does
         when it times out or is throttled mid-upload. */
      console.error("[/api/apply] Webhook returned non-JSON:", raw.slice(0, 300));
      return NextResponse.json(
        { success: false, message: "Failed to save submission" },
        { status: 502 }
      );
    }

    if (upstream?.success === false) {
      console.error("[/api/apply] Webhook reported failure:", upstream.error);
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

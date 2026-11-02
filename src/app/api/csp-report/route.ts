import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 16 * 1024;

/**
 * Receives CSP violation reports (`report-uri`). Bodies are attacker-supplied,
 * so they are size-capped, parsed defensively, and only the relevant fields are
 * logged.
 */
export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  try {
    const parsed = JSON.parse(raw) as {
      "csp-report"?: {
        "document-uri"?: string;
        "violated-directive"?: string;
        "blocked-uri"?: string;
        "source-file"?: string;
      };
    };
    const report = parsed["csp-report"];
    if (report) {
      console.warn("[csp] violation", {
        document: report["document-uri"]?.slice(0, 300),
        directive: report["violated-directive"]?.slice(0, 200),
        blocked: report["blocked-uri"]?.slice(0, 300),
        source: report["source-file"]?.slice(0, 300),
      });
    }
  } catch {
    // Ignore malformed reports.
  }

  return NextResponse.json({ ok: true });
}

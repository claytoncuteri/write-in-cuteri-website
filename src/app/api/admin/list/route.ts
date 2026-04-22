// GET /api/admin/list?tag=volunteer&format=json|csv
//
// Auth-gated via the admin cookie. Returns signup records filtered by tag,
// newest first. CSV export mode emits a spreadsheet-friendly download.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listSignups, listQuizRecords, type SignupTag } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TAGS = new Set<SignupTag>(["volunteer", "donor", "press", "general"]);

function csvEscape(val: unknown): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const url = new URL(req.url);
  const tagParam = url.searchParams.get("tag");
  const format = url.searchParams.get("format") ?? "json";
  const resource = url.searchParams.get("resource") ?? "signups";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "500"), 5000);

  if (resource === "quiz") {
    const records = await listQuizRecords({ limit });
    if (format === "csv") {
      const rows = [
        [
          "created_at",
          "email",
          "score_core",
          "score_extended",
          "completed_extended",
          "source_page",
          "ip_region",
        ].join(","),
        ...records.map((r) =>
          [
            r.createdAt,
            r.email ?? "",
            r.scoreCore,
            r.scoreExtended ?? "",
            r.completedExtended,
            r.sourcePage ?? "",
            r.ipRegion ?? "",
          ]
            .map(csvEscape)
            .join(","),
        ),
      ];
      return new NextResponse(rows.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cuteri-quiz.csv"`,
        },
      });
    }
    return NextResponse.json({ success: true, records });
  }

  // Default: signup records
  const tag: SignupTag | undefined = VALID_TAGS.has(tagParam as SignupTag)
    ? (tagParam as SignupTag)
    : undefined;

  const records = await listSignups({ tag, limit });

  if (format === "csv") {
    // Phone + TCPA audit-trail columns added for the SMS program. The
    // opt-in timestamp and consent wording are kept alongside the phone
    // so any TCPA compliance audit can trace a text back to its consent.
    const rows = [
      [
        "created_at",
        "tag",
        "email",
        "first_name",
        "last_name",
        "phone",
        "sms_opt_in",
        "sms_opt_in_at",
        "source_page",
        "ip_region",
        "ip_city",
        "convertkit_status",
      ].join(","),
      ...records.map((r) =>
        [
          r.createdAt,
          r.tag,
          r.email,
          r.firstName ?? "",
          r.lastName ?? "",
          r.fields?.phone ?? "",
          r.fields?.sms_opt_in ?? "",
          r.fields?.sms_opt_in_at ?? "",
          r.sourcePage ?? "",
          r.ipRegion ?? "",
          r.ipCity ?? "",
          r.convertkitStatus,
        ]
          .map(csvEscape)
          .join(","),
      ),
    ];
    return new NextResponse(rows.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="cuteri-${tag ?? "all"}.csv"`,
      },
    });
  }

    return NextResponse.json({ success: true, records });
  } catch (err) {
    // Catch-all so the endpoint never returns an empty body, which would
    // break r.json() on the client with "Unexpected end of JSON input".
    console.error("[admin-list] unexpected error", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unexpected server error",
        records: [],
      },
      { status: 500 },
    );
  }
}

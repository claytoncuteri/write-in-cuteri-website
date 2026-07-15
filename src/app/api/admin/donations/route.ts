// GET /api/admin/donations?format=json|csv
//
// Auth-gated. Returns every donation newest first (default limit
// 500). CSV mode emits an FEC-friendly export: name, address,
// employer, occupation, amount, date, and provider external id
// (which doubles as the receipt id).

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listDonations } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function csvEscape(val: unknown): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "500"), 5000);

  try {
    const records = await listDonations({ limit });
    if (format === "csv") {
      const rows = [
        [
          "created_at",
          "external_id",
          "provider",
          "amount",
          "email",
          "first_name",
          "last_name",
          "phone",
          "address",
          "city",
          "state",
          "zip",
          "recurring",
        ].join(","),
        ...records.map((r) =>
          [
            r.createdAt,
            r.externalId,
            r.provider,
            r.amount.toFixed(2),
            r.email,
            r.firstName ?? "",
            r.lastName ?? "",
            r.phone ?? "",
            r.address ?? "",
            r.city ?? "",
            r.state ?? "",
            r.zip ?? "",
            r.recurring ?? "",
          ]
            .map(csvEscape)
            .join(","),
        ),
      ];
      return new NextResponse(rows.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cuteri-donations.csv"`,
        },
      });
    }
    return NextResponse.json({ success: true, records });
  } catch (err) {
    console.error("[admin donations] failed", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to list donations",
        records: [],
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getTickets, getCurrentUser } from "@/lib/data";

function escapeCsv(value: string | number | boolean | undefined | null): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (me.role === "requester") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tickets = await getTickets();

  const headers = [
    "number",
    "title",
    "status",
    "priority",
    "category",
    "requester",
    "assignee",
    "created_at",
    "updated_at",
    "resolved_at",
    "due_at",
    "first_response_at",
    "sla_breached",
    "tags",
  ];

  const rows = tickets.map((t) =>
    [
      t.number,
      t.title,
      t.status,
      t.priority,
      t.category,
      t.requesterName,
      t.assigneeName ?? "",
      t.createdAt,
      t.updatedAt,
      t.resolvedAt ?? "",
      t.dueAt ?? "",
      t.firstResponseAt ?? "",
      t.slaBreached ? "yes" : "no",
      (t.tags ?? []).join(";"),
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

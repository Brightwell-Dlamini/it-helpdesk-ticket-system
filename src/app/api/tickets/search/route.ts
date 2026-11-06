import { NextRequest, NextResponse } from "next/server";
import { getTickets } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q || q.length < 1) {
    return NextResponse.json({ tickets: [] });
  }

  const tickets = await getTickets();

  const matched = tickets
    .filter((t) => {
      const hay = [
        t.number,
        t.title,
        t.description,
        t.requesterName,
        t.assigneeName ?? "",
        t.category,
        t.status,
        t.priority,
        ...(t.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assigneeName: t.assigneeName ?? null,
    }));

  return NextResponse.json({ tickets: matched });
}

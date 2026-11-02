import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateDueAt } from "@/lib/sla";

/**
 * Email-to-Ticket Ingestion
 * Point SendGrid/Mailgun/Postmark inbound to POST here.
 * Protect with EMAIL_INGEST_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.EMAIL_INGEST_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const from = (body.from || body.sender || "") as string;
    const subject = (body.subject || body.Subject || "Email ticket") as string;
    const text = (body.text || body["body-plain"] || body.html || "") as string;

    if (!from || !subject) {
      return NextResponse.json({ error: "Missing from or subject" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", from.toLowerCase())
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: "No matching user for sender email.", from },
        { status: 422 }
      );
    }

    const dueAt = calculateDueAt(new Date(), "medium");

    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        title: subject.slice(0, 200),
        description: text.slice(0, 10000) || "(No body)",
        category: "email",
        priority: "medium",
        requester_id: profile.id,
        due_at: dueAt.toISOString(),
        status: "open",
        tags: ["email-ingest"],
      })
      .select("id, number")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ticketId: ticket.id, number: ticket.number });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid payload" },
      { status: 400 }
    );
  }
}

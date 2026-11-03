import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let supabaseReachable = false;
  if (supabaseConfigured) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        next: { revalidate: 0 },
      });
      supabaseReachable = res.ok;
    } catch {
      supabaseReachable = false;
    }
  }

  return NextResponse.json({
    ok: true,
    app: "ApexDesk",
    mode: supabaseConfigured ? "supabase" : "mock",
    supabase: {
      configured: supabaseConfigured,
      reachable: supabaseReachable,
    },
    timestamp: new Date().toISOString(),
  });
}

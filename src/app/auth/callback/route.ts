import { NextResponse } from "next/server";

import { isDesignMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (isDesignMode()) {
    return NextResponse.redirect(new URL(next, origin));
  }

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(new URL("/login", origin));
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login", origin));
}

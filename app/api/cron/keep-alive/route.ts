import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Vercel Cron calls this endpoint to keep the Supabase Free-tier database
// from pausing after 7 days of inactivity.
// Schedule is configured in vercel.json.
export async function GET(request: Request) {
  // Verify the request comes from Vercel Cron (if CRON_SECRET is set)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Use a plain supabase-js client instead of the SSR client,
    // because cron requests have no cookies / user session.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Lightweight read query — just enough to prevent the DB from sleeping
    const { error } = await supabase.from('questions').select('id').limit(1);

    if (error) {
      console.error('[Cron] Supabase keep-alive failed:', error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`[Cron] Supabase keep-alive OK @ ${new Date().toISOString()}`);
    return NextResponse.json({ success: true, message: 'Database is awake!' });
  } catch (error: unknown) {
    console.error('[Cron] Error keeping Supabase alive:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

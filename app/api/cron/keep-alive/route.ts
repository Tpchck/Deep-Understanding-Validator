import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This endpoint receives a GET request from Vercel Cron and queries Supabase
// to prevent it from going to sleep after 7 days of inactivity (Free tier).
export async function GET(request: Request) {
  // Optional: Add basic security to ensure only Vercel can trigger this if you set up CRON_SECRET.
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // Perform a lightweight query to wake up/keep alive the database
    const { error } = await supabase.from('questions').select('id').limit(1);

    if (error) {
      console.error('[Cron] Supabase keep-alive failed:', error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('[Cron] Supabase keep-alive successful.');
    return NextResponse.json({ success: true, message: 'Database is awake!' });
  } catch (error: any) {
    console.error('[Cron] Error keeping Supabase alive:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  const envStatus = {
    clerk: !!process.env.CLERK_SECRET_KEY,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  
  const allConfigured = Object.values(envStatus).every(Boolean);
  
  return NextResponse.json({ 
    success: allConfigured,
    status: envStatus
  });
}
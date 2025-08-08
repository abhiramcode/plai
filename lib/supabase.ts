import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get Supabase client with user's JWT from Clerk
export async function getSupabaseWithUserAuth(clerkUserId: string) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          // This sets up the user_id for RLS policies
          'x-user-id': clerkUserId,
        },
      },
    }
  );
}
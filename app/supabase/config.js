import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const globalForSupabase = globalThis;

export const supabase =
    globalForSupabase.supabase ||
    createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            ...(process.env.NODE_ENV !== "production" && {
                lock: async (name, acquireTimeout, fn) => fn(),
            }),
        },
    });

if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabase = supabase;
}

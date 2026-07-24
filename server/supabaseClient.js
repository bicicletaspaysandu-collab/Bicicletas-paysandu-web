import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Polyfill WebSocket for Node.js environments
if (!global.WebSocket) {
  global.WebSocket = ws;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
}

const masterKey = serviceRoleKey || anonKey;

// Master Admin client using Secret Service Role Key (Bypasses RLS to ensure 100% reliable DB deletes and updates)
export const supabaseAdmin = createClient(supabaseUrl, masterKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabase = supabaseAdmin;

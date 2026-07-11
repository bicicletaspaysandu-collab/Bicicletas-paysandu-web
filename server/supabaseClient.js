import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Polyfill WebSocket for Node.js versions < 22
if (!global.WebSocket) {
  global.WebSocket = ws;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


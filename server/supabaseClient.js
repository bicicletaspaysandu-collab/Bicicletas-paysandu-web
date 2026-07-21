import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Polyfill WebSocket for Node.js versions < 22
if (!global.WebSocket) {
  global.WebSocket = ws;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hasServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder');
const supabaseKey = hasServiceRoleKey ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or key environment variables.');
}

if (!hasServiceRoleKey) {
  console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined or is a placeholder in your server/.env file. Falling back to ANON KEY. Database operations may fail due to strict Row Level Security (RLS) policies.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);



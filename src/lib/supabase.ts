/**
 * Supabase client configuration for calling the recovery-commander Edge Function.
 *
 * These values are PUBLISHABLE by design — they are shipped to the browser so the
 * frontend can authenticate against the Supabase gateway. The GROQ_API_KEY itself
 * never leaves the server; it lives only in Supabase Edge Function secrets.
 */
export const SUPABASE_URL = 'https://oguwuayvjdtbabniaxwu.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndXd1YXl2amR0YmFibmlheHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjQyMzAsImV4cCI6MjEwMTcwMDIzMH0.kvwFvLvuw12wIGo4aaPTccu-crSmPO-3_AUe79McRYo';

export const RECOVERY_COMMANDER_FUNCTION = `${SUPABASE_URL}/functions/v1/recovery-commander`;

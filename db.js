import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env");
}

// Server-side client only — uses the secret key, which bypasses Row Level
// Security. Never expose this key to the frontend.
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false },
});

export async function getAll() {
  const { data, error } = await supabase.from("store").select("key, value");
  if (error) throw error;
  const result = {};
  for (const row of data) {
    result[row.key] = row.value;
  }
  return result;
}

export async function getOne(key) {
  const { data, error } = await supabase.from("store").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data ? data.value : undefined;
}

export async function setOne(key, value) {
  const { error } = await supabase
    .from("store")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export default supabase;

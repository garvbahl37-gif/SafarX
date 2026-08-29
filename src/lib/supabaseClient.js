import { createClient } from "@supabase/supabase-js";

// Fall back to a placeholder project so the app still boots when env vars
// are missing (fresh clones, demos) — storage/db calls will fail gracefully.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "public-anon-key";

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn("VITE_SUPABASE_URL is not set — Supabase features disabled.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * There is deliberately no admin client here.
 *
 * This file used to read VITE_SUPABASE_SERVICE_ROLE_KEY to "bypass RLS" for
 * uploads. A service role key bypasses every row-level policy in the project —
 * full read, write and delete on every table and bucket — and anything with a
 * VITE_ prefix is compiled into the JavaScript served to every visitor. Setting
 * that variable would have handed the whole database to anyone who opened
 * devtools.
 *
 * Uploads go through the anon key and are governed by row-level security, which
 * is what RLS is for. If a policy blocks a legitimate upload, the fix is the
 * policy, not a skeleton key in the browser.
 */
export const supabaseAdmin = supabase;

// ✅ BYPASS RLS - Use admin client
export const uploadFileToStorage = async (file, filePath) => {
  try {
    console.log("📤 BYPASS RLS - Uploading:", filePath);

    const client = supabaseAdmin || supabase;

    const { data, error } = await client.storage
      .from("hidden-gems")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ CRITICAL: Storage RLS still active");
      console.error("Fix: Storage → hidden-gems → RLS OFF + Public ON");
      throw new Error(`RLS BLOCK: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("hidden-gems").getPublicUrl(data.path);

    console.log("✅ BYPASS SUCCESS:", publicUrl);
    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error("🚨 STORAGE RLS ERROR - GO TO SUPABASE NOW");
    throw error;
  }
};

// ✅ Database insert (RLS must be OFF on table)
export const insertHeritageGem = async (data) => {
  try {
    console.log("💾 Inserting:", data.title);

    const { data: insertedData, error } = await supabase
      .from("hidden_gems")
      .insert([data])
      .select();

    if (error) {
      console.error("❌ TABLE RLS ERROR - DISABLE table RLS");
      throw new Error(`Table RLS: ${error.message}`);
    }

    console.log("✅ INSERT SUCCESS:", insertedData[0]?.id);
    return insertedData[0];
  } catch (error) {
    throw error;
  }
};

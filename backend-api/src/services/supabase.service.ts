import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Admin Supabase client using Service Role Key.
 * Lazy-loaded so dotenv is guaranteed to have run first.
 * Use this on the backend ONLY — never expose to frontend.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    }
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}


/**
 * Upload an image buffer to Supabase Storage
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const BUCKET_NAME = "scan-images";

  const { error } = await getSupabaseAdmin().storage
    .from(BUCKET_NAME)
    .upload(fileName, imageBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = getSupabaseAdmin().storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
}

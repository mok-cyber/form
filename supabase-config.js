/*
  Supabase browser configuration
  --------------------------------
  Replace the two placeholder values below with:
    1. Your Supabase Project URL
    2. Your Supabase publishable key (starts with sb_publishable_)

  Never put an sb_secret_ key or service_role key in this file.
  This file is public when deployed to GitHub Pages.
*/

(() => {
  "use strict";

  const SUPABASE_URL = "https://bkoiwuvxmxqfdqysxpaa.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_clXAia8SdwvuvUKx5E8sgw_4pnDlBnX";

  const looksConfigured =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("YOUR_") &&
    SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_") &&
    !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_");

  if (!looksConfigured) {
    window.supabaseClient = null;
    window.isSupabaseConfigured = false;
    console.info("Supabase is not configured yet. Follow README.md to add your Project URL and publishable key.");
    return;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    window.supabaseClient = null;
    window.isSupabaseConfigured = false;
    console.error("Supabase JS did not load. Check your internet connection or CDN access.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
  window.isSupabaseConfigured = true;
})();

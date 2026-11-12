
// CampusCompass - Supabase connection

const SUPABASE_URL = "https://obysshmohzbowvbqhkkq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EywYTSLS9MVB-2SC0iWuCQ_Pw4qG_s3";

// Create one shared Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Make it available to all page scripts
window.supabaseClient = supabaseClient;

console.log("CampusCompass: Supabase client initialized.");

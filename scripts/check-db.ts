import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("❌ Missing Supabase Credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    console.log("🔍 Checking 'system_logs' table...");
    // Attempt to select from the table. Using head: true to avoid fetching data.
    const { error } = await supabase.from('system_logs').select('*', { count: 'exact', head: true });

    if (error) {
        console.error("❌ Error accessing 'system_logs' table:", error.message);
        console.error("👉 Detailed Error:", error);
        console.error("💡 Action Required: Go to Supabase SQL Editor and run migrations/20260202_system_logs.sql");
        process.exit(1);
    }

    console.log("✅ 'system_logs' table exists and is accessible.");
}

check();

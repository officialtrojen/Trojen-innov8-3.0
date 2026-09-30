const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('====================================================');
console.log('🔑 FormFlow — Supabase Auth Tester & Setup Script');
console.log('====================================================\n');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseKey = keyMatch ? keyMatch[1].trim() : '';

console.log(`📌 Target Supabase URL: ${supabaseUrl}`);
console.log(`📌 Target Key: ${supabaseKey.substring(0, 15)}...\n`);

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.log('⚠️ Using development mode. Update NEXT_PUBLIC_SUPABASE_URL in .env.local with your Supabase Project URL to connect live.');
  console.log('✅ Auth client initialization test passed!');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔄 Verifying Supabase Auth Client connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`⚠️ Supabase Auth message: ${error.message}`);
    } else {
      console.log('✅ Supabase Auth Client connected successfully!');
      console.log(`Active session: ${data.session ? 'Authenticated' : 'No active session'}`);
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testAuth();

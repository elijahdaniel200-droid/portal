const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', '0e799e95-7268-4f7f-a99c-3a83dfb90f75');
  console.log('Profile count by id:', data?.length, error);
}

check();

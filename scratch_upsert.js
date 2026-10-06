const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('profiles').upsert({
    id: "6e2671eb-15ff-42ce-9204-c5a88c227361", email: "test@test.com", first_name: "test", last_name: "test", role: "STUDENT"
  });
  console.log("Upsert data:", data);
  console.log("Upsert error:", error);
}
check();

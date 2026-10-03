const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: students } = await supabase.from('students').select('*').limit(1);
  const student_id = students[0].id;
  const { data: student, error: sErr } = await supabase
      .from('students')
      .select(`
        id, enrollment_number, class_id,
        profiles!inner ( first_name, last_name, email )
      `)
      .eq('id', student_id)
      .single();
  console.log("student:", student);
  console.log("sErr:", sErr);
}
run();

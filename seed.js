const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  // 1. Create class
  let { data: cls } = await supabase.from('classes').insert({ name: 'Grade 10 Science' }).select().single();
  if (!cls) {
    const { data: existing } = await supabase.from('classes').select('*').limit(1).single();
    cls = existing;
  }
  
  if (!cls) return console.log("Failed to create or find class");

  // 2. Create subjects
  const subs = [
    { name: 'Mathematics', code: 'MTH101' },
    { name: 'Physics', code: 'PHY101' },
    { name: 'Chemistry', code: 'CHM101' }
  ];
  const createdSubs = [];
  for (let s of subs) {
    const { data: subject } = await supabase.from('subjects').upsert(s, { onConflict: 'code' }).select().single();
    if (subject) createdSubs.push(subject);
  }

  // 3. Link subjects to class
  for (let sub of createdSubs) {
    await supabase.from('class_subjects').insert({ class_id: cls.id, subject_id: sub.id }).select().single();
  }

  // 4. Update all students to have this class
  await supabase.from('students').update({ class_id: cls.id }).neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log("Seeding complete. Students now assigned to:", cls.name);
}
seed();

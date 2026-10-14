const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(url, key);

async function seedSubjectsAndClassSubjects() {
  console.log('🚀 Seeding subjects & class_subjects...');

  // 1. Fetch teachers
  const { data: teachers } = await sb.from('teachers').select('id');
  const teacherIds = teachers.map(t => t.id);

  // 2. Core Subjects (matching subjects table: name, code)
  const subjectsToCreate = [
    { name: 'Mathematics', code: 'MTH101' },
    { name: 'English Language', code: 'ENG101' },
    { name: 'Physics', code: 'PHY101' },
    { name: 'Chemistry', code: 'CHM101' },
    { name: 'Biology', code: 'BIO101' },
    { name: 'Economics', code: 'ECO101' },
    { name: 'Civic Education', code: 'CIV101' },
    { name: 'Literature in English', code: 'LIT101' }
  ];

  const subjectMap = new Map();
  for (const s of subjectsToCreate) {
    const { data: existing } = await sb.from('subjects').select('*').eq('code', s.code).single();
    if (existing) {
      subjectMap.set(s.code, existing.id);
      console.log(`  Existing subject: ${s.name} (${s.code}) -> ${existing.id}`);
    } else {
      const { data: created, error } = await sb.from('subjects').insert(s).select().single();
      if (created) {
        subjectMap.set(s.code, created.id);
        console.log(`  Created subject: ${s.name} (${s.code}) -> ${created.id}`);
      } else if (error) {
        console.error(`  Error creating subject ${s.code}:`, error.message);
      }
    }
  }

  // 3. Fetch all classes
  const { data: classes } = await sb.from('classes').select('id, name');
  console.log(`Found ${classes.length} classes.`);

  // 4. Link every class with core subjects and assign teachers
  const subjectList = Array.from(subjectMap.entries());
  let linkedCount = 0;

  for (const cls of classes) {
    for (let i = 0; i < subjectList.length; i++) {
      const [code, subId] = subjectList[i];
      const assignedTeacherId = teacherIds[(i + classes.indexOf(cls)) % teacherIds.length] || teacherIds[0];

      const { data: existingCS } = await sb.from('class_subjects')
        .select('id')
        .eq('class_id', cls.id)
        .eq('subject_id', subId)
        .single();

      if (!existingCS) {
        const { error: csErr } = await sb.from('class_subjects').insert({
          class_id: cls.id,
          subject_id: subId,
          teacher_id: assignedTeacherId
        });
        if (!csErr) linkedCount++;
      }
    }
  }

  console.log(`✅ Successfully linked ${linkedCount} class_subjects across all classes!`);
}

seedSubjectsAndClassSubjects()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

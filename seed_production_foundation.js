const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(url, key);

async function seedProductionFoundation() {
  console.log('🚀 Seeding foundational academic structure...');

  // 1. Fetch teachers
  const { data: teachers, error: tErr } = await sb.from('teachers').select('id, profiles(first_name, last_name)');
  if (tErr) throw tErr;
  console.log(`Found ${teachers.length} teachers.`);

  const teacherIds = teachers.map(t => t.id);
  const defaultTeacherId = teacherIds[0] || null;

  // 2. Classes to ensure exist
  const classNames = [
    'JSS 1 Gold',
    'JSS 2 Gold',
    'JSS 3 Gold',
    'SS 1 Science',
    'SS 2 Science',
    'SS 3 Science',
    'SS 1 Arts',
    'SS 2 Arts',
    'SS 3 Arts'
  ];

  const classMap = new Map();
  for (let i = 0; i < classNames.length; i++) {
    const name = classNames[i];
    const formTeacherId = teacherIds[i % teacherIds.length] || defaultTeacherId;

    // Check if class exists
    const { data: existing } = await sb.from('classes').select('*').eq('name', name).single();
    if (existing) {
      classMap.set(name, existing.id);
      console.log(`  Existing class: ${name} (${existing.id})`);
    } else {
      const { data: created, error: cErr } = await sb.from('classes').insert({
        name,
        form_teacher_id: formTeacherId
      }).select().single();
      if (cErr) {
        console.error(`  Error creating class ${name}:`, cErr.message);
      } else {
        classMap.set(name, created.id);
        console.log(`  Created class: ${name} (${created.id})`);
      }
    }
  }

  // 3. Subjects to ensure exist
  const subjectsToCreate = [
    { name: 'Mathematics', code: 'MTH101', is_elective: false },
    { name: 'English Language', code: 'ENG101', is_elective: false },
    { name: 'Physics', code: 'PHY101', is_elective: false },
    { name: 'Chemistry', code: 'CHM101', is_elective: false },
    { name: 'Biology', code: 'BIO101', is_elective: false },
    { name: 'Economics', code: 'ECO101', is_elective: false },
    { name: 'Civic Education', code: 'CIV101', is_elective: false },
    { name: 'Literature in English', code: 'LIT101', is_elective: true }
  ];

  const subjectMap = new Map();
  for (const s of subjectsToCreate) {
    const { data: existing } = await sb.from('subjects').select('*').eq('code', s.code).single();
    if (existing) {
      subjectMap.set(s.code, existing.id);
      console.log(`  Existing subject: ${s.name} (${s.code})`);
    } else {
      const { data: created, error: sErr } = await sb.from('subjects').insert(s).select().single();
      if (sErr) {
        console.error(`  Error creating subject ${s.code}:`, sErr.message);
      } else {
        subjectMap.set(s.code, created.id);
        console.log(`  Created subject: ${s.name} (${s.code})`);
      }
    }
  }

  // 4. Link Class-Subjects
  console.log('Linking Class-Subjects...');
  const defaultClassId = classMap.get('SS 3 Science') || Array.from(classMap.values())[0];
  const subjectIds = Array.from(subjectMap.values());

  for (let i = 0; i < subjectIds.length; i++) {
    const subId = subjectIds[i];
    const assignedTeacher = teacherIds[i % teacherIds.length] || defaultTeacherId;

    const { data: existingCS } = await sb.from('class_subjects')
      .select('*')
      .eq('class_id', defaultClassId)
      .eq('subject_id', subId)
      .single();

    if (!existingCS) {
      await sb.from('class_subjects').insert({
        class_id: defaultClassId,
        subject_id: subId,
        teacher_id: assignedTeacher
      });
    }
  }
  console.log(`  Linked ${subjectIds.length} subjects to ${defaultClassId}`);

  // 5. Assign Students to Classes
  console.log('Assigning students to classes...');
  const { data: students, error: stuErr } = await sb.from('students').select('id, enrollment_number, class_id');
  if (stuErr) throw stuErr;

  const classIds = Array.from(classMap.values());
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const targetClassId = classIds[i % classIds.length];
    if (!student.class_id) {
      await sb.from('students').update({ class_id: targetClassId }).eq('id', student.id);
      console.log(`  Assigned student ${student.enrollment_number} -> class ${targetClassId}`);
    }
  }

  // 6. Active Term Verification
  let { data: activeTerm } = await sb.from('academic_terms').select('*').eq('is_active', true).limit(1).single();
  if (!activeTerm) {
    const { data: term } = await sb.from('academic_terms').insert({
      name: 'First Term 2026/2027',
      start_date: '2026-09-15',
      end_date: '2026-12-18',
      is_active: true
    }).select().single();
    activeTerm = term;
    console.log('  Created active term: First Term 2026/2027');
  } else {
    console.log(`  Active term confirmed: ${activeTerm.name} (${activeTerm.id})`);
  }

  // 7. Generate Sample Term Invoices for Students
  console.log('Generating term invoices for students without invoices...');
  const { data: existingInvoices } = await sb.from('invoices').select('student_id');
  const studentsWithInvoices = new Set((existingInvoices || []).map(inv => inv.student_id));

  for (const student of students) {
    if (!studentsWithInvoices.has(student.id)) {
      const { error: invErr } = await sb.from('invoices').insert({
        student_id: student.id,
        term_id: activeTerm.id,
        amount: 85000.00,
        description: 'First Term Tuition & Facility Levies 2026/2027',
        due_date: '2026-11-30',
        status: 'PENDING'
      });
      if (!invErr) {
        console.log(`  Created invoice ₦85,000 for student ${student.enrollment_number}`);
      }
    }
  }

  console.log('✅ Foundational academic data successfully seeded and verified.');
}

seedProductionFoundation()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });

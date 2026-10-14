const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(url, key);

function calcGrade(score) {
  if (score >= 75) return { grade: 'A1', remarks: 'Distinction' };
  if (score >= 70) return { grade: 'B2', remarks: 'Very Good' };
  if (score >= 65) return { grade: 'B3', remarks: 'Good' };
  if (score >= 60) return { grade: 'C4', remarks: 'Credit' };
  if (score >= 55) return { grade: 'C5', remarks: 'Credit' };
  if (score >= 50) return { grade: 'C6', remarks: 'Credit' };
  if (score >= 45) return { grade: 'D7', remarks: 'Pass' };
  if (score >= 40) return { grade: 'E8', remarks: 'Pass' };
  return { grade: 'F9', remarks: 'Fail' };
}

async function seedSampleGrades() {
  console.log('🚀 Seeding sample assessment grades...');

  // 1. Get active term
  const { data: terms } = await sb.from('academic_terms').select('id, name').eq('is_active', true).limit(1);
  const termId = terms?.[0]?.id;
  if (!termId) throw new Error('No active term found');

  // 2. Get students
  const { data: students } = await sb.from('students').select('id, class_id, enrollment_number');
  console.log(`Found ${students.length} students.`);

  let createdGrades = 0;

  for (const student of students) {
    if (!student.class_id) continue;

    // Get class_subjects for this student's class
    const { data: classSubjects } = await sb.from('class_subjects')
      .select('id, subject_id')
      .eq('class_id', student.class_id);

    if (!classSubjects || classSubjects.length === 0) continue;

    for (let i = 0; i < classSubjects.length; i++) {
      const cs = classSubjects[i];

      // Check if grade already exists
      const { data: existing } = await sb.from('grades')
        .select('id')
        .eq('student_id', student.id)
        .eq('class_subject_id', cs.id)
        .eq('term_id', termId)
        .maybeSingle();

      if (!existing) {
        // Generate realistic score: 62 to 92
        const score = 62 + ((i * 11) % 31);
        const { grade, remarks } = calcGrade(score);

        const { error } = await sb.from('grades').insert({
          student_id: student.id,
          class_subject_id: cs.id,
          term_id: termId,
          score,
          grade,
          remarks
        });

        if (!error) {
          createdGrades++;
        } else {
          console.error('Insert error:', error.message);
        }
      }
    }
  }

  console.log(`✅ Seeded ${createdGrades} assessment records across active student enrollments!`);
}

seedSampleGrades()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

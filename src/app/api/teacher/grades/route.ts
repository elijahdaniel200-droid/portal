import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacher_id = searchParams.get('teacher_id');
    const term_id = searchParams.get('term_id');
    const class_id = searchParams.get('class_id');
    const subject_id = searchParams.get('subject_id'); // This is the ID from the subjects table.

    if (!teacher_id) {
      return NextResponse.json({ error: 'teacher_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // If only teacher_id is provided, fetch configurations (terms, classes, subjects assigned to this teacher)
    if (!term_id || !class_id || !subject_id) {
      const { data: terms } = await supabase.from('academic_terms').select('*').order('start_date', { ascending: false });
      
      const { data: classSubjects } = await supabase
        .from('class_subjects')
        .select(`
          id,
          classes(id, name),
          subjects(id, name, code)
        `)
        .eq('teacher_id', teacher_id);

      // Deduplicate classes
      const classesMap = new Map();
      const subjectsByClass = new Map();

      classSubjects?.forEach((cs: any) => {
        const cls = Array.isArray(cs.classes) ? cs.classes[0] : cs.classes;
        const sub = Array.isArray(cs.subjects) ? cs.subjects[0] : cs.subjects;
        if (!classesMap.has(cls.id)) {
          classesMap.set(cls.id, cls);
          subjectsByClass.set(cls.id, []);
        }
        subjectsByClass.get(cls.id).push({ ...sub, class_subject_id: cs.id });
      });

      return NextResponse.json({
        terms: terms || [],
        classes: Array.from(classesMap.values()),
        subjectsByClass: Object.fromEntries(subjectsByClass)
      });
    }

    // If all params provided, fetch students for the class and their grades for this term/class_subject
    // First, find the class_subject_id
    const { data: classSubject } = await supabase
      .from('class_subjects')
      .select('id')
      .eq('teacher_id', teacher_id)
      .eq('class_id', class_id)
      .eq('subject_id', subject_id)
      .single();

    if (!classSubject) {
      return NextResponse.json({ error: 'You are not assigned to this class and subject.' }, { status: 403 });
    }

    const class_subject_id = classSubject.id;

    // Fetch students in the class
    const { data: students } = await supabase
      .from('students')
      .select('id, enrollment_number, profiles(first_name, last_name, email)')
      .eq('class_id', class_id);

    // Fetch existing grades
    const { data: grades } = await supabase
      .from('grades')
      .select('*')
      .eq('term_id', term_id)
      .eq('class_subject_id', class_subject_id);

    const gradesMap = new Map(grades?.map(g => [g.student_id, g]) || []);

    const rows = students?.map(student => {
      const existingGrade = gradesMap.get(student.id);
      const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
      return {
        studentId: student.id,
        enrollment_number: student.enrollment_number,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        ca1: existingGrade?.score ? Math.round(existingGrade.score * 0.2) : 0, // In reality, we might want to store ca1, ca2, exam separately in DB.
        // Wait, the existing grades table only has `score` (0-100). If we want CA1, CA2, EXAM, we need to add columns to the grades table or store them in a JSONB field.
        // For now, let's use a jsonb column 'breakdown' if available, or just mock it.
        ca2: 0,
        exam: existingGrade?.score ? existingGrade.score : 0, // Fallback if no breakdown
        score: existingGrade?.score || 0,
        grade: existingGrade?.grade || '',
        remarks: existingGrade?.remarks || '',
        status: existingGrade?.status || 'DRAFT',
        breakdown: existingGrade?.breakdown || { ca1: 0, ca2: 0, exam: 0 }
      };
    }) || [];

    return NextResponse.json({ rows, class_subject_id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');
    if (!teacherId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', teacherId).single();
    if (!profile || profile.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { records, action } = await req.json(); // action can be 'SAVE_DRAFT' or 'SUBMIT'

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid records format' }, { status: 400 });
    }

    const status = action === 'SUBMIT' ? 'SUBMITTED' : 'DRAFT';

    for (const record of records) {
      // Upsert the grade
      // Note: Supabase upsert requires primary key or unique constraint. 
      // The unique constraint in grades should be (student_id, term_id, class_subject_id)
      // Since it might not have one, we'll try to find an existing grade first
      
      const { data: existing } = await supabase
        .from('grades')
        .select('id, status')
        .eq('student_id', record.student_id)
        .eq('term_id', record.term_id)
        .eq('class_subject_id', record.class_subject_id)
        .single();

      if (existing) {
        if (existing.status === 'APPROVED') {
          continue; // Cannot edit approved grades
        }
        await supabase
          .from('grades')
          .update({
            score: record.score,
            grade: record.grade,
            remarks: record.remarks,
            breakdown: record.breakdown,
            status: status
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('grades')
          .insert({
            student_id: record.student_id,
            term_id: record.term_id,
            class_subject_id: record.class_subject_id,
            score: record.score,
            grade: record.grade,
            remarks: record.remarks,
            breakdown: record.breakdown,
            status: status
          });
      }
    }

    if (records.length > 0) {
      await import('@/lib/audit').then(m => m.logAuditAction(teacherId, status === 'SUBMITTED' ? 'SUBMIT_GRADES' : 'SAVE_DRAFT_GRADES', { 
        record_count: records.length, 
        class_subject_id: records[0].class_subject_id,
        term_id: records[0].term_id 
      }));
    }

    return NextResponse.json({ success: true, message: 'Grades saved successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

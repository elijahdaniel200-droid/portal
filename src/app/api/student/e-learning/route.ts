import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Get the class subjects the student is registered for (via grades or enrollment)
    const { data: grades, error: gradesErr } = await supabase
      .from('grades')
      .select('class_subject_id')
      .eq('student_id', student_id);

    if (gradesErr) throw gradesErr;

    const classSubjectIds = grades?.map(g => g.class_subject_id) || [];

    if (classSubjectIds.length === 0) {
      return NextResponse.json({ assignments: [], materials: [], subjects: [] });
    }

    // 2. Fetch assignments for these subjects
    const { data: assignments, error: asgErr } = await supabase
      .from('assignments')
      .select('*, class_subjects(subjects(name, code))')
      .in('class_subject_id', classSubjectIds)
      .order('created_at', { ascending: false });

    if (asgErr) throw asgErr;

    // 3. Fetch materials for these subjects
    const { data: materials, error: matErr } = await supabase
      .from('learning_materials')
      .select('*, class_subjects(subjects(name, code))')
      .in('class_subject_id', classSubjectIds)
      .order('created_at', { ascending: false });

    if (matErr) throw matErr;

    // Optional: Fetch subjects for filtering
    const { data: subjects } = await supabase
      .from('class_subjects')
      .select('id, subjects(name, code)')
      .in('id', classSubjectIds);

    return NextResponse.json({ 
      assignments: assignments || [], 
      materials: materials || [],
      subjects: subjects || []
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

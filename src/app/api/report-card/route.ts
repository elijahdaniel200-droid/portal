import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get('student_id');
    const term_id    = searchParams.get('term_id');

    if (!student_id) {
      return NextResponse.json({ error: 'student_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Parallelize independent queries to drastically improve load time
    const studentPromise = supabase
      .from('students')
      .select(`
        id, enrollment_number, class_id,
        profiles ( first_name, last_name, email )
      `)
      .eq('id', student_id)
      .single();

    let gradesQuery = supabase
      .from('grades')
      .select(`
        id, score, grade, remarks, term_id, class_subject_id,
        class_subjects (
          id,
          subjects ( name, code ),
          teachers ( profiles ( first_name, last_name ) )
        ),
        academic_terms ( name )
      `)
      .eq('student_id', student_id);
    if (term_id) gradesQuery = gradesQuery.eq('term_id', term_id);

    const attendancePromise = supabase
      .from('attendance')
      .select('status')
      .eq('student_id', student_id);

    const [
      { data: student, error: sErr },
      { data: grades },
      { data: attendance }
    ] = await Promise.all([studentPromise, gradesQuery, attendancePromise]);

    if (sErr || !student) {
      console.error("Student fetch error:", sErr);
      return NextResponse.json({ error: sErr?.message || 'Student not found', details: sErr }, { status: 404 });
    }

    // Fetch class manually (dependent on student_id)
    let studentClass = null;
    if (student.class_id) {
      const { data: cls } = await supabase.from('classes').select('id, name').eq('id', student.class_id).single();
      studentClass = cls;
    }

    const resultStudent = {
      ...student,
      profiles: Array.isArray(student.profiles) ? student.profiles[0] : student.profiles,
      classes: studentClass
    };

    const attSummary = {
      present: attendance?.filter(a => a.status === 'PRESENT').length ?? 0,
      absent:  attendance?.filter(a => a.status === 'ABSENT').length  ?? 0,
      late:    attendance?.filter(a => a.status === 'LATE').length    ?? 0,
      total:   attendance?.length ?? 0,
    };

    const registeredSubjects = grades?.map(g => g.class_subjects).filter(Boolean) || [];

    return NextResponse.json({ 
      student: resultStudent, 
      grades: grades ?? [], 
      attendance: attSummary,
      registeredSubjects 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

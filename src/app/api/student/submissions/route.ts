import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 });
    }

    const { assignment_id, submission_text, file_url } = await req.json();

    if (!assignment_id) {
      return NextResponse.json({ error: 'assignment_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify student is a student
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', student_id).single();
    if (!profile || profile.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert or update submission
    const { data: existing } = await supabase
      .from('assignment_submissions')
      .select('id')
      .eq('assignment_id', assignment_id)
      .eq('student_id', student_id)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('assignment_submissions')
        .update({
          submission_text,
          file_url,
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id,
          student_id,
          submission_text,
          file_url,
          status: 'SUBMITTED'
        });
    }

    if (result.error) throw result.error;

    // Notify the teacher
    const { data: assignmentData } = await supabase
      .from('assignments')
      .select('title, class_subjects(teacher_id)')
      .eq('id', assignment_id)
      .single();
      
    if (assignmentData?.class_subjects) {
      const cs = Array.isArray(assignmentData.class_subjects) ? assignmentData.class_subjects[0] : assignmentData.class_subjects;
      if (cs?.teacher_id) {
        const { createNotification } = await import('@/lib/notifications');
        await createNotification(
          cs.teacher_id,
          'New Assignment Submission',
          `A student submitted work for "${assignmentData.title}".`
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('student_id', student_id);

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

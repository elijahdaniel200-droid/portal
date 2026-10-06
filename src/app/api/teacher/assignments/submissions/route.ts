import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignment_id = searchParams.get('assignment_id');

    if (!assignment_id) {
      return NextResponse.json({ error: 'assignment_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: submissions, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        students (
          enrollment_number,
          profiles (first_name, last_name, email)
        )
      `)
      .eq('assignment_id', assignment_id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ submissions: submissions || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { submission_id, score, feedback } = await req.json();

    if (!submission_id) {
      return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('assignment_submissions')
      .update({
        score,
        feedback,
        status: 'GRADED'
      })
      .eq('id', submission_id);

    if (error) throw error;

    // Fetch submission to get the student_id and assignment title
    const { data: submissionData } = await supabase
      .from('assignment_submissions')
      .select('student_id, assignments(title)')
      .eq('id', submission_id)
      .single();

    if (submissionData?.student_id) {
      const asg: any = submissionData.assignments;
      const assignmentTitle = Array.isArray(asg) ? asg[0]?.title : asg?.title;
      const { createNotification } = await import('@/lib/notifications');
      await createNotification(
        submissionData.student_id,
        'Assignment Graded',
        `Your submission for "${assignmentTitle || 'an assignment'}" has been graded.`
      );
    }

    return NextResponse.json({ success: true, message: 'Submission graded successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

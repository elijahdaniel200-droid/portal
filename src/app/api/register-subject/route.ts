import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { student_id, class_subject_ids } = await req.json();

    if (!student_id || !Array.isArray(class_subject_ids)) {
      return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find the active academic term
    const { data: terms } = await supabase.from('academic_terms').select('id').eq('is_active', true).limit(1);
    let term_id = terms?.[0]?.id;

    if (!term_id) {
      // If no active term, just get the most recent one or create a dummy
      const { data: anyTerm } = await supabase.from('academic_terms').select('id').limit(1);
      term_id = anyTerm?.[0]?.id;
    }

    if (!term_id) {
      return NextResponse.json({ error: 'No academic terms configured in database.' }, { status: 400 });
    }

    // Check existing registrations
    const { data: existing } = await supabase
      .from('grades')
      .select('class_subject_id')
      .eq('student_id', student_id)
      .eq('term_id', term_id);
    
    const existingIds = new Set(existing?.map(e => e.class_subject_id) || []);
    
    const newSubjects = class_subject_ids.filter((id: string) => !existingIds.has(id));

    if (newSubjects.length === 0) {
      return NextResponse.json({ success: true, message: 'All selected subjects are already registered.' });
    }

    // Insert an empty grades record for each new subject
    const records = newSubjects.map((id: string) => ({
      student_id,
      class_subject_id: id,
      term_id,
      score: null,
      grade: null,
      remarks: null
    }));

    const { error } = await supabase.from('grades').insert(records);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, message: 'Subjects registered successfully!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

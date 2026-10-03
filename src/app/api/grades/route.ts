import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { records } = await req.json();
    if (!records?.length) return NextResponse.json({ error: 'No records provided' }, { status: 400 });

    // Bypass actual DB insert if using mock/demo data to prevent UUID casting errors
    if (records[0]?.student_id?.startsWith('demo-')) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ success: true, mock: true });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('grades').upsert(records, {
      onConflict: 'student_id,class_subject_id,term_id',
      ignoreDuplicates: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const class_subject_id = searchParams.get('class_subject_id');
    const term_id = searchParams.get('term_id');
    const supabase = createAdminClient();

    let query = supabase
      .from('grades')
      .select(`
        id, score, grade, remarks, term_id, class_subject_id, student_id,
        students ( profiles (id, first_name, last_name, email) ),
        academic_terms (id, name)
      `);

    if (class_subject_id) query = query.eq('class_subject_id', class_subject_id);
    if (term_id) query = query.eq('term_id', term_id);

    const { data: rawData, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const data = rawData.map((g: any) => {
      const p = Array.isArray(g.students?.profiles) ? g.students.profiles[0] : g.students?.profiles;
      return { ...g, profiles: p };
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

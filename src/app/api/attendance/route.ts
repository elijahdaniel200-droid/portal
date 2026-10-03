import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { records } = await req.json();
    // records = [{ student_id, class_id, date, status }]
    if (!records?.length) {
      return NextResponse.json({ error: 'No attendance records provided' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from('attendance').upsert(records, {
      onConflict: 'student_id,date',
      ignoreDuplicates: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, saved: records.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const class_id = searchParams.get('class_id');
    const date = searchParams.get('date');
    const supabase = createAdminClient();

    let query = supabase
      .from('attendance')
      .select(`
        id, date, status,
        profiles:student_id (id, first_name, last_name),
        classes:class_id (id, name)
      `)
      .order('date', { ascending: false });

    if (class_id) query = query.eq('class_id', class_id);
    if (date) query = query.eq('date', date);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

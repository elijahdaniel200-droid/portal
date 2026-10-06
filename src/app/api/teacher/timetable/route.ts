import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacher_id = searchParams.get('teacher_id');

    if (!teacher_id) {
      return NextResponse.json({ error: 'teacher_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: timetables } = await supabase
      .from('timetables')
      .select(`
        *,
        classes ( name ),
        subjects ( name, code )
      `)
      .eq('teacher_id', teacher_id)
      .order('day_of_week')
      .order('start_time');

    return NextResponse.json({ timetables: timetables || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

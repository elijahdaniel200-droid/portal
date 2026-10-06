import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const classId = searchParams.get('class_id');
    const teacherId = searchParams.get('teacher_id');

    let query = supabase.from('timetables').select('*, classes(*), subjects(*), teachers(profiles(*))');

    if (type) query = query.eq('type', type);
    if (classId) query = query.eq('class_id', classId);
    if (teacherId) query = query.eq('teacher_id', teacherId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase.from('timetables').insert([body]).select();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

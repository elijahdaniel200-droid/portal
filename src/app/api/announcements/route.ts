import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');
    const classId = searchParams.get('class_id');

    let query = supabase.from('announcements').select('*, profiles(first_name, last_name)').order('created_at', { ascending: false });

    if (target) {
      if (classId && target === 'SPECIFIC_CLASS') {
        query = query.eq('class_id', classId);
      } else {
        query = query.or(`target.eq.ALL,target.eq.${target}`);
      }
    }

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
    const { data, error } = await supabase.from('announcements').insert([body]).select();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

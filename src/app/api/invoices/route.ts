import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { student_id, term_id, amount, description, due_date } = await req.json();
    if (!student_id || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('invoices').insert({
      student_id, term_id: term_id || null, amount, description,
      due_date: due_date || null, status: 'PENDING',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const supabase = createAdminClient();

    let query = supabase
      .from('invoices')
      .select(`
        id, amount, description, due_date, status, student_id,
        students ( enrollment_number, profiles (id, first_name, last_name, email) ),
        academic_terms (id, name)
      `)
      .order('id', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    const { data: rawData, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const data = rawData.map((inv: any) => {
      const p = Array.isArray(inv.students?.profiles) ? inv.students.profiles[0] : inv.students?.profiles;
      return {
        ...inv,
        enrollment_number: inv.students?.enrollment_number,
        profiles: p,
      };
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

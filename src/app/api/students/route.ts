import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      first_name, last_name, email, password,
      enrollment_number, date_of_birth, class_id, emergency_contact
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !enrollment_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name, role: 'STUDENT' },
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const userId = authData.user.id;

    // 2. Upsert profile (trigger may have already created it)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId, email, first_name, last_name, role: 'STUDENT',
    });
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    // 3. Create student record
    const { error: studentError } = await supabase.from('students').insert({
      id: userId,
      enrollment_number,
      date_of_birth: date_of_birth || null,
      class_id: class_id || null,
      emergency_contact: emergency_contact || null,
    });
    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });

    return NextResponse.json({ success: true, userId, message: `Student ${first_name} ${last_name} created!` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const studentsPromise = supabase
      .from('students')
      .select(`
        id, enrollment_number, date_of_birth, emergency_contact, class_id,
        profiles (id, first_name, last_name, email, created_at)
      `);

    const classesPromise = supabase.from('classes').select('id, name');

    const [{ data: students, error }, { data: classes }] = await Promise.all([studentsPromise, classesPromise]);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const classMap = new Map(classes?.map(c => [c.id, c]) || []);

    const data = students?.map((s: any) => ({
      ...s,
      classes: classMap.get(s.class_id) || null
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

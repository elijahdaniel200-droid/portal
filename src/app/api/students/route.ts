import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', adminId).single();
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      first_name, last_name, email, password,
      enrollment_number, date_of_birth, class_id, emergency_contact
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !enrollment_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    await import('@/lib/audit').then(m => m.logAuditAction(adminId, 'CREATE_STUDENT', { student_id: userId, enrollment_number }));

    return NextResponse.json({ success: true, userId, message: `Student ${first_name} ${last_name} created!` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');
    const teacherId = searchParams.get('teacherId');
    
    if (!adminId && !teacherId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // Check role
    const checkingId = adminId || teacherId;
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', checkingId).single();
    if (profile?.role === 'STUDENT' || !profile) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

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
    const { first_name, last_name, email, password, department, hire_date } = body;

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name, role: 'TEACHER' },
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const userId = authData.user.id;

    // 2. Upsert profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId, email, first_name, last_name, role: 'TEACHER',
    });
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    // 3. Create teacher record
    const { error: teacherError } = await supabase.from('teachers').insert({
      id: userId,
      department: department || null,
      hire_date: hire_date || null,
    });
    if (teacherError) return NextResponse.json({ error: teacherError.message }, { status: 400 });

    await import('@/lib/audit').then(m => m.logAuditAction(adminId, 'CREATE_TEACHER', { teacher_id: userId, department }));

    return NextResponse.json({ success: true, userId, message: `Teacher ${first_name} ${last_name} created!` });
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
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id, department, hire_date,
        profiles (id, first_name, last_name, email, created_at)
      `);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

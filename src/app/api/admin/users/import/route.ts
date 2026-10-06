import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { users, role } = await req.json(); // role: 'STUDENT' or 'TEACHER'

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'No users provided' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let successCount = 0;
    let errors = [];

    for (const user of users) {
      try {
        const password = 'DefaultPassword123!';
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password,
          email_confirm: true
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role
          });

        if (profileError) throw profileError;

        if (role === 'STUDENT') {
          await supabase.from('students').insert({
            id: userId,
            enrollment_number: user.identifier || `STU${Math.floor(Math.random() * 10000)}`,
            class_id: null // Needs to be assigned later
          });
        } else if (role === 'TEACHER') {
          await supabase.from('teachers').insert({
            id: userId,
            employee_id: user.identifier || `EMP${Math.floor(Math.random() * 10000)}`,
            department: user.department || 'General'
          });
        }

        successCount++;
      } catch (err: any) {
        errors.push({ email: user.email, error: err.message });
      }
    }

    return NextResponse.json({ success: true, count: successCount, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

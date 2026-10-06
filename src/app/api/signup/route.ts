import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { first_name, last_name, email, password, role, enrollment_number, gender } = await req.json();

    if (!first_name || !last_name || !email || !password || !role || !gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name, role, gender },
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const userId = authData.user.id;

    // 2. Update/upsert profile role
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId, email, first_name, last_name, role, gender
    });
    
    if (profileError) {
      console.error("Profile upsert error:", profileError);
      if (profileError.code === 'PGRST205' || profileError.message.includes('schema cache')) {
         throw new Error("Database not initialized! Please run the supabase_schema.sql script in your Supabase SQL Editor.");
      }
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 3. Create role-specific record
    if (role === 'STUDENT') {
      // Use provided enrollment number, or create a random one
      const final_enrollment_number = enrollment_number || `STU-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      await supabase.from('students').upsert({ id: userId, enrollment_number: final_enrollment_number });
    } else if (role === 'TEACHER') {
      await supabase.from('teachers').upsert({ id: userId });
    }
    // No specific table for ADMIN, they just have the profile.

    return NextResponse.json({ success: true, message: 'Account created successfully!' });
  } catch (err: any) {
    console.error("Signup error:", err);
    // Specifically catch the "table not found" error to give a helpful message
    if (err.code === 'PGRST205' || (err.message && err.message.includes('schema cache'))) {
      return NextResponse.json({ 
        error: 'Database not initialized! Please run the supabase_schema.sql script in your Supabase SQL Editor.' 
      }, { status: 500 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

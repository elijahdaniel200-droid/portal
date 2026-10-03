import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route uses the SERVICE ROLE key (admin-level access) to create the first admin user.
// IMPORTANT: Delete or protect this route after first use!
export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // Use the service role key - bypasses RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' ') || 'Admin',
      role: 'ADMIN',
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // 2. Update profile role to ADMIN (trigger creates profile as STUDENT by default)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'ADMIN' })
    .eq('id', authData.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ 
    success: true, 
    message: `Admin user "${email}" created successfully!`,
    userId: authData.user.id
  });
}

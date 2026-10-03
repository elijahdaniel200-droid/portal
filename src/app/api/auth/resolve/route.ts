import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    if (!identifier) return NextResponse.json({ error: 'Identifier required' }, { status: 400 });

    // If it's an email, just return it
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier });
    }

    // Otherwise, assume it's a student enrollment number and find the profile
    const supabase = createAdminClient();
    const { data: student } = await supabase
      .from('students')
      .select('id, profiles!inner(email)')
      .ilike('enrollment_number', identifier)
      .single();

    const profile = Array.isArray(student?.profiles) ? student.profiles[0] : student?.profiles;
    if (student && profile?.email) {
      return NextResponse.json({ email: profile.email });
    }

    return NextResponse.json({ error: 'Account not found with this Registration Number' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

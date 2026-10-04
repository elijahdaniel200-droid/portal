import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Fetch terms ordered by start_date or created_at
    const { data, error } = await supabase
      .from('academic_terms')
      .select('id, name, start_date, end_date, status')
      .order('start_date', { ascending: false });

    if (error) {
      console.error("Terms fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

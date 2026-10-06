import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized: Missing adminId' }, { status: 401 });
    }

    // Verify role
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profileErr || profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Total students
    const { count: studentCount, error: err1 } = await supabase.from('students').select('*', { count: 'exact', head: true });
    
    // Total teachers
    const { count: teacherCount, error: err2 } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
    
    // Revenue (Sum of PAID invoices)
    const { data: invoices, error: err3 } = await supabase.from('invoices').select('amount, status');
    
    if (err1 || err2 || err3) throw new Error("Failed to fetch dashboard stats");

    let totalRevenue = 0;
    let pendingRevenue = 0;
    let overdueRevenue = 0;

    invoices?.forEach(inv => {
      if (inv.status === 'PAID') totalRevenue += Number(inv.amount);
      if (inv.status === 'PENDING') pendingRevenue += Number(inv.amount);
      if (inv.status === 'OVERDUE') overdueRevenue += Number(inv.amount);
    });

    return NextResponse.json({
      data: {
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        revenue: totalRevenue,
        pendingRevenue,
        overdueRevenue
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    const { student_id, term_id, amount, description, due_date } = await req.json();
    if (!student_id || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const { data, error } = await supabase.from('invoices').insert({
      student_id, term_id: term_id || null, amount, description,
      due_date: due_date || null, status: 'PENDING',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await import('@/lib/audit').then(m => m.logAuditAction(adminId, 'CREATE_INVOICE', { invoice_id: data.id, student_id, amount }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', adminId).single();
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const status = searchParams.get('status');

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

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', adminId).single();
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { invoice_id, status, payment_method } = await req.json();
    if (!invoice_id || !status) {
      return NextResponse.json({ error: 'Missing invoice_id or status' }, { status: 400 });
    }

    const { data: invoice, error: fetchErr } = await supabase
      .from('invoices')
      .select('id, amount, student_id, description')
      .eq('id', invoice_id)
      .single();

    if (fetchErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from('invoices')
      .update({ status: status.toUpperCase() })
      .eq('id', invoice_id)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 });

    if (status.toUpperCase() === 'PAID') {
      const manualRef = `OFFLINE-${Date.now().toString().slice(-8)}`;
      await supabase.from('transactions').insert({
        invoice_id: invoice_id,
        reference_code: manualRef,
        amount_paid: invoice.amount,
        gateway_response: {
          channel: payment_method || 'cash_or_bank_transfer',
          verified_by_admin: adminId,
          timestamp: new Date().toISOString(),
        },
      });

      // Notify student
      await supabase.from('notifications').insert({
        user_id: invoice.student_id,
        title: 'Fee Payment Recorded',
        message: `Your payment of ₦${invoice.amount.toLocaleString()} for "${invoice.description}" has been confirmed by administration.`,
        type: 'FINANCE',
        is_read: false,
      });
    }

    await import('@/lib/audit').then(m => m.logAuditAction(adminId, 'UPDATE_INVOICE_STATUS', {
      invoice_id,
      new_status: status.toUpperCase(),
      amount: invoice.amount,
    }));

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


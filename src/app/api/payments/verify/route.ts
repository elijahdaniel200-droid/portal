import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack secret not configured' }, { status: 500 });
    }

    // 1. Verify with Paystack REST API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      return NextResponse.json({ error: paystackData.message || 'Payment verification failed' }, { status: 400 });
    }

    const { data } = paystackData;
    if (data.status !== 'success') {
      return NextResponse.json({ verified: false, status: data.status, message: 'Transaction was not successful' });
    }

    const supabase = createAdminClient();
    const amountPaid = data.amount / 100;
    const invoiceId = data.metadata?.invoice_id;
    const studentId = data.metadata?.student_id;

    // 2. Check if already settled in transactions
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference_code', reference)
      .maybeSingle();

    if (!existingTx && invoiceId) {
      // Settle invoice
      await supabase
        .from('invoices')
        .update({ status: 'PAID' })
        .eq('id', invoiceId);

      // Record transaction
      await supabase.from('transactions').insert({
        invoice_id: invoiceId,
        reference_code: reference,
        amount_paid: amountPaid,
        gateway_response: data,
      });

      // Notification
      if (studentId) {
        try {
          await supabase.from('notifications').insert({
            user_id: studentId,
            title: 'Payment Confirmed',
            message: `Your payment of ₦${amountPaid.toLocaleString()} (Ref: ${reference}) has been confirmed.`,
          });
        } catch {}
      }
    }

    return NextResponse.json({
      verified: true,
      amount: amountPaid,
      reference,
      channel: data.channel,
      paid_at: data.paid_at,
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

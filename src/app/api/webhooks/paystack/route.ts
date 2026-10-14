import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase-admin';

// Paystack sends an HTTP POST event to this endpoint after charge events.
// Configure this in: Paystack Dashboard -> Settings -> API Keys & Webhooks -> Webhook URL
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error('Webhook error: PAYSTACK_SECRET_KEY is not configured in .env.local');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 1. Verify HMAC SHA-512 signature
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    if (hash !== signature) {
      console.warn('Webhook: HMAC SHA512 signature mismatch rejected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { data } = event;
      const referenceCode = data.reference;
      const amountPaid = data.amount / 100; // Convert from kobo to Naira (NGN)
      const channel = data.channel || 'card';
      const supabase = createAdminClient();

      // 2. Idempotency Check: Prevent duplicate payment crediting
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id, reference_code')
        .eq('reference_code', referenceCode)
        .maybeSingle();

      if (existingTx) {
        console.log(`Webhook: Duplicate transaction ignored idempotently: ${referenceCode}`);
        return NextResponse.json({ received: true, status: 'already_processed' });
      }

      let invoiceId = data.metadata?.invoice_id;
      const studentId = data.metadata?.student_id;
      const description = data.metadata?.description || 'School Fee Payment';

      // 3. Fallback: If no invoice_id was provided (e.g. from CustomPaymentModal), resolve or create invoice
      if (!invoiceId && studentId) {
        // Check if there is an existing pending invoice for this student
        const { data: pendingInvoice } = await supabase
          .from('invoices')
          .select('id, amount, status')
          .eq('student_id', studentId)
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pendingInvoice) {
          invoiceId = pendingInvoice.id;
        } else {
          // Fetch current active term
          const { data: activeTerm } = await supabase
            .from('academic_terms')
            .select('id')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          // Create a new settled invoice
          const { data: newInvoice, error: newInvErr } = await supabase
            .from('invoices')
            .insert({
              student_id: studentId,
              term_id: activeTerm?.id || null,
              amount: amountPaid,
              description: description,
              due_date: new Date().toISOString().split('T')[0],
              status: 'PAID'
            })
            .select('id')
            .single();

          if (!newInvErr && newInvoice) {
            invoiceId = newInvoice.id;
          }
        }
      }

      if (!invoiceId) {
        console.warn(`Webhook: Unable to map invoice or student for ref: ${referenceCode}`);
        return NextResponse.json({ received: true, warning: 'Unmapped transaction' });
      }

      // 4. Update Invoice Status
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id, amount, student_id')
        .eq('id', invoiceId)
        .single();

      if (invoice) {
        const isFullPayment = amountPaid >= (invoice.amount || 0);
        await supabase
          .from('invoices')
          .update({
            status: isFullPayment ? 'PAID' : 'PENDING'
          })
          .eq('id', invoiceId);
      }

      // 5. Record Settled Transaction
      const { error: txErr } = await supabase
        .from('transactions')
        .insert({
          invoice_id: invoiceId,
          reference_code: referenceCode,
          amount_paid: amountPaid,
          gateway_response: {
            channel,
            paid_at: data.paid_at || new Date().toISOString(),
            customer: data.customer,
            authorization: data.authorization,
          },
        });

      if (txErr) {
        console.error('Error inserting transaction record:', txErr.message);
      }

      // 6. Notify Student Real-Time
      const targetStudentId = invoice?.student_id || studentId;
      if (targetStudentId) {
        try {
          await supabase.from('notifications').insert({
            user_id: targetStudentId,
            title: 'Payment Confirmed',
            message: `Your payment of ₦${amountPaid.toLocaleString()} (Ref: ${referenceCode}) has been confirmed and settled.`,
          });
        } catch {
          // Notifications table fallback
        }
      }

      // 7. Audit Log
      try {
        const { logAuditAction } = await import('@/lib/audit');
        await logAuditAction(targetStudentId || 'system-paystack', 'PAYMENT_RECEIVED', {
          reference: referenceCode,
          invoice_id: invoiceId,
          amount: amountPaid,
          channel,
        });
      } catch {
        // Audit log fallback
      }

      console.log(`✅ [PAYSTACK WEBHOOK] Settled Ref: ${referenceCode} | ₦${amountPaid} for Invoice ${invoiceId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Paystack webhook processing exception:', err.message);
    return NextResponse.json({ error: 'Webhook processing error', details: err.message }, { status: 500 });
  }
}

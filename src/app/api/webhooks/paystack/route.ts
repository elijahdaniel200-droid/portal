import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase-admin';

// Paystack sends a POST to this endpoint after a successful charge.
// Make this URL public in Paystack Dashboard → Webhooks.
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json({ error: 'Paystack secret key not set' }, { status: 500 });
    }

    // Verify Paystack signature (SHA-512 HMAC)
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { data } = event;
      const invoiceId = data.metadata?.invoice_id;
      const amountPaid = data.amount / 100; // convert from kobo
      const referenceCode = data.reference;

      if (!invoiceId) {
        console.warn('Webhook: invoice_id missing in metadata, ref:', referenceCode);
        return NextResponse.json({ received: true });
      }

      const supabase = createAdminClient();

      // 1. Mark invoice as PAID
      const { error: invErr } = await supabase
        .from('invoices')
        .update({ status: 'PAID' })
        .eq('id', invoiceId);

      if (invErr) throw invErr;

      // 2. Record transaction
      const { error: txErr } = await supabase
        .from('transactions')
        .insert({
          invoice_id: invoiceId,
          reference_code: referenceCode,
          amount_paid: amountPaid,
          gateway_response: data,
        });

      if (txErr) console.error('Transaction insert error:', txErr.message);

      console.log(`✅ Payment confirmed — Invoice: ${invoiceId}, Amount: $${amountPaid}, Ref: ${referenceCode}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

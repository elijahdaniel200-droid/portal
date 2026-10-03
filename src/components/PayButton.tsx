"use client";

import { CreditCard } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

interface Invoice {
  id: string;
  amount: number;
}

interface PayButtonProps {
  invoice: Invoice;
  email: string;
  onSuccess: () => void;
}

export default function PayButton({ invoice, email, onSuccess }: PayButtonProps) {
  const config = {
    reference: `inv_${invoice.id.slice(0, 8)}_${new Date().getTime()}`,
    email,
    amount: invoice.amount * 100, // Paystack uses the lowest currency unit (cents/kobo)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
    metadata: {
      custom_fields: [{
        display_name: "Invoice ID",
        variable_name: "invoice_id",
        value: invoice.id
      }],
      invoice_id: invoice.id
    }
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      onClick={() => {
        initializePayment({
          onSuccess: () => {
            // Ideally rely on the webhook to mark PAID, but for immediate UI feedback:
            onSuccess();
          },
          onClose: () => { console.log('Payment modal closed'); }
        });
      }}
      className="px-4 py-2 rounded-lg font-bold text-xs text-white shadow-md hover:scale-105 transition-all w-full flex justify-center items-center"
      style={{ background: 'linear-gradient(135deg, #09090b, #27272a)' }}
    >
      <CreditCard className="w-3.5 h-3.5 mr-2" /> Pay Now
    </button>
  );
}

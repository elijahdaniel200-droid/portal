"use client";

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, AlertCircle, CheckCircle2, Clock, Download, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { generatePaymentReceiptPDF } from '@/lib/pdf/receiptPdf';

const PayButton = dynamic(() => import('@/components/PayButton'), { ssr: false });
const CustomPaymentModal = dynamic(() => import('@/components/CustomPaymentModal'), { ssr: false });

interface Invoice {
  id: string;
  amount: number;
  description: string;
  due_date: string | null;
  status: string;
  created_at: string;
}

const statusMeta: Record<string, { label: string; cls: string; icon: any }> = {
  PAID: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  OVERDUE: { label: 'Overdue', cls: 'bg-red-100 text-red-600', icon: AlertCircle },
};



export default function StudentFinancesPage() {
  const { profile } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCustomPaymentOpen, setIsCustomPaymentOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/my-invoices?student_id=${profile.id}`);
      const json = await res.json();
      if (json.data) {
        setInvoices(json.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const totals = {
    paid: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0),
  };
  const outstanding = totals.pending + totals.overdue;

  // Optimistic UI update for payment
  const handlePaymentSuccess = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv));
  };

  const downloadReceipt = (inv: Invoice) => {
    const receiptData = {
      school: {
        name: "EduPortal International High School",
        address: "10 Academic Boulevard, Uyo, Akwa Ibom State",
        email: "finance@eduportal.sch.ng",
        phone: "+234 802 345 6789",
        motto: "Excellence in Character and Learning",
      },
      student: {
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`,
        enrollmentNo: profile?.enrollment_number || 'STU-2026-0001',
        email: profile?.email,
      },
      transaction: {
        receiptNo: `REC-${inv.id.split('-')[0].toUpperCase()}`,
        reference: `PAY-${inv.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        invoiceId: inv.id,
        date: new Date(inv.created_at || Date.now()).toLocaleDateString('en-US', { dateStyle: 'medium' }),
        description: inv.description,
        amount: inv.amount,
        paymentMethod: 'Paystack (Card / Transfer / USSD)',
      }
    };

    const doc = generatePaymentReceiptPDF(receiptData);
    doc.save(`Receipt_${inv.id.split('-')[0].toUpperCase()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Center</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your tuition, fees, and payments securely.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Payments secured by Paystack</span>
          </div>
          <button 
            onClick={() => setIsCustomPaymentOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #09090b, #27272a)' }}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Fee Here</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold text-slate-900">₦{outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount Paid</p>
            <p className="text-3xl font-bold text-slate-900">₦{totals.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overdue Amount</p>
            <p className="text-3xl font-bold text-red-600">₦{totals.overdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Invoices</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No invoices found</p>
            <p className="text-slate-400 text-sm mt-1">You are all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {invoices.map((inv) => {
              const meta = statusMeta[inv.status] || statusMeta.PENDING;
              const Icon = meta.icon;
              return (
                <div key={inv.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{inv.description}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Due Date: <span className="font-medium text-slate-700">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}</span>
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${meta.cls}`}>
                          <Icon className="w-3 h-3" /><span>{meta.label}</span>
                        </span>
                        <span className="text-xs text-slate-400">ID: {inv.id.split('-')[0].toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between min-w-[140px]">
                    <span className="text-2xl font-black text-slate-900">₦{inv.amount.toFixed(2)}</span>
                    <div className="mt-3 w-full">
                      {inv.status !== 'PAID' ? (
                        <PayButton 
                          invoice={inv} 
                          email={profile?.email || 'student@school.edu'} 
                          onSuccess={() => handlePaymentSuccess(inv.id)} 
                        />
                      ) : (
                        <button onClick={() => downloadReceipt(inv)} className="flex items-center justify-center space-x-2 px-4 py-2 w-full rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                          <Download className="w-3.5 h-3.5" /><span>Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <CustomPaymentModal 
        isOpen={isCustomPaymentOpen}
        onClose={() => setIsCustomPaymentOpen(false)}
        email={profile?.email || 'student@school.edu'}
        studentId={profile?.id || ''}
        onSuccess={() => {
          alert("Payment successful! It will be recorded in your history shortly.");
          fetchInvoices();
        }}
      />
    </div>
  );
}

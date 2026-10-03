"use client";

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Search, Filter, Download, CheckCircle2, AlertCircle, Clock, RefreshCw, X } from 'lucide-react';
import Modal from '@/components/Modal';

type Status = 'all' | 'PENDING' | 'PAID' | 'OVERDUE';

interface Invoice {
  id: string;
  amount: number;
  description: string;
  due_date: string | null;
  status: string;
  created_at: string;
  enrollment_number?: string;
  profiles: { id: string; first_name: string; last_name: string; email: string } | null;
  academic_terms: { id: string; name: string } | null;
}

const statusMeta: Record<string, { label: string; classes: string; icon: any }> = {
  PAID: { label: 'Paid', classes: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  PENDING: { label: 'Pending', classes: 'bg-amber-100 text-amber-700', icon: Clock },
  OVERDUE: { label: 'Overdue', classes: 'bg-red-100 text-red-600', icon: AlertCircle },
};

const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all";
const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

export default function AdminFeesPage() {
  const [activeTab, setActiveTab] = useState<Status>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ student_email: '', amount: '', description: 'Term 1 Tuition Fee', due_date: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices?status=${activeTab}`);
      const json = await res.json();
      setInvoices(json.data || []);
    } catch { setInvoices([]); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filtered = invoices.filter(inv => {
    const name = `${inv.profiles?.first_name} ${inv.profiles?.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || inv.description.toLowerCase().includes(search.toLowerCase());
  });

  const totals = {
    all: invoices.reduce((s, i) => s + i.amount, 0),
    paid: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0),
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError(''); setFormSuccess('');
    try {
      // Find student by email first
      const studRes = await fetch(`/api/students`);
      const studJson = await studRes.json();
      const student = studJson.data?.find((s: any) => s.profiles?.email === form.student_email);
      if (!student) throw new Error('Student with that email not found');

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.id,
          amount: parseFloat(form.amount),
          description: form.description,
          due_date: form.due_date || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormSuccess('Invoice created successfully!');
      setTimeout(() => { setShowCreate(false); fetchInvoices(); setFormSuccess(''); }, 1500);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fee Management</h2>
          <p className="text-slate-500 text-sm mt-1">Track invoices, payments and defaulters.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => {}} className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /><span>Export Report</span>
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <Plus className="w-4 h-4" /><span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Invoiced', value: totals.all, color: 'from-blue-500 to-blue-700', icon: DollarSign },
          { label: 'Collected', value: totals.paid, color: 'from-emerald-500 to-emerald-700', icon: CheckCircle2 },
          { label: 'Pending', value: totals.pending, color: 'from-amber-400 to-amber-600', icon: Clock },
          { label: 'Overdue', value: totals.overdue, color: 'from-red-500 to-red-700', icon: AlertCircle },
        ].map((card, i) => (
          <div key={i} className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-xl font-bold text-slate-900">₦{card.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          {(['all', 'PENDING', 'PAID', 'OVERDUE'] as Status[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by student or description…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 w-72 transition-all" />
          </div>
          <button onClick={fetchInvoices} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Student', 'Description', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No invoices found</p>
                    </td>
                  </tr>
                ) : filtered.map((inv) => {
                  const meta = statusMeta[inv.status] || statusMeta.PENDING;
                  const Icon = meta.icon;
                  return (
                    <tr key={inv.id} className="table-row-hover group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 text-sm">
                          {inv.profiles ? `${inv.profiles.first_name} ${inv.profiles.last_name}` : '—'}
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          {inv.enrollment_number && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {inv.enrollment_number}
                            </span>
                          )}
                          <p className="text-xs text-slate-400 truncate max-w-[150px]">{inv.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">{inv.description}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">₦{inv.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full ${meta.classes}`}>
                          <Icon className="w-3 h-3" /><span>{meta.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-xs font-semibold text-emerald-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">Showing {filtered.length} of {invoices.length} invoices</p>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Invoice" subtitle="Generate a fee invoice for a student">
        <form onSubmit={handleCreateInvoice} className="space-y-5">
          <div>
            <label className={labelClass}>Student Email *</label>
            <input type="email" className={inputClass} placeholder="student@school.edu" required
              value={form.student_email} onChange={e => setForm(p => ({ ...p, student_email: e.target.value }))} />
            <p className="text-xs text-slate-400 mt-1">Enter the registered email of the student.</p>
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <input className={inputClass} placeholder="e.g. Term 1 Tuition Fee 2026" required
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Amount (₦) *</label>
              <input type="number" step="0.01" min="0" className={inputClass} placeholder="450.00" required
                value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <input type="date" className={inputClass}
                value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
            </div>
          </div>

          {formError && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-start space-x-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-600">{formSuccess}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={formLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              {formLoading ? 'Creating…' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

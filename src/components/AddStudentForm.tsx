"use client";

import { useState } from 'react';
import { User, Mail, Lock, Hash, Calendar, Phone, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all";
const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

export default function AddStudentForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    enrollment_number: '', date_of_birth: '', emergency_contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { profile } = useAuthStore.getState();
      const adminId = profile?.id;
      const res = await fetch(`/api/students?adminId=${adminId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSuccess(data.message);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Personal Info */}
      <div className="pb-2">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-bold text-slate-700">Personal Information</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input className={inputClass} placeholder="e.g. Alice" value={form.first_name} onChange={set('first_name')} required />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input className={inputClass} placeholder="e.g. Walker" value={form.last_name} onChange={set('last_name')} required />
          </div>
        </div>
      </div>

      {/* Academic Info */}
      <div className="pb-2">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-sm font-bold text-slate-700">Academic Details</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Enrollment Number *</label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={`${inputClass} pl-10`} placeholder="e.g. STU-2026-001" value={form.enrollment_number} onChange={set('enrollment_number')} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="date" className={`${inputClass} pl-10`} value={form.date_of_birth} onChange={set('date_of_birth')} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Emergency Contact</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={`${inputClass} pl-10`} placeholder="Parent/Guardian phone" value={form.emergency_contact} onChange={set('emergency_contact')} />
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="pb-2">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-sm font-bold text-slate-700">Portal Account</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" className={`${inputClass} pl-10`} placeholder="student@school.edu" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Temporary Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" className={`${inputClass} pl-10`} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Student should change this on first login.</p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start space-x-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-600">{success}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
          {loading ? 'Creating Account…' : 'Create Student Account'}
        </button>
      </div>
    </form>
  );
}

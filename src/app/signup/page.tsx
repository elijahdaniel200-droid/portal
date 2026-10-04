"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, GraduationCap, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'STUDENT', enrollment_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      // Auto-redirect to login with email prefilled
      router.push(`/login?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all";

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-slate-900">
        
        {/* Background Image of Students and Teachers */}
        <div className="absolute inset-0 z-0">
          <img src="/signup-bg.jpg" alt="Students and Teachers" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40" />
        </div>
        
        <div className="relative z-10 flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden border-2 border-amber-400">
            <img src="/eduportal-logo.jpg" alt="EduPortal Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-4xl font-black text-white tracking-tight">EduPortal</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-5xl font-extrabold text-white leading-tight">Join our learning community today.</h1>
          
          <div className="space-y-4">
            <p className="text-slate-300 text-lg leading-relaxed">
              Experience the future of education management. Whether you're a student checking your latest grades, or a teacher managing your daily classes, EduPortal provides a seamless, intuitive experience.
            </p>
            <ul className="text-slate-300 text-md space-y-3 mt-4">
              <li className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm">✓</span>
                <span>Real-time academic performance tracking</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm">✓</span>
                <span>Simplified attendance and gradebook tools</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm">✓</span>
                <span>Centralized communication hub</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-4 text-sm text-slate-400">
          <span>© 2026 EduPortal Systems</span>
          <div className="w-1 h-1 rounded-full bg-slate-600"></div>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden border-2 border-amber-400">
              <img src="/eduportal-logo.jpg" alt="EduPortal Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">EduPortal</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create an account</h2>
            <p className="text-slate-500">Please fill in your details to sign up.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start space-x-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className={inputClass} placeholder="First name" value={form.first_name} onChange={set('first_name')} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className={inputClass} placeholder="Last name" value={form.last_name} onChange={set('last_name')} required />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" className={inputClass} placeholder="name@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" className={inputClass} placeholder="Create a strong password" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">I am a...</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select 
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={form.role} 
                  onChange={set('role')}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            {form.role === 'STUDENT' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Registration Number (Optional)</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className={inputClass} placeholder="e.g. STU-2026-0001 (Leave blank to auto-generate)" value={form.enrollment_number} onChange={set('enrollment_number')} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 mt-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

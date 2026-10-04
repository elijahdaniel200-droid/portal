"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore, UserRole } from '@/store/useAuthStore';
import { Eye, EyeOff, GraduationCap, Lock, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser, setRole, setProfile } = useAuthStore();

  const handleDemoLogin = (role: string) => {
    if (role === 'Student') {
      setLoginType('student');
      setIdentifier('STU-2026-0001'); // Standard demo reg number
      setPassword('password123');
    } else if (role === 'Teacher') {
      setLoginType('staff');
      setIdentifier('teacher@school.edu');
      setPassword('password123');
    } else if (role === 'Admin') {
      setLoginType('staff');
      setIdentifier('admin@school.edu');
      setPassword('password123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Resolve identifier to email
      const res = await fetch('/api/auth/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const resolveData = await res.json();
      if (!res.ok) throw new Error(resolveData.error || 'Failed to resolve account');

      const loginEmail = resolveData.email;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (authError) throw authError;
      if (authData.user) {
        setUser(authData.user);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles').select('*').eq('id', authData.user.id).single();
        if (profileError) throw profileError;
        setProfile(profileData);
        setRole(profileData.role as UserRole);
        if (profileData.role === 'ADMIN') router.push('/admin');
        else if (profileData.role === 'TEACHER') router.push('/teacher');
        else router.push('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated orbs */}
      <div className="orb w-96 h-96 bg-blue-600/20 top-[-80px] left-[-80px]" />
      <div className="orb w-80 h-80 bg-amber-500/15 bottom-[-60px] right-[-60px]" />
      <div className="orb w-64 h-64 bg-indigo-500/10 top-1/2 left-1/3" />

      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div className="gold-shimmer h-full w-1/3" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* School Logo / Crest */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-2xl shadow-amber-500/30 mb-4 overflow-hidden border-2 border-amber-400">
            <img src="/eduportal-logo.jpg" alt="EduPortal Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EduPortal</h1>
          <p className="text-blue-200/70 text-sm mt-1 tracking-wider uppercase font-medium">School Management System</p>
        </div>

        {/* Glass Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-blue-200/60 text-sm mt-1">Sign in to access your portal</p>
          </div>

          <div className="flex bg-white/10 rounded-xl p-1 mb-6">
            <button 
              onClick={() => { setLoginType('student'); setError(''); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'student' ? 'bg-white text-blue-600 shadow-md' : 'text-blue-100 hover:text-white hover:bg-white/5'}`}
            >
              Student
            </button>
            <button 
              onClick={() => { setLoginType('staff'); setError(''); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'staff' ? 'bg-white text-violet-600 shadow-md' : 'text-blue-100 hover:text-white hover:bg-white/5'}`}
            >
              Staff
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Identifier */}
            <div>
              <label className="block text-xs font-semibold text-blue-100/70 uppercase tracking-wider mb-2">
                {loginType === 'student' ? 'Registration Number' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={loginType === 'student' ? 'e.g. STU-2026-0001' : 'you@school.edu'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/8 border border-white/10 text-white placeholder-blue-200/30 input-field focus:bg-white/12 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-blue-100/70 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/8 border border-white/10 text-white placeholder-blue-200/30 input-field focus:bg-white/12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-amber-400" />
                <span className="text-sm text-blue-200/60">Remember me</span>
              </label>
              <button type="button" className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-500/15 border border-red-500/30 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #f5a623 0%, #e8920d 100%)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Signing in…</span>
                </span>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>

          {/* Role Hints */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-blue-200/40 text-center mb-3 uppercase tracking-wider">Portal Access</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[
                { role: 'Student', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30' },
                { role: 'Teacher', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' },
                { role: 'Admin', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30' },
              ].map((r) => (
                <button 
                  key={r.role} 
                  type="button"
                  onClick={() => handleDemoLogin(r.role)}
                  className={`text-xs font-medium px-3 py-1 rounded-full border transition-all cursor-pointer ${r.color}`}
                  title={`Pre-fill ${r.role} demo credentials`}
                >
                  {r.role}
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-blue-200/60">
                Don't have an account?{' '}
                <Link href="/signup" className="text-amber-400 font-bold hover:underline transition-all">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-200/30 text-xs mt-6">
          © 2026 EduPortal. All rights reserved. &nbsp;·&nbsp; Secure HTTPS Connection
        </p>
      </div>
    </div>
  );
}

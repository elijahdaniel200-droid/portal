"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { role, profile, clearAuth } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push('/login');
  };

  const getDashboardHref = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'TEACHER') return '/teacher';
    if (role === 'STUDENT') return '/student';
    return '/login';
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb w-96 h-96 bg-red-600/15 top-[-80px] right-[-80px]" />
      <div className="orb w-80 h-80 bg-amber-500/10 bottom-[-60px] left-[-60px]" />

      <div className="w-full max-w-lg relative z-10 text-center">
        {/* Glass Card */}
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 backdrop-blur-xl">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-400 shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-500/20 text-red-300 border border-red-500/30 mb-3">
            HTTP 403 Forbidden
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Access Restricted
          </h1>

          <p className="text-blue-200/70 text-sm sm:text-base mt-3 leading-relaxed">
            You do not have the required permissions to view this resource. This incident has been logged for security auditing.
          </p>

          {profile && (
            <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-3 text-xs text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Signed in as: <strong className="text-white">{profile.first_name} {profile.last_name}</strong></span>
              <span className="text-white/40">|</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-medium">
                {role || 'UNKNOWN'}
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={getDashboardHref()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              Return to My Portal
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-medium text-sm border border-white/10 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Switch Account
            </button>
          </div>
        </div>

        <p className="text-xs text-blue-200/40 mt-6">
          EduPortal Security Subsystem &bull; Zero-Trust Policy Enforced
        </p>
      </div>
    </div>
  );
}

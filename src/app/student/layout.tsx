"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CreditCard, LayoutDashboard, UserCircle, LogOut, GraduationCap, Bell, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NotificationsDropdown from '@/components/NotificationsDropdown';

const navigation = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Academics', href: '/student/academics', icon: BookOpen },
  { name: 'E-Learning', href: '/student/e-learning', icon: BookOpen }, // Assuming BookOpen or similar icon is fine, I can use BookMarked or something
  { name: 'Financial Center', href: '/student/finances', icon: CreditCard },
  { name: 'My Profile', href: '/student/profile', icon: UserCircle },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, clearAuth } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push('/login');
  };

  const initials = `${profile?.first_name?.[0] || 'S'}${profile?.last_name?.[0] || ''}`;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex-shrink-0 hidden md:flex flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #05111f 0%, #0a1929 60%, #0d2137 100%)' }}
      >
        {/* Decorative orb */}
        <div className="orb w-56 h-56 bg-blue-600/20 -top-16 -left-16" />
        <div className="orb w-40 h-40 bg-amber-500/10 bottom-20 -right-10" />

        {/* Logo */}
        <div className="relative z-10 p-6 border-b border-white/8">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">EduPortal</h1>
              <p className="text-xs text-blue-300/50 font-medium">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''} flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-blue-200/50 hover:bg-white/6 hover:text-blue-100'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-amber-400' : ''}`} style={{ width: '18px', height: '18px' }} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-amber-400/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="relative z-10 p-4 border-t border-white/8">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-blue-300/50 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm text-red-300/70 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shadow-sm">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {navigation.find(n => n.href === pathname)?.name || 'Student Portal'}
            </p>
          </div>
          <div className="flex items-center space-x-3 relative">
            <NotificationsDropdown />

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

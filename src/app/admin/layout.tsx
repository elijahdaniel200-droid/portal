"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, GraduationCap, LayoutDashboard, Settings, LogOut, CreditCard, CalendarDays, ShieldAlert, Bell, ChevronRight, CheckSquare, Menu, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NotificationsDropdown from '@/components/NotificationsDropdown';

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Academics Setup', href: '/admin/academics', icon: GraduationCap },
  { name: 'Result Management', href: '/admin/results', icon: CheckSquare },
  { name: 'Fee Management', href: '/admin/fees', icon: CreditCard },
  { name: 'Events & Calendar', href: '/admin/events', icon: CalendarDays },
  { name: 'System Logs', href: '/admin/logs', icon: ShieldAlert },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, clearAuth } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push('/login');
  };

  const initials = `${profile?.first_name?.[0] || 'A'}${profile?.last_name?.[0] || ''}`;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>
        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`w-64 flex-shrink-0 flex flex-col absolute md:relative z-50 h-full transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-hidden`}
          style={{ background: 'linear-gradient(180deg, #05111f 0%, #0a1929 100%)' }}
        >
          {/* Close button for mobile */}
          <button 
            className="absolute top-4 right-4 text-white/50 hover:text-white md:hidden z-20"
            onClick={() => setShowMobileMenu(false)}
          >
            <XCircle className="w-6 h-6" />
          </button>
          
          <div className="orb w-48 h-48 bg-emerald-500/10 -top-12 -right-12" />
          <div className="orb w-56 h-56 bg-amber-500/8 bottom-10 -left-20" />

          {/* Logo */}
          <div className="relative z-10 p-6 border-b border-white/8">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">EduPortal</h1>
                <p className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">Admin Console</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="relative z-10 flex-1 p-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`nav-link ${isActive ? 'active' : ''} flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-500/12 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} style={{ width: '17px', height: '17px' }} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="relative z-10 p-4 border-t border-white/8">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-xs text-emerald-400/60">Administrator</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm text-red-300/60 hover:bg-red-500/10 hover:text-red-300 transition-all">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <button 
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium hidden sm:block">
                {navigation.find(n => n.href === pathname)?.name || 'Admin Console'}
              </p>
            </div>
          <div className="flex items-center space-x-3 relative">
            <NotificationsDropdown />

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

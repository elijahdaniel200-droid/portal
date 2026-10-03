"use client";

import { Users, FileEdit, CalendarDays, TrendingUp, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const stats = [
  { title: 'Students Assigned', value: '142', sub: 'Across 4 classes', icon: Users, from: '#3b82f6', to: '#1d4ed8', href: '/teacher/classes' },
  { title: 'Grades Submitted', value: '86%', sub: '12 remaining', icon: FileEdit, from: '#10b981', to: '#059669', href: '/teacher/gradebook' },
  { title: 'Classes Today', value: '5', sub: 'Next at 09:00 AM', icon: CalendarDays, from: '#f59e0b', to: '#d97706', href: '/teacher/classes' },
  { title: 'Class Average', value: 'B+', sub: 'Up from last term', icon: TrendingUp, from: '#8b5cf6', to: '#6d28d9', href: '/teacher/gradebook' },
];

const myClasses = [
  { id: '10A', subject: 'Advanced Physics', time: '09:00 AM', students: 28, avgGrade: 'A-' },
  { id: '11B', subject: 'General Mathematics', time: '11:30 AM', students: 32, avgGrade: 'B+' },
  { id: '9C', subject: 'Intro to Science', time: '01:00 PM', students: 25, avgGrade: 'B' },
  { id: '12A', subject: 'Applied Physics', time: '03:00 PM', students: 22, avgGrade: 'A' },
];

export default function TeacherDashboard() {
  const { profile } = useAuthStore();
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #05111f 0%, #1e1040 60%, #2d1b69 100%)' }}
      >
        <div className="orb w-64 h-64 bg-violet-500/15 -top-20 right-0" />
        <div className="orb w-48 h-48 bg-amber-500/10 bottom-0 left-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-1">Staff Portal 👨‍🏫</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Good morning, {profile?.first_name ? `Mr./Ms. ${profile.last_name}` : 'Teacher'}!
            </h2>
            <p className="text-blue-200/50 mt-2 text-sm">Term 1, 2026/2027 — Science Department</p>
          </div>
          <button
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg self-start md:self-auto"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
          >
            <span>+ New Announcement</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <button 
              key={i} 
              onClick={() => router.push(stat.href)}
              className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4 hover:bg-slate-50 transition-colors text-left cursor-pointer group hover:scale-[1.02] duration-200"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200"
                style={{ background: `linear-gradient(135deg, ${stat.from}, ${stat.to})` }}
              >
                <Icon className="text-white" style={{ width: '22px', height: '22px' }} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]" title={stat.sub}>{stat.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Classes Table + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">My Assigned Classes</h3>
            <button 
              onClick={() => router.push('/teacher/classes')}
              className="text-xs font-semibold text-violet-600 flex items-center space-x-1 hover:text-violet-700"
            >
              <span>View All</span><ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {myClasses.map((cls, i) => (
              <div key={i} className="table-row-hover px-6 py-4 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-xs flex-shrink-0">
                  {cls.id}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{cls.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cls.time} &middot; {cls.students} students &middot; Avg: <span className="font-bold text-violet-600">{cls.avgGrade}</span></p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button 
                    onClick={() => router.push('/teacher/attendance')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Attendance
                  </button>
                  <button 
                    onClick={() => router.push('/teacher/gradebook')}
                    className="px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                  >
                    Records
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
          </div>
          <div className="p-6 space-y-5">
            {[
              { action: 'Published Mid-Term Grades for Class 10A', time: '2 hours ago', color: 'bg-emerald-500' },
              { action: 'Uploaded assignment: "Newton\'s Laws of Motion"', time: 'Yesterday 4:30 PM', color: 'bg-blue-500' },
              { action: 'Marked attendance for Class 11B (100%)', time: 'Yesterday 1:00 PM', color: 'bg-violet-500' },
              { action: 'Added remarks to Class 9C report cards', time: 'Sep 30, 2026', color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="flex space-x-3">
                <div className="flex flex-col items-center">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${item.color}`} />
                  {i < 3 && <div className="w-px flex-1 bg-slate-100 mt-1.5" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{item.action}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

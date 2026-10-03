"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar, CheckCircle2, AlertCircle, Clock, TrendingUp, BookMarked, ArrowRight, User, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

export default function StudentDashboard() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetch(`/api/student-dashboard?studentId=${profile.id}`)
        .then(res => res.json())
        .then(data => {
          setDashboardData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { title: 'Attendance Rate', value: `${dashboardData?.attendanceRate || 0}%`, sub: 'Current standing', icon: CheckCircle2, from: '#10b981', to: '#059669', href: '/student/academics' },
    { title: 'Pending Fees', value: `₦${(dashboardData?.pendingFees || 0).toLocaleString()}`, sub: dashboardData?.nextDueDate || 'No pending fees', icon: AlertCircle, from: '#f59e0b', to: '#d97706', href: '/student/finances' },
    { title: "Enrolled Classes", value: `${dashboardData?.classesCount || 0}`, sub: 'This term', icon: Clock, from: '#3b82f6', to: '#1d4ed8', href: '/student/academics' },
    { title: 'Avg Grade', value: dashboardData?.avgGrade || 'N/A', sub: 'Current term standing', icon: TrendingUp, from: '#8b5cf6', to: '#6d28d9', href: '/student/academics' },
  ];

  const schedule = dashboardData?.schedule || [];
  const announcements = dashboardData?.announcements || [];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #05111f 0%, #113050 60%, #1a4a7a 100%)' }}
      >
        <div className="orb w-64 h-64 bg-amber-500/15 -top-20 right-0" />
        <div className="orb w-40 h-40 bg-blue-500/20 bottom-0 left-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Good morning 👋</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {profile?.first_name ? `Welcome back, ${profile.first_name}!` : 'Welcome back, Student!'}
            </h2>
            <p className="text-blue-200/60 mt-2 text-sm">Term 1, 2026/2027 Academic Year • {dashboardData?.className}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="glass text-center px-6 py-4 rounded-xl">
              <p className="text-2xl font-bold text-white">14</p>
              <p className="text-xs text-blue-200/60 mt-1">Days to Exams</p>
            </div>
            <div className="glass text-center px-6 py-4 rounded-xl">
              <p className="text-2xl font-bold text-amber-400">3rd</p>
              <p className="text-xs text-blue-200/60 mt-1">Class Rank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
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
                <Icon className="w-5.5 h-5.5 text-white" style={{ width: '22px', height: '22px' }} />
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

      {/* Schedule + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Today's Schedule</h3>
            </div>
            <button 
              onClick={() => router.push('/student/academics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors"
            >
              <span>Full Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {schedule.map((cls: any, i: number) => (
              <div key={i} className="table-row-hover px-6 py-4 flex items-center space-x-4">
                <div className={`w-1 h-10 rounded-full flex-shrink-0 ${cls.color}`} />
                <div className="w-20 flex-shrink-0">
                  <p className="text-xs font-bold text-slate-900">{cls.time}</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{cls.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cls.teacher} &middot; {cls.room}</p>
                </div>
                <button 
                  onClick={() => setSelectedClass(cls)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0"
                >
                  View
                </button>
              </div>
            ))}
            {schedule.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500 font-medium">No classes scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BookMarked className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Announcements</h3>
            </div>
            <span className="badge-pulse w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="p-6 space-y-5">
            {announcements.map((a: any, i: number) => {
              const dotColor = a.type === 'info' ? 'bg-blue-500' : a.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div 
                  key={i} 
                  className="group cursor-pointer"
                  onClick={() => setSelectedAnnouncement(a)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center pt-1">
                      <span className={`w-2 h-2 rounded-full ${dotColor} mb-1`} />
                      <div className="w-0.5 h-full bg-slate-100 group-last:hidden" />
                    </div>
                    <div className="flex-1 pb-5 group-last:pb-0">
                      <p className="text-xs font-bold text-blue-600 mb-1">{a.date}</p>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{a.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{a.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title="Class Details"
      >
        {selectedClass && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${selectedClass.color}`}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedClass.subject}</h3>
                <p className="text-sm text-slate-500 font-medium">{selectedClass.time}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-slate-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Teacher</span>
                </div>
                <p className="font-semibold text-slate-900">{selectedClass.teacher}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-slate-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                </div>
                <p className="font-semibold text-slate-900">{selectedClass.room}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedClass(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title="Announcement"
      >
        {selectedAnnouncement && (
          <div className="p-6">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3">
                {selectedAnnouncement.date}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedAnnouncement.title}</h3>
            </div>
            <div className="prose prose-slate prose-sm max-w-none">
              <p className="text-slate-600 leading-relaxed">{selectedAnnouncement.desc}</p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 text-right">
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

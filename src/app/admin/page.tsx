"use client";

import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, Activity, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StudentProfileModal from '@/components/StudentProfileModal';

const stats = [
  { title: 'Total Students', value: '1,240', change: '+12%', up: true, icon: Users, from: '#3b82f6', to: '#1d4ed8', path: '/admin/users' },
  { title: 'Teaching Staff', value: '84', change: '+2 new', up: true, icon: GraduationCap, from: '#10b981', to: '#059669', path: '/admin/users' },
  { title: 'Revenue (Term 1)', value: '₦124.5M', change: '+4.5%', up: true, icon: DollarSign, from: '#f59e0b', to: '#d97706', path: '/admin/fees' },
  { title: 'System Uptime', value: '99.9%', change: 'Healthy', up: null, icon: Activity, from: '#8b5cf6', to: '#6d28d9', path: '/admin/logs' },
];

const statusStyle: Record<string, string> = {
  'Active': 'bg-emerald-100 text-emerald-700',
  'Pending Fee': 'bg-amber-100 text-amber-700',
  'Inactive': 'bg-red-100 text-red-600',
};

import { useAuthStore } from '@/store/useAuthStore';

export default function AdminDashboard() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    revenue: 0,
    pendingRevenue: 0,
    overdueRevenue: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetch(`/api/admin/dashboard?adminId=${profile.id}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            setDashboardStats(json.data);
          }
        })
        .catch(console.error);

      fetch(`/api/students?adminId=${profile.id}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            const formatted = json.data.slice(0, 5).map((item: any) => {
              const p = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
              return {
                id: item.id,
                name: `${p?.first_name || 'Unknown'} ${p?.last_name || ''}`,
                enrollmentId: item.enrollment_number,
                class: item.classes?.name || 'Unassigned',
                status: 'Active'
              };
            });
            setRecentStudents(formatted);
          }
        })
        .catch(console.error);
    }
  }, [profile]);

  const dynamicStats = [
    { title: 'Total Students', value: dashboardStats.totalStudents.toString(), change: 'Live', up: true, icon: Users, from: '#3b82f6', to: '#1d4ed8', path: '/admin/users' },
    { title: 'Teaching Staff', value: dashboardStats.totalTeachers.toString(), change: 'Live', up: true, icon: GraduationCap, from: '#10b981', to: '#059669', path: '/admin/users' },
    { title: 'Revenue (Term 1)', value: `₦${dashboardStats.revenue.toLocaleString()}`, change: 'Live', up: true, icon: DollarSign, from: '#f59e0b', to: '#d97706', path: '/admin/fees' },
    { title: 'System Uptime', value: '99.9%', change: 'Healthy', up: null, icon: Activity, from: '#8b5cf6', to: '#6d28d9', path: '/admin/logs' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #05111f 0%, #0d2137 50%, #113050 100%)' }}
      >
        <div className="orb w-72 h-72 bg-emerald-500/12 -top-20 right-0" />
        <div className="orb w-48 h-48 bg-amber-500/10 bottom-0 left-1/4" />
        <div className="relative z-10">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-1">Admin Console</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">School Overview</h2>
          <p className="text-blue-200/50 mt-2 text-sm">Academic Year 2026/2027 — Term 1 in progress</p>
          <div className="flex flex-wrap gap-4 mt-5">
            <button 
              onClick={() => router.push('/admin/users')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
              <Users className="w-4 h-4" /><span>Add New User</span>
            </button>
            <button 
              onClick={() => router.push('/admin/fees')}
              className="glass flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white hover:bg-white/12 transition-all">
              <DollarSign className="w-4 h-4 text-amber-400" /><span>Generate Invoices</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dynamicStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              onClick={() => router.push(stat.path)}
              className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${stat.from}, ${stat.to})` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {stat.up !== null ? (
                  <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />{stat.change}
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Table + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Recent Enrollments</h3>
            <button 
              onClick={() => router.push('/admin/users')}
              className="text-xs font-semibold text-blue-600 flex items-center space-x-1 hover:text-blue-700 transition-colors"
            >
              <span>View All Users</span><ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentStudents.map((s, i) => (
                  <tr 
                    key={i} 
                    onClick={() => setSelectedStudentId(s.id)}
                    className="table-row-hover cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {s.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.enrollmentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{s.class}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${statusStyle[s.status] || 'bg-slate-100 text-slate-600'}`}>
                        {s.status === 'Active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {s.status === 'Pending Fee' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No recent enrollments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Side Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Fee Collection Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Collected', value: dashboardStats.revenue, color: 'bg-emerald-500' },
                { label: 'Pending', value: dashboardStats.pendingRevenue, color: 'bg-amber-400' },
                { label: 'Overdue', value: dashboardStats.overdueRevenue, color: 'bg-red-500' },
              ].map((item) => {
                const total = dashboardStats.revenue + dashboardStats.pendingRevenue + dashboardStats.overdueRevenue;
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                      <span>{item.label}</span><span className="font-bold">₦{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Import Students (CSV)', icon: Users, color: 'text-blue-600 bg-blue-50', path: '/admin/users' },
                { label: 'Generate Invoices', icon: DollarSign, color: 'text-amber-600 bg-amber-50', path: '/admin/fees' },
                { label: 'New Academic Term', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50', path: '/admin/academics' },
              ].map((a) => (
                <button 
                  key={a.label} 
                  onClick={() => router.push(a.path)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{a.label}</span>
                  <ArrowUpRight className="ml-auto w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedStudentId && (
        <StudentProfileModal
          isOpen={true}
          onClose={() => setSelectedStudentId(null)}
          studentId={selectedStudentId}
        />
      )}
    </div>
  );
}

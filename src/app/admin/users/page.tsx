"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Upload, Plus, Edit2, Trash2, RefreshCw, Users, GraduationCap, Eye } from 'lucide-react';
import Modal from '@/components/Modal';
import AddStudentForm from '@/components/AddStudentForm';
import AddTeacherForm from '@/components/AddTeacherForm';
import StudentProfileModal from '@/components/StudentProfileModal';

type Tab = 'students' | 'teachers';

interface UserRow {
  id: string;
  name: string;
  email: string;
  identifier: string; // enrollment_number or department
  detail: string;     // class name or hire date
  status: string;
  joinedAt: string;
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  'Pending Fee': 'bg-amber-100 text-amber-700',
  Inactive: 'bg-red-100 text-red-600',
  Staff: 'bg-violet-100 text-violet-700',
};

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'students' ? '/api/students' : '/api/teachers';
      const res = await fetch(endpoint);
      const json = await res.json();
      
      if (json.data) {
        const rows: UserRow[] = json.data.map((item: any) => {
          const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          if (activeTab === 'students') {
            return {
              id: item.id,
              name: `${profile?.first_name} ${profile?.last_name}`,
              email: profile?.email || '',
              identifier: item.enrollment_number,
              detail: item.classes?.name || 'Unassigned',
              status: 'Active',
              joinedAt: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—',
            };
          } else {
            return {
              id: item.id,
              name: `${profile?.first_name} ${profile?.last_name}`,
              email: profile?.email || '',
              identifier: item.department || 'Unassigned',
              detail: item.hire_date ? new Date(item.hire_date).toLocaleDateString() : '—',
              status: 'Staff',
              joinedAt: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—',
            };
          }
        });
        setUsers(rows);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.identifier.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuccess = () => {
    setShowAddStudent(false);
    setShowAddTeacher(false);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 text-sm mt-1">
            {users.length} {activeTab} registered
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors font-medium text-sm">
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => activeTab === 'students' ? setShowAddStudent(true) : setShowAddTeacher(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm transition-all hover:scale-105"
            style={{ background: activeTab === 'students' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add {activeTab === 'students' ? 'Student' : 'Teacher'}</span>
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" />
            <span>Students</span>
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'teachers' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Teachers & Staff</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 w-64 transition-all"
            />
          </div>
          <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading {activeTab}…</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeTab === 'students' ? 'Student' : 'Staff Member'}
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeTab === 'students' ? 'Enrollment ID' : 'Department'}
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeTab === 'students' ? 'Class' : 'Hire Date'}
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          {activeTab === 'students' ? <Users className="w-6 h-6 text-slate-400" /> : <GraduationCap className="w-6 h-6 text-slate-400" />}
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No {activeTab} found</p>
                        <p className="text-xs text-slate-400">
                          {search ? 'Try a different search term' : `Click "Add ${activeTab === 'students' ? 'Student' : 'Teacher'}" to get started`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((user) => (
                  <tr key={user.id} className="table-row-hover group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                          style={{ background: activeTab === 'students' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}
                        >
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-slate-700">{user.identifier}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.detail}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.joinedAt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[user.status] || 'bg-slate-100 text-slate-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab === 'students' && (
                          <button onClick={() => setViewStudentId(user.id)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination hint */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">Showing {filtered.length} of {users.length} records</p>
            <div className="flex space-x-1">
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Previous</button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">1</button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        title="Add New Student"
        subtitle="Create a student account and academic record"
        size="md"
      >
        <AddStudentForm onSuccess={handleSuccess} onCancel={() => setShowAddStudent(false)} />
      </Modal>

      <Modal
        isOpen={showAddTeacher}
        onClose={() => setShowAddTeacher(false)}
        title="Add New Teacher"
        subtitle="Create a staff account and assign department"
        size="md"
      >
        <AddTeacherForm onSuccess={handleSuccess} onCancel={() => setShowAddTeacher(false)} />
      </Modal>

      <StudentProfileModal 
        studentId={viewStudentId!} 
        isOpen={!!viewStudentId} 
        onClose={() => setViewStudentId(null)} 
      />
    </div>
  );
}

"use client";

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Save, RefreshCw, Calendar, MapPin, Mail, User } from 'lucide-react';
import Modal from '@/components/Modal';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface StudentRow {
  id: string;
  name: string;
  status: AttendanceStatus;
}

const statusConfig: Record<AttendanceStatus, { label: string; icon: any; active: string; inactive: string }> = {
  PRESENT: { label: 'Present', icon: CheckCircle2, active: 'bg-emerald-500 text-white', inactive: 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600' },
  LATE: { label: 'Late', icon: Clock, active: 'bg-amber-400 text-white', inactive: 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600' },
  ABSENT: { label: 'Absent', icon: XCircle, active: 'bg-red-500 text-white', inactive: 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600' },
  EXCUSED: { label: 'Excused', icon: AlertCircle, active: 'bg-blue-500 text-white', inactive: 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600' },
};

// Demo students — in production these would come from /api/students?class_id=...
const DEMO_STUDENTS: StudentRow[] = [
  { id: 'demo-1', name: 'Alice Walker', status: 'PRESENT' },
  { id: 'demo-2', name: 'Michael Chen', status: 'PRESENT' },
  { id: 'demo-3', name: 'Sarah Jones', status: 'PRESENT' },
  { id: 'demo-4', name: 'David Smith', status: 'PRESENT' },
  { id: 'demo-5', name: 'Emma Wilson', status: 'PRESENT' },
  { id: 'demo-6', name: 'James Okafor', status: 'PRESENT' },
  { id: 'demo-7', name: 'Fatima Bello', status: 'PRESENT' },
  { id: 'demo-8', name: 'Chukwudi Eze', status: 'PRESENT' },
];

const DEMO_CLASS_ID = '00000000-0000-0000-0000-000000000001';

export default function TeacherAttendancePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [students, setStudents] = useState<StudentRow[]>(DEMO_STUDENTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null);

  const markAll = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    setSaved(false);
  };

  const setStatus = (id: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setSaved(false);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        class_id: DEMO_CLASS_ID,
        date: selectedDate,
        status: s.status,
      }));
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [students, selectedDate]);

  const counts = {
    PRESENT: students.filter(s => s.status === 'PRESENT').length,
    LATE: students.filter(s => s.status === 'LATE').length,
    ABSENT: students.filter(s => s.status === 'ABSENT').length,
    EXCUSED: students.filter(s => s.status === 'EXCUSED').length,
  };

  const pctPresent = Math.round((counts.PRESENT / students.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Register</h2>
          <p className="text-slate-500 text-sm mt-1">Mark and track daily student attendance.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:scale-105 transition-all shadow-lg"
          style={{ background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /><span>Saved!</span></> : saving ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Saving…</span></> : <><Save className="w-4 h-4" /><span>Save Attendance</span></>}
        </button>
      </div>

      {/* Class & Date Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all">
            <option value="10A">Grade 10A — Advanced Physics</option>
            <option value="11B">Grade 11B — General Mathematics</option>
            <option value="9C">Grade 9C — Intro to Science</option>
            <option value="12A">Grade 12A — Applied Physics</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="date" value={selectedDate} max={today} onChange={e => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all" />
          </div>
        </div>
        <div className="flex space-x-2">
          {(Object.keys(statusConfig) as AttendanceStatus[]).map(s => (
            <button key={s} onClick={() => markAll(s)}
              className="px-3 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors">
              All {statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          const pct = Math.round((counts[status] / students.length) * 100);
          return (
            <div key={status} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.active}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{counts[status]}</p>
                <p className="text-xs text-slate-400">{cfg.label} ({pct}%)</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Overall Presence Rate</span>
          <span className={pctPresent >= 80 ? 'text-emerald-600' : 'text-red-500'}>{pctPresent}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 transition-all" style={{ width: `${(counts.PRESENT / students.length) * 100}%` }} />
          <div className="bg-amber-400 transition-all" style={{ width: `${(counts.LATE / students.length) * 100}%` }} />
          <div className="bg-blue-500 transition-all" style={{ width: `${(counts.EXCUSED / students.length) * 100}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${(counts.ABSENT / students.length) * 100}%` }} />
        </div>
        <div className="flex space-x-4 mt-2">
          {[['bg-emerald-500','Present'],['bg-amber-400','Late'],['bg-blue-500','Excused'],['bg-red-500','Absent']].map(([c,l]) => (
            <div key={l} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${c}`} />
              <span className="text-xs text-slate-400">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Student Register — {selectedClass} &middot; {new Date(selectedDate + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {students.map((student, idx) => (
            <div key={student.id} className="table-row-hover px-6 py-4 flex items-center justify-between gap-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer group flex-1"
                onClick={() => setSelectedStudentProfile(student)}
              >
                <span className="text-xs font-bold text-slate-300 w-5">{idx + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center font-bold text-violet-700 text-xs flex-shrink-0 group-hover:scale-110 transition-transform">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="font-semibold text-slate-900 text-sm group-hover:text-violet-600 transition-colors">{student.name}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                {(Object.keys(statusConfig) as AttendanceStatus[]).map(s => {
                  const cfg = statusConfig[s];
                  const Icon = cfg.icon;
                  const isActive = student.status === s;
                  return (
                    <button key={s} onClick={() => setStatus(student.id, s)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? cfg.active : cfg.inactive}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selectedStudentProfile} onClose={() => setSelectedStudentProfile(null)} title="Student Profile">
        {selectedStudentProfile && (
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-2xl font-black mb-3 shadow-inner">
                {selectedStudentProfile.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedStudentProfile.name}</h2>
              <p className="text-sm font-semibold text-slate-500">ID: {selectedStudentProfile.id}</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Guardian Contact</p>
                  <p className="text-sm font-semibold text-slate-900">guardian@example.com</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Enrollment Year</p>
                  <p className="text-sm font-semibold text-slate-900">2024</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                  <p className="text-sm font-semibold text-slate-900">123 School Way, District</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-right">
              <button 
                onClick={() => setSelectedStudentProfile(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

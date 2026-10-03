"use client";

import { useState, useCallback } from 'react';
import { Save, Download, RefreshCw, CheckCircle2, AlertCircle, Upload, User, MapPin, Calendar, Mail } from 'lucide-react';
import Modal from '@/components/Modal';

interface GradeRow {
  studentId: string;
  name: string;
  ca1: number; // 20%
  ca2: number; // 20%
  exam: number; // 60%
}

function computeTotal(r: GradeRow) {
  return Math.round(r.ca1 + r.ca2 + r.exam);
}

function getGrade(total: number) {
  if (total >= 90) return { grade: 'A+', color: 'text-emerald-600' };
  if (total >= 80) return { grade: 'A',  color: 'text-emerald-600' };
  if (total >= 70) return { grade: 'B+', color: 'text-blue-600' };
  if (total >= 60) return { grade: 'B',  color: 'text-blue-600' };
  if (total >= 50) return { grade: 'C',  color: 'text-amber-600' };
  return { grade: 'F', color: 'text-red-600' };
}

function getRemark(total: number) {
  if (total >= 90) return { text: 'Excellent', cls: 'bg-emerald-100 text-emerald-700' };
  if (total >= 70) return { text: 'Passed', cls: 'bg-blue-100 text-blue-700' };
  if (total >= 50) return { text: 'Credit', cls: 'bg-amber-100 text-amber-700' };
  return { text: 'Failed', cls: 'bg-red-100 text-red-600' };
}

const DEMO_ROWS: GradeRow[] = [
  { studentId: 'demo-1', name: 'Alice Walker',   ca1: 18, ca2: 17, exam: 54 },
  { studentId: 'demo-2', name: 'Michael Chen',   ca1: 20, ca2: 19, exam: 58 },
  { studentId: 'demo-3', name: 'Sarah Jones',    ca1: 15, ca2: 14, exam: 40 },
  { studentId: 'demo-4', name: 'David Smith',    ca1: 12, ca2: 13, exam: 35 },
  { studentId: 'demo-5', name: 'Emma Wilson',    ca1: 17, ca2: 18, exam: 52 },
  { studentId: 'demo-6', name: 'James Okafor',   ca1: 19, ca2: 16, exam: 56 },
  { studentId: 'demo-7', name: 'Fatima Bello',   ca1: 20, ca2: 20, exam: 60 },
  { studentId: 'demo-8', name: 'Chukwudi Eze',   ca1: 11, ca2: 10, exam: 28 },
];

const DEMO_CLASS_SUBJECT_ID = '00000000-0000-0000-0000-000000000002';
const DEMO_TERM_ID = '00000000-0000-0000-0000-000000000003';

export default function TeacherGradebookPage() {
  const [selectedTerm, setSelectedTerm] = useState('2026/2027 - Term 1');
  const [selectedClass, setSelectedClass] = useState('Grade 10A');
  const [selectedSubject, setSelectedSubject] = useState('Advanced Physics');
  const [rows, setRows] = useState<GradeRow[]>(DEMO_ROWS);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const setScore = (idx: number, field: 'ca1' | 'ca2' | 'exam', val: string) => {
    const num = Math.min(Math.max(Number(val), 0), field === 'exam' ? 60 : 20);
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: num } : r));
    setSavedMsg(''); setErrMsg('');
  };

  const handleSave = useCallback(async () => {
    setSaving(true); setSavedMsg(''); setErrMsg('');
    try {
      const records = rows.map(r => ({
        student_id: r.studentId,
        class_subject_id: DEMO_CLASS_SUBJECT_ID,
        term_id: DEMO_TERM_ID,
        score: computeTotal(r),
        grade: getGrade(computeTotal(r)).grade,
        remarks: getRemark(computeTotal(r)).text,
      }));
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedMsg(`${records.length} records saved successfully!`);
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err: any) {
      setErrMsg(err.message);
    } finally {
      setSaving(false);
    }
  }, [rows]);

  const classAvg = Math.round(rows.reduce((s, r) => s + computeTotal(r), 0) / rows.length);
  const passing = rows.filter(r => computeTotal(r) >= 50).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Result Record</h2>
          <p className="text-slate-500 text-sm mt-1">Enter and manage continuous assessment scores.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 hover:bg-indigo-100 shadow-sm text-sm font-bold transition-colors"
          >
            <Upload className="w-4 h-4" /><span>Upload New Result</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm text-sm font-medium">
            <Download className="w-4 h-4" /><span>Export CSV</span>
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:scale-105 transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
            {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Saving…</span></> : <><Save className="w-4 h-4" /><span>Save Grades</span></>}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all">
            <option>2026/2027 - Term 1</option><option>2026/2027 - Term 2</option><option>2026/2027 - Term 3</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all">
            <option>Grade 10A</option><option>Grade 11B</option><option>Grade 9C</option><option>Grade 12A</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all">
            <option>Advanced Physics</option><option>General Mathematics</option><option>English Literature</option>
          </select>
        </div>
        {/* Summary chips */}
        <div className="flex space-x-3 flex-wrap gap-2">
          <div className="px-4 py-2.5 rounded-xl bg-violet-50 border border-violet-100">
            <p className="text-xs text-violet-500 font-semibold uppercase tracking-wider">Class Average</p>
            <p className="text-xl font-bold text-violet-700">{classAvg}%</p>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Passing</p>
            <p className="text-xl font-bold text-emerald-700">{passing}/{rows.length}</p>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Failing</p>
            <p className="text-xl font-bold text-red-600">{rows.length - passing}/{rows.length}</p>
          </div>
        </div>
      </div>

      {/* Feedback messages */}
      {savedMsg && (
        <div className="flex items-center space-x-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <p className="text-sm text-emerald-600 font-medium">{savedMsg}</p>
        </div>
      )}
      {errMsg && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{errMsg}</p>
        </div>
      )}

      {/* Score Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">{selectedClass} — {selectedSubject}</h3>
            <p className="text-xs text-slate-400 mt-0.5">CA1: /20 &nbsp;·&nbsp; CA2: /20 &nbsp;·&nbsp; Exam: /60 &nbsp;·&nbsp; Total: /100</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">CA 1 (20)</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">CA 2 (20)</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Exam (60)</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Total</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Grade</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row, idx) => {
                const total = computeTotal(row);
                const { grade, color } = getGrade(total);
                const remark = getRemark(total);
                return (
                  <tr key={row.studentId} className="table-row-hover group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-300">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer group"
                        onClick={() => setSelectedStudent(row)}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center font-bold text-violet-700 text-xs flex-shrink-0 group-hover:scale-110 transition-transform">
                          {row.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-violet-600 transition-colors">{row.name}</span>
                      </div>
                    </td>
                    {(['ca1', 'ca2'] as const).map(field => (
                      <td key={field} className="px-4 py-4 text-center">
                        <input type="number" min="0" max="20" value={row[field]}
                          onChange={e => setScore(idx, field, e.target.value)}
                          className="w-16 text-center py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all" />
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                      <input type="number" min="0" max="60" value={row.exam}
                        onChange={e => setScore(idx, 'exam', e.target.value)}
                        className="w-20 text-center py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${color}`}>{total}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-base font-bold ${color}`}>{grade}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${remark.cls}`}>{remark.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">{rows.length} students &middot; {selectedClass} &middot; {selectedTerm}</p>
          <p className="text-xs font-bold text-violet-600">Class Average: {classAvg}/100</p>
        </div>
      </div>
      
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Result">
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Session / Term</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors">
              <option>2026/2027 - Term 1</option>
              <option>2026/2027 - Term 2</option>
              <option>2026/2027 - Term 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors">
              <option>Grade 10A</option>
              <option>Grade 11B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors">
              <option>Advanced Physics</option>
              <option>General Mathematics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Upload CSV File</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">CSV files only (Max 5MB)</p>
            </div>
          </div>
          <div className="pt-4 flex space-x-3">
            <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors">Process Upload</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Profile">
        {selectedStudent && (
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-2xl font-black mb-3 shadow-inner">
                {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h2>
              <p className="text-sm font-semibold text-slate-500">ID: {selectedStudent.studentId}</p>
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
                onClick={() => setSelectedStudent(null)}
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

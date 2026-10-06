"use client";

import { useState, useCallback, useEffect } from 'react';
import { Save, Download, RefreshCw, CheckCircle2, AlertCircle, Upload, User, MapPin, Calendar, Mail, Send } from 'lucide-react';
import Modal from '@/components/Modal';
import { useAuthStore } from '@/store/useAuthStore';

interface GradeRow {
  studentId: string;
  name: string;
  ca1: number; // 20%
  ca2: number; // 20%
  exam: number; // 60%
  status: string; // DRAFT, SUBMITTED, APPROVED, REJECTED
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

export default function TeacherGradebookPage() {
  const { profile } = useAuthStore();
  const teacherId = profile?.id;

  const [terms, setTerms] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjectsMap, setSubjectsMap] = useState<Record<string, any[]>>({});
  
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classSubjectId, setClassSubjectId] = useState('');

  const [rows, setRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Fetch configs
  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/teacher/grades?teacher_id=${teacherId}`)
      .then(res => res.json())
      .then(data => {
        if (data.terms) {
          setTerms(data.terms);
          if (data.terms.length > 0) setSelectedTerm(data.terms[0].id);
        }
        if (data.classes) {
          setClasses(data.classes);
          if (data.classes.length > 0) setSelectedClass(data.classes[0].id);
        }
        if (data.subjectsByClass) {
          setSubjectsMap(data.subjectsByClass);
        }
      });
  }, [teacherId]);

  // Update selected subject when class changes
  useEffect(() => {
    if (selectedClass && subjectsMap[selectedClass]?.length > 0) {
      setSelectedSubject(subjectsMap[selectedClass][0].id);
    } else {
      setSelectedSubject('');
    }
  }, [selectedClass, subjectsMap]);

  // Fetch Grades
  const fetchGrades = useCallback(async () => {
    if (!teacherId || !selectedTerm || !selectedClass || !selectedSubject) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/grades?teacher_id=${teacherId}&term_id=${selectedTerm}&class_id=${selectedClass}&subject_id=${selectedSubject}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.rows) {
        setRows(data.rows.map((r: any) => ({
          studentId: r.studentId,
          name: r.name,
          ca1: r.breakdown?.ca1 || r.ca1 || 0,
          ca2: r.breakdown?.ca2 || r.ca2 || 0,
          exam: r.breakdown?.exam || r.exam || 0,
          status: r.status
        })));
        setClassSubjectId(data.class_subject_id);
      }
    } catch (err: any) {
      setErrMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedTerm, selectedClass, selectedSubject]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const setScore = (idx: number, field: 'ca1' | 'ca2' | 'exam', val: string) => {
    if (rows[idx].status === 'SUBMITTED' || rows[idx].status === 'APPROVED') return; // locked
    const num = Math.min(Math.max(Number(val), 0), field === 'exam' ? 60 : 20);
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: num } : r));
    setSavedMsg(''); setErrMsg('');
  };

  const handleSave = async (action: 'SAVE_DRAFT' | 'SUBMIT') => {
    setSaving(true); setSavedMsg(''); setErrMsg('');
    try {
      const records = rows.map(r => {
        const total = computeTotal(r);
        return {
          student_id: r.studentId,
          class_subject_id: classSubjectId,
          term_id: selectedTerm,
          score: total,
          grade: getGrade(total).grade,
          remarks: getRemark(total).text,
          breakdown: { ca1: r.ca1, ca2: r.ca2, exam: r.exam }
        };
      });
      const res = await fetch(`/api/teacher/grades?teacherId=${teacherId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedMsg(action === 'SUBMIT' ? `Scores submitted successfully!` : `Scores saved as draft!`);
      setTimeout(() => setSavedMsg(''), 4000);
      fetchGrades(); // refresh statuses
    } catch (err: any) {
      setErrMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Student Name", "CA1", "CA2", "Exam", "Total", "Grade", "Remark", "Status"];
    const csvRows = rows.map(r => {
      const total = computeTotal(r);
      const grade = getGrade(total).grade;
      const remark = getRemark(total).text;
      return `"${r.name}",${r.ca1},${r.ca2},${r.exam},${total},"${grade}","${remark}","${r.status}"`;
    });
    const classObj = classes.find(c => c.id === selectedClass);
    const subObj = subjectsMap[selectedClass]?.find(s => s.id === selectedSubject);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gradebook_${classObj?.name || 'Class'}_${subObj?.name || 'Subject'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classAvg = rows.length ? Math.round(rows.reduce((s, r) => s + computeTotal(r), 0) / rows.length) : 0;
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
          <button onClick={exportToCSV} className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm text-sm font-medium">
            <Download className="w-4 h-4" /><span>Export CSV</span>
          </button>
          <button onClick={() => handleSave('SAVE_DRAFT')} disabled={saving || rows.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition-all shadow-sm">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span>Save Draft</span>
          </button>
          <button onClick={() => handleSave('SUBMIT')} disabled={saving || rows.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:scale-105 transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
            <Send className="w-4 h-4" /><span>Submit Results</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all">
            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all">
            {subjectsMap[selectedClass]?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>) || <option value="">No Subjects</option>}
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
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-slate-500 font-medium">No students found for this selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">CA 1 (20)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">CA 2 (20)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Exam (60)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Total</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Grade</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row, idx) => {
                  const total = computeTotal(row);
                  const { grade, color } = getGrade(total);
                  const remark = getRemark(total);
                  const isLocked = row.status === 'SUBMITTED' || row.status === 'APPROVED';
                  return (
                    <tr key={row.studentId} className={`table-row-hover ${isLocked ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 text-sm">{row.name}</span>
                      </td>
                      {(['ca1', 'ca2'] as const).map(field => (
                        <td key={field} className="px-4 py-4 text-center">
                          <input type="number" min="0" max="20" value={row[field]}
                            disabled={isLocked}
                            onChange={e => setScore(idx, field, e.target.value)}
                            className="w-16 text-center py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all disabled:bg-slate-100 disabled:text-slate-400" />
                        </td>
                      ))}
                      <td className="px-4 py-4 text-center">
                        <input type="number" min="0" max="60" value={row.exam}
                          disabled={isLocked}
                          onChange={e => setScore(idx, 'exam', e.target.value)}
                          className="w-20 text-center py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all disabled:bg-slate-100 disabled:text-slate-400" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-lg font-bold ${color}`}>{total}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-base font-bold ${color}`}>{grade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          row.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                          row.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                          row.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

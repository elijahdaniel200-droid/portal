"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckSquare, XCircle, CheckCircle, Clock, Eye, AlertCircle, Download } from 'lucide-react';
import Modal from '@/components/Modal';

interface GradeSubmission {
  id: string;
  student: {
    enrollment_number: string;
    profiles: { first_name: string; last_name: string };
  };
  class_subject: {
    classes: { name: string };
    subjects: { name: string };
    teachers: { profiles: { first_name: string; last_name: string } };
  };
  term: { name: string };
  score: number;
  grade: string;
  remarks: string;
  status: string;
}

export default function ResultManagementPage() {
  const [submissions, setSubmissions] = useState<GradeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<GradeSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<'SUBMITTED' | 'APPROVED' | 'REJECTED'>('SUBMITTED');

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('grades')
      .select(`
        id, score, grade, remarks, status,
        student:students(enrollment_number, profiles(first_name, last_name)),
        class_subject:class_subjects(
          classes(name),
          subjects(name),
          teachers(profiles(first_name, last_name))
        ),
        term:academic_terms(name)
      `)
      .in('status', ['SUBMITTED', 'APPROVED', 'REJECTED'])
      .order('id', { ascending: false });
    
    if (data) {
      const formatted = data.map((d: any) => ({
        ...d,
        student: {
          ...d.student,
          profiles: Array.isArray(d.student.profiles) ? d.student.profiles[0] : d.student.profiles
        },
        class_subject: {
          ...d.class_subject,
          teachers: {
            profiles: Array.isArray(d.class_subject.teachers?.profiles) ? d.class_subject.teachers.profiles[0] : d.class_subject.teachers?.profiles
          }
        }
      }));
      setSubmissions(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('grades')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      setSelectedSubmission(null);
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = submissions.filter(s => s.status === 'SUBMITTED').map(s => s.id);
    if (pendingIds.length === 0) return;
    const { error } = await supabase
      .from('grades')
      .update({ status: 'APPROVED' })
      .in('id', pendingIds);
    if (!error) {
      setSubmissions(prev => prev.map(s => pendingIds.includes(s.id) ? { ...s, status: 'APPROVED' } : s));
    }
  };

  const filtered = submissions.filter(s => s.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Result Management</h2>
          <p className="text-slate-500 text-sm mt-1">Review and publish teacher-submitted results.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              const headers = ["Student Name", "Enrollment No", "Class", "Subject", "Score", "Grade", "Remarks", "Status"];
              const csvRows = filtered.map(sub => {
                const sName = `${sub.student.profiles.first_name} ${sub.student.profiles.last_name}`;
                const eNum = sub.student.enrollment_number;
                const cName = sub.class_subject.classes.name;
                const subj = sub.class_subject.subjects.name;
                return `"${sName}","${eNum}","${cName}","${subj}",${sub.score},"${sub.grade}","${sub.remarks}","${sub.status}"`;
              });
              const csvContent = [headers.join(','), ...csvRows].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `results_${activeTab}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors font-medium text-sm"
          >
            <Download className="w-4 h-4" /><span>Export Results</span>
          </button>
          <button 
            onClick={handleBulkApprove}
            disabled={submissions.filter(s => s.status === 'SUBMITTED').length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg,#10b981,#047857)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
          >
            <CheckCircle className="w-4 h-4" /><span>Bulk Approve Pending</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex space-x-2">
          {['SUBMITTED', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status as any)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === status 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {status === 'SUBMITTED' ? 'Pending Review' : status === 'APPROVED' ? 'Published' : 'Rejected'}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/50 text-xs">
                {submissions.filter(s => s.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No results found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase">Student</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase">Class & Subject</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase text-center">Score</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase text-center">Grade</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(sub => (
                  <tr key={sub.id} className="table-row-hover">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{sub.student.profiles.first_name} {sub.student.profiles.last_name}</p>
                      <p className="text-xs text-slate-500">{sub.student.enrollment_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{sub.class_subject.subjects.name}</p>
                      <p className="text-xs text-slate-500">{sub.class_subject.classes.name} • {sub.term.name}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-lg text-slate-700">{sub.score}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">{sub.grade}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        sub.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                        sub.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {sub.status === 'SUBMITTED' ? 'PENDING' : sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedSubmission(sub)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} title="Review Result" size="md">
        {selectedSubmission && (
          <div className="p-6 space-y-6 bg-slate-50">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Student</p>
                <p className="text-lg font-bold text-slate-900">{selectedSubmission.student.profiles.first_name} {selectedSubmission.student.profiles.last_name}</p>
                <p className="text-sm text-slate-500">{selectedSubmission.student.enrollment_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Score</p>
                <p className="text-4xl font-black text-indigo-600">{selectedSubmission.score}<span className="text-lg text-slate-400">/100</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Subject</p>
                <p className="font-semibold text-slate-800">{selectedSubmission.class_subject.subjects.name}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Class</p>
                <p className="font-semibold text-slate-800">{selectedSubmission.class_subject.classes.name}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Submitted By</p>
                <p className="font-semibold text-slate-800">{selectedSubmission.class_subject.teachers?.profiles?.first_name} {selectedSubmission.class_subject.teachers?.profiles?.last_name}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Grade</p>
                <p className="font-semibold text-emerald-600 text-lg">{selectedSubmission.grade}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Teacher's Remark</p>
              <p className="text-sm text-slate-700 italic">"{selectedSubmission.remarks}"</p>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
              {selectedSubmission.status !== 'APPROVED' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'APPROVED')}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex justify-center items-center space-x-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" /><span>Approve & Publish</span>
                </button>
              )}
              {selectedSubmission.status !== 'REJECTED' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'REJECTED')}
                  className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex justify-center items-center space-x-2 transition-colors"
                >
                  <XCircle className="w-5 h-5" /><span>Reject</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

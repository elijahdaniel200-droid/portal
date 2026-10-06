"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { BookOpen, FileText, Video, Link as LinkIcon, Download, Clock, Calendar, CheckCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function StudentELearningPage() {
  const { profile } = useAuthStore();
  const [data, setData] = useState<{ assignments: any[], materials: any[], subjects: any[] }>({ assignments: [], materials: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments'>('materials');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionData, setSubmissionData] = useState({ text: '', file_url: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    if (profile?.id) {
      setLoading(true);
      fetch(`/api/student/e-learning?student_id=${profile.id}`)
        .then(res => res.json())
        .then(json => {
          if (!json.error) setData(json);
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !selectedAssignment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/submissions?student_id=${profile.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: selectedAssignment.id,
          submission_text: submissionData.text,
          file_url: submissionData.file_url
        })
      });
      if (res.ok) {
        setSelectedAssignment(null);
        setSubmissionData({ text: '', file_url: '' });
        alert('Assignment submitted successfully!');
        fetchData(); // Refresh assignments if needed, though they aren't removed, just submitted
      } else {
        alert('Failed to submit assignment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMaterials = data.materials.filter(m => selectedSubject === 'all' || m.class_subject_id === selectedSubject);
  const filteredAssignments = data.assignments.filter(a => selectedSubject === 'all' || a.class_subject_id === selectedSubject);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-rose-500" />;
      case 'VIDEO': return <Video className="w-5 h-5 text-blue-500" />;
      case 'LINK': return <LinkIcon className="w-5 h-5 text-indigo-500" />;
      default: return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">E-Learning Portal</h2>
          <p className="text-slate-500 text-sm mt-1">Access your course materials and submit assignments.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-1 p-1 bg-slate-50 rounded-xl">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'materials' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Learning Materials
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'assignments' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Assignments
          </button>
        </div>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none font-medium"
        >
          <option value="all">All Subjects</option>
          {data.subjects.map(s => (
            <option key={s.id} value={s.id}>{s.subjects?.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'materials' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-medium">No learning materials posted yet.</p>
            </div>
          ) : (
            filteredMaterials.map(m => (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    {getMaterialIcon(m.material_type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-1" title={m.title}>{m.title}</h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{m.class_subjects?.subjects?.name}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{m.description || 'No description provided.'}</p>
                <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{m.material_type}</span>
                  {m.file_url ? (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                      <span>View</span> <LinkIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No link attached</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-medium">No assignments due at this time.</p>
            </div>
          ) : (
            filteredAssignments.map(a => {
              const isPastDue = new Date(a.due_date) < new Date();
              return (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{a.class_subjects?.subjects?.name}</span>
                        {isPastDue && <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center"><Clock className="w-3 h-3 mr-1" /> Past Due</span>}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{a.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{a.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2 shrink-0 border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Due: {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                      <CheckCircle className="w-4 h-4 text-slate-400" />
                      <span>Max Score: {a.max_score}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedAssignment(a)}
                      className="mt-2 w-full md:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors text-center shadow-md">
                      View Assignment
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Submission Modal */}
      <Modal isOpen={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} title="Submit Assignment" size="lg">
        {selectedAssignment && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <h3 className="font-bold text-slate-900 text-xl mb-2">{selectedAssignment.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{selectedAssignment.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</span>
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Max Score: {selectedAssignment.max_score}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Your Answer / Text Submission</label>
              <textarea 
                rows={5}
                required
                value={submissionData.text}
                onChange={e => setSubmissionData({...submissionData, text: e.target.value})}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Upload File Link (Optional)</label>
              <div className="flex items-center">
                <div className="pl-4 pr-3 py-3 bg-slate-50 border border-slate-200 border-r-0 rounded-l-xl text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input 
                  type="url" 
                  value={submissionData.file_url}
                  onChange={e => setSubmissionData({...submissionData, file_url: e.target.value})}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex space-x-3 border-t border-slate-100">
              <button type="button" onClick={() => setSelectedAssignment(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                  <><Upload className="w-4 h-4 mr-2"/> Submit Work</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

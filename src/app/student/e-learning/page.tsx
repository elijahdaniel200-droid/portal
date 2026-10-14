"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  BookOpen, FileText, Video, Link as LinkIcon, Download, Clock, 
  Calendar, CheckCircle, Upload, CheckCircle2, AlertCircle, Paperclip, 
  Trash2, Award, MessageSquare 
} from 'lucide-react';
import Modal from '@/components/Modal';

export default function StudentELearningPage() {
  const { profile } = useAuthStore();
  const [data, setData] = useState<{ assignments: any[], materials: any[], subjects: any[] }>({ 
    assignments: [], 
    materials: [], 
    subjects: [] 
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments'>('assignments');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionData, setSubmissionData] = useState({ text: '', file_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const studentFileRef = useRef<HTMLInputElement>(null);

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

  const handleOpenAssignment = (a: any) => {
    setSelectedAssignment(a);
    if (a.submission) {
      setSubmissionData({
        text: a.submission.submission_text || '',
        file_url: a.submission.file_url || ''
      });
      if (a.submission.file_url) {
        setUploadedFileName(a.submission.file_url.split('/').pop() || 'Submitted File');
      } else {
        setUploadedFileName('');
      }
    } else {
      setSubmissionData({ text: '', file_url: '' });
      setUploadedFileName('');
    }
  };

  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('bucket', 'student-submissions');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setSubmissionData(prev => ({ ...prev, file_url: json.url }));
      setUploadedFileName(file.name);
    } catch (err: any) {
      alert(err.message || 'Failed to upload homework file');
    } finally {
      setUploadingFile(false);
    }
  };

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
        setUploadedFileName('');
        setSuccessToast('Assignment submitted successfully! Your teacher has been notified.');
        setTimeout(() => setSuccessToast(''), 4000);
        fetchData();
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">E-Learning & Coursework</h2>
          <p className="text-slate-500 text-sm mt-1">Access lecture notes, submit coursework, and track assessment feedback.</p>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tabs and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2.5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'assignments' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Assignments & Tasks
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'materials' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Study Materials
          </button>
        </div>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block px-4 py-2 outline-none font-medium"
        >
          <option value="all">All Subjects</option>
          {data.subjects.map(s => (
            <option key={s.id} value={s.id}>{s.subjects?.name || s.id}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'materials' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No learning materials posted for this filter.</p>
              <p className="text-xs text-slate-400 mt-1">Teachers will publish syllabus documents, notes, and video lectures here.</p>
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
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{m.class_subjects?.subjects?.name || 'General Resource'}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{m.description || 'No description provided.'}</p>
                <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{m.material_type}</span>
                  {m.file_url ? (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                      <span>Access Material</span> <LinkIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Reference Only</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No coursework due at this time.</p>
              <p className="text-xs text-slate-400 mt-1">Check back later or change your subject filter.</p>
            </div>
          ) : (
            filteredAssignments.map(a => {
              const isPastDue = new Date(a.due_date) < new Date();
              const sub = a.submission;
              const isGraded = sub?.status === 'GRADED';
              const isSubmitted = sub?.status === 'SUBMITTED' || isGraded;

              return (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isGraded ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : isSubmitted ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                      {isGraded ? <Award className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                          {a.class_subjects?.subjects?.name || 'Coursework'}
                        </span>

                        {isGraded ? (
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Graded: {sub.score}/{a.max_score}
                          </span>
                        ) : isSubmitted ? (
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Submitted (In Review)
                          </span>
                        ) : isPastDue ? (
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
                          </span>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg">{a.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 max-w-xl">{a.description}</p>

                      {isGraded && sub.feedback && (
                        <div className="mt-2.5 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
                          <MessageSquare className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                          <div>
                            <span className="font-bold">Teacher Feedback: </span>
                            <span>{sub.feedback}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0 border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Max Score: {a.max_score} pts</span>
                    </div>

                    <button 
                      onClick={() => handleOpenAssignment(a)}
                      className={`mt-2 w-full md:w-auto px-5 py-2.5 font-bold text-sm rounded-xl transition-all shadow-sm ${
                        isGraded 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : isSubmitted 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                      }`}
                    >
                      {isGraded ? 'View Submission & Grade' : isSubmitted ? 'Update Submission' : 'Submit Homework'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Submission Modal */}
      <Modal isOpen={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} title={selectedAssignment?.submission ? "Your Submission" : "Submit Assignment"} size="lg">
        {selectedAssignment && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900 text-lg">{selectedAssignment.title}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Max: {selectedAssignment.max_score} pts
                </span>
              </div>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{selectedAssignment.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-slate-400"/> Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</span>
                {selectedAssignment.file_url && (
                  <a 
                    href={selectedAssignment.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download Teacher Attachment
                  </a>
                )}
              </div>
            </div>

            {selectedAssignment.submission?.status === 'GRADED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Official Grade</span>
                  <span className="text-lg font-black text-emerald-800">{selectedAssignment.submission.score} / {selectedAssignment.max_score}</span>
                </div>
                {selectedAssignment.submission.feedback && (
                  <p className="text-xs text-emerald-900 font-medium pt-1 border-t border-emerald-200/60">
                    <span className="font-bold">Remarks: </span>{selectedAssignment.submission.feedback}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Solution / Text Answer *</label>
              <textarea 
                rows={5}
                required
                value={submissionData.text}
                onChange={e => setSubmissionData({ ...submissionData, text: e.target.value })}
                placeholder="Type your answer, derivations, or explanation here..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              />
            </div>

            {/* Cloud Storage File Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Attach Homework Document (Optional)</label>
              
              <input 
                ref={studentFileRef}
                type="file"
                onChange={handleStudentFileUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                className="hidden"
              />

              {uploadedFileName || submissionData.file_url ? (
                <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center space-x-2 truncate">
                    <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-sm font-semibold text-indigo-900 truncate">
                      {uploadedFileName || submissionData.file_url.split('/').pop()}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setUploadedFileName(''); setSubmissionData({ ...submissionData, file_url: '' }); }}
                    className="p-1 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => studentFileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  {uploadingFile ? (
                    <div className="flex items-center justify-center space-x-2 text-indigo-600">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-semibold">Uploading to Supabase Storage...</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">
                        Click to upload your solution file (PDF, Doc, Image)
                      </p>
                      <p className="text-[10px] text-slate-400">Stored in student-submissions bucket (Max 50MB)</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 flex space-x-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setSelectedAssignment(null)} 
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button 
                type="submit" 
                disabled={submitting || uploadingFile}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center shadow-md shadow-indigo-600/20"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Upload className="w-4 h-4 mr-2"/> {selectedAssignment.submission ? 'Update Submission' : 'Submit Work'}</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

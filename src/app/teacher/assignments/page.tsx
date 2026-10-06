"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Library, FileText, Upload, Plus, Calendar, Clock, Video, Link as LinkIcon, Book, Download, CheckSquare } from 'lucide-react';
import Modal from '@/components/Modal';
import { supabase } from '@/lib/supabase';
import { User } from 'lucide-react';

export default function TeacherAssignmentsPage() {
  const { profile } = useAuthStore();
  const teacherId = profile?.id;

  const [classes, setClasses] = useState<any[]>([]);
  const [subjectsMap, setSubjectsMap] = useState<Record<string, any[]>>({});
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classSubjectId, setClassSubjectId] = useState('');

  const [activeTab, setActiveTab] = useState<'ASSIGNMENTS' | 'MATERIALS'>('ASSIGNMENTS');
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingData, setGradingData] = useState<Record<string, { score: number, feedback: string }>>({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '', description: '', due_date: '', max_score: 100, file_url: '', material_type: 'DOCUMENT'
  });

  // Fetch configs
  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/teacher/grades?teacher_id=${teacherId}`)
      .then(res => res.json())
      .then(data => {
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

  // Fetch assignments and materials
  const fetchContent = useCallback(async () => {
    if (!teacherId || !selectedClass || !selectedSubject) return;
    
    // Find class_subject_id
    const cs = subjectsMap[selectedClass]?.find(s => s.id === selectedSubject);
    if (!cs || !cs.class_subject_id) return;
    
    setClassSubjectId(cs.class_subject_id);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/teacher/assignments?class_subject_id=${cs.class_subject_id}`);
      const data = await res.json();
      if (res.ok) {
        setAssignments(data.assignments);
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedClass, selectedSubject, subjectsMap]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        type: activeTab === 'ASSIGNMENTS' ? 'assignment' : 'material',
        class_subject_id: classSubjectId,
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      };

      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ title: '', description: '', due_date: '', max_score: 100, file_url: '', material_type: 'DOCUMENT' });
        fetchContent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      case 'VIDEO': return <Video className="w-5 h-5 text-blue-500" />;
      case 'LINK': return <LinkIcon className="w-5 h-5 text-emerald-500" />;
      default: return <Book className="w-5 h-5 text-violet-500" />;
    }
  };

  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignmentForGrading(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/teacher/assignments/submissions?assignment_id=${assignment.id}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions);
        // Initialize grading data state
        const initialGradingData: any = {};
        data.submissions.forEach((sub: any) => {
          initialGradingData[sub.id] = { score: sub.score || 0, feedback: sub.feedback || '' };
        });
        setGradingData(initialGradingData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    try {
      const res = await fetch('/api/teacher/assignments/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          score: gradingData[submissionId].score,
          feedback: gradingData[submissionId].feedback
        })
      });
      if (res.ok) {
        alert('Grade saved successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assignments & Materials</h2>
          <p className="text-slate-500 text-sm mt-1">Manage coursework and learning resources for your classes.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          disabled={!classSubjectId}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab === 'ASSIGNMENTS' ? 'Assignment' : 'Material'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-wrap gap-4 items-end">
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
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('ASSIGNMENTS')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'ASSIGNMENTS' ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <CheckSquare className="w-4 h-4" /><span>Assignments</span>
          </button>
          <button
            onClick={() => setActiveTab('MATERIALS')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'MATERIALS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Library className="w-4 h-4" /><span>Learning Materials</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : activeTab === 'ASSIGNMENTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.length === 0 && <div className="col-span-full text-center py-12 text-slate-500">No assignments created yet.</div>}
          {assignments.map(a => (
            <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Max: {a.max_score}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{a.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{a.description}</p>
              
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 mb-4 bg-amber-50 p-2 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button onClick={() => handleViewSubmissions(a)} className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">View Submissions</button>
                {a.file_url && <button className="text-slate-400 hover:text-slate-600"><LinkIcon className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.length === 0 && <div className="col-span-full text-center py-12 text-slate-500">No materials uploaded yet.</div>}
          {materials.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                {getIconForType(m.material_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{m.title}</h3>
                <p className="text-xs text-slate-500 truncate">{m.description || m.material_type}</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-violet-600 transition-colors bg-slate-50 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Add ${activeTab === 'ASSIGNMENTS' ? 'Assignment' : 'Material'}`}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"></textarea>
          </div>
          
          {activeTab === 'ASSIGNMENTS' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                <input required type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Max Score</label>
                <input required type="number" value={formData.max_score} onChange={e => setFormData({...formData, max_score: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
              <select value={formData.material_type} onChange={e => setFormData({...formData, material_type: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none">
                <option value="DOCUMENT">Document</option>
                <option value="PDF">PDF File</option>
                <option value="VIDEO">Video Link</option>
                <option value="LINK">Web Link</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Resource URL (Optional)</label>
            <input type="url" value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} placeholder="https://"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none" />
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700">Save</button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal isOpen={!!selectedAssignmentForGrading} onClose={() => setSelectedAssignmentForGrading(null)} title="Student Submissions" size="xl">
        <div className="p-6">
          {selectedAssignmentForGrading && (
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-xl">{selectedAssignmentForGrading.title}</h3>
              <p className="text-slate-500 text-sm mt-1">Max Score: {selectedAssignmentForGrading.max_score}</p>
            </div>
          )}
          
          {loadingSubmissions ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
              No students have submitted this assignment yet.
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub: any) => (
                <div key={sub.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                        {sub.students?.profiles?.first_name[0]}{sub.students?.profiles?.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{sub.students?.profiles?.first_name} {sub.students?.profiles?.last_name}</p>
                        <p className="text-xs text-slate-500">{sub.students?.enrollment_number} • Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {sub.status}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 text-sm text-slate-700 whitespace-pre-wrap">
                    {sub.submission_text || 'No text submitted.'}
                    {sub.file_url && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center space-x-1">
                          <LinkIcon className="w-4 h-4" /> <span>View Attached File</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end gap-4 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="w-32">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Score</label>
                      <input 
                        type="number" 
                        value={gradingData[sub.id]?.score} 
                        onChange={(e) => setGradingData({...gradingData, [sub.id]: { ...gradingData[sub.id], score: Number(e.target.value) }})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Feedback</label>
                      <input 
                        type="text" 
                        value={gradingData[sub.id]?.feedback} 
                        onChange={(e) => setGradingData({...gradingData, [sub.id]: { ...gradingData[sub.id], feedback: e.target.value }})}
                        placeholder="Great job..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleSaveGrade(sub.id)}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-lg transition-colors"
                    >
                      Save Grade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

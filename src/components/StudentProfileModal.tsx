import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { User, BookOpen, Clock, AlertCircle, FileText } from 'lucide-react';

interface Props {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentProfileModal({ studentId, isOpen, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');

  useEffect(() => {
    fetch('/api/terms')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setTerms(json.data);
          // Auto-select active term
          const active = json.data.find((t: any) => t.status === 'Active');
          if (active) setSelectedTerm(active.id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      const termQuery = selectedTerm ? `&term_id=${selectedTerm}` : '';
      fetch(`/api/report-card?student_id=${studentId}${termQuery}`)
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        });
    }
  }, [isOpen, studentId, selectedTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Profile & Results" size="xl">
      {loading || !data ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="p-6 space-y-8 bg-slate-50">
          {/* Header */}
          <div className="flex items-center space-x-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {data.student.profiles.first_name[0]}{data.student.profiles.last_name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{data.student.profiles.first_name} {data.student.profiles.last_name}</h2>
              <div className="flex space-x-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {data.student.enrollment_number}</span>
                <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1"/> {data.student.classes?.name || 'Unassigned Class'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grades */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center"><BookOpen className="w-5 h-5 text-indigo-500 mr-2"/> Academic Results</h3>
                <select 
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Terms</option>
                  {terms.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {data.grades.length === 0 ? (
                <div className="text-center py-6 text-slate-400">No grades recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {data.grades.map((g: any) => (
                    <div key={g.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{g.class_subjects.subjects.name}</p>
                        <p className="text-xs text-slate-400">{g.academic_terms.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-indigo-600">{g.score}%</p>
                        <p className="text-xs font-bold text-emerald-500">{g.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attendance & Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4"><Clock className="w-5 h-5 text-emerald-500 mr-2"/> Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                  <p className="text-3xl font-black text-emerald-600">{data.attendance.present}</p>
                  <p className="text-xs font-bold text-emerald-700 uppercase mt-1">Present</p>
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                  <p className="text-3xl font-black text-red-600">{data.attendance.absent}</p>
                  <p className="text-xs font-bold text-red-700 uppercase mt-1">Absent</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center col-span-2">
                  <p className="text-3xl font-black text-amber-600">{data.attendance.late}</p>
                  <p className="text-xs font-bold text-amber-700 uppercase mt-1">Late</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Documents */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4"><FileText className="w-5 h-5 text-blue-500 mr-2"/> Document Uploads</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">Birth Certificate</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">Previous School Report</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View</button>
                </div>
              </div>
            </div>

            {/* Leave & Disciplinary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4"><AlertCircle className="w-5 h-5 text-amber-500 mr-2"/> Leave & Disciplinary Records</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Medical Leave (Approved)</p>
                    <p className="text-xs text-slate-400">Oct 12, 2026 - Oct 15, 2026</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">No disciplinary actions recorded.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

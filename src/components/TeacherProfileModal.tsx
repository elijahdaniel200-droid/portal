import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { User, BookOpen, Clock, AlertCircle, FileText, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  teacherId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherProfileModal({ teacherId, isOpen, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && teacherId) {
      setLoading(true);
      fetchTeacherData(teacherId).then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [isOpen, teacherId]);

  const fetchTeacherData = async (id: string) => {
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*, profiles(first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (error || !teacher) return null;

    const { data: classes } = await supabase
      .from('classes')
      .select('name')
      .eq('form_teacher_id', id);

    const { data: subjects } = await supabase
      .from('class_subjects')
      .select('subjects(name, code), classes(name)')
      .eq('teacher_id', id);

    return {
      teacher: {
        ...teacher,
        profiles: Array.isArray(teacher.profiles) ? teacher.profiles[0] : teacher.profiles,
      },
      formClasses: classes || [],
      assignedSubjects: subjects || [],
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Teacher Profile" size="xl">
      {loading || !data ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="p-6 space-y-8 bg-slate-50">
          {/* Header */}
          <div className="flex items-center space-x-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {data.teacher.profiles.first_name[0]}{data.teacher.profiles.last_name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{data.teacher.profiles.first_name} {data.teacher.profiles.last_name}</h2>
              <div className="flex space-x-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/> {data.teacher.department || 'General'}</span>
                <span className="flex items-center"><User className="w-4 h-4 mr-1"/> Hired: {data.teacher.hire_date ? new Date(data.teacher.hire_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Responsibilities */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4"><BookOpen className="w-5 h-5 text-indigo-500 mr-2"/> Academic Responsibilities</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Form Teacher For</p>
                  {data.formClasses.length === 0 ? (
                    <p className="text-sm text-slate-500">None</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data.formClasses.map((c: any, i: number) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{c.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Subjects</p>
                  {data.assignedSubjects.length === 0 ? (
                    <p className="text-sm text-slate-500">No subjects assigned.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.assignedSubjects.map((s: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-sm font-semibold text-slate-800">{s.subjects?.name}</span>
                          <span className="text-xs font-bold text-slate-500">{s.classes?.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance & Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4"><Clock className="w-5 h-5 text-emerald-500 mr-2"/> Attendance (Term 1)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                  <p className="text-3xl font-black text-emerald-600">42</p>
                  <p className="text-xs font-bold text-emerald-700 uppercase mt-1">Days Present</p>
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                  <p className="text-3xl font-black text-red-600">1</p>
                  <p className="text-xs font-bold text-red-700 uppercase mt-1">Days Absent</p>
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
                    <span className="text-sm font-semibold text-slate-700">Resume / CV</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">Teaching Certificate</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View</button>
                </div>
              </div>
            </div>

            {/* Leave & Disciplinary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4"><AlertCircle className="w-5 h-5 text-amber-500 mr-2"/> Leave Records</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Annual Leave (Approved)</p>
                    <p className="text-xs text-slate-400">Dec 15, 2026 - Jan 5, 2027</p>
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

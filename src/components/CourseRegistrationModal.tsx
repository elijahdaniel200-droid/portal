import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onComplete: () => void;
}

export default function CourseRegistrationModal({ isOpen, onClose, studentId, onComplete }: Props) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/available-subjects')
        .then(r => r.json())
        .then(d => {
          setSubjects(d.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);
  
  const toggleSubject = (id: string) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };
  
  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/register-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, class_subject_ids: selected })
      });
      if (res.ok) {
        onComplete();
        onClose();
      } else {
        alert('Failed to register subjects.');
      }
    } catch (e) {
      alert('Error registering subjects.');
    }
    setSaving(false);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Course Registration">
      <div className="p-6">
        <p className="text-sm text-slate-500 mb-4">Select the courses you want to register for this academic session.</p>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto mb-6 pr-2">
            {subjects.map(s => (
              <label key={s.id} className="flex items-start space-x-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                  checked={selected.includes(s.id)} 
                  onChange={() => toggleSubject(s.id)} 
                />
                <div>
                  <p className="font-bold text-slate-800 text-base">
                    {s.subject_name} 
                    <span className="ml-2 text-xs text-slate-400 font-mono font-medium">({s.subject_code})</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{s.class_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Lecturer: {s.teacher_name}</p>
                </div>
              </label>
            ))}
            {subjects.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>No courses available for registration.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={saving || selected.length === 0} 
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {saving ? 'Registering...' : 'Register Selected'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

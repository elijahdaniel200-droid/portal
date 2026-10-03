const fs = require('fs');

const pageFile = 'src/app/student/academics/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

if (!content.includes("import Modal")) {
  content = content.replace("import { Download", "import Modal from '@/components/Modal';\nimport { Download");
}

if (!content.includes("CourseRegistrationModal")) {
  const modalCode = `
function CourseRegistrationModal({ isOpen, onClose, studentId, onComplete }: any) {
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/available-subjects').then(r=>r.json()).then(d => {
        setSubjects(d.data || []);
        setLoading(false);
      });
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
          <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
            {subjects.map(s => (
              <label key={s.id} className="flex items-center space-x-3 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded"
                  checked={selected.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                <div>
                  <p className="font-bold text-slate-800">{s.subject_name} <span className="text-xs text-slate-400 font-normal">({s.subject_code})</span></p>
                  <p className="text-xs text-slate-500">{s.class_name} • {s.teacher_name}</p>
                </div>
              </label>
            ))}
            {subjects.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No courses available.</p>}
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || selected.length===0} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Registering...' : 'Register Selected'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
`;

  // Find the end of imports
  const lines = content.split('\n');
  const lastImportIdx = lines.findLastIndex(l => l.startsWith('import '));
  lines.splice(lastImportIdx + 1, 0, modalCode);
  content = lines.join('\n');
}

if (!content.includes("isRegisterModalOpen")) {
  content = content.replace("const [loading, setLoading] = useState(true);", 
    "const [loading, setLoading] = useState(true);\n  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);");
  
  content = content.replace("<button onClick={downloadPDF}", 
    `<button onClick={() => setIsRegisterModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#10b981,#047857)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
          <CheckCircle2 className="w-4 h-4" /><span>Course Registration</span>
        </button>\n        <button onClick={downloadPDF}`);
        
  // Add modal to render
  content = content.replace("return (", `return (\n    <>\n      <CourseRegistrationModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} studentId={student.id} onComplete={fetchData} />`);
  // And the closing tag for <>
  const lastDiv = content.lastIndexOf("</div>");
  if (lastDiv !== -1) {
    content = content.substring(0, lastDiv + 6) + "\n    </>\n" + content.substring(lastDiv + 6);
  }
}

// Add import for React if needed
if (!content.includes("import React")) {
  content = content.replace("import { useState", "import React, { useState");
}

fs.writeFileSync(pageFile, content);
console.log("Updated page.tsx!");

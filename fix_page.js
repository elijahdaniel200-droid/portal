const fs = require('fs');
let text = fs.readFileSync('src/app/student/academics/page.tsx', 'utf8');

// 1. Remove the broken CourseRegistrationModal (from line 7 to line 80 roughly)
const lines = text.split('\n');
const startIdx = lines.findIndex(l => l.startsWith('function CourseRegistrationModal'));
if (startIdx !== -1) {
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith('interface Grade'));
  lines.splice(startIdx, endIdx - startIdx);
}
text = lines.join('\n');

// 2. Remove the broken injected state and button
text = text.replace("const [loading, setLoading] = useState(true);\n  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);", "const [loading, setLoading] = useState(true);");

const badBtn = `<button onClick={() => setIsRegisterModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#10b981,#047857)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
          <CheckCircle2 className="w-4 h-4" /><span>Course Registration</span>
        </button>
        <button onClick={downloadPDF}`;
text = text.replace(badBtn, "<button onClick={downloadPDF}");

const badReturn = `return (
    <>
      <CourseRegistrationModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} studentId={student.id} onComplete={fetchData} />`;
text = text.replace(badReturn, "return (");

text = text.replace("    </>\n\n  );\n}", "\n  );\n}");

fs.writeFileSync('src/app/student/academics/page.tsx', text);
console.log("Cleanup complete!");

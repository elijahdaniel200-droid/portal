"use client";
import { useState } from 'react';
import { BookOpen, GraduationCap, Library, PlusCircle, ArrowRight, CalendarDays, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/Modal';
export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('terms');
  
  // Term State
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '' });
  const [terms, setTerms] = useState([
    { name: "Term 1 (2026/2027)", status: "Active", startDate: "Sep 2026", endDate: "Dec 2026" }
  ]);

  // Class State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([
    "Grade 10A", "Grade 10B", "Grade 11A", "Grade 11B", "Grade 12 Science", "Grade 12 Arts"
  ]);

  // Subject State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjects, setSubjects] = useState([
    "Mathematics", "Physics", "Chemistry", "Biology", "English Literature", "History"
  ]);

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setTerms([...terms, {
      name: formData.name,
      status: "Upcoming",
      startDate: formData.startDate || "TBA",
      endDate: formData.endDate || "TBA"
    }]);
    setIsTermModalOpen(false);
    setFormData({ name: '', startDate: '', endDate: '' });
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) return;
    setClasses([...classes, className]);
    setClassName('');
    setIsClassModalOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName) return;
    setSubjects([...subjects, subjectName]);
    setSubjectName('');
    setIsSubjectModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Academics Setup</h1>
          <p className="text-slate-500 mt-1">Manage terms, classes, and subjects</p>
        </div>
        <button 
          onClick={() => {
            if (activeTab === 'terms') setIsTermModalOpen(true);
            if (activeTab === 'classes') setIsClassModalOpen(true);
            if (activeTab === 'subjects') setIsSubjectModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all font-bold"
        >
          <PlusCircle className="w-5 h-5 animate-pulse" />
          <span className="capitalize">New {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'terms', title: "Academic Terms", icon: BookOpen, count: terms.length, color: "from-blue-400 to-blue-600", bg: "bg-blue-50" },
          { id: 'classes', title: "Active Classes", icon: GraduationCap, count: classes.length, color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50" },
          { id: 'subjects', title: "Total Subjects", icon: Library, count: subjects.length, color: "from-amber-400 to-amber-600", bg: "bg-amber-50" }
        ].map((item, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl border ${activeTab === item.id ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-white/20'} p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group cursor-pointer`} onClick={() => setActiveTab(item.id)}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="text-3xl font-black mt-2 text-slate-700">{item.count}</p>
            <div className={`mt-4 flex items-center text-sm font-bold transition-colors ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`}>
              <span>{activeTab === item.id ? 'Currently Viewing' : 'View Details'}</span>
              <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${activeTab === item.id ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden min-h-[300px]">
        {activeTab === 'terms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Configured Terms</h2>
            <div className="space-y-3">
              {terms.map((term, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all bg-slate-50/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{term.name}</h3>
                      <p className="text-sm text-slate-500">{term.startDate} - {term.endDate}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${term.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {term.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Active Classes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors bg-slate-50/50 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800">{cls}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Total Subjects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors bg-slate-50/50 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Library className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800">{sub}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isTermModalOpen} onClose={() => setIsTermModalOpen(false)} title="Create New Academic Term">
        <form onSubmit={handleCreateTerm} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Term Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              placeholder="e.g. Term 2 (2026/2027)"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsTermModalOpen(false)}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:scale-105 flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Term</span>
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Create New Class">
        <form onSubmit={handleCreateClass} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Class Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              placeholder="e.g. Grade 10C"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" /><span>Save Class</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add New Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              placeholder="e.g. Computer Science"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" /><span>Save Subject</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
"use client";
import { useState } from 'react';
import { Users, UserPlus, BookOpen, X, Download } from 'lucide-react';
import Modal from '@/components/Modal';

export default function TeacherClassesPage() {
  const [rosterClass, setRosterClass] = useState<any>(null);

  const demoRoster = [
    { id: 'STU-001', name: 'Alice Walker', status: 'Active' },
    { id: 'STU-002', name: 'Michael Chen', status: 'Active' },
    { id: 'STU-003', name: 'Sarah Jones', status: 'Active' },
    { id: 'STU-004', name: 'David Smith', status: 'Active' },
    { id: 'STU-005', name: 'Emma Wilson', status: 'Active' },
    { id: 'STU-006', name: 'James Okafor', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Classes</h1>
          <p className="text-slate-500 mt-1">Manage your assigned students and class information.</p>
        </div>
        <div className="hidden md:flex space-x-2">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center -mr-3 border-2 border-white z-30 shadow-sm"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full" alt="avatar" /></div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center -mr-3 border-2 border-white z-20 shadow-sm"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" className="w-full h-full" alt="avatar" /></div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white z-10 shadow-sm"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" className="w-full h-full" alt="avatar" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "Grade 10 - Mathematics", count: 24, time: "09:00 AM", color: "from-violet-500 to-fuchsia-500" },
          { name: "Grade 11 - Physics", count: 18, time: "11:30 AM", color: "from-blue-500 to-cyan-500" }
        ].map((cls, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${cls.color}`}></div>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{cls.time}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{cls.name}</h3>
            <div className="flex items-center text-slate-500 text-sm font-medium">
              <Users className="w-4 h-4 mr-1.5" />
              <span>{cls.count} Students enrolled</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(n => (
                  <div key={n} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cls.name}${n}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setRosterClass(cls)}
                className="text-violet-600 text-sm font-bold hover:text-violet-700 hover:underline"
              >
                View Roster
              </button>
            </div>
          </div>
        ))}

        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center hover:bg-slate-100 transition-colors cursor-pointer min-h-[250px]">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
            <UserPlus className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700">Request Class Assignment</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">Contact the administrator to be assigned to a new class or subject.</p>
        </div>
      </div>

      <Modal isOpen={!!rosterClass} onClose={() => setRosterClass(null)} title="Class Roster">
        {rosterClass && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{rosterClass.name}</h2>
                <p className="text-slate-500 text-sm">{rosterClass.count} Students Enrolled</p>
              </div>
              <button onClick={() => {
                const headers = ["Student ID", "Name", "Status"];
                const csvRows = demoRoster.map(r => `"${r.id}","${r.name}","${r.status}"`);
                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows].join('\\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `roster_${rosterClass.name.replace(/\s+/g, '_')}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                <Download className="w-4 h-4" /><span>Export List</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {demoRoster.map((student, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{student.id}</td>
                      <td className="px-4 py-3 flex items-center space-x-3">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} className="w-8 h-8 rounded-full bg-slate-100" alt="avatar" />
                        <span className="font-medium text-slate-700">{student.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">{student.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-right border-t border-slate-100 pt-4">
              <button 
                onClick={() => setRosterClass(null)}
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
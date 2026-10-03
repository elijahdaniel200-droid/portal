const fs = require('fs');
const path = require('path');

const pages = [
  {
    path: 'src/app/admin/academics/page.tsx',
    content: `"use client";
import { BookOpen, GraduationCap, Library, PlusCircle, ArrowRight } from 'lucide-react';
export default function AcademicsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Academics Setup</h1>
          <p className="text-slate-500 mt-1">Manage terms, classes, and subjects</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all font-bold">
          <PlusCircle className="w-5 h-5 animate-pulse" />
          <span>New Term</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Academic Terms", icon: BookOpen, count: 4, color: "from-blue-400 to-blue-600", bg: "bg-blue-50" },
          { title: "Active Classes", icon: GraduationCap, count: 12, color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50" },
          { title: "Total Subjects", icon: Library, count: 24, color: "from-amber-400 to-amber-600", bg: "bg-amber-50" }
        ].map((item, i) => (
          <div key={i} className={\`relative overflow-hidden rounded-2xl border border-white/20 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group\`}>
            <div className={\`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br \${item.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700\`}></div>
            <div className={\`w-14 h-14 rounded-2xl bg-gradient-to-br \${item.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform\`}>
              <item.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="text-3xl font-black mt-2 text-slate-700">{item.count}</p>
            <div className="mt-4 flex items-center text-sm font-bold text-slate-400 group-hover:text-emerald-500 transition-colors cursor-pointer">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <GraduationCap className="w-16 h-16 mx-auto text-emerald-400 animate-bounce mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Ready to configure the new year?</h2>
        <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">Set up your curriculum, assign form teachers, and prepare for the upcoming academic session.</p>
        <button className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg">Get Started</button>
      </div>
    </div>
  );
}`
  },
  {
    path: 'src/app/admin/events/page.tsx',
    content: `"use client";
import { CalendarDays, MapPin, Clock, Star } from 'lucide-react';
export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay animate-pulse"></div>
        <h1 className="text-3xl font-black tracking-tight relative z-10">School Events Calendar</h1>
        <p className="text-indigo-100 mt-2 relative z-10">Manage assemblies, PTA meetings, and holidays.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[
            { title: "Science Fair 2026", date: "Oct 15", time: "10:00 AM", location: "Main Hall", color: "pink" },
            { title: "Parent-Teacher Association", date: "Oct 22", time: "02:00 PM", location: "Auditorium", color: "indigo" },
            { title: "Mid-Term Break Begins", date: "Oct 30", time: "All Day", location: "Campus", color: "emerald" }
          ].map((ev, i) => (
            <div key={i} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:border-purple-200">
              <div className="flex items-center space-x-5">
                <div className={\`w-16 h-16 rounded-2xl flex flex-col items-center justify-center bg-\${ev.color}-50 text-\${ev.color}-600 border border-\${ev.color}-100 group-hover:scale-105 transition-transform\`}>
                  <span className="text-xs font-bold uppercase">{ev.date.split(' ')[0]}</span>
                  <span className="text-xl font-black">{ev.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{ev.title}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{ev.time}</span>
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{ev.location}</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-purple-100 hover:text-purple-600 transition-colors">
                <Star className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mx-auto mb-4 animate-spin-slow" style={{animationDuration: '10s'}}>
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="text-center font-bold text-lg">Add New Event</h3>
          <p className="text-center text-sm text-slate-500 mt-2 mb-6">Schedule a new activity for the school.</p>
          <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-colors">
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'src/app/admin/logs/page.tsx',
    content: `"use client";
import { Activity, ShieldCheck, AlertCircle, Database } from 'lucide-react';
export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">System Activity Logs</h1>
        <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>System Healthy</span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-1 shadow-2xl overflow-hidden border border-slate-800">
        <div className="flex items-center px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="ml-4 text-xs font-mono text-slate-400">eduportal-syslog // Live</span>
        </div>
        <div className="p-6 font-mono text-sm space-y-3 h-[60vh] overflow-y-auto">
          {[
            { time: "07:41:22", type: "INFO", msg: "User 'admin@school.com' logged in successfully", icon: ShieldCheck, color: "text-blue-400" },
            { time: "07:39:15", type: "WARN", msg: "Multiple failed login attempts from IP 192.168.1.5", icon: AlertCircle, color: "text-amber-400" },
            { time: "07:35:01", type: "DB_SYNC", msg: "Automated database backup completed (45MB)", icon: Database, color: "text-emerald-400" },
            { time: "07:28:44", type: "INFO", msg: "New student account created (STU-2026-0042)", icon: Activity, color: "text-blue-400" }
          ].map((log, i) => (
            <div key={i} className="flex items-start space-x-4 p-2 hover:bg-slate-800/50 rounded transition-colors group cursor-default">
              <span className="text-slate-500 opacity-70">[{log.time}]</span>
              <span className={\`font-bold \${log.color} w-20\`}>{log.type}</span>
              <span className="text-slate-300 flex-1 group-hover:text-white transition-colors">{log.msg}</span>
              <log.icon className={\`w-4 h-4 \${log.color} opacity-0 group-hover:opacity-100 transition-opacity\`} />
            </div>
          ))}
          <div className="flex items-center space-x-2 text-slate-500 pt-4">
            <span className="animate-pulse">_</span> waiting for new events...
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'src/app/admin/settings/page.tsx',
    content: `"use client";
import { Settings, Sliders, BellRing, Lock, Save } from 'lucide-react';
export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
          <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">System Preferences</h1>
          <p className="text-slate-500">Global configurations for EduPortal</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-start space-x-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <Sliders className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-slate-900">General Settings</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Update school name, logo, and academic year.</p>
            <input type="text" defaultValue="EduPortal High School" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
          </div>
        </div>

        <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
          <BellRing className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            <p className="text-sm text-slate-500 mt-1">Configure email alerts for fee payments and attendance.</p>
          </div>
          <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer shadow-inner">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
          <Lock className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">Security & Authentication</h3>
            <p className="text-sm text-slate-500 mt-1">Enforce two-factor authentication for staff.</p>
          </div>
          <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer shadow-inner">
            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'src/app/teacher/classes/page.tsx',
    content: `"use client";
import { Users, UserPlus, BookOpen } from 'lucide-react';
export default function TeacherClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Classes</h1>
          <p className="text-slate-500 mt-1">Manage your assigned students and class information.</p>
        </div>
        <div className="hidden md:flex space-x-2">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center -mr-3 border-2 border-white z-30 shadow-sm"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full" /></div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center -mr-3 border-2 border-white z-20 shadow-sm"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" className="w-full h-full" /></div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white z-10 shadow-sm"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" className="w-full h-full" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "Grade 10 - Mathematics", count: 24, time: "09:00 AM", color: "from-violet-500 to-fuchsia-500" },
          { name: "Grade 11 - Physics", count: 18, time: "11:30 AM", color: "from-blue-500 to-cyan-500" }
        ].map((cls, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            <div className={\`absolute top-0 left-0 w-full h-2 bg-gradient-to-r \${cls.color}\`}></div>
            <div className="flex justify-between items-start mb-6">
              <div className={\`w-12 h-12 rounded-xl bg-gradient-to-br \${cls.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform\`}>
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
                    <img src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${cls.name}\${n}\`} />
                  </div>
                ))}
              </div>
              <button className="text-violet-600 text-sm font-bold hover:text-violet-700 hover:underline">View Roster</button>
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
    </div>
  );
}`
  },
  {
    path: 'src/app/teacher/settings/page.tsx',
    content: `"use client";
import { Settings } from 'lucide-react';
export default function TeacherSettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-violet-400">
        <Settings className="w-12 h-12 animate-spin-slow" style={{animationDuration: '8s'}} />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Preferences</h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Teacher notification preferences and account settings are being moved to the new unified dashboard.
        </p>
      </div>
    </div>
  );
}`
  }
];

pages.forEach(p => {
  const fullPath = path.join(__dirname, p.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, p.content, 'utf-8');
});

console.log("Colorful UI pages created successfully!");

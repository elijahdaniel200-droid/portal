"use client";
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
              <span className={`font-bold ${log.color} w-20`}>{log.type}</span>
              <span className="text-slate-300 flex-1 group-hover:text-white transition-colors">{log.msg}</span>
              <log.icon className={`w-4 h-4 ${log.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
          <div className="flex items-center space-x-2 text-slate-500 pt-4">
            <span className="animate-pulse">_</span> waiting for new events...
          </div>
        </div>
      </div>
    </div>
  );
}
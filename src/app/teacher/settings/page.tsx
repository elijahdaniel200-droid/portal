"use client";
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
}
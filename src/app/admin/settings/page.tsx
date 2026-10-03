"use client";
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
}
"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { UserCircle, Mail, Phone, MapPin, Calendar, Book, Shield, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StudentProfilePage() {
  const { profile } = useAuthStore();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentData() {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from('students')
        .select(`
          enrollment_number,
          date_of_birth,
          emergency_contact,
          classes ( name )
        `)
        .eq('id', profile.id)
        .single();
      
      if (!error && data) {
        setStudentData(data);
      }
      setLoading(false);
    }
    fetchStudentData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Card */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4 ring-4 ring-white shadow-lg">
              <UserCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-sm text-blue-600 font-medium mb-4">{studentData?.enrollment_number || 'N/A'}</p>
            
            <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl text-sm mb-2">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md font-bold text-xs">Active</span>
            </div>
            <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl text-sm">
              <span className="text-slate-500 font-medium">Class</span>
              <span className="text-slate-900 font-bold">{studentData?.classes?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Account Security</span>
            </h3>
            <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
                <Key className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                <span>Change Password</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium">
                    {profile?.first_name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium">
                    {profile?.last_name}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="flex items-center space-x-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900 font-medium">{profile?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <div className="flex items-center space-x-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 font-medium">{studentData?.date_of_birth || 'Not specified'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Emergency Contact</label>
                  <div className="flex items-center space-x-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 font-medium">{studentData?.emergency_contact || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/20">
                Request Info Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

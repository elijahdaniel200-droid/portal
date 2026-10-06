"use client";

import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Calendar, GraduationCap, Clock, CheckCircle2, Download, Award, AlertCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import CourseRegistrationModal from '@/components/CourseRegistrationModal';

interface Grade {
  id: string;
  score: number;
  grade: string;
  remarks: string;
  class_subjects: { subjects: { name: string; code: string } };
  academic_terms: { name: string };
}

interface StudentData {
  enrollment_number: string;
  classes: { name: string };
  profiles: { first_name: string; last_name: string; email: string };
}

interface AttendanceData {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface RegisteredSubject {
  id: string;
  subjects: { name: string; code: string };
  teachers: { profiles: { first_name: string; last_name: string } };
}

export default function StudentAcademicsPage() {
  const { profile } = useAuthStore();
  const [data, setData] = useState<{ 
    student: StudentData; 
    grades: Grade[]; 
    attendance: AttendanceData;
    registeredSubjects: RegisteredSubject[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // Pass the student ID from auth profile
      const res = await fetch(`/api/report-card?student_id=${profile.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load academics');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-slate-600 font-medium">{error || 'Could not load data'}</p>
      </div>
    );
  }

  const { student, grades, attendance, registeredSubjects } = data;
  
  // Calculate GPA roughly (A=4, B=3, C=2, F=0)
  const gpaPoints: Record<string, number> = { 'A+': 4, 'A': 4, 'B+': 3.5, 'B': 3, 'C': 2, 'F': 0 };
  const totalPoints = grades.reduce((sum, g) => sum + (gpaPoints[g.grade] || 0), 0);
  const gpa = grades.length > 0 ? (totalPoints / grades.length).toFixed(2) : 'N/A';

  const presentPct = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 100;

  const downloadPDF = async () => {
    if (!data) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text("EduPortal", 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Student Academic Report", 14, 30);
    
    // Student Info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Name: ${student.profiles.first_name} ${student.profiles.last_name}`, 14, 40);
    doc.text(`Enrollment ID: ${student.enrollment_number}`, 14, 46);
    doc.text(`Class: ${student.classes?.name || 'Unassigned'}`, 14, 52);
    doc.text(`Term: First Term (2026)`, 14, 58);
    
    // Summary
    doc.text(`Cumulative GPA: ${gpa}`, 140, 40);
    doc.text(`Attendance: ${presentPct}% (${attendance.present}/${attendance.total} days)`, 140, 46);

    // Table
    const tableData = grades.map(g => [
      g.class_subjects?.subjects?.name || 'Unknown',
      g.class_subjects?.subjects?.code || '—',
      g.score.toString(),
      g.grade,
      g.remarks
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Subject', 'Code', 'Score', 'Grade', 'Remark']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175] },
    });

    // Footer
    doc.setFontSize(9);
    doc.text("This is an officially generated report card from EduPortal.", 14, doc.internal.pageSize.getHeight() - 10);

    doc.save(`${student.profiles.first_name}_${student.profiles.last_name}_ReportCard.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Academic Report Card</h2>
          <p className="text-slate-500 text-sm mt-1">Term 1, 2026/2027 Academic Year</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#10b981,#047857)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
          >
            <CheckCircle2 className="w-4 h-4" /><span>Course Registration</span>
          </button>
          <Link 
            href="/student/report-card" 
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}
          >
            <Printer className="w-4 h-4" /><span>View Official Report Card</span>
          </Link>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="bg-slate-50 p-6 md:w-1/3 flex flex-col items-center justify-center border-r border-slate-100 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-blue-700 text-3xl mb-3 shadow-sm">
            {student.profiles.first_name[0]}{student.profiles.last_name[0]}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{student.profiles.first_name} {student.profiles.last_name}</h3>
          <p className="text-sm font-medium text-blue-600 mt-1">{student.enrollment_number}</p>
        </div>
        <div className="p-6 md:w-2/3 grid grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Class</p>
            <p className="font-semibold text-slate-900 flex items-center"><GraduationCap className="w-4 h-4 mr-2 text-slate-400" />{student.classes?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Term</p>
            <p className="font-semibold text-slate-900 flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400" />First Term (2026)</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cumulative GPA</p>
            <p className="font-bold text-slate-900 text-xl flex items-center"><Award className="w-5 h-5 mr-2 text-amber-400" />{gpa}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance</p>
            <div className="flex items-center">
              <span className={`text-xl font-bold ${presentPct >= 80 ? 'text-emerald-600' : 'text-red-500'}`}>{presentPct}%</span>
              <span className="text-xs text-slate-400 ml-2">({attendance.present}/{attendance.total} days)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Subjects Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />Registered Subjects</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Name</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Code</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {registeredSubjects?.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No subjects assigned for this session.</td></tr>
              ) : registeredSubjects?.map((sub) => (
                <tr key={sub.id} className="table-row-hover">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{sub.subjects?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-xs font-mono font-medium text-slate-500">{sub.subjects?.code || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sub.teachers?.profiles ? `${sub.teachers.profiles.first_name} ${sub.teachers.profiles.last_name}` : 'TBA'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center"><BookOpen className="w-4 h-4 mr-2 text-blue-500" />Term Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Score</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Grade</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {grades.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No grades recorded for this term yet.</td></tr>
              ) : grades.map((g) => (
                <tr key={g.id} className="table-row-hover">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{g.class_subjects?.subjects?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-xs font-mono font-medium text-slate-500">{g.class_subjects?.subjects?.code || '—'}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-900">{g.score}</td>
                  <td className="px-6 py-4 text-center font-bold" style={{ color: g.grade.startsWith('A') ? '#059669' : g.grade.startsWith('B') ? '#2563eb' : g.grade.startsWith('C') ? '#d97706' : '#dc2626' }}>
                    {g.grade}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">{g.remarks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {profile?.id && (
        <CourseRegistrationModal 
          isOpen={isRegisterModalOpen} 
          onClose={() => setIsRegisterModalOpen(false)} 
          studentId={profile.id} 
          onComplete={fetchReport} 
        />
      )}
    </div>

  );
}

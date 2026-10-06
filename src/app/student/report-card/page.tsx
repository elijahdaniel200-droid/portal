"use client";

import { useEffect, useState, useRef } from 'react';
import { Download, Printer, ArrowLeft, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

// Default mock data to fall back on missing fields
const defaultSchool = {
  name: "EXCELLENCE INTERNATIONAL ACADEMY",
  address: "123 Education Way, Victoria Island, Lagos",
  email: "info@excellenceacademy.edu.ng",
  phone: "+234 800 123 4567",
  motto: "Knowledge is Power",
  logo: "https://api.dicebear.com/7.x/shapes/svg?seed=schoolLogo",
};

export default function ReportCardPage() {
  const { profile } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (profile?.id) {
      setLoading(true);
      fetch(`/api/report-card?student_id=${profile.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            // Transform data to our format
            const stu = data.student;
            const gradesData = data.grades || [];
            
            // Only show approved grades on report card, but for testing we can show all. Let's show all for now or 'APPROVED'
            const approvedGrades = gradesData.filter((g: any) => g.status === 'APPROVED' || g.status === 'SUBMITTED' || g.status === 'DRAFT'); // Fallback if no workflow enforced yet

            const totalScore = approvedGrades.reduce((sum: number, g: any) => sum + (Number(g.score) || 0), 0);
            const maxScore = approvedGrades.length * 100;
            const average = approvedGrades.length > 0 ? (totalScore / approvedGrades.length).toFixed(2) : 0;
            
            const termName = approvedGrades[0]?.academic_terms?.name || "Current Term";
            
            const mappedGrades = approvedGrades.map((g: any) => {
              const ca1 = g.breakdown?.ca1 || 0;
              const ca2 = g.breakdown?.ca2 || 0;
              const exam = g.breakdown?.exam || 0;
              return {
                subject: g.class_subjects?.subjects?.name || 'Unknown',
                ca1,
                ca2,
                exam,
                total: g.score || (ca1 + ca2 + exam),
                grade: g.grade || 'N/A',
                remark: g.remarks || 'N/A'
              };
            });

            // Attendance
            const att = data.attendance;
            const attPct = att.total > 0 ? Math.round((att.present / att.total) * 100) + '%' : 'N/A';

            setReportData({
              school: defaultSchool,
              student: {
                name: `${stu.profiles?.first_name} ${stu.profiles?.last_name}`,
                admissionNo: stu.enrollment_number || 'N/A',
                class: stu.classes?.name || 'N/A',
                term: termName,
                session: "2026/2027",
                dob: "N/A", // Not stored in profile currently
                gender: "N/A", // Not stored in profile currently
                attendance: attPct,
                passport: `https://api.dicebear.com/7.x/initials/svg?seed=${stu.profiles?.first_name}`,
              },
              performance: {
                totalScore,
                maxScore: maxScore === 0 ? 100 : maxScore,
                average,
                position: "N/A", // Position requires calculating all students
                nextTermBegins: "To be announced"
              },
              grades: mappedGrades,
              affectiveTraits: [
                { trait: "Punctuality", rating: 5 },
                { trait: "Attendance", rating: 4 },
                { trait: "Neatness", rating: 5 },
                { trait: "Politeness", rating: 4 },
                { trait: "Honesty", rating: 5 },
              ],
              psychomotorSkills: [
                { skill: "Handwriting", rating: 4 },
                { skill: "Sports/Games", rating: 4 },
                { skill: "Clubs/Societies", rating: 5 },
                { skill: "Public Speaking", rating: 4 },
              ],
              comments: {
                formTeacher: "A very good performance. Keep it up.",
                principal: "Satisfactory result. Can do better with more focus."
              }
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Could not load report card data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans print:bg-white print:py-0 print:px-0">
      
      {/* Controls - Hidden during print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/student/academics" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">Back to Academics</span>
        </Link>
        <div className="flex space-x-3">
          <button onClick={handlePrint} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-colors">
            <Printer className="w-4 h-4" />
            <span className="font-semibold text-sm">Print Result</span>
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-2xl rounded-2xl border border-slate-200 print:shadow-none print:border-none print:p-4 print:max-w-none print:m-0">
        
        {/* Header section */}
        <div className="flex justify-between items-center border-b-4 border-indigo-900 pb-6 mb-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full border-4 border-indigo-100 overflow-hidden shrink-0">
            <img src={reportData.school.logo} alt="School Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center px-4">
            <h1 className="text-3xl font-black text-indigo-950 uppercase tracking-wider">{reportData.school.name}</h1>
            <p className="text-sm font-semibold text-slate-700 mt-1 uppercase">{reportData.school.address}</p>
            <p className="text-xs text-slate-500 mt-1">Tel: {reportData.school.phone} | Email: {reportData.school.email}</p>
            <p className="text-sm font-bold text-indigo-700 italic mt-2">Motto: "{reportData.school.motto}"</p>
          </div>
          <div className="w-24 h-24 bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden shrink-0 shadow-sm">
            <img src={reportData.student.passport} alt="Student Passport" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="inline-block bg-indigo-900 text-white font-bold px-6 py-2 rounded-full uppercase tracking-widest text-sm shadow-md">
            Termly Student Performance Report
          </h2>
        </div>

        {/* Biodata Section */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <table className="w-full">
              <tbody>
                <tr className="mb-2"><td className="font-bold text-slate-500 py-1 w-1/3">Name:</td><td className="font-bold text-slate-900 uppercase">{reportData.student.name}</td></tr>
                <tr className="mb-2"><td className="font-bold text-slate-500 py-1">Admission No:</td><td className="font-bold text-slate-900">{reportData.student.admissionNo}</td></tr>
                <tr className="mb-2"><td className="font-bold text-slate-500 py-1">Class:</td><td className="font-bold text-slate-900">{reportData.student.class}</td></tr>
                <tr><td className="font-bold text-slate-500 py-1">Gender:</td><td className="font-bold text-slate-900">{reportData.student.gender}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <table className="w-full">
              <tbody>
                <tr className="mb-2"><td className="font-bold text-slate-500 py-1 w-1/3">Session:</td><td className="font-bold text-slate-900">{reportData.student.session}</td></tr>
                <tr className="mb-2"><td className="font-bold text-slate-500 py-1">Term:</td><td className="font-bold text-slate-900">{reportData.student.term}</td></tr>
                <tr className="mb-2"><td className="font-bold text-slate-500 py-1">Date of Birth:</td><td className="font-bold text-slate-900">{reportData.student.dob}</td></tr>
                <tr><td className="font-bold text-slate-500 py-1">Attendance:</td><td className="font-bold text-slate-900">{reportData.student.attendance}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Grades Table */}
        <div className="mb-8">
          <h3 className="font-bold text-indigo-950 uppercase mb-3 flex items-center border-b border-indigo-100 pb-2">
            <BookOpen className="w-4 h-4 mr-2 text-indigo-600" /> Academic Performance
          </h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 border-b border-slate-300">
                <tr className="text-indigo-950">
                  <th className="py-3 px-4 text-left font-bold uppercase w-1/3">Subject</th>
                  <th className="py-3 px-2 text-center font-bold text-xs uppercase" title="Continuous Assessment 1 (20)">CA 1<br/><span className="text-[10px] text-slate-500">(20)</span></th>
                  <th className="py-3 px-2 text-center font-bold text-xs uppercase" title="Continuous Assessment 2 (20)">CA 2<br/><span className="text-[10px] text-slate-500">(20)</span></th>
                  <th className="py-3 px-2 text-center font-bold text-xs uppercase" title="Examination (60)">EXAM<br/><span className="text-[10px] text-slate-500">(60)</span></th>
                  <th className="py-3 px-2 text-center font-bold text-xs uppercase bg-indigo-100" title="Total Score (100)">TOTAL<br/><span className="text-[10px] text-slate-500">(100)</span></th>
                  <th className="py-3 px-2 text-center font-bold uppercase">Grade</th>
                  <th className="py-3 px-4 text-left font-bold uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.grades.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-slate-500 italic">No grades found for this term.</td>
                  </tr>
                )}
                {reportData.grades.map((g: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700">{g.subject}</td>
                    <td className="py-2.5 px-2 text-center font-medium text-slate-600">{g.ca1}</td>
                    <td className="py-2.5 px-2 text-center font-medium text-slate-600">{g.ca2}</td>
                    <td className="py-2.5 px-2 text-center font-medium text-slate-600">{g.exam}</td>
                    <td className="py-2.5 px-2 text-center font-black text-indigo-900 bg-indigo-50/50">{g.total}</td>
                    <td className={`py-2.5 px-2 text-center font-black ${g.grade.includes('A') ? 'text-emerald-600' : g.grade.includes('B') ? 'text-blue-600' : 'text-amber-600'}`}>
                      {g.grade}
                    </td>
                    <td className="py-2.5 px-4 text-left font-medium text-slate-600">{g.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary & Traits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Performance Summary */}
          <div className="col-span-1 bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex flex-col justify-center">
            <h3 className="font-bold text-indigo-950 uppercase mb-4 flex items-center text-sm border-b border-indigo-200 pb-2">
              <Award className="w-4 h-4 mr-2 text-indigo-600" /> Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Total Score:</span> <span className="font-black text-lg text-indigo-950">{reportData.performance.totalScore} / {reportData.performance.maxScore}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Average:</span> <span className="font-black text-lg text-indigo-950">{reportData.performance.average}%</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Position:</span> <span className="font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">{reportData.performance.position}</span></div>
            </div>
          </div>
          
          {/* Affective */}
          <div className="col-span-1 border border-slate-200 rounded-xl overflow-hidden text-sm">
            <div className="bg-slate-100 py-2 px-3 border-b border-slate-200 font-bold text-slate-700 text-center uppercase text-xs">Affective Traits (1-5)</div>
            <table className="w-full">
              <tbody className="divide-y divide-slate-100">
                {reportData.affectiveTraits.map((t: any, i: number) => (
                  <tr key={i}>
                    <td className="py-1.5 px-3 text-slate-600">{t.trait}</td>
                    <td className="py-1.5 px-3 text-right font-bold text-indigo-900">{t.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Psychomotor */}
          <div className="col-span-1 border border-slate-200 rounded-xl overflow-hidden text-sm">
            <div className="bg-slate-100 py-2 px-3 border-b border-slate-200 font-bold text-slate-700 text-center uppercase text-xs">Psychomotor Skills (1-5)</div>
            <table className="w-full">
              <tbody className="divide-y divide-slate-100">
                {reportData.psychomotorSkills.map((t: any, i: number) => (
                  <tr key={i}>
                    <td className="py-1.5 px-3 text-slate-600">{t.skill}</td>
                    <td className="py-1.5 px-3 text-right font-bold text-indigo-900">{t.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grading Key */}
        <div className="mb-8 border border-slate-200 rounded-lg p-3 bg-slate-50 flex justify-center space-x-6 text-xs text-slate-600 uppercase font-medium">
          <span>A1: 75-100 (Excellent)</span>
          <span>B2: 70-74 (Very Good)</span>
          <span>B3: 65-69 (Good)</span>
          <span>C4: 60-64 (Credit)</span>
          <span>C5: 55-59 (Credit)</span>
          <span>C6: 50-54 (Pass)</span>
          <span>F9: 0-49 (Fail)</span>
        </div>

        {/* Remarks Section */}
        <div className="space-y-4 mb-10">
          <div className="border-b-2 border-slate-200 border-dotted pb-2 flex">
            <span className="font-bold text-slate-700 mr-2 uppercase text-sm w-48">Form Teacher's Remark:</span>
            <span className="text-slate-900 italic flex-1">{reportData.comments.formTeacher}</span>
          </div>
          <div className="border-b-2 border-slate-200 border-dotted pb-2 flex">
            <span className="font-bold text-slate-700 mr-2 uppercase text-sm w-48">Principal's Remark:</span>
            <span className="text-slate-900 italic flex-1">{reportData.comments.principal}</span>
          </div>
          <div className="border-b-2 border-slate-200 border-dotted pb-2 flex">
            <span className="font-bold text-slate-700 mr-2 uppercase text-sm w-48">Next Term Begins:</span>
            <span className="text-slate-900 font-bold flex-1">{reportData.performance.nextTermBegins}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-16 pt-8 text-center text-sm font-bold text-slate-700">
          <div className="w-48">
            <div className="border-b border-slate-800 mb-2 h-8">
              {/* Signature Image Placeholder */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" className="h-10 mx-auto -mb-2 opacity-70" alt="signature" />
            </div>
            <p>Form Teacher's Signature</p>
          </div>
          <div className="w-48">
            <div className="border-b border-slate-800 mb-2 h-8">
               <img src="https://upload.wikimedia.org/wikipedia/commons/7/77/Signature_of_George_Washington.svg" className="h-10 mx-auto -mb-2 opacity-70" alt="signature" />
            </div>
            <p>Principal's Signature</p>
            <p className="text-[10px] text-slate-400 font-normal mt-1">Stamp/Seal</p>
          </div>
        </div>

      </div>
    </div>
  );
}

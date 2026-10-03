import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Pending Fees
    const { data: pendingInvoices } = await supabase
      .from('invoices')
      .select('amount, due_date')
      .eq('student_id', studentId)
      .eq('status', 'PENDING');
      
    let pendingFees = 0;
    let nextDueDate = 'No pending fees';
    if (pendingInvoices && pendingInvoices.length > 0) {
      pendingFees = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
      const sorted = pendingInvoices.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      nextDueDate = `Due ${new Date(sorted[0].due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    // 2. Attendance Rate
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId);

    let attendanceRate = 100;
    if (attendance && attendance.length > 0) {
      const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
      attendanceRate = Math.round((present / attendance.length) * 100);
    } else {
      // Dummy logic if no attendance records yet
      attendanceRate = 95;
    }

    // 3. Avg Grade & Enrolled Classes
    const { data: grades } = await supabase
      .from('grades')
      .select('score, class_subjects(id, subjects(name))')
      .eq('student_id', studentId);
      
    let avgGrade = 'N/A';
    let classesCount = 0;
    if (grades && grades.length > 0) {
      const totalScore = grades.reduce((sum, g) => sum + Number(g.score || 0), 0);
      const avg = totalScore / grades.length;
      if (avg >= 70) avgGrade = 'A';
      else if (avg >= 60) avgGrade = 'B';
      else if (avg >= 50) avgGrade = 'C';
      else if (avg >= 40) avgGrade = 'D';
      else avgGrade = 'F';
      
      classesCount = grades.length;
    } else {
      // Dummy logic
      avgGrade = 'B+';
      classesCount = 4;
    }

    // 4. Student Data (Rank, Class)
    const { data: student } = await supabase
      .from('students')
      .select('classes(name)')
      .eq('id', studentId)
      .single();

    const classesData: any = student?.classes;
    const className = classesData?.name || classesData?.[0]?.name || 'Grade 10';

    return NextResponse.json({
      pendingFees,
      nextDueDate,
      attendanceRate,
      avgGrade,
      classesCount,
      className,
      // Pass some static announcements for now, or fetch from a table if it exists
      announcements: [
        { date: 'Oct 01', title: 'Mid-Term Exam Timetable Released', desc: 'View the full schedule under the Academics tab.', type: 'info' },
        { date: 'Sep 28', title: 'Fee Payment Deadline Reminder', desc: 'Term 1 fees must be paid before Oct 15 to avoid penalties.', type: 'warning' },
        { date: 'Sep 25', title: 'Cultural Day — Nov 5', desc: 'All students are expected to participate in the annual Cultural Day event.', type: 'event' },
      ],
      schedule: [
        { time: '08:00 AM', subject: 'Advanced Mathematics', teacher: 'Mr. Adeyemi', room: 'Room 101', color: 'bg-blue-500' },
        { time: '09:30 AM', subject: 'General Physics', teacher: 'Mrs. Okonkwo', room: 'Lab 2', color: 'bg-violet-500' },
        { time: '11:00 AM', subject: 'English Literature', teacher: 'Ms. Eze', room: 'Room 204', color: 'bg-emerald-500' },
        { time: '01:30 PM', subject: 'Further Mathematics', teacher: 'Mr. Bello', room: 'Room 105', color: 'bg-amber-500' },
      ]
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

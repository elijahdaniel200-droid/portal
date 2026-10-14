import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateGrade } from '@/lib/grading';

export interface ReportCardGradeItem {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export interface ReportCardData {
  school: {
    name: string;
    address: string;
    email: string;
    phone: string;
    motto: string;
  };
  student: {
    name: string;
    admissionNo: string;
    class: string;
    term: string;
    session: string;
    dob?: string;
    gender?: string;
    attendance?: string;
  };
  performance: {
    totalScore: number;
    maxScore: number;
    average: number | string;
    position?: string;
    nextTermBegins?: string;
  };
  grades: ReportCardGradeItem[];
  affectiveTraits?: { trait: string; rating: number }[];
}

export function generateReportCardPDF(data: ReportCardData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Top Decorative Brand Stripes
  doc.setFillColor(15, 23, 42); // Deep Navy
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(245, 158, 11); // Amber / Gold Accent
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // 2. School Header
  let yPos = 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(data.school.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.school.address, pageWidth / 2, yPos, { align: 'center' });

  yPos += 4;
  doc.setFontSize(8);
  doc.text(`Tel: ${data.school.phone}  |  Email: ${data.school.email}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 4;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(217, 119, 6);
  doc.text(`"${data.school.motto}"`, pageWidth / 2, yPos, { align: 'center' });

  // 3. Document Title Pill
  yPos += 7;
  const titleText = 'TERMLY STUDENT PERFORMANCE REPORT';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const titleWidth = doc.getTextWidth(titleText) + 16;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect((pageWidth - titleWidth) / 2, yPos - 4.5, titleWidth, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(titleText, pageWidth / 2, yPos, { align: 'center' });

  // 4. Student Bio-Data & Term Details Box
  yPos += 7;
  const bioTableBody = [
    [
      { content: 'STUDENT INFORMATION', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
      { content: 'ACADEMIC SESSION DETAILS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
    ],
    [
      'Student Name:', data.student.name.toUpperCase(),
      'Academic Term:', data.student.term,
    ],
    [
      'Admission No:', data.student.admissionNo,
      'School Session:', data.student.session,
    ],
    [
      'Class / Arm:', data.student.class,
      'Term Attendance:', data.student.attendance || '95% (Regular)',
    ],
  ];

  const fn = (autoTable as any).default || autoTable;

  fn(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    body: bioTableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 30, textColor: [71, 85, 105] },
      1: { width: 62 },
      2: { fontStyle: 'bold', width: 32, textColor: [71, 85, 105] },
      3: { width: 58 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 6;

  // 5. Academic Performance Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACADEMIC EVALUATION & CONTINUOUS ASSESSMENT', margin, yPos);

  yPos += 2;

  const gradeRows = data.grades.map(item => {
    const calc = calculateGrade(item.total);
    return [
      item.subject,
      item.ca1.toString(),
      item.ca2.toString(),
      item.exam.toString(),
      item.total.toString(),
      calc.grade,
      calc.remark,
    ];
  });

  fn(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: 'SUBJECT', styles: { halign: 'left' } },
        { content: 'CA 1\n(20)', styles: { halign: 'center' } },
        { content: 'CA 2\n(20)', styles: { halign: 'center' } },
        { content: 'EXAM\n(60)', styles: { halign: 'center' } },
        { content: 'TOTAL\n(100)', styles: { halign: 'center', fillColor: [245, 158, 11] } },
        { content: 'GRADE', styles: { halign: 'center' } },
        { content: 'REMARKS', styles: { halign: 'left' } },
      ],
    ],
    body: gradeRows.length > 0 ? gradeRows : [['No grades published for this term yet.', '-', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center', fontStyle: 'bold', textColor: [15, 23, 42] },
      5: { halign: 'center', fontStyle: 'bold', textColor: [2, 132, 199] },
      6: { halign: 'left' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 6;

  // 6. Performance Summary & Affective Domain Grid
  const avgNum = Number(data.performance.average) || 0;
  const isPassing = avgNum >= 50;

  const summaryBody = [
    [
      { content: 'CUMULATIVE PERFORMANCE', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'BEHAVIORAL & AFFECTIVE TRAITS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
    ],
    [
      'Total Marks Obtained:', `${data.performance.totalScore} / ${data.performance.maxScore}`,
      'Punctuality & Regularity:', '5 / 5 (Excellent)',
    ],
    [
      'Term Percentage Average:', `${avgNum.toFixed(1)}%`,
      'Classroom Attentiveness:', '5 / 5 (Attentive)',
    ],
    [
      'Academic Standing / Result:', isPassing ? 'PASSED & PROMOTABLE' : 'REQUIRES IMPROVEMENT',
      'Leadership & Neatness:', '4 / 5 (Commendable)',
    ],
    [
      'Next Term Commences:', data.performance.nextTermBegins || 'January 12, 2027',
      'Honesty & Integrity:', '5 / 5 (High)',
    ],
  ];

  fn(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    body: summaryBody,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 45, textColor: [71, 85, 105] },
      1: { width: 47, fontStyle: 'bold', textColor: isPassing ? [5, 150, 105] : [225, 29, 72] },
      2: { fontStyle: 'bold', width: 45, textColor: [71, 85, 105] },
      3: { width: 45 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // 7. Teacher and Principal Attestation
  const boxWidth = (pageWidth - margin * 2 - 8) / 2;

  // Form Teacher Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, boxWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("FORM TEACHER'S REMARK & SIGNATURE", margin + 3, yPos + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    avgNum >= 70 ? 'An exceptional academic display. Keep up the high standard.' : 'Consistent effort shown. Focus more on analytical subjects.',
    margin + 3,
    yPos + 9.5,
    { maxWidth: boxWidth - 6 }
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Signature: __________________________', margin + 3, yPos + 20);

  // Principal Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + boxWidth + 8, yPos, boxWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("PRINCIPAL'S ENDORSEMENT & OFFICIAL STAMP", margin + boxWidth + 11, yPos + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    isPassing ? 'Satisfactory progress demonstrated. Promoted in good standing.' : 'Performance flagged for academic counseling.',
    margin + boxWidth + 11,
    yPos + 9.5,
    { maxWidth: boxWidth - 6 }
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Authorized Signature & Seal: __________________', margin + boxWidth + 11, yPos + 20);

  // 8. Security Footer & Verification Bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const printTimestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Official Document ID: EDU-${data.student.admissionNo.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`, margin, pageHeight - 6);
  doc.text(`Generated: ${printTimestamp} | EduPortal Academic Records Subsystem`, pageWidth - margin, pageHeight - 6, { align: 'right' });

  return doc;
}

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReceiptData {
  school: {
    name: string;
    address: string;
    email: string;
    phone: string;
    motto: string;
  };
  student: {
    name: string;
    enrollmentNo: string;
    class?: string;
    email?: string;
  };
  transaction: {
    receiptNo: string;
    reference: string;
    invoiceId: string;
    date: string;
    description: string;
    amount: number;
    paymentMethod: string;
    channel?: string;
  };
}

export function generatePaymentReceiptPDF(data: ReceiptData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Standard compact official receipt size
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // 1. Top Decorative Brand Stripes
  doc.setFillColor(15, 23, 42); // Navy
  doc.rect(0, 0, pageWidth, 4, 'F');
  doc.setFillColor(16, 185, 129); // Emerald Success
  doc.rect(0, 4, pageWidth, 1.2, 'F');

  // 2. School Header
  let yPos = 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(data.school.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });

  yPos += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.school.address, pageWidth / 2, yPos, { align: 'center' });

  yPos += 3.5;
  doc.setFontSize(7);
  doc.text(`Tel: ${data.school.phone}  |  Email: ${data.school.email}`, pageWidth / 2, yPos, { align: 'center' });

  // 3. Document Title Pill
  yPos += 6;
  const titleText = 'OFFICIAL ELECTRONIC PAYMENT RECEIPT';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const titleWidth = doc.getTextWidth(titleText) + 12;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect((pageWidth - titleWidth) / 2, yPos - 3.5, titleWidth, 5.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(titleText, pageWidth / 2, yPos, { align: 'center' });

  // 4. Receipt Meta & Student Info Grid
  yPos += 6;
  const metaBody = [
    [
      { content: 'STUDENT DETAILS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'PAYMENT METADATA', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
    ],
    [
      'Student Name:', data.student.name.toUpperCase(),
      'Receipt Number:', data.transaction.receiptNo,
    ],
    [
      'Registration No:', data.student.enrollmentNo,
      'Payment Date:', data.transaction.date,
    ],
    [
      'Class Level:', data.student.class || 'Secondary Division',
      'Transaction Ref:', data.transaction.reference,
    ],
  ];

  const fn = (autoTable as any).default || autoTable;

  fn(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    body: metaBody,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 24, textColor: [71, 85, 105] },
      1: { width: 40 },
      2: { fontStyle: 'bold', width: 26, textColor: [71, 85, 105] },
      3: { width: 38 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 5;

  // 5. Transaction Items Table
  fn(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: 'DESCRIPTION', styles: { halign: 'left' } },
        { content: 'INVOICE ID', styles: { halign: 'center' } },
        { content: 'METHOD', styles: { halign: 'center' } },
        { content: 'AMOUNT (NGN)', styles: { halign: 'right' } },
      ],
    ],
    body: [
      [
        data.transaction.description,
        data.transaction.invoiceId.split('-')[0].toUpperCase(),
        data.transaction.paymentMethod,
        `₦${Number(data.transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      ],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left', width: 55 },
      1: { halign: 'center', width: 25 },
      2: { halign: 'center', width: 22 },
      3: { halign: 'right', fontStyle: 'bold', width: 26, textColor: [5, 150, 105] },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 5;

  // 6. Paid & Verified Stamp Badge
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.8);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(pageWidth - margin - 42, yPos, 42, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✔ PAID & SETTLED', pageWidth - margin - 21, yPos + 6, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(16, 185, 129);
  doc.text('ELECTRONICALLY VERIFIED', pageWidth - margin - 21, yPos + 10.5, { align: 'center' });

  // 7. Security Footnote & Bursar Attestation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This is an official computer-generated receipt issued by EduPortal.', margin, yPos + 5);
  doc.text('No physical signature required. Keep for verification during clearance.', margin, yPos + 9);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`Audit Hash: ${data.transaction.reference}`, margin, pageHeight - 5);
  doc.text(`Issued: ${new Date().toLocaleString()}`, pageWidth - margin, pageHeight - 5, { align: 'right' });

  return doc;
}

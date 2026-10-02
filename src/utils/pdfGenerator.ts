/**
 * EXAMGUARD — Rasmiy PDF imtihon jadvali yaratuvchi modul (jsPDF)
 * 
 * FARG‘ONA DAVLAT TEXNIKA UNIVERSITETI standarti asosida
 * Chop etish va rasmiy e'lon qilishga to‘liq tayyor PDF hujjat generatsiyasi.
 */

import { jsPDF } from 'jspdf';
import { Exam, Group, Room, Subject, Teacher } from '../types';

function cleanPdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[‘’ʻ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–/g, '-');
}

export function generateSchedulePDF(
  exams: Exam[],
  groups: Group[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[],
  titlePrefix: string = 'Fakultet umumiy jadvali',
  filterGroupName?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Hujjat sarlavhasi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(cleanPdfText('FARG\'ONA DAVLAT TEXNIKA UNIVERSITETI'), 105, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanPdfText('KOMPYUTER VA DASTURIY INJINIRING FAKULTETI'), 105, 24, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const title = filterGroupName
    ? `${filterGroupName} GURUHI IMTIHON JADVALI (2025/2026 O'QUV YILI)`
    : `${titlePrefix.toUpperCase()} (2025/2026 O'QUV YILI)`;
  doc.text(cleanPdfText(title), 105, 32, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  if (exams.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(cleanPdfText('Hozirda rejalashtirilgan imtihon jadvali mavjud emas.'), 105, 60, { align: 'center' });
    const safeName = filterGroupName ? `Imtihon_Jadvali_${filterGroupName}.pdf` : 'Fakultet_Imtihon_Jadvali.pdf';
    doc.save(safeName);
    return;
  }

  // Jadval parametrlari
  let currentY = 44;
  const startX = 14;
  const colWidths = [10, 24, 25, 25, 48, 38, 16]; // Jami 186mm
  const headers = ['No', 'Sana', 'Vaqt', 'Guruh', 'Fan nomi', "O'qituvchi", 'Xona'];

  // Sarlavha satri
  doc.setFillColor(240, 244, 250);
  doc.rect(startX, currentY, 182, 8, 'F');
  doc.setDrawColor(180, 190, 205);
  doc.rect(startX, currentY, 182, 8, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  let curX = startX;
  headers.forEach((h, idx) => {
    doc.text(h, curX + 2, currentY + 5.5);
    curX += colWidths[idx];
  });

  currentY += 8;

  // Imtihon satrlari
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const sortedExams = [...exams].sort((a, b) => {
    if (a.exam_date !== b.exam_date) return a.exam_date.localeCompare(b.exam_date);
    return a.start_time.localeCompare(b.start_time);
  });

  sortedExams.forEach((exam, index) => {
    // Sahifa to‘lib qolsa yangi sahifa ochish
    if (currentY > 265) {
      doc.addPage();
      currentY = 20;

      // Qayta sarlavha
      doc.setFillColor(240, 244, 250);
      doc.rect(startX, currentY, 182, 8, 'F');
      doc.rect(startX, currentY, 182, 8, 'S');
      doc.setFont('helvetica', 'bold');
      let hX = startX;
      headers.forEach((h, idx) => {
        doc.text(h, hX + 2, currentY + 5.5);
        hX += colWidths[idx];
      });
      currentY += 8;
      doc.setFont('helvetica', 'normal');
    }

    const group = groupMap.get(exam.group_id);
    const subject = subjectMap.get(exam.subject_id);
    const teacher = teacherMap.get(exam.teacher_id);
    const room = roomMap.get(exam.room_id);

    // Qator foni (zebra chiziqlar)
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, currentY, 182, 8, 'F');
    }
    doc.rect(startX, currentY, 182, 8, 'S');

    const rowData = [
      String(index + 1),
      exam.exam_date,
      `${exam.start_time}-${exam.end_time}`,
      group?.name || '—',
      (subject?.name || '—').length > 25 ? (subject?.name || '').slice(0, 23) + '..' : (subject?.name || '—'),
      (teacher?.full_name || '—').length > 20 ? (teacher?.full_name || '').slice(0, 18) + '..' : (teacher?.full_name || '—'),
      room?.name || '—'
    ];

    let rowX = startX;
    rowData.forEach((val, i) => {
      doc.text(cleanPdfText(val), rowX + 2, currentY + 5.5);
      rowX += colWidths[i];
    });

    currentY += 8;
  });

  // Imzo qismi
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 15;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Fakultet dekani: _______________________ (imzo)', 20, currentY);
  doc.text('O‘quv bo‘limi boshlig‘i: _______________________ (imzo)', 110, currentY);

  currentY += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Chop etilgan sana: ${new Date().toLocaleDateString('uz-UZ')} | EXAMGUARD Tizimi orqali tasdiqlangan`, 105, 285, { align: 'center' });

  // Fayl nomi
  const safeName = filterGroupName ? `Imtihon_Jadvali_${filterGroupName}.pdf` : 'Fakultet_Imtihon_Jadvali.pdf';
  doc.save(safeName);
}

/**
 * EXAMGUARD — Excel bilan ishlash moduli (SheetJS)
 * 
 * - .xlsx, .xls, .csv formatlarini tahlil qilish
 * - Har bir satrni to‘liq tekshirish va xatoliklar hisoboti
 * - To‘g‘ri satrlarni tanlab import qilish
 * - Shablon va jadvalni Excel formatida yuklab olish
 */

import * as XLSX from 'xlsx';
import { Exam, Group, Room, Subject, Teacher, ExcelImportRow, Conflict } from '../types';

/**
 * Excel shablonini generatsiya qilish va yuklab olish
 */
export function downloadExcelTemplate(): void {
  const sampleData = [
    {
      'Fan': 'Dasturlash asoslari',
      'Fan kodi': 'DS101',
      'Guruh': '614-24',
      'Talabalar soni': 28,
      'O‘qituvchi': 'A. Karimov',
      'Sana': '2026-06-15',
      'Boshlanish vaqti': '09:00',
      'Tugash vaqti': '11:00',
      'Xona': '301',
      'Xona sig‘imi': 40
    },
    {
      'Fan': 'Ma\'lumotlar tuzilmasi',
      'Fan kodi': 'MT201',
      'Guruh': '614-24',
      'Talabalar soni': 28,
      'O‘qituvchi': 'B. Sobirov',
      'Sana': '2026-06-17',
      'Boshlanish vaqti': '11:30',
      'Tugash vaqti': '13:30',
      'Xona': '302',
      'Xona sig‘imi': 45
    },
    {
      'Fan': 'Oliy matematika',
      'Fan kodi': 'OM102',
      'Guruh': '615-24',
      'Talabalar soni': 30,
      'O‘qituvchi': 'D. Aliyev',
      'Sana': '2026-06-16',
      'Boshlanish vaqti': '09:00',
      'Tugash vaqti': '11:00',
      'Xona': '205',
      'Xona sig‘imi': 35
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  // Ustun kengliklari
  ws['!cols'] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Imtihonlar_Shabloni');
  XLSX.writeFile(wb, 'EXAMGUARD_Imtihon_Jadvali_Shablon.xlsx');
}

/**
 * Exceldan kelgan sanani YYYY-MM-DD formatiga xavfsiz o‘tkazish
 */
function normalizeExcelDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel serial sana (1900 date system)
    const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().slice(0, 10);
    }
  }
  const str = String(val).trim();
  // Agar allaqachon YYYY-MM-DD bo'lsa
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // Agar DD.MM.YYYY yoki DD/MM/YYYY bo'lsa
  const matchDmy = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (matchDmy) {
    const day = matchDmy[1].padStart(2, '0');
    const month = matchDmy[2].padStart(2, '0');
    const year = matchDmy[3];
    return `${year}-${month}-${day}`;
  }
  return str;
}

/**
 * Exceldan kelgan vaqtni HH:mm formatiga o‘tkazish
 */
function normalizeExcelTime(val: any): string {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'number' && val >= 0 && val < 1) {
    // Excel vaqt kasr son sifatida (masalan: 0.375 -> 09:00)
    const totalMinutes = Math.round(val * 24 * 60);
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  let str = String(val).trim();
  // Agar "09:00:00" kelsa sekundlarni olib tashlaymiz
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    str = str.slice(0, 5);
  }
  // Agar "9:00" bo'lsa "09:00" qilamiz
  if (/^\d:\d{2}$/.test(str)) {
    str = '0' + str;
  }
  return str;
}

/**
 * Yuklangan faylni tahlil qilish va validatsiya
 */
export async function parseExcelFile(
  file: File,
  existingGroups: Group[],
  existingSubjects: Subject[],
  existingTeachers: Teacher[],
  existingRooms: Room[]
): Promise<{
  rows: ExcelImportRow[];
  validCount: number;
  invalidCount: number;
  totalCount: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedRows: ExcelImportRow[] = [];
        let validCount = 0;
        let invalidCount = 0;

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // Sarlavha 1-satrda
          const errors: { field: string; error: string; suggestion: string }[] = [];

          // Qiymatlarni moslashtirish (turli nomdagi ustunlarni qo'llab-quvvatlash)
          const subject = String(row['Fan'] || row['fan'] || row['Subject'] || '').trim();
          const subjectCode = String(row['Fan kodi'] || row['fan kodi'] || row['Code'] || '').trim();
          const group = String(row['Guruh'] || row['guruh'] || row['Group'] || '').trim();
          const studentCountRaw = row['Talabalar soni'] || row['talabalar soni'] || row['Students'];
          const teacher = String(row['O‘qituvchi'] || row['O\'qituvchi'] || row['Teacher'] || '').trim();
          const date = normalizeExcelDate(row['Sana'] || row['sana'] || row['Date']);
          let startTime = normalizeExcelTime(row['Boshlanish vaqti'] || row['boshlanish'] || row['Start']);
          let endTime = normalizeExcelTime(row['Tugash vaqti'] || row['tugash'] || row['End']);
          const room = String(row['Xona'] || row['xona'] || row['Room'] || '').trim();
          const roomCapacityRaw = row['Xona sig‘imi'] || row['sig\'im'] || row['Capacity'];

          // 1. Fan tekshiruvi
          if (!subject) {
            errors.push({
              field: 'Fan',
              error: 'Fan nomi ko‘rsatilmagan',
              suggestion: 'Iltimos, fanning to‘liq nomini kiriting'
            });
          }

          // 2. Guruh tekshiruvi
          if (!group) {
            errors.push({
              field: 'Guruh',
              error: 'Guruh nomi ko‘rsatilmagan',
              suggestion: 'Guruh nomini (masalan: 614-24) kiriting'
            });
          }

          // 3. O'qituvchi tekshiruvi
          if (!teacher) {
            errors.push({
              field: 'O‘qituvchi',
              error: 'O‘qituvchi ko‘rsatilmagan',
              suggestion: 'O‘qituvchining F.I.Sh. kiriting'
            });
          }

          // 4. Sana tekshiruvi (YYYY-MM-DD)
          if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            errors.push({
              field: 'Sana',
              error: 'Sana formati noto‘g‘ri yoki kiritilmagan',
              suggestion: 'Sanani YYYY-MM-DD formatida kiriting (masalan: 2026-06-15)'
            });
          }

          // 5. Vaqt tekshiruvi
          if (!startTime || !endTime) {
            errors.push({
              field: 'Vaqt',
              error: 'Boshlanish yoki tugash vaqti to‘liq emas',
              suggestion: 'HH:mm formatida kiriting (masalan: 09:00 va 11:00)'
            });
          } else if (startTime >= endTime) {
            errors.push({
              field: 'Vaqt',
              error: 'Tugash vaqti boshlanish vaqtidan oldin yoki teng',
              suggestion: 'Tugash vaqti kamida boshlanish vaqtidan 30 daqiqa keyin bo‘lishi lozim'
            });
          }

          // 6. Xona tekshiruvi
          if (!room) {
            errors.push({
              field: 'Xona',
              error: 'Xona raqami ko‘rsatilmagan',
              suggestion: 'Auditoriya raqamini kiriting (masalan: 301)'
            });
          }

          const isValid = errors.length === 0;
          if (isValid) validCount++;
          else invalidCount++;

          parsedRows.push({
            row_number: rowNum,
            subject_name: subject,
            subject_code: subjectCode,
            group_name: group,
            student_count: studentCountRaw ? Number(studentCountRaw) : undefined,
            teacher_name: teacher,
            exam_date: date,
            start_time: startTime,
            end_time: endTime,
            room_name: room,
            room_capacity: roomCapacityRaw ? Number(roomCapacityRaw) : undefined,
            is_valid: isValid,
            errors
          });
        });

        resolve({
          rows: parsedRows,
          validCount,
          invalidCount,
          totalCount: parsedRows.length
        });
      } catch (err: any) {
        reject(new Error('Excel faylini tahlil qilishda xatolik yuz berdi: ' + err.message));
      }
    };

    reader.onerror = () => reject(new Error('Faylni o‘qib bo‘lmadi'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Umumiy jadvalni Excel fayl sifatida eksport qilish
 */
export function exportScheduleToExcel(
  exams: Exam[],
  groups: Group[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[],
  fileName: string = 'EXAMGUARD_Imtihon_Jadvali.xlsx'
): void {
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const data = exams.map((e, index) => {
    const group = groupMap.get(e.group_id);
    const subject = subjectMap.get(e.subject_id);
    const teacher = teacherMap.get(e.teacher_id);
    const room = roomMap.get(e.room_id);

    return {
      '№': index + 1,
      'Sana': e.exam_date,
      'Boshlanish vaqti': e.start_time,
      'Tugash vaqti': e.end_time,
      'Guruh': group?.name || '—',
      'Fakultet': group?.faculty || '—',
      'Kurs': group?.course ? `${group.course}-kurs` : '—',
      'Talabalar soni': group?.student_count || 0,
      'Fan': subject?.name || '—',
      'Fan kodi': subject?.code || '—',
      'O‘qituvchi': teacher?.full_name || '—',
      'Kafedra': teacher?.department || '—',
      'Xona': room?.name || '—',
      'Bino': room?.building || '—',
      'Xona sig‘imi': room?.capacity || 0,
      'Holat': e.status
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 24 },
    { wch: 10 },
    { wch: 15 },
    { wch: 25 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Imtihon_Jadvali');
  XLSX.writeFile(wb, fileName);
}

/**
 * To'qnashuvlar hisobotini Excel eksport qilish
 */
export function exportConflictsToExcel(conflicts: Conflict[]): void {
  const data = conflicts.map((c, index) => ({
    '№': index + 1,
    'Daraja': c.severity,
    'To‘qnashuv turi': c.conflict_type,
    'Sarlavha': c.title,
    'Tavsif': c.description,
    'Guruh': c.group_name || '—',
    'O‘qituvchi': c.teacher_name || '—',
    'Xona': c.room_name || '—',
    'Sana': c.exam_date || '—',
    'Vaqt oralig‘i': c.time_range || '—',
    'Holat': c.status
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Toqnashuvlar_Hisoboti');
  XLSX.writeFile(wb, 'EXAMGUARD_Toqnashuvlar_Hisoboti.xlsx');
}

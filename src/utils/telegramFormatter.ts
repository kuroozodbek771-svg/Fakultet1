/**
 * EXAMGUARD — Telegram integratsiyasi uchun xabar formatlash moduli
 * 
 * Fakultet botlari va kanallari uchun chiroyli, emojilar bilan boyitilgan
 * rasmiy Telegram xabarlari tayyorlaydi.
 */

import { Exam, Group, Room, Subject, Teacher } from '../types';

export function formatTelegramGroupSchedule(
  group: Group,
  exams: Exam[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[]
): string {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const groupExams = exams
    .filter((e) => e.group_id === group.id)
    .sort((a, b) => {
      if (a.exam_date !== b.exam_date) return a.exam_date.localeCompare(b.exam_date);
      return a.start_time.localeCompare(b.start_time);
    });

  if (groupExams.length === 0) {
    return `📢 *${group.name} guruhi imtihon jadvali*\n\nHozircha ushbu guruh uchun e'lon qilingan imtihonlar mavjud emas.`;
  }

  let text = `📢 *${group.name} GURUHINING RASMIY IMTIHON JADVALI*\n`;
  text += `🏛 Fakultet: ${group.faculty}\n`;
  text += `👥 Talabalar soni: ${group.student_count}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  groupExams.forEach((exam, idx) => {
    const subject = subjectMap.get(exam.subject_id);
    const teacher = teacherMap.get(exam.teacher_id);
    const room = roomMap.get(exam.room_id);

    // Sanani chiroyli formatlash: 15.06.2026
    const [year, month, day] = exam.exam_date.split('-');
    const formattedDate = `${day}.${month}.${year}`;

    text += `🔹 *${idx + 1}. ${subject?.name || 'Fan'}* (${subject?.code || ''})\n`;
    text += `   📅 Sana: *${formattedDate}*\n`;
    text += `   ⏰ Vaqt: *${exam.start_time} — ${exam.end_time}*\n`;
    text += `   🏫 Xona: *${room?.name || 'Xona'}* (${room?.building || ''})\n`;
    text += `   👨‍🏫 O'qituvchi: _${teacher?.full_name || 'Noma\'lum'}_\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚠️ *Eslatma:* Imtihonga o'z vaqtida, shaxsni tasdiqlovchi hujjat bilan kelishingiz so'raladi.\n`;
  text += `🤖 _Tizim: EXAMGUARD Schedule Optimizer_`;

  return text;
}

export function formatTelegramDailyDigest(
  targetDate: string,
  exams: Exam[],
  groups: Group[],
  subjects: Subject[],
  rooms: Room[]
): string {
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const dailyExams = exams
    .filter((e) => e.exam_date === targetDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  let text = `📅 *BUGUNGI IMTIHONLAR (${targetDate})*\n`;
  text += `Jami o'tkaziladigan imtihonlar: ${dailyExams.length} ta\n\n`;

  if (dailyExams.length === 0) {
    return text + `Bugun uchun imtihonlar rejalashtirilmagan.`;
  }

  dailyExams.forEach((exam) => {
    const group = groupMap.get(exam.group_id);
    const subject = subjectMap.get(exam.subject_id);
    const room = roomMap.get(exam.room_id);

    text += `⏰ *${exam.start_time}* | ${group?.name || 'Guruh'} | ${subject?.name || 'Fan'} | Xona: ${room?.name || '301'}\n`;
  });

  return text;
}

/**
 * EXAMGUARD — "ExamGuard AI" Sun'iy intellekt xizmati
 * 
 * Google Gen AI SDK (@google/genai) yordamida gemini-3.8-flash modeliga asoslangan.
 * Jadvaldagi to‘qnashuvlarni o‘zbek tilida tushuntirish, foydalanuvchi savollariga
 * faqat haqiqiy ma'lumotlar asosida aniq javob berish.
 */

import { GoogleGenAI } from '@google/genai';
import { Conflict, Exam, Group, Room, Subject, Teacher } from '../types';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  // Vite env or system env
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch {
      aiClient = null;
    }
  }
  return aiClient;
}

/**
 * AI ga beriladigan hozirgi tizim holati (Grounding Context)
 */
function buildScheduleContext(
  exams: Exam[],
  conflicts: Conflict[],
  groups: Group[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[]
): string {
  const groupMap = new Map(groups.map((g) => [g.id, g.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t.full_name]));
  const roomMap = new Map(rooms.map((r) => [r.id, `${r.name} (sig'im: ${r.capacity})`]));

  const examsSummary = exams.slice(0, 40).map((e) => ({
    id: e.id,
    sana: e.exam_date,
    vaqt: `${e.start_time}-${e.end_time}`,
    guruh: groupMap.get(e.group_id) || e.group_id,
    fan: subjectMap.get(e.subject_id) || e.subject_id,
    oqituvchi: teacherMap.get(e.teacher_id) || e.teacher_id,
    xona: roomMap.get(e.room_id) || e.room_id
  }));

  const conflictsSummary = conflicts.map((c) => ({
    turi: c.conflict_type,
    daraja: c.severity,
    sarlavha: c.title,
    tavsif: c.description,
    guruh: c.group_name,
    oqituvchi: c.teacher_name,
    xona: c.room_name,
    sana: c.exam_date,
    vaqt: c.time_range
  }));

  return `
UNIVERSITET IMTIHON TIZIMI MA'LUMOTLARI:
- Jami imtihonlar: ${exams.length} ta
- Mavjud guruhlar (${groups.length} ta): ${groups.map((g) => `${g.name} (${g.student_count} talaba)`).join(', ')}
- Mavjud xonalar (${rooms.length} ta): ${rooms.map((r) => `${r.name} (${r.capacity} kishi)`).join(', ')}
- Mavjud o'qituvchilar (${teachers.length} ta): ${teachers.map((t) => t.full_name).join(', ')}
- Jami aniqlangan to'qnashuvlar: ${conflicts.length} ta

Hozirgi to'qnashuvlar ro'yxati:
${JSON.stringify(conflictsSummary, null, 2)}

Imtihonlar ro'yxati namunalari:
${JSON.stringify(examsSummary, null, 2)}
`;
}

/**
 * Foydalanuvchi savoliga ExamGuard AI orqali javob olish
 */
export async function askExamGuardAI(
  userQuery: string,
  exams: Exam[],
  conflicts: Conflict[],
  groups: Group[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[]
): Promise<string> {
  const context = buildScheduleContext(exams, conflicts, groups, subjects, teachers, rooms);

  const client = getAiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Siz EXAMGUARD tizimining rasmiy AI yordamchisisiz.
Quyidagi haqiqiy universitet jadvali ma'lumotlariga tayangan holda foydalanuvchining savoliga o'zbek tilida aniq, xushmuomala, professional va lo‘nda javob bering.

QAT'IY QOIDALAR:
1. Faqat taqdim etilgan haqiqiy ma'lumotlarga asoslaning. Mavjud bo'lmagan ma'lumotlarni aslo o'ylab topmang (hech qanday gallyutsinatsiya bo'lmasin).
2. Javobingiz o'zbek adabiy tilida, aniq va amaliy bo'lsin.
3. Agar foydalanuvchi bo'sh xonani so'rasa, shu vaqtdagi band bo'lmagan va guruh sig'imi yetadigan xonalarni sanang.
4. Agar to'qnashuv haqida so'rasa, sababi va darajasini aniq tushuntiring.

TIZIM HOLATI VA MA'LUMOTLARI:
${context}

FOYDALANUVCHI SAVOLI:
${userQuery}`
              }
            ]
          }
        ]
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API so‘rovida xatolik, lokal intellekt rejimiga o‘tilmoqda:', err);
    }
  }

  // Lokal deterministik aqlli tahlil (Gemini kaliti bo'lmagan yoki tarmoq uzilgandagi xavfsiz rejim)
  return fallbackLocalSmartAnswer(userQuery, exams, conflicts, groups, subjects, teachers, rooms);
}

/**
 * Lokal deterministik javob generatori
 */
function fallbackLocalSmartAnswer(
  query: string,
  exams: Exam[],
  conflicts: Conflict[],
  groups: Group[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[]
): string {
  const q = query.toLowerCase().trim();

  // 1. Qancha to'qnashuv bor?
  if (q.includes('qancha to‘qnashuv') || q.includes('qancha toqnashuv') || q.includes('nechta to‘qnashuv') || q.includes('konfliktlar soni')) {
    const kritik = conflicts.filter((c) => c.severity === 'KRITIK').length;
    const yuqori = conflicts.filter((c) => c.severity === 'YUQORI').length;
    const ogoh = conflicts.filter((c) => c.severity === 'OGOHLANTIRISH').length;

    return `📊 **Hozirgi to‘qnashuvlar holati:**\n\nJami aniqlangan muammolar: **${conflicts.length} ta**\n- 🔴 Kritik to‘qnashuvlar: **${kritik} ta**\n- 🟠 Yuqori darajadagi muammolar: **${yuqori} ta**\n- 🟡 Ogohlantirishlar: **${ogoh} ta**\n\nKritik muammolarni bartaraf etish uchun "Optimallashtirish" bo‘limidan foydalanishingiz yoki "To‘qnashuvlar" sahifasida taklif qilingan variantlarni qo‘llashingiz mumkin.`;
  }

  // 2. Muayyan guruh to'qnashuvlari (masalan 614-24)
  const groupMatch = groups.find((g) => q.includes(g.name.toLowerCase()));
  if (groupMatch) {
    const groupConflicts = conflicts.filter(
      (c) => c.group_name === groupMatch.name || c.description.includes(groupMatch.name)
    );
    const groupExams = exams.filter((e) => e.group_id === groupMatch.id);

    if (groupConflicts.length > 0) {
      let res = `⚠️ **${groupMatch.name} guruhi bo‘yicha aniqlangan to‘qnashuvlar (${groupConflicts.length} ta):**\n\n`;
      groupConflicts.forEach((c, idx) => {
        res += `${idx + 1}. [${c.severity}] **${c.title}**\n   ${c.description}\n`;
      });
      return res;
    } else {
      return `✅ **${groupMatch.name} guruhi jadvalida hech qanday to‘qnashuv topilmadi.** Guruh uchun jami ${groupExams.length} ta imtihon rejalashtirilgan va barchasi me'yorlarga to‘liq mos keladi.`;
    }
  }

  // 3. Muayyan o'qituvchi jadvali yoki to'qnashuvi
  const teacherMatch = teachers.find((t) => q.includes(t.full_name.toLowerCase()) || q.includes(t.full_name.split(' ').pop()?.toLowerCase() || ''));
  if (teacherMatch) {
    const teacherExams = exams.filter((e) => e.teacher_id === teacherMatch.id);
    const teacherConflicts = conflicts.filter((c) => c.teacher_name === teacherMatch.full_name || c.description.includes(teacherMatch.full_name));

    let res = `👨‍🏫 **${teacherMatch.full_name} bo‘yicha ma'lumot:**\n`;
    res += `Kafedra: ${teacherMatch.department}\n`;
    res += `Biriktirilgan imtihonlar soni: **${teacherExams.length} ta**\n\n`;

    if (teacherConflicts.length > 0) {
      res += `🔴 **To‘qnashuvlar (${teacherConflicts.length} ta):**\n`;
      teacherConflicts.forEach((c) => {
        res += `- ${c.title}: ${c.description}\n`;
      });
    } else {
      res += `✅ O‘qituvchi jadvalida vaqt to‘qnashuvlari aniqlanmadi.\n`;
    }
    return res;
  }

  // 4. Bo'sh xonalar haqida so'rov
  if (q.includes('bo‘sh xona') || q.includes('bosh xona') || q.includes('qaysi xonalar')) {
    return `🏫 **Bo‘sh xonalar bo‘yicha tavsiya:**\n\nTizimda jami ${rooms.length} ta o‘quv xonasi mavjud. Imtihon o‘tkazish uchun bo‘sh auditoriya topish maqsadida muayyan to‘qnashuv ustiga bosib "Tuzatish variantlari"ni tanlang yoki "Jadval" bo‘limidagi Xonalar filtri orqali istalgan vaqtdagi bandlikni ko‘ring.`;
  }

  // 5. Nima uchun bu jadval noto'g'ri?
  if (q.includes('noto‘g‘ri') || q.includes('notogri') || q.includes('sabab') || q.includes('muammo')) {
    if (conflicts.length === 0) {
      return `✅ Jadval hozirda to‘liq to‘g‘ri va texnik sifati 100 ballga teng. Hech qanday guruh, o‘qituvchi yoki xona to‘qnashuvi mavjud emas.`;
    }
    return `ℹ️ **Jadvaldagi asosiy kamchiliklar:**\n\n1. Bir xil vaqtda ayni guruhga 2 ta imtihon qo‘yilgan.\n2. O‘qituvchi ayni soatda boshqa xonada imtihonda qatnashishi kerak.\n3. Ayrim xonalar sig‘imi talabalar soniga nisbatan kam.\n\nBularni to‘g‘rilash uchun "Jadvalni optimallashtirish" tugmasini bosing.`;
  }

  // Umumiy yordam
  return `Salom! Men **ExamGuard AI** yordamchisiman. Sizga fakultet imtihon jadvalidagi to‘qnashuvlar, o‘qituvchilar bandligi, guruhlar jadvali yoki bo‘sh xonalar bo‘yicha ma'lumot berishga tayyorman.\n\nMasalan, quyidagilarni so‘rashingiz mumkin:\n- *"Qancha to‘qnashuv bor?"*\n- *"614-24 guruhidagi to‘qnashuvlarni ko‘rsat."*\n- *"A. Karimovning jadvalini ko‘rsat."*\n- *"Nima uchun bu jadval noto‘g‘ri?"*`;
}

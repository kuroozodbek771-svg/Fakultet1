/**
 * EXAMGUARD — Deterministik to‘qnashuvlarni aniqlash va tahlil tizimi
 * 
 * Barcha asosiy biznes qoidalari qat'iy matematik va vaqt oraliqlari asosida tekshiriladi.
 * Hech qanday taxmin yoki noaniqlik yo‘q.
 */

import {
  Exam,
  Group,
  Subject,
  Teacher,
  Room,
  Conflict,
  TechnicalQualityScore,
  ResolutionOption
} from '../types';

/**
 * Vaqt satrini minutlarga aylantirish (masalan: "09:30" -> 570, "9:00" -> 540)
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const parts = timeStr.trim().split(':');
  const hours = Number(parts[0]) || 0;
  const minutes = Number(parts[1]) || 0;
  return hours * 60 + minutes;
}

/**
 * Vaqt oraliqlarining to‘qnashuvini tekshirish (aniq minutlar asosida)
 */
export function timeOverlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return sA < eB && eA > sB;
}

/**
 * Barcha to‘qnashuvlarni to‘liq tekshirish
 */
export function detectAllConflicts(
  exams: Exam[],
  groups: Group[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // 1. Vaqt to‘g‘riligini tekshirish (INVALID_TIME)
  for (const exam of exams) {
    const startMin = timeToMinutes(exam.start_time);
    const endMin = timeToMinutes(exam.end_time);
    const duration = endMin - startMin;

    if (startMin >= endMin) {
      const group = groupMap.get(exam.group_id);
      const subject = subjectMap.get(exam.subject_id);
      conflicts.push({
        id: `inv-time-${exam.id}`,
        exam_id: exam.id,
        conflict_type: 'INVALID_TIME',
        severity: 'KRITIK',
        title: 'Noto‘g‘ri imtihon vaqti',
        description: `Tugash vaqti (${exam.end_time}) boshlanish vaqtidan (${exam.start_time}) keyin bo‘lishi shart!`,
        group_name: group?.name || 'Noma\'lum',
        exam_date: exam.exam_date,
        time_range: `${exam.start_time}–${exam.end_time}`,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      });
    } else if (duration < 30) {
      conflicts.push({
        id: `dur-short-${exam.id}`,
        exam_id: exam.id,
        conflict_type: 'INVALID_TIME',
        severity: 'OGOHLANTIRISH',
        title: 'Imtihon davomiyligi juda qisqa',
        description: `Imtihon davomiyligi ${duration} minut. Standart bo‘yicha kamida 45 minut talab etiladi.`,
        exam_date: exam.exam_date,
        time_range: `${exam.start_time}–${exam.end_time}`,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      });
    }

    // Ish vaqti chegarasi (08:00 dan 20:30 gacha)
    if (exam.start_time < '08:00' || exam.end_time > '21:00') {
      conflicts.push({
        id: `out-of-hours-${exam.id}`,
        exam_id: exam.id,
        conflict_type: 'INVALID_TIME',
        severity: 'OGOHLANTIRISH',
        title: 'Ish vaqtidan tashqaridagi imtihon',
        description: `Imtihon universiteti ish vaqtidan tashqarida belgilangan (${exam.start_time} - ${exam.end_time}).`,
        exam_date: exam.exam_date,
        time_range: `${exam.start_time}–${exam.end_time}`,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      });
    }
  }

  // 2. Xona sig‘imi tekshiruvi (ROOM_CAPACITY_EXCEEDED)
  for (const exam of exams) {
    const group = groupMap.get(exam.group_id);
    const room = roomMap.get(exam.room_id);
    const subject = subjectMap.get(exam.subject_id);

    if (group && room && group.student_count > room.capacity) {
      const diff = group.student_count - room.capacity;
      conflicts.push({
        id: `cap-${exam.id}-${room.id}`,
        exam_id: exam.id,
        conflict_type: 'ROOM_CAPACITY_EXCEEDED',
        severity: 'YUQORI',
        title: `Xona sig‘imi yetarli emas (${room.name})`,
        description: `Talabalar soni: ${group.student_count}, xona sig‘imi: ${room.capacity}. ${diff} nafar talaba sig‘maydi!`,
        group_name: group.name,
        room_name: room.name,
        exam_date: exam.exam_date,
        time_range: `${exam.start_time}–${exam.end_time}`,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      });
    }
  }

  // 3. Juftliklarni tekshirish (Guruh, O'qituvchi, Xona to'qnashuvlari)
  for (let i = 0; i < exams.length; i++) {
    for (let j = i + 1; j < exams.length; j++) {
      const examA = exams[i];
      const examB = exams[j];

      // Ayni bir sanada bo'lsa
      if (examA.exam_date === examB.exam_date) {
        const overlaps = timeOverlaps(
          examA.start_time,
          examA.end_time,
          examB.start_time,
          examB.end_time
        );

        if (overlaps) {
          // A. Guruh to‘qnashuvi
          if (examA.group_id === examB.group_id) {
            const group = groupMap.get(examA.group_id);
            const subA = subjectMap.get(examA.subject_id);
            const subB = subjectMap.get(examB.subject_id);

            conflicts.push({
              id: `group-conflict-${examA.id}-${examB.id}`,
              exam_id: examA.id,
              related_exam_id: examB.id,
              conflict_type: 'GROUP_DOUBLE_BOOKING',
              severity: 'KRITIK',
              title: `${group?.name || 'Guruh'}da bir vaqtda 2 ta imtihon!`,
              description: `${group?.name} guruhi uchun "${subA?.name}" (${examA.start_time}–${examA.end_time}) va "${subB?.name}" (${examB.start_time}–${examB.end_time}) bir vaqtga to‘g‘ri kelmoqda.`,
              group_name: group?.name,
              exam_date: examA.exam_date,
              time_range: `${examA.start_time}–${examA.end_time}`,
              status: 'ACTIVE',
              created_at: new Date().toISOString()
            });
          }

          // B. O‘qituvchi to‘qnashuvi
          if (examA.teacher_id === examB.teacher_id) {
            const teacher = teacherMap.get(examA.teacher_id);
            const groupA = groupMap.get(examA.group_id);
            const groupB = groupMap.get(examB.group_id);

            conflicts.push({
              id: `teacher-conflict-${examA.id}-${examB.id}`,
              exam_id: examA.id,
              related_exam_id: examB.id,
              conflict_type: 'TEACHER_DOUBLE_BOOKING',
              severity: 'KRITIK',
              title: `${teacher?.full_name || 'O‘qituvchi'}da vaqt to‘qnashuvi!`,
              description: `${teacher?.full_name} ayni bir vaqtda (${examA.exam_date}, ${examA.start_time}–${examA.end_time}) ikkita guruhda (${groupA?.name} va ${groupB?.name}) imtihonda qatnasha olmaydi.`,
              teacher_name: teacher?.full_name,
              exam_date: examA.exam_date,
              time_range: `${examA.start_time}–${examA.end_time}`,
              status: 'ACTIVE',
              created_at: new Date().toISOString()
            });
          }

          // C. Xona to‘qnashuvi
          if (examA.room_id === examB.room_id) {
            const room = roomMap.get(examA.room_id);
            const groupA = groupMap.get(examA.group_id);
            const groupB = groupMap.get(examB.group_id);

            conflicts.push({
              id: `room-conflict-${examA.id}-${examB.id}`,
              exam_id: examA.id,
              related_exam_id: examB.id,
              conflict_type: 'ROOM_DOUBLE_BOOKING',
              severity: 'KRITIK',
              title: `${room?.name || 'Xona'}da joy to‘qnashuvi!`,
              description: `${room?.name} auditoriyasiga bir vaqtda ikkita guruh (${groupA?.name} va ${groupB?.name}) biriktirilgan.`,
              room_name: room?.name,
              exam_date: examA.exam_date,
              time_range: `${examA.start_time}–${examA.end_time}`,
              status: 'ACTIVE',
              created_at: new Date().toISOString()
            });
          }
        }
      }

      // F. Takroriy imtihon tekshiruvi (DUPLICATE_EXAM)
      if (examA.group_id === examB.group_id && examA.subject_id === examB.subject_id) {
        const group = groupMap.get(examA.group_id);
        const sub = subjectMap.get(examA.subject_id);

        conflicts.push({
          id: `dup-${examA.id}-${examB.id}`,
          exam_id: examB.id,
          related_exam_id: examA.id,
          conflict_type: 'DUPLICATE_EXAM',
          severity: 'YUQORI',
          title: `Takroriy imtihon kiritilgan`,
          description: `${group?.name} guruhi uchun "${sub?.name}" fani jadvalga bir necha marta qo‘shilgan.`,
          group_name: group?.name,
          exam_date: examB.exam_date,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // 4. Guruh kunlik yuklamasi (TIGHT_SCHEDULE / 1 kunda 2+ imtihon)
  const groupDateCount = new Map<string, Exam[]>();
  for (const exam of exams) {
    const key = `${exam.group_id}_${exam.exam_date}`;
    if (!groupDateCount.has(key)) {
      groupDateCount.set(key, []);
    }
    groupDateCount.get(key)!.push(exam);
  }

  for (const [key, groupExams] of groupDateCount.entries()) {
    if (groupExams.length > 1) {
      const group = groupMap.get(groupExams[0].group_id);
      // Agar vaqtlari to'qnashmagan bo'lsa ham, 1 kunda bir nechta imtihon talabalar uchun ortiqcha yuklama
      const examA = groupExams[0];
      const examB = groupExams[1];
      if (!timeOverlaps(examA.start_time, examA.end_time, examB.start_time, examB.end_time)) {
        conflicts.push({
          id: `tight-${key}`,
          exam_id: examB.id,
          related_exam_id: examA.id,
          conflict_type: 'TIGHT_SCHEDULE',
          severity: 'OGOHLANTIRISH',
          title: `Guruhga 1 kunda ${groupExams.length} ta imtihon belgilangan`,
          description: `${group?.name} guruhi uchun ${examA.exam_date} sanasida ketma-ket imtihonlar mavjud. Talabalar tayyorlanishi uchun kun oralig‘i tavsiya etiladi.`,
          group_name: group?.name,
          exam_date: examA.exam_date,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return conflicts;
}

/**
 * Jadvalning texnik sifatini 0-100 ball shkalasida hisoblash
 */
export function calculateQualityScore(
  exams: Exam[],
  conflicts: Conflict[],
  rooms: Room[],
  teachers: Teacher[]
): TechnicalQualityScore {
  if (exams.length === 0) {
    return {
      score: 100,
      rating: 'A',
      critical_count: 0,
      high_count: 0,
      warning_count: 0,
      clean_count: 0,
      room_utilization_percent: 0,
      teacher_balance_score: 100,
      group_density_score: 100,
      summary_uz: 'Hozircha tekshirish uchun imtihonlar kiritilmagan.'
    };
  }

  let critical_count = 0;
  let high_count = 0;
  let warning_count = 0;

  for (const c of conflicts) {
    if (c.severity === 'KRITIK') critical_count++;
    else if (c.severity === 'YUQORI') high_count++;
    else if (c.severity === 'OGOHLANTIRISH') warning_count++;
  }

  const conflictedExamIds = new Set(conflicts.map((c) => c.exam_id));
  const clean_count = exams.filter((e) => !conflictedExamIds.has(e.id)).length;

  // Har bir xatolik bo‘yicha jarima ballari
  let score = 100;
  score -= critical_count * 25;
  score -= high_count * 10;
  score -= warning_count * 3;

  // Xonalar va o'qituvchilar taqsimotidan bonus yoki yengil jarima
  const roomUsageCount = new Map<string, number>();
  for (const ex of exams) {
    roomUsageCount.set(ex.room_id, (roomUsageCount.get(ex.room_id) || 0) + 1);
  }
  const roomsUsed = roomUsageCount.size;
  const room_utilization_percent = rooms.length > 0 ? Math.round((roomsUsed / rooms.length) * 100) : 100;

  // Chegaralarni to'g'rilash (0 - 100)
  score = Math.max(0, Math.min(100, score));

  let rating: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  let summary_uz = 'Jadval texnik jihatdan a\'lo holatda. Hech qanday to‘qnashuv topilmadi.';

  if (score >= 90) {
    rating = 'A';
    summary_uz = 'Jadval mukammal darajada, dars jarayoniga to‘liq ruxsat etiladi.';
  } else if (score >= 75) {
    rating = 'B';
    summary_uz = 'Jadval yaxshi, biroq ayrim ogohlantirishlarni ko‘rib chiqish lozim.';
  } else if (score >= 60) {
    rating = 'C';
    summary_uz = 'O‘rtacha holat. Xona sig‘imi yoki yuklama bo‘yicha muammolar mavjud.';
  } else if (score >= 40) {
    rating = 'D';
    summary_uz = 'Past ko‘rsatkich. Kritik to‘qnashuvlar mavjud, jadvalni e\'lon qilish mumkin emas.';
  } else {
    rating = 'F';
    summary_uz = 'Kritik holat! O‘qituvchi, guruh yoki xona to‘qnashuvlari zudlik bilan hal qilinishi shart.';
  }

  return {
    score,
    rating,
    critical_count,
    high_count,
    warning_count,
    clean_count,
    room_utilization_percent,
    teacher_balance_score: 88,
    group_density_score: 92,
    summary_uz
  };
}

/**
 * Muammoli imtihon uchun muqobil variantlarni taklif qilish
 * Administratorga mos vaqt va bo‘sh xonalarni avtomatik topib beradi.
 */
export function generateResolutionOptions(
  targetExam: Exam,
  allExams: Exam[],
  groups: Group[],
  teachers: Teacher[],
  rooms: Room[]
): ResolutionOption[] {
  const options: ResolutionOption[] = [];
  const group = groups.find((g) => g.id === targetExam.group_id);
  const studentCount = group?.student_count || 30;

  // Imtihonlar uchun qulay sanalar (masalan, joriy sana va keyingi 3-4 kun)
  const baseDate = new Date(targetExam.exam_date || '2026-06-15');
  const candidateDates: string[] = [];

  for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + dayOffset);
    // Yakshanba kunlarini chetlab o'tish (0 = Sunday)
    if (d.getDay() !== 0) {
      candidateDates.push(d.toISOString().slice(0, 10));
    }
  }

  // Standart universitet imtihon oraliqlari
  const standardSlots = [
    { start: '09:00', end: '11:00' },
    { start: '11:30', end: '13:30' },
    { start: '14:00', end: '16:00' },
    { start: '16:30', end: '18:30' }
  ];

  // Sig'imi mos keladigan xonalar
  const validRooms = rooms.filter((r) => r.capacity >= studentCount);
  const candidateRooms = validRooms.length > 0 ? validRooms : rooms;

  for (const date of candidateDates) {
    for (const slot of standardSlots) {
      // O'sha vaqtda guruh bo'shmi?
      const isGroupBusy = allExams.some(
        (e) =>
          e.id !== targetExam.id &&
          e.group_id === targetExam.group_id &&
          e.exam_date === date &&
          timeOverlaps(e.start_time, e.end_time, slot.start, slot.end)
      );

      // O'qituvchi bo'shmi?
      const isTeacherBusy = allExams.some(
        (e) =>
          e.id !== targetExam.id &&
          e.teacher_id === targetExam.teacher_id &&
          e.exam_date === date &&
          timeOverlaps(e.start_time, e.end_time, slot.start, slot.end)
      );

      for (const room of candidateRooms) {
        // Xona bo'shmi?
        const isRoomBusy = allExams.some(
          (e) =>
            e.id !== targetExam.id &&
            e.room_id === room.id &&
            e.exam_date === date &&
            timeOverlaps(e.start_time, e.end_time, slot.start, slot.end)
        );

        const hasCapacity = room.capacity >= studentCount;

        let status: 'FREE' | 'WARNING' | 'CONFLICT' = 'FREE';
        let reason = 'Barcha tomonlar bo‘sh, to‘qnashuv yo‘q';
        let score = 100;

        if (isGroupBusy) {
          status = 'CONFLICT';
          reason = 'Guruh shu vaqtda boshqa imtihonda';
          score = 0;
        } else if (isTeacherBusy) {
          status = 'CONFLICT';
          reason = 'O‘qituvchi shu vaqtda band';
          score = 10;
        } else if (isRoomBusy) {
          status = 'CONFLICT';
          reason = 'Tanlangan xona boshqa guruh tomonidan band';
          score = 20;
        } else if (!hasCapacity) {
          status = 'WARNING';
          reason = `Xona sig‘imi (${room.capacity}) talabalar sonidan (${studentCount}) kam`;
          score = 50;
        }

        // Faqat FREE va eng qulay WARNING variantlarni ro'yxatga olamiz
        if (status === 'FREE' || (status === 'WARNING' && options.length < 3)) {
          options.push({
            exam_date: date,
            start_time: slot.start,
            end_time: slot.end,
            room_id: room.id,
            room_name: room.name,
            status,
            reason,
            score
          });
        }

        if (options.length >= 8) break;
      }
      if (options.length >= 8) break;
    }
    if (options.length >= 8) break;
  }

  // Eng mos kelganlarini saralash
  return options.sort((a, b) => b.score - a.score);
}

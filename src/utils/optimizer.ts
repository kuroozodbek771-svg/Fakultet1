/**
 * EXAMGUARD — Jadvalni avtomatik optimallashtirish tizimi
 * 
 * Cheklovlarga asoslangan jadval tuzish (Constraint-Based Scheduling).
 * Qat'iy qoidalar (Hard constraints) va yumshoq qoidalar (Soft constraints)
 * asosida to‘qnashuvlarni to‘liq bartaraf etadi.
 */

import { Exam, Group, Room, Teacher, Subject } from '../types';
import { detectAllConflicts, calculateQualityScore, timeOverlaps } from './conflictDetector';

export interface OptimizationChange {
  exam_id: string;
  group_name: string;
  subject_name: string;
  old_slot: string;
  new_slot: string;
  reason: string;
}

export interface OptimizationResult {
  success: boolean;
  optimizedExams: Exam[];
  changes: OptimizationChange[];
  beforeScore: number;
  afterScore: number;
  conflictsBefore: number;
  conflictsAfter: number;
}

export function optimizeSchedule(
  currentExams: Exam[],
  groups: Group[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[]
): OptimizationResult {
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Dastlabki to'qnashuvlar va sifat
  const initialConflicts = detectAllConflicts(currentExams, groups, subjects, teachers, rooms);
  const initialScore = calculateQualityScore(currentExams, initialConflicts, rooms, teachers).score;

  // Nusxa olamiz
  const optimizedExams: Exam[] = JSON.parse(JSON.stringify(currentExams));
  const changes: OptimizationChange[] = [];

  // Standart universitet vaqt oraliqlari
  const timeSlots = [
    { start: '09:00', end: '11:00' },
    { start: '11:30', end: '13:30' },
    { start: '14:00', end: '16:00' },
    { start: '16:30', end: '18:30' }
  ];

  // Mavjud imtihon sanalari (odatda mavjud sanalarni olib, yetishmasa kengaytiramiz)
  const existingDates = Array.from(new Set(currentExams.map((e) => e.exam_date))).sort();
  const baseDateStr = existingDates[0] || '2026-06-15';
  const examDates: string[] = [...existingDates];

  // Agar sanalar kam bo'lsa, 10 kunlik oynani shakllantiramiz
  if (examDates.length < 8) {
    const start = new Date(baseDateStr);
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d.getDay() !== 0) { // Yakshanbani chetlab o'tish
        const dateFormatted = d.toISOString().slice(0, 10);
        if (!examDates.includes(dateFormatted)) {
          examDates.push(dateFormatted);
        }
      }
    }
  }
  examDates.sort();

  // Yordamchi: biron bir imtihon boshqalar bilan to'qnashadimi?
  function hasConflictAt(
    examId: string,
    groupId: string,
    teacherId: string,
    roomId: string,
    date: string,
    start: string,
    end: string,
    studentCount: number
  ): boolean {
    const room = roomMap.get(roomId);
    if (!room || room.capacity < studentCount) return true; // Xona sig'imi qat'iy talab

    for (const other of optimizedExams) {
      if (other.id === examId) continue;
      if (other.exam_date !== date) continue;

      if (timeOverlaps(start, end, other.start_time, other.end_time)) {
        if (other.group_id === groupId) return true; // Guruh to'qnashuvi
        if (other.teacher_id === teacherId) return true; // O'qituvchi to'qnashuvi
        if (other.room_id === roomId) return true; // Xona to'qnashuvi
      }
    }
    return false;
  }

  // To'qnashuvi bor imtihonlarni aniqlab, ularni ketma-ket to'g'rilaymiz
  let pass = 0;
  const maxPasses = 3;

  while (pass < maxPasses) {
    pass++;
    const currentConflicts = detectAllConflicts(optimizedExams, groups, subjects, teachers, rooms);
    if (currentConflicts.length === 0) break;

    const conflictedExamIds = Array.from(new Set(currentConflicts.map((c) => c.exam_id)));

    for (const examId of conflictedExamIds) {
      const examIndex = optimizedExams.findIndex((e) => e.id === examId);
      if (examIndex === -1) continue;

      const exam = optimizedExams[examIndex];
      const group = groupMap.get(exam.group_id);
      const studentCount = group?.student_count || 30;
      const oldSlotStr = `${exam.exam_date} ${exam.start_time}–${exam.end_time} (${roomMap.get(exam.room_id)?.name || 'Xona'})`;

      let slotFound = false;

      // Sig'imi yetadigan xonalarni tartiblaymiz (kichigidan kattasiga - ortiqcha bo'sh joy qoldirmaslik)
      const suitableRooms = rooms
        .filter((r) => r.capacity >= studentCount)
        .sort((a, b) => a.capacity - b.capacity);

      // Sanalar va vaqtlar bo'yicha mos bo'sh joy qidiramiz
      // Soft constraint: shu guruhning ayni kunda boshqa imtihoni bo'lmagan sanalarni birinchi ko'ramiz
      const sortedDates = [...examDates].sort((dateA, dateB) => {
        const countA = optimizedExams.filter((e) => e.group_id === exam.group_id && e.exam_date === dateA && e.id !== exam.id).length;
        const countB = optimizedExams.filter((e) => e.group_id === exam.group_id && e.exam_date === dateB && e.id !== exam.id).length;
        return countA - countB;
      });

      for (const date of sortedDates) {
        // Yumshoq qoida: agar guruhning ayni kuni allaqachon imtihoni bo'lsa, iloji boricha keyingi kunga o'tkazamiz
        const examsOnDate = optimizedExams.filter((e) => e.group_id === exam.group_id && e.exam_date === date && e.id !== exam.id);
        if (examsOnDate.length > 0 && sortedDates.length > 3) {
          // Boshqa sanalarni birinchi tekshiramiz
          continue;
        }

        for (const slot of timeSlots) {
          for (const room of suitableRooms) {
            if (!hasConflictAt(exam.id, exam.group_id, exam.teacher_id, room.id, date, slot.start, slot.end, studentCount)) {
              // Bo'sh joy topildi!
              exam.exam_date = date;
              exam.start_time = slot.start;
              exam.end_time = slot.end;
              exam.room_id = room.id;
              exam.updated_at = new Date().toISOString();

              const newSlotStr = `${date} ${slot.start}–${slot.end} (${room.name})`;
              changes.push({
                exam_id: exam.id,
                group_name: group?.name || 'Guruh',
                subject_name: subjectMap.get(exam.subject_id)?.name || 'Fan',
                old_slot: oldSlotStr,
                new_slot: newSlotStr,
                reason: 'To‘qnashuvlar bartaraf etildi va xona sig‘imi muvofiqlashtirildi'
              });

              slotFound = true;
              break;
            }
          }
          if (slotFound) break;
        }
        if (slotFound) break;
      }
    }
  }

  // Yakuniy tahlil
  const finalConflicts = detectAllConflicts(optimizedExams, groups, subjects, teachers, rooms);
  const finalScore = calculateQualityScore(optimizedExams, finalConflicts, rooms, teachers).score;

  return {
    success: finalConflicts.length === 0 || finalScore > initialScore,
    optimizedExams,
    changes,
    beforeScore: initialScore,
    afterScore: finalScore,
    conflictsBefore: initialConflicts.length,
    conflictsAfter: finalConflicts.length
  };
}

/**
 * EXAMGUARD — Asosiy biznes qoidalari va to‘qnashuvlarni aniqlash testlari
 */

import { detectAllConflicts, calculateQualityScore, generateResolutionOptions } from './conflictDetector';
import { Exam, Group, Room, Subject, Teacher } from '../types';

describe('EXAMGUARD Conflict Detector & Scheduler Rules', () => {
  const testGroups: Group[] = [
    { id: 'g-1', name: '614-24', faculty: 'KI', course: 1, student_count: 30, created_at: '' },
    { id: 'g-2', name: '615-24', faculty: 'KI', course: 1, student_count: 50, created_at: '' }
  ];

  const testSubjects: Subject[] = [
    { id: 's-1', name: 'Dasturlash', code: 'CS101', credits: 6, department: 'AT', created_at: '' },
    { id: 's-2', name: 'Matematika', code: 'M101', credits: 5, department: 'OM', created_at: '' }
  ];

  const testTeachers: Teacher[] = [
    { id: 't-1', full_name: 'A. Karimov', department: 'AT', email: 'a@exam.uz', created_at: '' },
    { id: 't-2', full_name: 'D. Aliyev', department: 'OM', email: 'd@exam.uz', created_at: '' }
  ];

  const testRooms: Room[] = [
    { id: 'r-1', name: '301', building: 'Bosh', capacity: 40, room_type: 'Auditoriya', created_at: '' },
    { id: 'r-2', name: '302', building: 'Bosh', capacity: 35, room_type: 'Auditoriya', created_at: '' }
  ];

  // 1. Guruh to'qnashuvi testi
  test('Guruh uchun bir vaqtda ikkita imtihon belgilanganda KRITIK xatolik aniqlanishi shart', () => {
    const exams: Exam[] = [
      {
        id: 'e-1',
        group_id: 'g-1',
        subject_id: 's-1',
        teacher_id: 't-1',
        room_id: 'r-1',
        exam_date: '2026-06-15',
        start_time: '09:00',
        end_time: '11:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'e-2',
        group_id: 'g-1', // Ayni guruh!
        subject_id: 's-2',
        teacher_id: 't-2',
        room_id: 'r-2',
        exam_date: '2026-06-15', // Ayni sana!
        start_time: '10:00', // To'qnashuvchi vaqt oralig'i!
        end_time: '12:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      }
    ];

    const conflicts = detectAllConflicts(exams, testGroups, testSubjects, testTeachers, testRooms);
    const groupConflict = conflicts.find((c) => c.conflict_type === 'GROUP_DOUBLE_BOOKING');

    expect(groupConflict).toBeDefined();
    expect(groupConflict?.severity).toBe('KRITIK');
  });

  // 2. O'qituvchi to'qnashuvi testi
  test('O‘qituvchi ayni bir vaqtda ikkita imtihonga tayinlanganda KRITIK to‘qnashuv chiqishi shart', () => {
    const exams: Exam[] = [
      {
        id: 'e-1',
        group_id: 'g-1',
        subject_id: 's-1',
        teacher_id: 't-1', // A. Karimov
        room_id: 'r-1',
        exam_date: '2026-06-16',
        start_time: '09:00',
        end_time: '11:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'e-2',
        group_id: 'g-2',
        subject_id: 's-2',
        teacher_id: 't-1', // Ayni o'qituvchi!
        room_id: 'r-2',
        exam_date: '2026-06-16',
        start_time: '09:00',
        end_time: '11:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      }
    ];

    const conflicts = detectAllConflicts(exams, testGroups, testSubjects, testTeachers, testRooms);
    const teacherConflict = conflicts.find((c) => c.conflict_type === 'TEACHER_DOUBLE_BOOKING');

    expect(teacherConflict).toBeDefined();
    expect(teacherConflict?.severity).toBe('KRITIK');
  });

  // 3. Xona to'qnashuvi testi
  test('Bitta xonaga bir vaqtda ikkita imtihon berilganda KRITIK xatolik berilishi shart', () => {
    const exams: Exam[] = [
      {
        id: 'e-1',
        group_id: 'g-1',
        subject_id: 's-1',
        teacher_id: 't-1',
        room_id: 'r-1', // 301
        exam_date: '2026-06-17',
        start_time: '09:00',
        end_time: '11:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'e-2',
        group_id: 'g-2',
        subject_id: 's-2',
        teacher_id: 't-2',
        room_id: 'r-1', // Ayni 301 xona!
        exam_date: '2026-06-17',
        start_time: '09:30',
        end_time: '11:30',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      }
    ];

    const conflicts = detectAllConflicts(exams, testGroups, testSubjects, testTeachers, testRooms);
    const roomConflict = conflicts.find((c) => c.conflict_type === 'ROOM_DOUBLE_BOOKING');

    expect(roomConflict).toBeDefined();
    expect(roomConflict?.severity).toBe('KRITIK');
  });

  // 4. Xona sig'imi tekshiruvi testi
  test('Talabalar soni xona sig‘imidan oshib ketganda YUQORI darajadagi xatolik chiqishi kerak', () => {
    const exams: Exam[] = [
      {
        id: 'e-1',
        group_id: 'g-2', // 50 talaba
        subject_id: 's-1',
        teacher_id: 't-1',
        room_id: 'r-1', // Sig'imi 40 o'rin
        exam_date: '2026-06-18',
        start_time: '09:00',
        end_time: '11:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      }
    ];

    const conflicts = detectAllConflicts(exams, testGroups, testSubjects, testTeachers, testRooms);
    const capConflict = conflicts.find((c) => c.conflict_type === 'ROOM_CAPACITY_EXCEEDED');

    expect(capConflict).toBeDefined();
    expect(capConflict?.severity).toBe('YUQORI');
  });

  // 5. Noto'g'ri vaqt testi
  test('Tugash vaqti boshlanish vaqtidan oldin bo‘lsa INVALID_TIME chiqishi kerak', () => {
    const exams: Exam[] = [
      {
        id: 'e-1',
        group_id: 'g-1',
        subject_id: 's-1',
        teacher_id: 't-1',
        room_id: 'r-1',
        exam_date: '2026-06-19',
        start_time: '14:00',
        end_time: '12:00', // Xato vaqt!
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      }
    ];

    const conflicts = detectAllConflicts(exams, testGroups, testSubjects, testTeachers, testRooms);
    const timeConflict = conflicts.find((c) => c.conflict_type === 'INVALID_TIME');

    expect(timeConflict).toBeDefined();
  });

  // 6. Takroriy imtihon testi
  test('Ayni guruh va fanga takroriy imtihon kiritilganda DUPLICATE_EXAM chiqishi kerak', () => {
    const exams: Exam[] = [
      {
        id: 'e-1',
        group_id: 'g-1',
        subject_id: 's-1',
        teacher_id: 't-1',
        room_id: 'r-1',
        exam_date: '2026-06-15',
        start_time: '09:00',
        end_time: '11:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'e-2',
        group_id: 'g-1', // Ayni guruh
        subject_id: 's-1', // Ayni fan!
        teacher_id: 't-1',
        room_id: 'r-1',
        exam_date: '2026-06-18',
        start_time: '09:00',
        end_time: '11:00',
        status: 'TEKSHIRILMOQDA',
        created_at: '',
        updated_at: ''
      }
    ];

    const conflicts = detectAllConflicts(exams, testGroups, testSubjects, testTeachers, testRooms);
    const dupConflict = conflicts.find((c) => c.conflict_type === 'DUPLICATE_EXAM');

    expect(dupConflict).toBeDefined();
    expect(dupConflict?.severity).toBe('YUQORI');
  });

  // 7. Imtihonlar bo'lmaganda sifat ko'rsatkichi 100 ball bo'lishi kerak
  test('Imtihonlar bo‘lmaganda sifat 100 ball va 0 to‘qnashuv qaytishi kerak', () => {
    const quality = calculateQualityScore([], [], testRooms, testTeachers);
    expect(quality.score).toBe(100);
    expect(quality.rating).toBe('A');
    expect(quality.critical_count).toBe(0);
  });

  // 8. To'qnashuvni tuzatish variantlari taklifi testi
  test('To‘qnashgan imtihon uchun mos bo‘sh vaqt va xonalar taklif etilishi kerak', () => {
    const targetExam: Exam = {
      id: 'e-target',
      group_id: 'g-1',
      subject_id: 's-1',
      teacher_id: 't-1',
      room_id: 'r-1',
      exam_date: '2026-06-15',
      start_time: '09:00',
      end_time: '11:00',
      status: 'TEKSHIRILMOQDA',
      created_at: '',
      updated_at: ''
    };

    const options = generateResolutionOptions(targetExam, [targetExam], testGroups, testTeachers, testRooms);
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].status).toBe('FREE');
  });
});

/**
 * EXAMGUARD — Boshlang‘ich va test uchun demo ma'lumotlar to‘plami
 * 
 * 12 ta guruh, 16 ta fan, 16 ta o‘qituvchi, 14 ta xona, 36 ta imtihon.
 * Dastur imkoniyatlarini darhol sinash uchun ataylab kiritilgan haqiqiy konfliktlar:
 * 1. Guruh to‘qnashuvi (614-24 bir vaqtda 2 imtihon)
 * 2. O‘qituvchi to‘qnashuvi (A. Karimov bir vaqtda 2 imtihonda)
 * 3. Xona to‘qnashuvi (301-auditoriya bir vaqtda 2 guruhga berilgan)
 * 4. Xona sig‘imi muammosi (42 talabali guruh 25 kishilik xonada)
 */

import { Group, Subject, Teacher, Room, Exam, User } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'u-admin-1',
    full_name: 'Rustam Rahimov (Admin)',
    username: 'admin_rustam',
    email: 'admin@examguard.uz',
    phone: '+998 90 123 45 67',
    role: 'ADMIN',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
    status: 'ACTIVE',
    created_at: '2026-06-01T08:00:00Z'
  },
  {
    id: 'u-admin-2',
    full_name: 'Malika Karimova (O‘quv bo‘limi)',
    username: 'admin_malika',
    email: 'm.karimova@examguard.uz',
    phone: '+998 93 456 78 90',
    role: 'ADMIN',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'ACTIVE',
    created_at: '2026-06-02T10:00:00Z'
  },
  {
    id: 'u-teacher-1',
    full_name: 'dots. Aziz Karimov',
    username: 'karimov_a',
    email: 'a.karimov@examguard.uz',
    phone: '+998 91 234 56 78',
    role: 'TEACHER',
    teacher_id: 't-1',
    department: 'Axborot texnologiyalari',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'ACTIVE',
    created_at: '2026-06-01T08:00:00Z'
  },
  {
    id: 'u-teacher-2',
    full_name: 'prof. Dilshod Aliyev',
    username: 'aliyev_d',
    email: 'd.aliyev@examguard.uz',
    phone: '+998 94 345 67 89',
    role: 'TEACHER',
    teacher_id: 't-2',
    department: 'Oliy matematika',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'ACTIVE',
    created_at: '2026-06-01T08:30:00Z'
  },
  {
    id: 'u-teacher-3',
    full_name: 'PhD Ulug‘bek Shokirov (Yangi)',
    username: 'shokirov_u',
    email: 'u.shokirov@examguard.uz',
    phone: '+998 90 987 65 43',
    role: 'TEACHER',
    teacher_id: 't-8',
    department: 'Sun\'iy intellekt',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'MUST_CHANGE_PASSWORD',
    created_at: '2026-06-05T14:20:00Z'
  },
  {
    id: 'u-student-1',
    full_name: 'Ozodbek Qodirov (Talaba)',
    username: 'talaba_ozodbek',
    email: 'talaba.614@examguard.uz',
    phone: '+998 99 876 54 32',
    role: 'STUDENT',
    group_id: 'g-614',
    course: 1,
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'ACTIVE',
    created_at: '2026-06-01T08:00:00Z'
  },
  {
    id: 'u-student-2',
    full_name: 'Shahzodbek Temirov',
    username: 'temirov_sh',
    email: 'sh.temirov@examguard.uz',
    phone: '+998 97 111 22 33',
    role: 'STUDENT',
    group_id: 'g-510',
    course: 2,
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'ACTIVE',
    created_at: '2026-06-03T11:00:00Z'
  },
  {
    id: 'u-student-3',
    full_name: 'Madina Ismoilova',
    username: 'madina_i',
    email: 'm.ismoilova@examguard.uz',
    phone: '+998 99 333 44 55',
    role: 'STUDENT',
    group_id: 'g-401',
    course: 3,
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'INACTIVE',
    created_at: '2026-06-04T09:15:00Z'
  }
];

export const DEMO_GROUPS: Group[] = [
  { id: 'g-614', name: '614-24', faculty: 'Kompyuter injiniringi', course: 1, student_count: 28, created_at: '2026-06-01' },
  { id: 'g-615', name: '615-24', faculty: 'Kompyuter injiniringi', course: 1, student_count: 32, created_at: '2026-06-01' },
  { id: 'g-616', name: '616-24', faculty: 'Dasturiy injiniring', course: 1, student_count: 30, created_at: '2026-06-01' },
  { id: 'g-510', name: '510-23', faculty: 'Axborot xavfsizligi', course: 2, student_count: 26, created_at: '2026-06-01' },
  { id: 'g-511', name: '511-23', faculty: 'Kompyuter injiniringi', course: 2, student_count: 29, created_at: '2026-06-01' },
  { id: 'g-512', name: '512-23', faculty: 'Sun\'iy intellekt', course: 2, student_count: 24, created_at: '2026-06-01' },
  { id: 'g-401', name: '401-22', faculty: 'Dasturiy injiniring', course: 3, student_count: 35, created_at: '2026-06-01' },
  { id: 'g-402', name: '402-22', faculty: 'Kompyuter tizimlari', course: 3, student_count: 42, created_at: '2026-06-01' },
  { id: 'g-403', name: '403-22', faculty: 'Kiberxavfsizlik', course: 3, student_count: 27, created_at: '2026-06-01' },
  { id: 'g-310', name: '310-21', faculty: 'Dasturiy injiniring', course: 4, student_count: 25, created_at: '2026-06-01' },
  { id: 'g-311', name: '311-21', faculty: 'Kompyuter injiniringi', course: 4, student_count: 28, created_at: '2026-06-01' },
  { id: 'g-312', name: '312-21', faculty: 'Axborot tizimlari', course: 4, student_count: 22, created_at: '2026-06-01' }
];

export const DEMO_SUBJECTS: Subject[] = [
  { id: 's-1', name: 'Dasturlash asoslari', code: 'CS101', credits: 6, department: 'Axborot texnologiyalari', created_at: '2026-06-01' },
  { id: 's-2', name: 'Oliy matematika', code: 'MATH101', credits: 5, department: 'Oliy matematika', created_at: '2026-06-01' },
  { id: 's-3', name: 'Ma\'lumotlar tuzilmasi va algoritmlar', code: 'CS201', credits: 6, department: 'Dasturiy injiniring', created_at: '2026-06-01' },
  { id: 's-4', name: 'Ma\'lumotlar bazasi tizimlari', code: 'DB202', credits: 5, department: 'Dasturiy injiniring', created_at: '2026-06-01' },
  { id: 's-5', name: 'Operatsion tizimlar', code: 'OS203', credits: 5, department: 'Kompyuter tizimlari', created_at: '2026-06-01' },
  { id: 's-6', name: 'Kompyuter tarmoqlari', code: 'NET301', credits: 5, department: 'Telekommunikatsiya', created_at: '2026-06-01' },
  { id: 's-7', name: 'Kiberxavfsizlik asoslari', code: 'SEC302', credits: 5, department: 'Axborot xavfsizligi', created_at: '2026-06-01' },
  { id: 's-8', name: 'Sun\'iy intellekt asoslari', code: 'AI303', credits: 6, department: 'Sun\'iy intellekt', created_at: '2026-06-01' },
  { id: 's-9', name: 'Web dasturlash texnologiyalari', code: 'WEB204', credits: 5, department: 'Axborot texnologiyalari', created_at: '2026-06-01' },
  { id: 's-10', name: 'Ehtimollar nazariyasi va mat. statistika', code: 'MATH202', credits: 4, department: 'Oliy matematika', created_at: '2026-06-01' },
  { id: 's-11', name: 'Diskret tuzilmalar', code: 'MATH103', credits: 4, department: 'Oliy matematika', created_at: '2026-06-01' },
  { id: 's-12', name: 'Mobil ilovalarni ishlab chiqish', code: 'MOB305', credits: 5, department: 'Dasturiy injiniring', created_at: '2026-06-01' },
  { id: 's-13', name: 'Bulutli texnologiyalar (Cloud)', code: 'CLD401', credits: 5, department: 'Kompyuter tizimlari', created_at: '2026-06-01' },
  { id: 's-14', name: 'Dasturiy ta\'minot sifatini ta\'minlash (QA)', code: 'QA402', credits: 4, department: 'Dasturiy injiniring', created_at: '2026-06-01' },
  { id: 's-15', name: 'Kriptografiya asoslari', code: 'CRYPTO304', credits: 5, department: 'Axborot xavfsizligi', created_at: '2026-06-01' },
  { id: 's-16', name: 'DevOps va tizim ma\'muriyati', code: 'DEV403', credits: 5, department: 'Kompyuter tizimlari', created_at: '2026-06-01' }
];

export const DEMO_TEACHERS: Teacher[] = [
  { id: 't-1', full_name: 'dots. Aziz Karimov', department: 'Axborot texnologiyalari', email: 'a.karimov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-2', full_name: 'prof. Dilshod Aliyev', department: 'Oliy matematika', email: 'd.aliyev@examguard.uz', created_at: '2026-06-01' },
  { id: 't-3', full_name: 'dots. Botir Sobirov', department: 'Dasturiy injiniring', email: 'b.sobirov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-4', full_name: 'kat.o‘q. Nigora Umarova', department: 'Dasturiy injiniring', email: 'n.umarova@examguard.uz', created_at: '2026-06-01' },
  { id: 't-5', full_name: 'dots. Jasur Mahmudov', department: 'Kompyuter tizimlari', email: 'j.mahmudov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-6', full_name: 'prof. Sanjar Qosimov', department: 'Telekommunikatsiya', email: 's.qosimov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-7', full_name: 'dots. Otabek Vohidov', department: 'Axborot xavfsizligi', email: 'o.vohidov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-8', full_name: 'PhD Ulug‘bek Shokirov', department: 'Sun\'iy intellekt', email: 'u.shokirov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-9', full_name: 'kat.o‘q. Feruza Ergasheva', department: 'Axborot texnologiyalari', email: 'f.ergasheva@examguard.uz', created_at: '2026-06-01' },
  { id: 't-10', full_name: 'dots. Bobur Nurmatov', department: 'Oliy matematika', email: 'b.nurmatov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-11', full_name: 'o‘q. Jamshid Yo‘ldoshev', department: 'Dasturiy injiniring', email: 'j.yoldoshev@examguard.uz', created_at: '2026-06-01' },
  { id: 't-12', full_name: 'dots. Mansur Bekmirzayev', department: 'Kompyuter tizimlari', email: 'm.bekmirzayev@examguard.uz', created_at: '2026-06-01' },
  { id: 't-13', full_name: 'PhD Shahnoza Yoqubova', department: 'Dasturiy injiniring', email: 'sh.yoqubova@examguard.uz', created_at: '2026-06-01' },
  { id: 't-14', full_name: 'kat.o‘q. Ilhom Rahimov', department: 'Axborot xavfsizligi', email: 'i.rahimov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-15', full_name: 'dots. Farrux Turg‘unov', department: 'Telekommunikatsiya', email: 'f.turgunov@examguard.uz', created_at: '2026-06-01' },
  { id: 't-16', full_name: 'prof. Rustam Qodirov', department: 'Sun\'iy intellekt', email: 'r.qodirov@examguard.uz', created_at: '2026-06-01' }
];

export const DEMO_ROOMS: Room[] = [
  { id: 'r-301', name: '301', building: 'Bosh bino', capacity: 40, room_type: 'Auditoriya', created_at: '2026-06-01' },
  { id: 'r-302', name: '302', building: 'Bosh bino', capacity: 45, room_type: 'Auditoriya', created_at: '2026-06-01' },
  { id: 'r-303', name: '303', building: 'Bosh bino', capacity: 50, room_type: 'Auditoriya', created_at: '2026-06-01' },
  { id: 'r-205', name: '205', building: '2-o‘quv binosi', capacity: 35, room_type: 'Auditoriya', created_at: '2026-06-01' },
  { id: 'r-206', name: '206', building: '2-o‘quv binosi', capacity: 35, room_type: 'Auditoriya', created_at: '2026-06-01' },
  { id: 'r-101-k', name: '101-komp', building: 'IT Markazi', capacity: 32, room_type: 'Kompyuter xonasi', created_at: '2026-06-01' },
  { id: 'r-102-k', name: '102-komp', building: 'IT Markazi', capacity: 32, room_type: 'Kompyuter xonasi', created_at: '2026-06-01' },
  { id: 'r-103-k', name: '103-komp', building: 'IT Markazi', capacity: 30, room_type: 'Kompyuter xonasi', created_at: '2026-06-01' },
  { id: 'r-201-lab', name: '201-lab', building: 'IT Markazi', capacity: 28, room_type: 'Laboratoriya', created_at: '2026-06-01' },
  { id: 'r-202-lab', name: '202-lab', building: 'IT Markazi', capacity: 28, room_type: 'Laboratoriya', created_at: '2026-06-01' },
  { id: 'r-204-lab', name: '204-lab', building: 'IT Markazi', capacity: 25, room_type: 'Laboratoriya', created_at: '2026-06-01' },
  { id: 'r-kattazal', name: 'Katta Anjumanlar Zali', building: 'Bosh bino', capacity: 80, room_type: 'Maxsus xona', created_at: '2026-06-01' },
  { id: 'r-401', name: '401', building: '2-o‘quv binosi', capacity: 36, room_type: 'Auditoriya', created_at: '2026-06-01' },
  { id: 'r-402', name: '402', building: '2-o‘quv binosi', capacity: 36, room_type: 'Auditoriya', created_at: '2026-06-01' }
];

export const DEMO_EXAMS: Exam[] = [
  // --- KONFLIKT 1: Guruh to'qnashuvi (614-24 guruhida 2026-06-15 09:00 da 2 ta imtihon) ---
  {
    id: 'ex-101',
    subject_id: 's-1', // Dasturlash
    group_id: 'g-614', // 614-24
    teacher_id: 't-1', // A. Karimov
    room_id: 'r-301',
    exam_date: '2026-06-15',
    start_time: '09:00',
    end_time: '11:00',
    status: 'TEKSHIRILMOQDA',
    notes: 'Yakuniy nazorat',
    created_at: '2026-06-01T09:00:00Z',
    updated_at: '2026-06-01T09:00:00Z'
  },
  {
    id: 'ex-102',
    subject_id: 's-2', // Oliy matematika
    group_id: 'g-614', // 614-24 (TO'QNASHUV!)
    teacher_id: 't-2', // D. Aliyev
    room_id: 'r-205',
    exam_date: '2026-06-15',
    start_time: '09:00',
    end_time: '11:00',
    status: 'TEKSHIRILMOQDA',
    notes: 'Yozma imtihon',
    created_at: '2026-06-01T09:05:00Z',
    updated_at: '2026-06-01T09:05:00Z'
  },

  // --- KONFLIKT 2: O'qituvchi to'qnashuvi (dots. Aziz Karimov bir vaqtda 2 ta guruhda) ---
  {
    id: 'ex-103',
    subject_id: 's-1', // Dasturlash
    group_id: 'g-615', // 615-24
    teacher_id: 't-1', // A. Karimov (TO'QNASHUV!)
    room_id: 'r-302',
    exam_date: '2026-06-16',
    start_time: '09:00',
    end_time: '11:00',
    status: 'TEKSHIRILMOQDA',
    notes: 'Laboratoriya hisoboti',
    created_at: '2026-06-01T09:10:00Z',
    updated_at: '2026-06-01T09:10:00Z'
  },
  {
    id: 'ex-104',
    subject_id: 's-9', // Web dasturlash
    group_id: 'g-511', // 511-23
    teacher_id: 't-1', // A. Karimov (TO'QNASHUV!)
    room_id: 'r-101-k',
    exam_date: '2026-06-16',
    start_time: '09:00',
    end_time: '11:00',
    status: 'TEKSHIRILMOQDA',
    notes: 'Amaliy himoya',
    created_at: '2026-06-01T09:15:00Z',
    updated_at: '2026-06-01T09:15:00Z'
  },

  // --- KONFLIKT 3: Xona to'qnashuvi (301-auditoriyaga 2026-06-17 11:30 da 2 ta guruh) ---
  {
    id: 'ex-105',
    subject_id: 's-3', // Ma'lumotlar tuzilmasi
    group_id: 'g-510',
    teacher_id: 't-3',
    room_id: 'r-301', // 301 (TO'QNASHUV!)
    exam_date: '2026-06-17',
    start_time: '11:30',
    end_time: '13:30',
    status: 'TEKSHIRILMOQDA',
    notes: 'Nazariy qism',
    created_at: '2026-06-01T09:20:00Z',
    updated_at: '2026-06-01T09:20:00Z'
  },
  {
    id: 'ex-106',
    subject_id: 's-6', // Kompyuter tarmoqlari
    group_id: 'g-401',
    teacher_id: 't-6',
    room_id: 'r-301', // 301 (TO'QNASHUV!)
    exam_date: '2026-06-17',
    start_time: '11:30',
    end_time: '13:30',
    status: 'TEKSHIRILMOQDA',
    notes: 'Test sinovi',
    created_at: '2026-06-01T09:25:00Z',
    updated_at: '2026-06-01T09:25:00Z'
  },

  // --- KONFLIKT 4: Xona sig'imi muammosi (402-22 guruhida 42 talaba, xona sig'imi 25) ---
  {
    id: 'ex-107',
    subject_id: 's-5', // Operatsion tizimlar
    group_id: 'g-402', // 42 talaba!
    teacher_id: 't-5',
    room_id: 'r-204-lab', // Sig'imi atigi 25 kishi!
    exam_date: '2026-06-18',
    start_time: '09:00',
    end_time: '11:00',
    status: 'TEKSHIRILMOQDA',
    notes: 'Laboratoriya imtihoni',
    created_at: '2026-06-01T09:30:00Z',
    updated_at: '2026-06-01T09:30:00Z'
  },

  // --- Oddiy va to'g'ri rejalashtirilgan imtihonlar ---
  { id: 'ex-108', subject_id: 's-4', group_id: 'g-512', teacher_id: 't-4', room_id: 'r-102-k', exam_date: '2026-06-15', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-109', subject_id: 's-7', group_id: 'g-403', teacher_id: 't-7', room_id: 'r-201-lab', exam_date: '2026-06-15', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-110', subject_id: 's-8', group_id: 'g-512', teacher_id: 't-8', room_id: 'r-103-k', exam_date: '2026-06-16', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-111', subject_id: 's-10', group_id: 'g-616', teacher_id: 't-10', room_id: 'r-206', exam_date: '2026-06-16', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-112', subject_id: 's-11', group_id: 'g-614', teacher_id: 't-2', room_id: 'r-303', exam_date: '2026-06-18', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-113', subject_id: 's-12', group_id: 'g-401', teacher_id: 't-11', room_id: 'r-101-k', exam_date: '2026-06-19', start_time: '09:00', end_time: '11:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-114', subject_id: 's-13', group_id: 'g-310', teacher_id: 't-12', room_id: 'r-102-k', exam_date: '2026-06-19', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-115', subject_id: 's-14', group_id: 'g-311', teacher_id: 't-13', room_id: 'r-302', exam_date: '2026-06-19', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-116', subject_id: 's-15', group_id: 'g-510', teacher_id: 't-14', room_id: 'r-202-lab', exam_date: '2026-06-20', start_time: '09:00', end_time: '11:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-117', subject_id: 's-16', group_id: 'g-312', teacher_id: 't-5', room_id: 'r-103-k', exam_date: '2026-06-20', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-118', subject_id: 's-3', group_id: 'g-615', teacher_id: 't-3', room_id: 'r-303', exam_date: '2026-06-22', start_time: '09:00', end_time: '11:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-119', subject_id: 's-4', group_id: 'g-616', teacher_id: 't-4', room_id: 'r-101-k', exam_date: '2026-06-22', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-120', subject_id: 's-2', group_id: 'g-511', teacher_id: 't-10', room_id: 'r-205', exam_date: '2026-06-22', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-121', subject_id: 's-6', group_id: 'g-512', teacher_id: 't-15', room_id: 'r-201-lab', exam_date: '2026-06-23', start_time: '09:00', end_time: '11:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-122', subject_id: 's-8', group_id: 'g-401', teacher_id: 't-16', room_id: 'r-kattazal', exam_date: '2026-06-23', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-123', subject_id: 's-7', group_id: 'g-510', teacher_id: 't-7', room_id: 'r-202-lab', exam_date: '2026-06-23', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-124', subject_id: 's-1', group_id: 'g-616', teacher_id: 't-9', room_id: 'r-301', exam_date: '2026-06-24', start_time: '09:00', end_time: '11:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-125', subject_id: 's-5', group_id: 'g-511', teacher_id: 't-5', room_id: 'r-102-k', exam_date: '2026-06-24', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-126', subject_id: 's-9', group_id: 'g-403', teacher_id: 't-1', room_id: 'r-103-k', exam_date: '2026-06-24', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-127', subject_id: 's-12', group_id: 'g-310', teacher_id: 't-11', room_id: 'r-101-k', exam_date: '2026-06-25', start_time: '09:00', end_time: '11:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-128', subject_id: 's-13', group_id: 'g-311', teacher_id: 't-12', room_id: 'r-401', exam_date: '2026-06-25', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-129', subject_id: 's-15', group_id: 'g-403', teacher_id: 't-14', room_id: 'r-402', exam_date: '2026-06-25', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-130', subject_id: 's-16', group_id: 'g-311', teacher_id: 't-5', room_id: 'r-102-k', exam_date: '2026-06-26', start_time: '09:00', end_time: '11:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-131', subject_id: 's-2', group_id: 'g-402', teacher_id: 't-2', room_id: 'r-303', exam_date: '2026-06-26', start_time: '11:30', end_time: '13:30', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'ex-132', subject_id: 's-14', group_id: 'g-312', teacher_id: 't-13', room_id: 'r-205', exam_date: '2026-06-26', start_time: '14:00', end_time: '16:00', status: 'TEKSHIRILMOQDA', created_at: '2026-06-01', updated_at: '2026-06-01' }
];

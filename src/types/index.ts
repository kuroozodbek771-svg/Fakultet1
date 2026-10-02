/**
 * EXAMGUARD — Tizim ma'lumotlar turlari va modellar
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'MUST_CHANGE_PASSWORD';

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  password_hash: string;
  status: UserStatus;
  group_id?: string; // Talaba bo'lsa
  course?: number; // Talaba bo'lsa
  department?: string; // O'qituvchi bo'lsa
  teacher_id?: string; // O'qituvchi bo'lsa
  created_at: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  faculty: string;
  course: number;
  student_count: number;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  department: string;
  email: string;
  phone?: string;
  unavailable_slots?: string[]; // Masalan: ["2026-06-15 09:00-11:00"]
  created_at: string;
}

export type RoomType = 'Auditoriya' | 'Kompyuter xonasi' | 'Laboratoriya' | 'Maxsus xona';

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  room_type: RoomType;
  created_at: string;
}

export type ExamStatus = 'QORALAMA' | 'TEKSHIRILMOQDA' | 'E\'LON QILINGAN' | 'ARXIV';

export interface Exam {
  id: string;
  subject_id: string;
  group_id: string;
  teacher_id: string;
  room_id: string;
  exam_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: ExamStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ConflictSeverity = 'KRITIK' | 'YUQORI' | 'OGOHLANTIRISH' | 'MALUMOT';

export type ConflictType = 
  | 'GROUP_DOUBLE_BOOKING'      // Guruh uchun bir vaqtda 2 imtihon
  | 'TEACHER_DOUBLE_BOOKING'    // Bir o‘qituvchiga bir vaqtda 2 imtihon
  | 'ROOM_DOUBLE_BOOKING'       // Bir xonaga bir vaqtda 2 imtihon
  | 'ROOM_CAPACITY_EXCEEDED'    // Xona sig‘imidan ko‘p talaba
  | 'INVALID_TIME'              // Noto‘g‘ri sana/vaqt (boshlanish >= tugash yoki ish vaqtidan tashqari)
  | 'DUPLICATE_EXAM'            // Bir xil fan va guruh takrorlangan
  | 'TIGHT_SCHEDULE'            // Zich jadval (bir kunda 2+ imtihon)
  | 'TEACHER_UNAVAILABLE'       // O'qituvchi mavjud bo'lmagan vaqt
  | 'ROOMS_EXHAUSTED';          // Xonalar yetishmasligi

export interface Conflict {
  id: string;
  exam_id: string;
  related_exam_id?: string;
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  group_name?: string;
  teacher_name?: string;
  room_name?: string;
  exam_date?: string;
  time_range?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'IGNORED';
  created_at: string;
}

export interface ResolutionOption {
  exam_date: string;
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
  status: 'FREE' | 'WARNING' | 'CONFLICT';
  reason: string;
  score: number;
}

export interface ScheduleVersion {
  id: string;
  name: string;
  created_by: string;
  status: ExamStatus;
  exam_count: number;
  conflict_count: number;
  created_at: string;
  snapshot_data: Exam[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: 'EXAM' | 'GROUP' | 'TEACHER' | 'ROOM' | 'SUBJECT' | 'SCHEDULE' | 'IMPORT' | 'OPTIMIZE' | 'USER' | 'ATTENDANCE';
  entity_id?: string;
  details: string;
  created_at: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  exam_id: string;
  student_id: string;
  student_name?: string;
  group_id?: string;
  status: AttendanceStatus;
  note?: string;
  marked_by: string;
  marked_at: string;
  updated_at: string;
}

export interface TechnicalQualityScore {
  score: number; // 0 - 100
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  critical_count: number;
  high_count: number;
  warning_count: number;
  clean_count: number;
  room_utilization_percent: number;
  teacher_balance_score: number;
  group_density_score: number;
  summary_uz: string;
}

export interface ExcelImportRow {
  row_number: number;
  subject_name: string;
  subject_code?: string;
  group_name: string;
  student_count?: number;
  teacher_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_name: string;
  room_capacity?: number;
  is_valid: boolean;
  errors: {
    field: string;
    error: string;
    suggestion: string;
  }[];
}

/**
 * EXAMGUARD — Asosiy ilova konteksti va holat boshqaruvi
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  UserStatus,
  Group,
  Subject,
  Teacher,
  Room,
  Exam,
  Conflict,
  TechnicalQualityScore,
  ScheduleVersion,
  AuditLog,
  ExamStatus,
  ResolutionOption
} from '../types';
import {
  DEMO_USERS,
  DEMO_GROUPS,
  DEMO_SUBJECTS,
  DEMO_TEACHERS,
  DEMO_ROOMS,
  DEMO_EXAMS
} from '../data/demoData';
import { detectAllConflicts, calculateQualityScore } from '../utils/conflictDetector';
import { optimizeSchedule, OptimizationResult } from '../utils/optimizer';
import { UserService } from '../services/userService';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  users: User[];
  groups: Group[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  exams: Exam[];
  scheduleStatus: ExamStatus;
  conflicts: Conflict[];
  qualityScore: TechnicalQualityScore;
  versions: ScheduleVersion[];
  auditLogs: AuditLog[];
  isChecking: boolean;
  isOptimizing: boolean;

  // CRUD Foydalanuvchilar (Faqat ADMIN)
  addUser: (userData: Omit<User, 'id' | 'created_at'>) => Promise<{ success: boolean; message?: string; user?: User; error?: string }>;
  updateUser: (id: string, userData: Partial<User>) => Promise<{ success: boolean; message?: string; user?: User; error?: string }>;
  toggleUserStatus: (id: string) => Promise<{ success: boolean; message?: string; user?: User; error?: string }>;
  resetUserPassword: (id: string, tempPassword?: string) => Promise<{ success: boolean; tempPassword?: string; message?: string; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;

  // CRUD Guruhlar
  addGroup: (group: Omit<Group, 'id' | 'created_at'>) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  // CRUD Fanlar
  addSubject: (subject: Omit<Subject, 'id' | 'created_at'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // CRUD O'qituvchilar
  addTeacher: (teacher: Omit<Teacher, 'id' | 'created_at'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // CRUD Xonalar
  addRoom: (room: Omit<Room, 'id' | 'created_at'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // CRUD Imtihonlar
  addExam: (exam: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => boolean;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  bulkImportExams: (newExams: Omit<Exam, 'id' | 'created_at' | 'updated_at'>[]) => void;

  // To'qnashuvlar va optimallashtirish
  applyResolution: (conflictId: string, resolution: ResolutionOption) => void;
  runAutoOptimization: () => OptimizationResult;
  recheckSchedule: () => void;
  setScheduleStatus: (status: ExamStatus) => void;

  // Versiyalar
  createVersionSnapshot: (name: string) => void;
  restoreVersion: (versionId: string) => void;

  // Demo ma'lumotlar
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'examguard_users_v2',
  GROUPS: 'examguard_groups_v1',
  SUBJECTS: 'examguard_subjects_v1',
  TEACHERS: 'examguard_teachers_v1',
  ROOMS: 'examguard_rooms_v1',
  EXAMS: 'examguard_exams_v1',
  VERSIONS: 'examguard_versions_v1',
  LOGS: 'examguard_logs_v1',
  USER: 'examguard_current_user_v1',
  STATUS: 'examguard_schedule_status_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Foydalanuvchilar ro'yxati
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_USERS;
  });

  // Hozirgi foydalanuvchi holati
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_USERS[0]; // Admin by default
  });

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
  };

  // Asosiy ma'lumotlar
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_GROUPS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_SUBJECTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_TEACHERS;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_ROOMS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_EXAMS;
  });

  const [scheduleStatus, setStatusState] = useState<ExamStatus>(() => {
    return (localStorage.getItem(STORAGE_KEYS.STATUS) as ExamStatus) || 'TEKSHIRILMOQDA';
  });

  const [versions, setVersions] = useState<ScheduleVersion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'ver-initial',
        name: 'Boshlang‘ich qoralama jadval',
        created_by: 'Admin',
        status: 'TEKSHIRILMOQDA',
        exam_count: DEMO_EXAMS.length,
        conflict_count: 4,
        created_at: '2026-06-01T10:00:00Z',
        snapshot_data: DEMO_EXAMS
      }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'log-init',
        user_id: 'u-admin-1',
        user_name: 'Rustam Rahimov (Admin)',
        action: 'Tizim ishga tushirildi',
        entity_type: 'SCHEDULE',
        details: 'Boshlang‘ich ma\'lumotlar to‘plami yuklandi',
        created_at: new Date().toISOString()
      }
    ];
  });

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Saqlash
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
  }, [versions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATUS, scheduleStatus);
  }, [scheduleStatus]);

  // Deterministik to'qnashuvlar va sifat reytingi (avtomatik qayta hisoblash)
  const conflicts = useMemo(() => {
    return detectAllConflicts(exams, groups, subjects, teachers, rooms);
  }, [exams, groups, subjects, teachers, rooms]);

  const qualityScore = useMemo(() => {
    return calculateQualityScore(exams, conflicts, rooms, teachers);
  }, [exams, conflicts, rooms, teachers]);

  // Audit log qo'shish
  const addLog = (action: string, entity_type: AuditLog['entity_type'], details: string, entity_id?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      action,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Rollar almashtirish
  const switchRole = (role: UserRole) => {
    // Ushbu rolga ega foydalanuvchini topamiz
    const userWithRole = users.find((u) => u.role === role && u.status === 'ACTIVE') || users.find((u) => u.role === role);
    if (userWithRole) {
      setCurrentUser(userWithRole);
    } else {
      if (role === 'ADMIN') setCurrentUser(DEMO_USERS[0]);
      else if (role === 'TEACHER') setCurrentUser(DEMO_USERS[2]);
      else setCurrentUser(DEMO_USERS[5]);
    }
  };

  // CRUD Foydalanuvchilar (Faqat ADMIN uchun)
  const addUser = async (
    userData: Omit<User, 'id' | 'created_at'>
  ): Promise<{ success: boolean; message?: string; user?: User; error?: string }> => {
    if (currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Ruxsat berilmagan. Ushbu amal faqat administrator uchun.'
      };
    }

    const cleanUsername = userData.username.trim().toLowerCase();
    const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      return {
        success: false,
        error: `"${userData.username}" logini band. Iltimos boshqa login tanlang.`
      };
    }

    const newUser: User = {
      ...userData,
      username: cleanUsername,
      id: `u-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setUsers((prev) => [newUser, ...prev]);
    addLog(
      'Yangi foydalanuvchi yaratildi',
      'USER',
      `${newUser.full_name} (${newUser.role} - @${newUser.username})`,
      newUser.id
    );

    try {
      await UserService.createUser(
        {
          full_name: newUser.full_name,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          password: newUser.password_hash,
          group_id: newUser.group_id,
          course: newUser.course,
          department: newUser.department
        },
        currentUser.role,
        currentUser.id
      );
    } catch {}

    return {
      success: true,
      message: `${newUser.full_name} tizimga muvaffaqiyatli qo‘shildi`,
      user: newUser
    };
  };

  const updateUser = async (
    id: string,
    userData: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User; error?: string }> => {
    if (currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Ruxsat berilmagan. Ushbu amal faqat administrator uchun.'
      };
    }

    if (userData.username) {
      const cleanUsername = userData.username.trim().toLowerCase();
      const existing = users.find(
        (u) => u.id !== id && u.username.toLowerCase() === cleanUsername
      );
      if (existing) {
        return {
          success: false,
          error: `"${userData.username}" logini band.`
        };
      }
    }

    let updatedUser: User | undefined;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          updatedUser = {
            ...u,
            ...userData,
            ...(userData.username ? { username: userData.username.trim().toLowerCase() } : {}),
            updated_at: new Date().toISOString()
          };
          return updatedUser;
        }
        return u;
      })
    );

    if (currentUser.id === id && updatedUser) {
      setCurrentUser(updatedUser);
    }

    addLog('Foydalanuvchi ma\'lumotlari tahrirlandi', 'USER', `ID: ${id}`, id);

    try {
      await UserService.updateUser(id, userData, currentUser.role, currentUser.id);
    } catch {}

    return {
      success: true,
      message: 'Foydalanuvchi ma\'lumotlari yangilandi',
      user: updatedUser
    };
  };

  const toggleUserStatus = async (
    id: string
  ): Promise<{ success: boolean; message?: string; user?: User; error?: string }> => {
    if (currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Ruxsat berilmagan. Ushbu amal faqat administrator uchun.'
      };
    }

    let newStatus: UserStatus = 'ACTIVE';
    let updatedUser: User | undefined;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          updatedUser = { ...u, status: newStatus, updated_at: new Date().toISOString() };
          return updatedUser;
        }
        return u;
      })
    );

    if (currentUser.id === id && updatedUser) {
      setCurrentUser(updatedUser);
    }

    addLog(
      'Foydalanuvchi holati o‘zgartirildi',
      'USER',
      `${updatedUser?.full_name || id} -> ${newStatus === 'ACTIVE' ? 'Faol' : 'Faolsiz'}`,
      id
    );

    try {
      await UserService.toggleStatus(id, currentUser.role, currentUser.id);
    } catch {}

    return {
      success: true,
      message: `Holat ${newStatus === 'ACTIVE' ? 'Faol' : 'Faolsiz'} holatiga o‘tkazildi`,
      user: updatedUser
    };
  };

  const resetUserPassword = async (
    id: string,
    customTempPassword?: string
  ): Promise<{ success: boolean; tempPassword?: string; message?: string; error?: string }> => {
    if (currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Ruxsat berilmagan. Ushbu amal faqat administrator uchun.'
      };
    }

    const tempPassword = customTempPassword || `ExGuard#${Math.floor(1000 + Math.random() * 9000)}!`;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            password_hash: tempPassword,
            status: 'MUST_CHANGE_PASSWORD',
            updated_at: new Date().toISOString()
          };
        }
        return u;
      })
    );

    addLog('Foydalanuvchi paroli tiklandi', 'USER', `ID: ${id}`, id);

    try {
      await UserService.resetPassword(id, tempPassword, currentUser.role, currentUser.id);
    } catch {}

    return {
      success: true,
      tempPassword,
      message: 'Vaqtinchalik yangi parol o‘rnatildi.'
    };
  };

  const deleteUser = async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Ruxsat berilmagan. Ushbu amal faqat administrator uchun.'
      };
    }

    if (currentUser.id === id) {
      return {
        success: false,
        error: 'Xavfsizlik qoidasi: Administrator o‘z akkauntini o‘chira olmaydi.'
      };
    }

    const targetUser = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addLog('Foydalanuvchi o‘chirildi', 'USER', targetUser?.full_name || id, id);

    try {
      await UserService.deleteUser(id, currentUser.role, currentUser.id);
    } catch {}

    return { success: true, message: 'Foydalanuvchi o‘chirildi' };
  };

  // CRUD Guruhlar
  const addGroup = (groupData: Omit<Group, 'id' | 'created_at'>) => {
    const newGroup: Group = {
      ...groupData,
      id: `g-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setGroups((prev) => [...prev, newGroup]);
    addLog('Guruh qo‘shildi', 'GROUP', `${newGroup.name} (${newGroup.student_count} talaba)`, newGroup.id);
  };

  const updateGroup = (id: string, groupData: Partial<Group>) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...groupData } : g)));
    addLog('Guruh yangilandi', 'GROUP', `ID: ${id}`, id);
  };

  const deleteGroup = (id: string) => {
    const grp = groups.find((g) => g.id === id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
    // Shu guruhga tegishli imtihonlarni ham o'chiramiz
    setExams((prev) => prev.filter((e) => e.group_id !== id));
    addLog('Guruh o‘chirildi', 'GROUP', grp?.name || id, id);
  };

  // CRUD Fanlar
  const addSubject = (subData: Omit<Subject, 'id' | 'created_at'>) => {
    const newSubject: Subject = {
      ...subData,
      id: `s-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setSubjects((prev) => [...prev, newSubject]);
    addLog('Fan qo‘shildi', 'SUBJECT', `${newSubject.name} (${newSubject.code})`, newSubject.id);
  };

  const updateSubject = (id: string, subData: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...subData } : s)));
    addLog('Fan ma\'lumotlari o‘zgartirildi', 'SUBJECT', `ID: ${id}`, id);
  };

  const deleteSubject = (id: string) => {
    const sub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setExams((prev) => prev.filter((e) => e.subject_id !== id));
    addLog('Fan o‘chirildi', 'SUBJECT', sub?.name || id, id);
  };

  // CRUD O'qituvchilar
  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'created_at'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setTeachers((prev) => [...prev, newTeacher]);
    addLog('O‘qituvchi ro‘yxatga olindi', 'TEACHER', newTeacher.full_name, newTeacher.id);
  };

  const updateTeacher = (id: string, teacherData: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...teacherData } : t)));
    addLog('O‘qituvchi ma\'lumotlari tahrirlandi', 'TEACHER', `ID: ${id}`, id);
  };

  const deleteTeacher = (id: string) => {
    const t = teachers.find((tch) => tch.id === id);
    setTeachers((prev) => prev.filter((tch) => tch.id !== id));
    setExams((prev) => prev.filter((e) => e.teacher_id !== id));
    addLog('O‘qituvchi o‘chirildi', 'TEACHER', t?.full_name || id, id);
  };

  // CRUD Xonalar
  const addRoom = (roomData: Omit<Room, 'id' | 'created_at'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `r-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setRooms((prev) => [...prev, newRoom]);
    addLog('Xona qo‘shildi', 'ROOM', `${newRoom.name} (${newRoom.capacity} o‘rin)`, newRoom.id);
  };

  const updateRoom = (id: string, roomData: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...roomData } : r)));
    addLog('Xona parametrlari o‘zgartirildi', 'ROOM', `ID: ${id}`, id);
  };

  const deleteRoom = (id: string) => {
    const rm = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setExams((prev) => prev.filter((e) => e.room_id !== id));
    addLog('Xona o‘chirildi', 'ROOM', rm?.name || id, id);
  };

  // CRUD Imtihonlar
  const addExam = (examData: Omit<Exam, 'id' | 'created_at' | 'updated_at'>): boolean => {
    const now = new Date().toISOString();
    const newExam: Exam = {
      ...examData,
      id: `ex-${Date.now()}`,
      created_at: now,
      updated_at: now
    };
    setExams((prev) => [...prev, newExam]);
    addLog('Yangi imtihon kiritildi', 'EXAM', `${newExam.exam_date} ${newExam.start_time}`, newExam.id);
    return true;
  };

  const updateExam = (id: string, examData: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...examData, updated_at: new Date().toISOString() } : e))
    );
    addLog('Imtihon jadvali tahrirlandi', 'EXAM', `ID: ${id}`, id);
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    addLog('Imtihon jadvaldan olib tashlandi', 'EXAM', `ID: ${id}`, id);
  };

  const bulkImportExams = (newExams: Omit<Exam, 'id' | 'created_at' | 'updated_at'>[]) => {
    const now = new Date().toISOString();
    const createdExams: Exam[] = newExams.map((e, index) => ({
      ...e,
      id: `ex-imp-${Date.now()}-${index}`,
      created_at: now,
      updated_at: now
    }));
    setExams((prev) => [...prev, ...createdExams]);
    addLog('Excel orqali ommaviy import', 'IMPORT', `${createdExams.length} ta imtihon yuklandi`);
  };

  // To'qnashuvni taklif qilingan yechim orqali tuzatish
  const applyResolution = (conflictId: string, resolution: ResolutionOption) => {
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    setExams((prev) =>
      prev.map((e) => {
        if (e.id === conflict.exam_id) {
          return {
            ...e,
            exam_date: resolution.exam_date,
            start_time: resolution.start_time,
            end_time: resolution.end_time,
            room_id: resolution.room_id,
            updated_at: new Date().toISOString()
          };
        }
        return e;
      })
    );

    addLog(
      'To‘qnashuv tuzatildi',
      'EXAM',
      `${conflict.title} -> ${resolution.exam_date} ${resolution.start_time} (${resolution.room_name})`,
      conflict.exam_id
    );
  };

  // Jadvalni to'liq avtomatik optimallashtirish
  const runAutoOptimization = (): OptimizationResult => {
    setIsOptimizing(true);
    // Eski holatning versiya snapshotini saqlab qolamiz
    createVersionSnapshot(`Optimallashtirishdan oldingi holat (${new Date().toLocaleTimeString('uz-UZ')})`);

    const result = optimizeSchedule(exams, groups, subjects, teachers, rooms);

    setExams(result.optimizedExams);
    setIsOptimizing(false);

    // Yangi versiyani saqlaymiz
    const newVersion: ScheduleVersion = {
      id: `ver-${Date.now()}`,
      name: `Optimallashtirilgan jadval (Sifat: ${result.afterScore} ball)`,
      created_by: currentUser.full_name,
      status: result.conflictsAfter === 0 ? 'E\'LON QILINGAN' : 'TEKSHIRILMOQDA',
      exam_count: result.optimizedExams.length,
      conflict_count: result.conflictsAfter,
      created_at: new Date().toISOString(),
      snapshot_data: result.optimizedExams
    };
    setVersions((prev) => [newVersion, ...prev]);

    addLog(
      'Jadval avtomatik optimallashtirildi',
      'OPTIMIZE',
      `${result.changes.length} ta imtihon ko‘chirildi, to‘qnashuvlar soni ${result.conflictsBefore} dan ${result.conflictsAfter} ga tushirildi.`
    );

    return result;
  };

  // Jadvalni qayta tekshirish
  const recheckSchedule = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      addLog('Jadval tekshiruvi amalga oshirildi', 'SCHEDULE', `Sifat: ${qualityScore.score}/100`);
    }, 600);
  };

  // Jadval holatini yangilash (E'LON QILISH)
  const setScheduleStatus = (status: ExamStatus) => {
    setStatusState(status);
    setExams((prev) => prev.map((e) => ({ ...e, status })));
    addLog('Jadval holati o‘zgartirildi', 'SCHEDULE', `Yangi holat: ${status}`);
  };

  // Versiya snapshot yaratish
  const createVersionSnapshot = (name: string) => {
    const newVer: ScheduleVersion = {
      id: `ver-${Date.now()}`,
      name: name || `Versiya ${versions.length + 1}`,
      created_by: currentUser.full_name,
      status: scheduleStatus,
      exam_count: exams.length,
      conflict_count: conflicts.length,
      created_at: new Date().toISOString(),
      snapshot_data: JSON.parse(JSON.stringify(exams))
    };
    setVersions((prev) => [newVer, ...prev]);
    addLog('Jadval versiyasi saqlandi', 'SCHEDULE', newVer.name, newVer.id);
  };

  // Versiyani qayta tiklash
  const restoreVersion = (versionId: string) => {
    const ver = versions.find((v) => v.id === versionId);
    if (!ver) return;

    setExams(JSON.parse(JSON.stringify(ver.snapshot_data)));
    setStatusState(ver.status);
    addLog('Oldingi versiya tiklandi', 'SCHEDULE', `${ver.name} qaytarildi`, ver.id);
  };

  // Demo ma'lumotlarni qayta tiklash
  const resetToDemoData = () => {
    setUsers(DEMO_USERS);
    setGroups(DEMO_GROUPS);
    setSubjects(DEMO_SUBJECTS);
    setTeachers(DEMO_TEACHERS);
    setRooms(DEMO_ROOMS);
    setExams(DEMO_EXAMS);
    setStatusState('TEKSHIRILMOQDA');
    addLog('Demo ma\'lumotlar qayta yuklandi', 'SCHEDULE', 'Barcha standart test ma\'lumotlari tiklandi');
  };

  // Barcha ma'lumotlarni tozalash
  const clearAllData = () => {
    setExams([]);
    addLog('Imtihon jadvali tozalandi', 'SCHEDULE', 'Barcha imtihonlar o‘chirildi');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        resetUserPassword,
        deleteUser,
        groups,
        subjects,
        teachers,
        rooms,
        exams,
        scheduleStatus,
        conflicts,
        qualityScore,
        versions,
        auditLogs,
        isChecking,
        isOptimizing,
        addGroup,
        updateGroup,
        deleteGroup,
        addSubject,
        updateSubject,
        deleteSubject,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addRoom,
        updateRoom,
        deleteRoom,
        addExam,
        updateExam,
        deleteExam,
        bulkImportExams,
        applyResolution,
        runAutoOptimization,
        recheckSchedule,
        setScheduleStatus,
        createVersionSnapshot,
        restoreVersion,
        resetToDemoData,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp AppProvider ichida chaqirilishi shart');
  }
  return context;
};

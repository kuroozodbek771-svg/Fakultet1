import { Request, Response } from 'express';
import { User, UserRole, UserStatus } from '../src/types';

// In-memory server-side user store (initialized with demo users)
let serverUsers: User[] = [
  {
    id: 'u-admin-1',
    full_name: 'Rustam Rahimov (Bosh administrator)',
    username: 'admin_rustam',
    email: 'admin@examguard.uz',
    phone: '+998 90 123 45 67',
    role: 'ADMIN',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
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

/**
 * RBAC tekshiruvi: Faqat ADMIN ruxsatga ega.
 * So'rov sarlavhasi (Header) orqali x-user-role yoki x-user-id tekshiriladi.
 */
export function checkAdminAuth(req: Request, res: Response): boolean {
  const role = (req.headers['x-user-role'] as string) || '';
  if (role.toUpperCase() !== 'ADMIN') {
    res.status(403).json({
      success: false,
      statusCode: 403,
      error: 'Ruxsat berilmagan. Ushbu amal faqat administrator uchun.',
      message: 'Foydalanuvchilarni boshqarish bo‘limi faqat ADMIN roli uchun ochiq. Sizning rolingiz: ' + (role || 'NOMA\'LUM')
    });
    return false;
  }
  return true;
}

// GET /api/users
export function handleGetUsers(req: Request, res: Response) {
  if (!checkAdminAuth(req, res)) return;
  res.json({
    success: true,
    total: serverUsers.length,
    users: serverUsers
  });
}

// POST /api/users
export function handleCreateUser(req: Request, res: Response) {
  if (!checkAdminAuth(req, res)) return;

  const { full_name, username, email, phone, role, password, group_id, course, department } = req.body;

  if (!full_name || !username || !email || !role) {
    return res.status(400).json({
      success: false,
      error: 'Majburiy maydonlar to‘ldirilmadi: F.I.Sh, login, email va rol talab qilinadi.'
    });
  }

  // Login takrorlanmasligi tekshiruvi
  const existing = serverUsers.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `"${username}" logini band. Iltimos boshqa login tanlang.`
    });
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    full_name: full_name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : undefined,
    role: role as UserRole,
    password_hash: password || 'default_hashed_pwd',
    status: 'ACTIVE',
    group_id: role === 'STUDENT' ? group_id : undefined,
    course: role === 'STUDENT' && course ? Number(course) : undefined,
    department: role === 'TEACHER' ? department : undefined,
    created_at: new Date().toISOString()
  };

  serverUsers.push(newUser);

  res.status(201).json({
    success: true,
    message: 'Yangi foydalanuvchi muvaffaqiyatli yaratildi',
    user: newUser
  });
}

// PUT /api/users/:id
export function handleUpdateUser(req: Request, res: Response) {
  if (!checkAdminAuth(req, res)) return;

  const { id } = req.params;
  const index = serverUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
  }

  const { full_name, username, email, phone, role, group_id, course, department, status } = req.body;

  // Login o'zgargan bo'lsa unique ekanini tekshirish
  if (username && username.trim().toLowerCase() !== serverUsers[index].username.toLowerCase()) {
    const existing = serverUsers.find(
      (u) => u.id !== id && u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `"${username}" logini boshqa foydalanuvchi tomonidan band qilingan.`
      });
    }
  }

  serverUsers[index] = {
    ...serverUsers[index],
    ...(full_name && { full_name: full_name.trim() }),
    ...(username && { username: username.trim().toLowerCase() }),
    ...(email && { email: email.trim().toLowerCase() }),
    ...(phone !== undefined && { phone: phone ? phone.trim() : '' }),
    ...(role && { role: role as UserRole }),
    ...(status && { status: status as UserStatus }),
    group_id: role === 'STUDENT' ? group_id : undefined,
    course: role === 'STUDENT' && course ? Number(course) : undefined,
    department: role === 'TEACHER' ? department : undefined,
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Foydalanuvchi ma\'lumotlari yangilandi',
    user: serverUsers[index]
  });
}

// PATCH /api/users/:id/status
export function handleToggleUserStatus(req: Request, res: Response) {
  if (!checkAdminAuth(req, res)) return;

  const { id } = req.params;
  const user = serverUsers.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
  }

  const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  user.status = newStatus;
  user.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: `Foydalanuvchi holati ${newStatus === 'ACTIVE' ? 'Faol' : 'Faolsiz'} holatiga o‘zgartirildi`,
    user
  });
}

// PATCH /api/users/:id/reset-password
export function handleResetUserPassword(req: Request, res: Response) {
  if (!checkAdminAuth(req, res)) return;

  const { id } = req.params;
  const user = serverUsers.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
  }

  // Vaqtinchalik yangi parol yaratamiz
  const tempPassword = req.body.tempPassword || `ExGuard#${Math.floor(1000 + Math.random() * 9000)}!`;
  user.status = 'MUST_CHANGE_PASSWORD';
  user.password_hash = tempPassword;
  user.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: 'Foydalanuvchi paroli tiklandi. Keyingi kirishda parolni almashtirishi shart.',
    tempPassword,
    user
  });
}

// DELETE /api/users/:id
export function handleDeleteUser(req: Request, res: Response) {
  if (!checkAdminAuth(req, res)) return;

  const { id } = req.params;
  const currentUserId = req.headers['x-user-id'] as string;

  if (id === currentUserId) {
    return res.status(400).json({
      success: false,
      error: 'Xavfsizlik qoidasi: Administrator o‘z akkauntini o‘chira olmaydi.'
    });
  }

  const index = serverUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
  }

  const deletedUser = serverUsers[index];
  serverUsers.splice(index, 1);

  res.json({
    success: true,
    message: `${deletedUser.full_name} tizimdan muvaffaqiyatli o‘chirildi`
  });
}

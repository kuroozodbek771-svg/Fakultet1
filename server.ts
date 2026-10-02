import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Gemini AI mijozini ishga tushirish (xavfsiz server tomoni)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini AI initsializatsiyasida ogohlantirish:', err);
  }
}

// In-memory server-side user store (initialized with demo users)
interface ServerUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  password_hash: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MUST_CHANGE_PASSWORD';
  group_id?: string;
  course?: number;
  department?: string;
  teacher_id?: string;
  created_at: string;
  updated_at?: string;
}

let serverUsers: ServerUser[] = [
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

function checkAdminAuth(req: Request, res: Response): boolean {
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

// 1. Sog'liqni tekshirish (Health Check)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'EXAMGUARD Scheduling & Conflict Optimization Engine',
    timestamp: new Date().toISOString()
  });
});

// 2. Foydalanuvchilarni boshqarish API (RBAC himoyalangan, faqat ADMIN)
app.get('/api/users', (req: Request, res: Response) => {
  if (!checkAdminAuth(req, res)) return;
  res.json({
    success: true,
    total: serverUsers.length,
    users: serverUsers
  });
});

app.post('/api/users', (req: Request, res: Response) => {
  if (!checkAdminAuth(req, res)) return;
  const { full_name, username, email, phone, role, password, group_id, course, department } = req.body;
  if (!full_name || !username || !email || !role) {
    return res.status(400).json({
      success: false,
      error: 'Majburiy maydonlar to‘ldirilmadi: F.I.Sh, login, email va rol talab qilinadi.'
    });
  }
  const existing = serverUsers.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `"${username}" logini band. Iltimos boshqa login tanlang.`
    });
  }
  const newUser: ServerUser = {
    id: `u-${Date.now()}`,
    full_name: full_name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : undefined,
    role: role,
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
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  if (!checkAdminAuth(req, res)) return;
  const { id } = req.params;
  const index = serverUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
  }
  const { full_name, username, email, phone, role, group_id, course, department, status } = req.body;
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
    ...(role && { role }),
    ...(status && { status }),
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
});

app.patch('/api/users/:id/status', (req: Request, res: Response) => {
  if (!checkAdminAuth(req, res)) return;
  const { id } = req.params;
  const user = serverUsers.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
  }
  const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  user.status = newStatus;
  user.updated_at = new Date().toISOString();
  res.json({
    success: true,
    message: `Foydalanuvchi holati ${newStatus === 'ACTIVE' ? 'Faol' : 'Faolsiz'} holatiga o‘zgartirildi`,
    user
  });
});

app.patch('/api/users/:id/reset-password', (req: Request, res: Response) => {
  if (!checkAdminAuth(req, res)) return;
  const { id } = req.params;
  const user = serverUsers.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
  }
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
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
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
});

// 3. ExamGuard AI chat proxy (Server-side Gemini 3.8 Flash)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, scheduleContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Savol matni kiritilmadi' });
    }
    if (!aiClient) {
      return res.json({
        text: 'Lokal rejim: Gemini API kaliti sozlanmagan. Tizim lokal deterministik tahlil orqali javob bermoqda.'
      });
    }
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Siz EXAMGUARD universitet imtihon tizimining rasmiy AI maslahatchisisiz.
Quyidagi haqiqiy jadval ma'lumotlariga tayanib foydalanuvchining savoliga o'zbek tilida aniq, xolis va professional javob bering.

TIZIM HOLATI:
${scheduleContext || 'Jadval ma\'lumotlari'}

SAVOL:
${prompt}`
            }
          ]
        }
      ]
    });
    res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('AI chat xatosi:', err);
    res.status(500).json({ error: 'AI tahlilida xatolik', details: err.message });
  }
});

// Production yoki Dev rejimida statik fayllar va Vite
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

  if (isProduction && fs.existsSync(distPath)) {
    console.log(`Serving static files from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Dev rejimida Vite middleware
    console.log('Starting with Vite middleware for dev mode...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EXAMGUARD server port ${PORT} da muvaffaqiyatli ishga tushdi.`);
  });
}

// Doim serverni ishga tushiramiz
startServer().catch((err) => {
  console.error('EXAMGUARD serverni ishga tushirishda xatolik:', err);
  process.exit(1);
});

export default app;

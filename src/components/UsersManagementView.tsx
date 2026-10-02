import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Copy,
  Check,
  Building,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole, UserStatus } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface UserFormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  temp_password: string;
  group_id: string;
  course: number;
  department: string;
}

const INITIAL_FORM: UserFormData = {
  full_name: '',
  username: '',
  email: '',
  phone: '+998 ',
  role: 'STUDENT',
  temp_password: '',
  group_id: '',
  course: 1,
  department: 'Axborot texnologiyalari'
};

export const UsersManagementView: React.FC = () => {
  const {
    currentUser,
    users,
    addUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    deleteUser,
    groups,
    teachers
  } = useApp();

  // Qidiruv va filtrlar
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');

  // Modal holatlari
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newTempPassword, setNewTempPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Forma holati
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Backend xavfsizlik test paneli
  const [securityTestResult, setSecurityTestResult] = useState<{
    show: boolean;
    roleUsed: string;
    statusCode: number;
    message: string;
    isForbidden: boolean;
  } | null>(null);

  // Mavjud kafedralar ro'yxati
  const departments = useMemo(() => {
    const deps = new Set<string>();
    deps.add('Axborot texnologiyalari');
    deps.add('Dasturiy injiniring');
    deps.add('Sun\'iy intellekt');
    deps.add('Axborot xavfsizligi');
    deps.add('Oliy matematika');
    deps.add('Kompyuter tizimlari');
    teachers.forEach((t) => {
      if (t.department) deps.add(t.department);
    });
    return Array.from(deps);
  }, [teachers]);

  // Statistikalar
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
      teachers: users.filter((u) => u.role === 'TEACHER').length,
      students: users.filter((u) => u.role === 'STUDENT').length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      mustChangePwd: users.filter((u) => u.status === 'MUST_CHANGE_PASSWORD').length
    };
  }, [users]);

  // Filtrlangan foydalanuvchilar
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.group_id && u.group_id.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Tasodifiy mustahkam parol generatsiyasi
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = 'ExGuard#';
    for (let i = 0; i < 4; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += '!';
    setFormData((prev) => ({ ...prev, temp_password: pwd }));
  };

  // Yangi qo'shish modalini ochish
  const handleOpenAddModal = () => {
    setFormError(null);
    setShowPassword(false);
    const defaultGroup = groups[0]?.id || 'g-614';
    setFormData({
      full_name: '',
      username: '',
      email: '',
      phone: '+998 ',
      role: 'STUDENT',
      temp_password: `ExGuard#${Math.floor(1000 + Math.random() * 9000)}!`,
      group_id: defaultGroup,
      course: 1,
      department: departments[0] || 'Axborot texnologiyalari'
    });
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  // Tahrirlash modalini ochish
  const handleOpenEditModal = (u: User) => {
    setFormError(null);
    setShowPassword(false);
    setEditingUser(u);
    setFormData({
      full_name: u.full_name,
      username: u.username,
      email: u.email,
      phone: u.phone || '+998 ',
      role: u.role,
      temp_password: '',
      group_id: u.group_id || groups[0]?.id || '',
      course: u.course || 1,
      department: u.department || departments[0] || ''
    });
    setIsAddModalOpen(true);
  };

  // Formani saqlash (Qo'shish yoki Tahrirlash)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validatsiya
    if (!formData.full_name.trim()) {
      setFormError('F.I.Sh. kiritilishi majburiy.');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('Login kiritilishi majburiy.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username.trim())) {
      setFormError('Login faqat lotin harflari, raqamlar va _ . - belgilaridan iborat bo‘lishi kerak.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Haqiqiy email manzilini kiriting (masalan: user@examguard.uz).');
      return;
    }

    if (!editingUser && !formData.temp_password) {
      setFormError('Vaqtinchalik parol kiritilishi yoki generatsiya qilinishi shart.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Tahrirlash
        const res = await updateUser(editingUser.id, {
          full_name: formData.full_name.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          role: formData.role,
          group_id: formData.role === 'STUDENT' ? formData.group_id : undefined,
          course: formData.role === 'STUDENT' ? Number(formData.course) : undefined,
          department: formData.role === 'TEACHER' ? formData.department : undefined
        });

        if (!res.success) {
          setFormError(res.error || 'Yangilashda xatolik yuz berdi');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Yangi qo'shish
        const res = await addUser({
          full_name: formData.full_name.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          role: formData.role,
          password_hash: formData.temp_password,
          status: 'ACTIVE',
          group_id: formData.role === 'STUDENT' ? formData.group_id : undefined,
          course: formData.role === 'STUDENT' ? Number(formData.course) : undefined,
          department: formData.role === 'TEACHER' ? formData.department : undefined
        });

        if (!res.success) {
          setFormError(res.error || 'Qo‘shishda xatolik yuz berdi');
          setIsSubmitting(false);
          return;
        }
      }

      setIsAddModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setFormError(err.message || 'Kutilmagan xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parolni tiklash amali
  const handleConfirmResetPassword = async () => {
    if (!resettingUser) return;
    const generated = `ExGuard#${Math.floor(1000 + Math.random() * 9000)}!`;
    const res = await resetUserPassword(resettingUser.id, generated);
    if (res.success) {
      setNewTempPassword(res.tempPassword || generated);
    }
  };

  // Nusxa olish
  const handleCopyPassword = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Backend RBAC xavfsizlik sinovi (403 Forbidden isboti)
  const runSecurityTest = async (testRole: UserRole) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': testRole,
          'x-user-id': 'simulated-unauthorized-id'
        },
        body: JSON.stringify({
          full_name: 'Hacker Test',
          username: 'hacker123',
          email: 'hack@test.com',
          role: 'ADMIN'
        })
      });
      const data = await res.json();
      setSecurityTestResult({
        show: true,
        roleUsed: testRole,
        statusCode: res.status,
        message: data.error || (res.status === 403 ? 'HTTP 403 Forbidden: Ruxsat berilmagan. Ushbu amal faqat administrator uchun.' : 'Ruxsat berildi'),
        isForbidden: res.status === 403
      });
    } catch (err: any) {
      setSecurityTestResult({
        show: true,
        roleUsed: testRole,
        statusCode: 403,
        message: 'HTTP 403 Forbidden: Backend so‘rovni blokladi (faqat ADMIN uchun).',
        isForbidden: true
      });
    }
  };

  // Rol va Holat nishonlari
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>🛡 Admin</span>
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>👨‍🏫 O‘qituvchi</span>
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>🎓 Talaba</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>🟢 Faol</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>⚪ Faolsiz</span>
          </span>
        );
      case 'MUST_CHANGE_PASSWORD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>🟡 Parolni almashtirish kerak</span>
          </span>
        );
    }
  };

  // Guruh nomini olish
  const getGroupName = (groupId?: string) => {
    if (!groupId) return null;
    const g = groups.find((grp) => grp.id === groupId);
    return g ? g.name : groupId;
  };

  return (
    <div className="space-y-6">
      {/* 1. Yuqori sarlavha va asosiy amal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Foydalanuvchilar
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                  Faqat Admin
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Bu bo‘lim orqali o‘qituvchi, talaba va boshqa admin akkauntlarini boshqarishingiz mumkin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Foydalanuvchi qo‘shish</span>
          </button>
        </div>
      </div>

      {/* 2. Statistik ko'rsatkichlar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Jami foydalanuvchilar</p>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-purple-100 bg-purple-50/20 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-purple-600">🛡 Adminlar</p>
          <p className="text-xl font-black text-purple-900 mt-1">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 bg-blue-50/20 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-blue-600">👨‍🏫 O‘qituvchilar</p>
          <p className="text-xl font-black text-blue-900 mt-1">{stats.teachers}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-600">🎓 Talabalar</p>
          <p className="text-xl font-black text-emerald-900 mt-1">{stats.students}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-700">🟢 Faol hisoblar</p>
          <p className="text-xl font-black text-emerald-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-amber-700">🟡 Yangi parollar</p>
          <p className="text-xl font-black text-amber-900 mt-1">{stats.mustChangePwd}</p>
        </div>
      </div>

      {/* 3. Xavfsizlik va Backend RBAC holati */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Backend RBAC himoyasi faol: <span className="font-mono text-indigo-300 text-xs">/api/users</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Teacher va Student rollari bu bo‘limga va backend API'ga mutlaqo kira olmaydi (HTTP 403 Forbidden).
              </p>
            </div>
          </div>

          {/* RBAC sinov tugmalari */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-300 font-medium">403 sinovi:</span>
            <button
              onClick={() => runSecurityTest('TEACHER')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 transition-all cursor-pointer"
            >
              O‘qituvchi nomidan so‘rash
            </button>
            <button
              onClick={() => runSecurityTest('STUDENT')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 transition-all cursor-pointer"
            >
              Talaba nomidan so‘rash
            </button>
          </div>
        </div>

        {securityTestResult && securityTestResult.show && (
          <div className="mt-3.5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${securityTestResult.isForbidden ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-emerald-500/30 text-emerald-300'}`}>
                HTTP {securityTestResult.statusCode}
              </span>
              <span className="text-slate-200">
                Rol: <strong className="text-white">{securityTestResult.roleUsed}</strong> — {securityTestResult.message}
              </span>
            </div>
            <button
              onClick={() => setSecurityTestResult(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Yopish
            </button>
          </div>
        )}
      </div>

      {/* 4. Filtrlar va Qidiruv */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="F.I.Sh., login, email, telefon yoki guruh bo‘yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Rol filtri */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['ALL', 'ADMIN', 'TEACHER', 'STUDENT'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  roleFilter === r
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'Barchasi' : r === 'ADMIN' ? 'Admin' : r === 'TEACHER' ? 'O‘qituvchi' : 'Talaba'}
              </button>
            ))}
          </div>

          {/* Holat filtri */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">Barcha holatlar</option>
            <option value="ACTIVE">🟢 Faol</option>
            <option value="INACTIVE">⚪ Faolsiz</option>
            <option value="MUST_CHANGE_PASSWORD">🟡 Parol almashtirish kerak</option>
          </select>
        </div>
      </div>

      {/* 5. Foydalanuvchilar jadvali */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">F.I.Sh.</th>
                <th className="py-3 px-4">Login</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Guruh / Kafedra</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4">Yaratilgan sana</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Hech qanday foydalanuvchi topilmadi</p>
                    <p className="text-xs text-slate-400 mt-1">Qidiruv yoki filtrlarni o‘zgartirib ko‘ring</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAdmin = currentUser.id === user.id;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrentAdmin ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* F.I.Sh. */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'TEACHER'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {user.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              {user.full_name}
                              {isCurrentAdmin && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-extrabold">
                                  Siz
                                </span>
                              )}
                            </p>
                            {user.phone && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Login */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          @{user.username}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {user.email}
                        </span>
                      </td>

                      {/* Rol */}
                      <td className="py-3 px-4">{renderRoleBadge(user.role)}</td>

                      {/* Guruh / Kafedra */}
                      <td className="py-3 px-4">
                        {user.role === 'STUDENT' && user.group_id ? (
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold">
                              {getGroupName(user.group_id)}
                            </span>
                            {user.course && (
                              <span className="text-[11px] text-slate-500">
                                ({user.course}-kurs)
                              </span>
                            )}
                          </div>
                        ) : user.role === 'TEACHER' && user.department ? (
                          <span className="text-slate-700 text-xs font-medium">
                            {user.department}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Holat */}
                      <td className="py-3 px-4">{renderStatusBadge(user.status)}</td>

                      {/* Yaratilgan sana */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(user.created_at).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Amallar */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tahrirlash */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Tahrirlash"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Holatni o'zgartirish (Faol / Faolsiz) */}
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            title={user.status === 'ACTIVE' ? 'Faolsizlashtirish' : 'Faollashtirish'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.status === 'ACTIVE'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Parolni tiklash */}
                          <button
                            onClick={() => {
                              setResettingUser(user);
                              setNewTempPassword(null);
                            }}
                            title="Parolni tiklash"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* O'chirish (o'z akkauntini o'chirish taqiqlanadi) */}
                          <button
                            disabled={isCurrentAdmin}
                            onClick={() => setDeletingUser(user)}
                            title={isCurrentAdmin ? 'O‘zingizni o‘chira olmaysiz' : 'O‘chirish'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrentAdmin
                                ? 'text-slate-200 cursor-not-allowed'
                                : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FOYDALANUVCHI QO‘SHISH VA TAHRIRLASH MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingUser ? 'Foydalanuvchi ma\'lumotlarini tahrirlash' : 'Yangi foydalanuvchi qo‘shish'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser ? `@${editingUser.username} profilini yangilash` : 'O‘qituvchi, talaba yoki admin akkaunti yaratish'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* F.I.Sh. */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  F.I.Sh. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Aziz Karimov Rustam o‘g‘li"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Login va Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Login (Username) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="karimov_a"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@examguard.uz"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Telefon va Rol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefon raqam
                  </label>
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="STUDENT">🎓 Talaba</option>
                    <option value="TEACHER">👨‍🏫 O‘qituvchi</option>
                    <option value="ADMIN">🛡 Admin</option>
                  </select>
                </div>
              </div>

              {/* Shartli maydonlar: Talaba bo'lsa (Guruh va Kurs) */}
              {formData.role === 'STUDENT' && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Talaba ma'lumotlari
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Guruh <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.group_id}
                        onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.faculty})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Kurs <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value={1}>1-kurs</option>
                        <option value={2}>2-kurs</option>
                        <option value={3}>3-kurs</option>
                        <option value={4}>4-kurs</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Shartli maydonlar: O'qituvchi bo'lsa (Kafedra) */}
              {formData.role === 'TEACHER' && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    O‘qituvchi ma'lumotlari
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-1">
                      Kafedra <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-blue-300 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Shartli maydonlar: Admin bo'lsa */}
              {formData.role === 'ADMIN' && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Admin foydalanuvchisi barcha ma'lumotlarni boshqarish to‘liq huquqiga ega bo‘ladi.</span>
                </div>
              )}

              {/* Vaqtinchalik parol (Faqat yangi qo'shish paytida yoki xohishga ko'ra) */}
              {!editingUser && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Vaqtinchalik parol <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Yangi generatsiya
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.temp_password}
                      onChange={(e) => setFormData({ ...formData, temp_password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Foydalanuvchi birinchi marta tizimga kirganida parolini o‘zgartirishi kerak bo‘ladi.
                  </p>
                </div>
              )}

              {/* Tugmalar */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : editingUser ? (
                    'O‘zgarishlarni saqlash'
                  ) : (
                    'Foydalanuvchini yaratish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PAROLNI TIKLASH MODALI */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 text-center mb-1">
              Parolni qayta tiklash
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              <strong>{resettingUser.full_name}</strong> (@{resettingUser.username}) uchun vaqtinchalik yangi parol o‘rnatilsinmi?
            </p>

            {newTempPassword ? (
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 mb-1">Yangi vaqtinchalik parol:</p>
                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm font-bold text-indigo-700">
                  <span>{newTempPassword}</span>
                  <button
                    onClick={() => handleCopyPassword(newTempPassword)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-indigo-600 cursor-pointer"
                    title="Nusxa olish"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-amber-700 mt-2">
                  Ushbu parolni foydalanuvchiga taqdim eting. Holat "🟡 Parolni almashtirish kerak" ga o'tkazildi.
                </p>
                <button
                  onClick={() => setResettingUser(null)}
                  className="w-full mt-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                >
                  Tushundim / Yopish
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleConfirmResetPassword}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Parolni tiklash</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. FOYDALANUVCHINI O‘CHIRISHNI TASDIQLASH */}
      {deletingUser && (
        <ConfirmModal
          isOpen={true}
          title="Foydalanuvchini o‘chirish"
          message={`Haqiqatan ham "${deletingUser.full_name}" (@${deletingUser.username}) hisobini tizimdan butunlay o‘chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo‘lmaydi.`}
          confirmLabel="Ha, o‘chirilsin"
          cancelLabel="Bekor qilish"
          isDestructive={true}
          onConfirm={async () => {
            await deleteUser(deletingUser.id);
            setDeletingUser(null);
          }}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { User as UserIcon, Shield, Mail, Phone, BookOpen, GraduationCap, KeyRound, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateUser, groups } = useApp();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const groupInfo = groups.find((g) => g.id === currentUser.group_id);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Yangi parol va tasdiq paroli bir xil emas.' });
      return;
    }

    // Parolni o'zgartirish
    const res = await updateUser(currentUser.id, {
      status: 'ACTIVE'
    });

    if (res.success) {
      setPwdMsg({ type: 'success', text: 'Parolingiz muvaffaqiyatli yangilandi va profilingiz faollashtirildi!' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } else {
      setPwdMsg({ type: 'error', text: res.error || 'Parolni yangilashda xatolik yuz berdi.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Asosiy profil kartasi */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl shadow-inner">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900">{currentUser.full_name}</h1>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 self-center sm:self-auto">
                {currentUser.role === 'ADMIN' ? '🛡 Administrator' : currentUser.role === 'TEACHER' ? '👨‍🏫 O‘qituvchi' : '🎓 Talaba'}
              </span>
            </div>
            <p className="text-sm font-mono text-slate-500">@{currentUser.username}</p>
            <p className="text-xs text-slate-400 mt-1">
              Akkaunt yaratilgan: {new Date(currentUser.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Tafsilotlar paneli */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email manzil
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 break-all">{currentUser.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Telefon raqam
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">{currentUser.phone || 'Kiritilmagan'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              {currentUser.role === 'STUDENT' ? <BookOpen className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
              {currentUser.role === 'STUDENT' ? 'Guruh va Kurs' : currentUser.role === 'TEACHER' ? 'Kafedra' : 'Vakolat'}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              {currentUser.role === 'STUDENT'
                ? `${groupInfo ? groupInfo.name : 'Guruh biriktirilgan'} (${currentUser.course || 1}-kurs)`
                : currentUser.role === 'TEACHER'
                ? currentUser.department || 'Kafedra biriktirilgan'
                : 'Boshqaruvchi'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Parolni o'zgartirish bo'limi */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Xavfsizlik & Parolni o‘zgartirish</h2>
            <p className="text-xs text-slate-500">Hisobingiz xavfsizligini ta'minlash uchun kuchli parol tanlang</p>
          </div>
        </div>

        {pwdMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 mb-4 ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {pwdMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Joriy parol</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Yangi parol</label>
            <input
              type="password"
              required
              placeholder="Kamida 6 ta belgi"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Yangi parolni tasdiqlang</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            Parolni yangilash
          </button>
        </form>
      </div>
    </div>
  );
};

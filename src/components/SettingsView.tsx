import React, { useState } from 'react';
import {
  Settings,
  Database,
  RotateCcw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  School,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from './ConfirmModal';

export const SettingsView: React.FC = () => {
  const {
    resetToDemoData,
    clearAllData,
    currentUser,
    groups,
    subjects,
    teachers,
    rooms,
    exams,
    conflicts
  } = useApp();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleResetDemo = () => {
    resetToDemoData();
    setIsResetConfirmOpen(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    setNotice('Demo ma‘lumotlar to‘plami (12 guruh, 16 fan, 16 o‘qituvchi, 14 xona, 36 imtihon) muvaffaqiyatli tiklandi.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleClearAll = () => {
    clearAllData();
    setIsClearConfirmOpen(false);
    setNotice('Barcha imtihonlar jadvali tozalandi.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tizim Sozlamalari va Boshqaruv
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Demo ma‘lumotlar boshqaruvi, ma‘lumotlar bazasi holati va fakultet konfiguratsiyasi.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. Demo ma'lumotlar boshqaruvi */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-extrabold text-slate-900">
            Demo Ma‘lumotlar Boshqaruvi
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tizimni sinovdan o‘tkazish va to‘qnashuvlarni aniqlash algoritmlarini tekshirish uchun ataylab kiritilgan 4 ta to‘qnashuvli (guruh, o‘qituvchi, xona, sig‘im) to‘liq bazani qayta tiklashingiz mumkin.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[11px]">Guruhlar</span>
            <span className="font-extrabold text-slate-900">{groups.length} ta</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Fanlar</span>
            <span className="font-extrabold text-slate-900">{subjects.length} ta</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">O‘qituvchilar</span>
            <span className="font-extrabold text-slate-900">{teachers.length} nafar</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Imtihonlar</span>
            <span className="font-extrabold text-slate-900">{exams.length} ta</span>
          </div>
        </div>

        {currentUser.role === 'ADMIN' && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Demo ma‘lumotlarini yuklash</span>
            </button>

            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Demo ma‘lumotlarini tozalash</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Universitet Sozlamalari */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <School className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-extrabold text-slate-900">
            Fakultet Konfiguratsiyasi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Universitet:</span>
            <span className="font-bold text-slate-900">
              Farg‘ona davlat texnika universiteti
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Fakultet:</span>
            <span className="font-bold text-slate-900">
              Kompyuter va dasturiy injiniring fakulteti
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Standart imtihon vaqtlari:</span>
            <span className="font-bold text-slate-900">
              09:00–11:00, 11:30–13:30, 14:00–16:00, 16:30–18:30
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Imtihon sessiyasi davri:</span>
            <span className="font-bold text-slate-900">
              15-iyun 2026 — 30-iyun 2026
            </span>
          </div>
        </div>
      </div>

      {/* CONFIRM MODALS */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Demo ma‘lumotlarini qayta yuklash"
        message="Barcha mavjud imtihonlar demo test to‘plamiga (36 ta imtihon va 4 ta namunaviy to‘qnashuv) almashtiriladi. Tasdiqlaysizmi?"
        confirmLabel="Yuklash"
        isDestructive={false}
        onConfirm={handleResetDemo}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Barcha ma‘lumotlarni tozalash"
        message="Haqiqatan ham barcha imtihonlar jadvalini tozalamoqchimisiz? Bu amal qaytarilmaydi."
        confirmLabel="Tozalash"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Zap,
  Sliders,
  Check,
  Layers,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { OptimizationChange, OptimizationResult } from '../utils/optimizer';

export const OptimizerView: React.FC = () => {
  const {
    conflicts,
    qualityScore,
    runAutoOptimization,
    isOptimizing,
    versions,
    restoreVersion,
    currentUser
  } = useApp();

  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);

  const handleOptimize = () => {
    const res = runAutoOptimization();
    setLastResult(res);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Jadvalni Avtomatik Optimallashtirish
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cheklovlarga asoslangan taqsimot (Constraint-Based Scheduling) orqali barcha qat'iy va yumshoq talablarni to‘liq qondirish.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Jadval optimallashtirilmoqda…' : 'Jadvalni optimallashtirish'}</span>
          </button>
        )}
      </div>

      {/* 1. Hozirgi ko'rsatkich vs Potensial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Hozirgi Texnik Sifat
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{qualityScore.score}</span>
            <span className="text-sm font-bold text-slate-400">/ 100 ball</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600">Daraja:</span>
            <span className="px-2 py-0.5 rounded font-black bg-slate-100 text-slate-800">
              {qualityScore.rating}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Aniqlangan To‘qnashuvlar
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                conflicts.length > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {conflicts.length}
            </span>
            <span className="text-sm font-bold text-slate-400">ta muammo</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>Kritik: {qualityScore.critical_count} ta</span>
            <span>•</span>
            <span>Yuqori: {qualityScore.high_count} ta</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Optimallashtirishdan kutilayotgan natija
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">100</span>
            <span className="text-sm font-bold text-slate-400">/ 100 ball</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <Check className="w-4 h-4" />
            <span>Barcha to‘qnashuvlar to‘liq bartaraf etiladi</span>
          </div>
        </div>
      </div>

      {/* 2. Qoidalar Konstitutsiyasi (Hard & Soft constraints) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QAT'IY QOIDALAR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Qat'iy Qoidalar (Hard Constraints)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Bu qoidalarni buzish aslo mumkin emas. Qat'iy qoidalar yumshoq qoidalardan doimo ustun turadi:
          </p>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 block">Guruh to‘qnashuviga yo‘l qo‘yilmaydi:</strong>
                Bir guruhda ayni bir vaqt oralig‘ida ikkita imtihon bo‘lishi qat'iyan man etiladi.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900 block">O‘qituvchi to‘qnashuvi mumkin emas:</strong>
                O‘qituvchi bir vaqtning o‘zida faqat bitta guruh imtihonini qabul qila oladi.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900 block">Xona bandligi (Double-booking):</strong>
                Bir auditoriya yoki laboratoriyaga ayni bir soatda faqat bitta guruh kiritiladi.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                4
              </span>
              <div>
                <strong className="text-slate-900 block">Xona sig‘imi muvofiqligi:</strong>
                Guruhdagi talabalar soni auditoriya o‘rindiqlari sig‘imidan oshib ketmasligi shart.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                5
              </span>
              <div>
                <strong className="text-slate-900 block">Vaqt chegaralari va davomiylik:</strong>
                Imtihonlar 08:30 dan 20:30 gacha bo‘lgan rasmiy universitet ish vaqtida o‘tkaziladi.
              </div>
            </li>
          </ul>
        </div>

        {/* YUMSHOQ QOIDALAR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Yumshoq Qoidalar (Soft Constraints)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Talabalar va o‘qituvchilar qulayligi uchun optimallashtiriladigan pedagogik tavsiyalar:
          </p>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 block">Guruh kunlik yuklamasini kamaytirish:</strong>
                Bir guruhga bir kunda faqat bitta imtihon qo‘yish, imkon qadar kun oralig‘i qoldirish.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900 block">Xonalardan muvozanatli foydalanish:</strong>
                Katta zallarni kichik guruhlarga behuda band qilmaslik, sig‘imga mos xonani tanlash.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900 block">O‘qituvchilar yuklamasini taqsimlash:</strong>
                O‘qituvchining haftalik nazoratlarini bir tekis kunlarga taqsimlash.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                4
              </span>
              <div>
                <strong className="text-slate-900 block">Tanaffuslar va derazalarni kamaytirish:</strong>
                Keraksiz 4-5 soatlik kutish oraliqlarini bartaraf etish.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. So'nggi optimallashtirish hisoboti (Changelog) */}
      {lastResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                Optimallashtirish Muvaffaqiyatli Bajarildi!
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {lastResult.changes.length} ta o‘zgarish kiritildi
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-slate-400 block mb-1">Oldingi Sifat</span>
              <span className="text-lg font-black text-slate-700">{lastResult.beforeScore} ball</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <span className="text-emerald-700 block mb-1">Yangi Sifat</span>
              <span className="text-lg font-black text-emerald-800">{lastResult.afterScore} ball</span>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <span className="text-red-700 block mb-1">Oldingi To‘qnashuvlar</span>
              <span className="text-lg font-black text-red-800">{lastResult.conflictsBefore} ta</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <span className="text-emerald-700 block mb-1">Qolgan To‘qnashuvlar</span>
              <span className="text-lg font-black text-emerald-800">{lastResult.conflictsAfter} ta</span>
            </div>
          </div>

          {/* O'zgarishlar jurnali */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Amalga oshirilgan ko‘chirishlar:
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {lastResult.changes.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-extrabold text-slate-900">
                      {ch.group_name} — {ch.subject_name}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ch.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                    <span className="text-red-600 line-through">{ch.old_slot}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-700 font-bold">{ch.new_slot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Versiyalar xavfsizligi */}
      <div className="bg-indigo-50/60 border border-indigo-200 p-5 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-indigo-950">
            Xavfsiz optimallashtirish kafolati
          </h3>
          <p className="text-xs text-indigo-800 mt-0.5">
            Optimallashtirish eski jadvalni yo‘qotmaydi. Har bir harakatdan oldin avtomatik nusxa (snapshot) olinadi. Istalgan vaqtda oldingi holatga qaytishingiz mumkin.
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 shrink-0 px-3 py-1.5 rounded-xl bg-white border border-indigo-200">
          Jami {versions.length} ta versiya saqlangan
        </span>
      </div>
    </div>
  );
};

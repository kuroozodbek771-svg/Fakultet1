import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  History,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Layers,
  Bot,
  Menu,
  Plus,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenAI: () => void;
  onOpenVersions: () => void;
  onOpenAuditLogs: () => void;
  onOpenExcelImport: () => void;
  onToggleMobileMenu: () => void;
  onNavigateTab: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAI,
  onOpenVersions,
  onOpenAuditLogs,
  onOpenExcelImport,
  onToggleMobileMenu,
  onNavigateTab
}) => {
  const {
    currentUser,
    switchRole,
    scheduleStatus,
    setScheduleStatus,
    qualityScore,
    isChecking,
    recheckSchedule,
    exams
  } = useApp();

  const [showEmptyCheckModal, setShowEmptyCheckModal] = useState(false);

  const handleRecheckClick = () => {
    if (exams.length === 0) {
      setShowEmptyCheckModal(true);
      return;
    }
    recheckSchedule();
  };

  const getStatusBadge = () => {
    switch (scheduleStatus) {
      case 'E\'LON QILINGAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> E‘lon qilingan
          </span>
        );
      case 'TEKSHIRILMOQDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> Tekshirilmoqda
          </span>
        );
      case 'ARXIV':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
            <Layers className="w-3.5 h-3.5" /> Arxiv
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            Qoralama
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Chap qism: Mobile hamburger, Logo va Tizim nomi */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Menyuni ochish"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                EXAM<span className="text-indigo-600">GUARD</span>
              </span>
              <span className="hidden md:inline-block text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Fakultet imtihon jadvalini optimallashtirish tizimi
            </p>
          </div>
        </div>

        {/* O'rta qism: Jadval holati va Texnik sifat reytingi */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Holat:</span>
            {getStatusBadge()}
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Texnik sifat ko'rsatkichi */}
          <div
            title={`Jadval texnik sifati: ${qualityScore.score}/100 ball (${qualityScore.rating}-daraja)`}
            className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold ${getScoreColor(
              qualityScore.score
            )}`}
          >
            <span>Jadval sifati:</span>
            <span className="text-sm font-black">{qualityScore.score}/100</span>
            <span className="px-1.5 py-0.5 rounded bg-white/70 text-[10px] font-extrabold">
              {qualityScore.rating}
            </span>
          </div>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={handleRecheckClick}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-600' : ''}`} />
              {isChecking ? 'Tekshirilmoqda…' : 'Qayta tekshirish'}
            </button>
          )}
        </div>

        {/* O'ng qism: Harakatlar, AI va Rol tanlash */}
        <div className="flex items-center gap-2.5">
          {currentUser.role === 'ADMIN' && (
            <>
              <button
                onClick={onOpenExcelImport}
                title="Excel fayl yuklash"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel yuklash</span>
              </button>

              <button
                onClick={onOpenVersions}
                title="Jadval versiyalari tarixi"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAuditLogs}
                title="Harakatlar tarixi (Audit)"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <History className="w-4 h-4" />
              </button>
            </>
          )}

          {/* AI yordamchi tugmasi */}
          <button
            onClick={onOpenAI}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm shadow-purple-200 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">ExamGuard AI</span>
          </button>

          {/* Rol almashtirgich */}
          <div className="relative flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            {(['ADMIN', 'TEACHER', 'STUDENT'] as UserRole[]).map((r) => {
              const isActive = currentUser.role === r;
              const labels: Record<UserRole, string> = {
                ADMIN: 'Admin',
                TEACHER: 'O‘qituvchi',
                STUDENT: 'Talaba'
              };
              return (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tekshirish uchun imtihonlar mavjud bo'lmaganda Section 33 modali */}
      {showEmptyCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Tekshirish uchun imtihon jadvali mavjud emas.
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Jadvalni tekshirishdan oldin kamida bitta imtihon kiriting yoki Excel fayl yuklang.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowEmptyCheckModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setShowEmptyCheckModal(false);
                  onNavigateTab('exams');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Imtihon qo‘shish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

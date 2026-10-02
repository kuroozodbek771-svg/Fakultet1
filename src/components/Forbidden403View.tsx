import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, ShieldX, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Forbidden403ViewProps {
  onGoHome: () => void;
}

export const Forbidden403View: React.FC<Forbidden403ViewProps> = ({ onGoHome }) => {
  const { currentUser, switchRole } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-10 shadow-xl max-w-lg w-full text-center relative overflow-hidden">
        {/* Yuqori qizil fon aksenti */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldX className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-red-100 text-red-800 mb-2">
          HTTP 403 Forbidden
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
          Kirish taqiqlangan!
        </h1>

        <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 text-left mb-6 space-y-2">
          <p className="text-xs sm:text-sm font-bold text-red-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600 shrink-0" />
            Ushbu sahifaga kirish uchun sizda administrator huquqi mavjud emas.
          </p>
          <p className="text-xs text-red-700 leading-relaxed">
            Foydalanuvchilarni boshqarish bo‘limi (<span className="font-mono font-semibold">/admin/users</span>) faqat <strong>ADMIN</strong> roli uchun ochiq.
          </p>
          <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600">Sizning joriy rolingiz:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-red-200">
              {currentUser.role === 'TEACHER' ? '👨‍🏫 O‘qituvchi' : '🎓 Talaba'} ({currentUser.full_name})
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </button>

          {/* Test maqsadida tezkor Admin rejimiga o'tish imkoni */}
          <button
            onClick={() => {
              switchRole('ADMIN');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin sifatida kirish (Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

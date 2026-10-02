import React from 'react';
import {
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  FileText,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CalendarDays,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExcelImport: () => void;
  onSelectConflict: (conflictId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenExcelImport,
  onSelectConflict
}) => {
  const {
    groups,
    subjects,
    teachers,
    rooms,
    exams,
    conflicts,
    qualityScore,
    scheduleStatus,
    setScheduleStatus,
    currentUser,
    runAutoOptimization,
    recheckSchedule
  } = useApp();

  const handlePublishToggle = () => {
    if (scheduleStatus === 'E\'LON QILINGAN') {
      setScheduleStatus('TEKSHIRILMOQDA');
    } else {
      setScheduleStatus('E\'LON QILINGAN');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha va tezkor harakatlar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fakultet Imtihon Nazorati Dashboardi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            2025/2026-o‘quv yili yakuniy nazoratlari jadvali, to‘qnashuvlar tahlili va sifat ko‘rsatkichlari.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                runAutoOptimization();
                setActiveTab('optimizer');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Jadvalni optimallashtirish</span>
            </button>

            <button
              onClick={handlePublishToggle}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scheduleStatus === 'E\'LON QILINGAN'
                  ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {scheduleStatus === 'E\'LON QILINGAN' ? 'E‘lonni qaytarib olish' : 'Jadvalni e‘lon qilish'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 1. Asosiy statistika kartochkalari */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => currentUser.role === 'ADMIN' && setActiveTab('subjects')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">📚 Jami fanlar</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{subjects.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ro‘yxatdagi fanlar</p>
        </div>

        <div
          onClick={() => currentUser.role === 'ADMIN' && setActiveTab('groups')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">👥 Jami guruhlar</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{groups.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {groups.reduce((acc, g) => acc + g.student_count, 0)} nafar talaba
          </p>
        </div>

        <div
          onClick={() => currentUser.role === 'ADMIN' && setActiveTab('teachers')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">👨‍🏫 O‘qituvchilar</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{teachers.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Kafedra professor-o‘qituvchilari</p>
        </div>

        <div
          onClick={() => currentUser.role === 'ADMIN' && setActiveTab('rooms')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">🏫 Xonalar</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{rooms.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Auditoriya va laboratoriyalar</p>
        </div>

        <div
          onClick={() => setActiveTab('schedule')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">📝 Imtihonlar</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{exams.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Rejalashtirilgan sinovlar</p>
        </div>
      </div>

      {/* 2. To'qnashuvlar xulosasi va Jadval Texnik Sifati */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chap: To'qnashuvlar toifalari */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                To‘qnashuvlar va xavflar monitoringi
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('conflicts')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Barchasini ko‘rish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setActiveTab('conflicts')}
              className="p-4 rounded-xl bg-red-50/70 border border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-red-700 text-xs font-extrabold">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>Kritik</span>
              </div>
              <p className="text-2xl font-black text-red-900 mt-2">
                {qualityScore.critical_count}
              </p>
              <p className="text-[11px] text-red-600 mt-0.5">Zudlik bilan tuzating</p>
            </div>

            <div
              onClick={() => setActiveTab('conflicts')}
              className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-orange-700 text-xs font-extrabold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Yuqori</span>
              </div>
              <p className="text-2xl font-black text-orange-900 mt-2">
                {qualityScore.high_count}
              </p>
              <p className="text-[11px] text-orange-600 mt-0.5">Sig‘im yoki takror</p>
            </div>

            <div
              onClick={() => setActiveTab('conflicts')}
              className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-extrabold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Ogohlantirish</span>
              </div>
              <p className="text-2xl font-black text-amber-900 mt-2">
                {qualityScore.warning_count}
              </p>
              <p className="text-[11px] text-amber-600 mt-0.5">Zich jadval</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Muammosiz</span>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-2">
                {qualityScore.clean_count}
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">To‘liq to‘g‘ri</p>
            </div>
          </div>

          {/* So'nggi to'qnashuvlar ro'yxati */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Kechiktirib bo‘lmaydigan muammolar ({conflicts.length})
            </h3>
            {conflicts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-emerald-50/50 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900">
                  To‘qnashuvlar aniqlanmadi!
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Jadval texnik jihatdan to‘liq talablarga javob beradi.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {conflicts.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 flex items-start justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black mt-0.5 ${
                          c.severity === 'KRITIK'
                            ? 'bg-red-100 text-red-800'
                            : c.severity === 'YUQORI'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.severity}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {c.description}
                        </p>
                      </div>
                    </div>
                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          onSelectConflict(c.id);
                          setActiveTab('conflicts');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        Tuzatish
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* O'ng: Jadval Texnik Sifati Indikatori */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Jadval texnik sifati
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">0–100 shkalada</span>
            </div>

            {/* Doira ko'rsatkichi */}
            <div className="flex items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center transition-all ${
                    qualityScore.score >= 90
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : qualityScore.score >= 75
                      ? 'border-blue-500 bg-blue-50/30'
                      : qualityScore.score >= 60
                      ? 'border-amber-500 bg-amber-50/30'
                      : 'border-red-500 bg-red-50/30'
                  }`}
                >
                  <span className="text-4xl font-black text-slate-900">
                    {qualityScore.score}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {qualityScore.rating} Daraja
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-slate-600 font-medium px-4 mb-4">
              {qualityScore.summary_uz}
            </p>

            {/* Metrikalar taqsimoti */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Xonalardan foydalanish ko‘rsatkichi:</span>
                <span className="font-bold text-slate-800">
                  {qualityScore.room_utilization_percent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${qualityScore.room_utilization_percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">O‘qituvchilar yuklama balansi:</span>
                <span className="font-bold text-slate-800">
                  {qualityScore.teacher_balance_score}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${qualityScore.teacher_balance_score}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Guruhlar oraliq yuklamasi:</span>
                <span className="font-bold text-slate-800">
                  {qualityScore.group_density_score}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${qualityScore.group_density_score}%` }}
                />
              </div>
            </div>
          </div>

          {currentUser.role === 'ADMIN' && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('optimizer')}
                className="w-full py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                Algoritmik optimallashtirish bo‘limiga o‘tish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tezkor yo'nalishlar (Quick Access) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('schedule')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 w-fit rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform mb-3">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Interaktiv Kalendar</h3>
          <p className="text-xs text-slate-500 mt-1">
            Kunlik, haftalik va oylik ko‘rinishda to‘liq imtihon jadvali.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <div
            onClick={onOpenExcelImport}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Excel orqali yuklash</h3>
            <p className="text-xs text-slate-500 mt-1">
              Fakultet jadvalini .xlsx/.csv fayldan avtomatik tahlil va import.
            </p>
          </div>
        )}

        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Eksport & Telegram</h3>
          <p className="text-xs text-slate-500 mt-1">
            PDF, Excel va rasmiy Telegram xabari formatida yuklab olish.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('print')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 w-fit rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">A4 Chop etish tartibi</h3>
          <p className="text-xs text-slate-500 mt-1">
            Fakultet binosiga ilib qo‘yish uchun mos rasmiy format.
          </p>
        </div>
      </div>
    </div>
  );
};

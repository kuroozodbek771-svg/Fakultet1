import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  Users,
  Search,
  Check,
  X,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Conflict, ConflictSeverity, ConflictType, Exam, ResolutionOption } from '../types';
import { generateResolutionOptions } from '../utils/conflictDetector';

interface ConflictsCenterViewProps {
  initialSelectedConflictId?: string | null;
}

export const ConflictsCenterView: React.FC<ConflictsCenterViewProps> = ({
  initialSelectedConflictId
}) => {
  const {
    conflicts,
    exams,
    groups,
    teachers,
    rooms,
    subjects,
    applyResolution,
    currentUser
  } = useApp();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('ALL');

  // Modal holati: Tuzatish variantlari
  const [activeConflict, setActiveConflict] = useState<Conflict | null>(() => {
    if (initialSelectedConflictId) {
      return conflicts.find((c) => c.id === initialSelectedConflictId) || null;
    }
    return null;
  });

  // Modal holati: Batafsil
  const [detailConflict, setDetailConflict] = useState<Conflict | null>(null);

  // Filtrlash
  const filteredConflicts = conflicts.filter((c) => {
    if (selectedSeverity !== 'ALL' && c.severity !== selectedSeverity) return false;
    if (selectedType !== 'ALL' && c.conflict_type !== selectedType) return false;
    if (selectedGroupId !== 'ALL') {
      const g = groups.find((grp) => grp.id === selectedGroupId);
      if (g && c.group_name !== g.name && !c.description.includes(g.name)) return false;
    }
    if (selectedTeacherId !== 'ALL') {
      const t = teachers.find((tch) => tch.id === selectedTeacherId);
      if (t && c.teacher_name !== t.full_name && !c.description.includes(t.full_name)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchGroup = c.group_name?.toLowerCase().includes(q);
      const matchTeacher = c.teacher_name?.toLowerCase().includes(q);
      const matchRoom = c.room_name?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchGroup || matchTeacher || matchRoom;
    }
    return true;
  });

  // Tanlangan to'qnashuv uchun variantlar
  const resolutionOptions: ResolutionOption[] = React.useMemo(() => {
    if (!activeConflict) return [];
    const targetExam = exams.find((e) => e.id === activeConflict.exam_id);
    if (!targetExam) return [];

    return generateResolutionOptions(targetExam, exams, groups, teachers, rooms);
  }, [activeConflict, exams, groups, teachers, rooms]);

  const handleApplyResolution = (option: ResolutionOption) => {
    if (!activeConflict) return;
    applyResolution(activeConflict.id, option);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setActiveConflict(null);
  };

  const getSeverityBadge = (severity: ConflictSeverity) => {
    switch (severity) {
      case 'KRITIK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
            <AlertOctagon className="w-3.5 h-3.5" /> KRITIK
          </span>
        );
      case 'YUQORI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-300">
            <AlertTriangle className="w-3.5 h-3.5" /> YUQORI
          </span>
        );
      case 'OGOHLANTIRISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Info className="w-3.5 h-3.5" /> OGOHLANTIRISH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            MA'LUMOT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              To‘qnashuvlar Markazi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-800">
              {conflicts.length} ta aniqlangan
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Guruh, o‘qituvchi, xona va sig‘im bo‘yicha aniqlangan barcha konfliktlar ro‘yxati va tezkor yechimlar.
          </p>
        </div>
      </div>

      {/* Filtrlash paneli */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Qidiruv */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Qidiruv (nomi, guruh, xona)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Daraja filtri */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">Barcha darajalar</option>
              <option value="KRITIK">🔴 Faqat Kritik</option>
              <option value="YUQORI">🟠 Faqat Yuqori</option>
              <option value="OGOHLANTIRISH">🟡 Faqat Ogohlantirish</option>
            </select>
          </div>

          {/* Konflikt turi */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">Barcha turlar</option>
              <option value="GROUP_DOUBLE_BOOKING">Guruh to‘qnashuvi</option>
              <option value="TEACHER_DOUBLE_BOOKING">O‘qituvchi to‘qnashuvi</option>
              <option value="ROOM_DOUBLE_BOOKING">Xona to‘qnashuvi</option>
              <option value="ROOM_CAPACITY_EXCEEDED">Xona sig‘imi muammosi</option>
              <option value="INVALID_TIME">Noto‘g‘ri vaqt</option>
              <option value="DUPLICATE_EXAM">Takroriy imtihon</option>
              <option value="TIGHT_SCHEDULE">Zich jadval (1 kunda 2+)</option>
            </select>
          </div>

          {/* Guruh bo'yicha */}
          <div>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">Barcha guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* O'qituvchi bo'yicha */}
          <div>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">Barcha o‘qituvchilar</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* To'qnashuvlar ro'yxati (Kartochkalar) */}
      {filteredConflicts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            ✅
          </div>
          <h3 className="text-lg font-bold text-slate-900">To‘qnashuvlar aniqlanmadi.</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Jadval texnik jihatdan muammosiz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConflicts.map((c) => {
            const exam = exams.find((e) => e.id === c.exam_id);
            const relatedExam = c.related_exam_id
              ? exams.find((e) => e.id === c.related_exam_id)
              : null;
            const sub = exam ? subjects.find((s) => s.id === exam.subject_id) : null;
            const relatedSub = relatedExam
              ? subjects.find((s) => s.id === relatedExam.subject_id)
              : null;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(c.severity)}
                      <span className="text-[11px] font-mono text-slate-400">
                        {c.conflict_type}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 mb-2 leading-snug">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Qatnashuvchi ob'ektlar */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-4">
                    {c.group_name && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{c.group_name}</span>
                      </div>
                    )}
                    {c.exam_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.exam_date}</span>
                      </div>
                    )}
                    {c.time_range && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.time_range}</span>
                      </div>
                    )}
                    {c.room_name && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.room_name}</span>
                      </div>
                    )}
                    {c.teacher_name && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.teacher_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tugmalar */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setDetailConflict(c)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Batafsil
                  </button>

                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => setActiveConflict(c)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tuzatish variantlari</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: TUZATISH VARIANTLARI */}
      {activeConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    To‘qnashuvni tuzatish variantlari
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">{activeConflict.title}</p>
              </div>
              <button
                onClick={() => setActiveConflict(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 mb-5 leading-relaxed">
              <span className="font-bold">Muammo sababi:</span> {activeConflict.description}
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Tizim tomonidan tekshirilgan bo‘sh vaqt va xonalar taklifi:
            </h4>

            {resolutionOptions.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600">
                  Mos bo‘sh variant topilmadi. "Jadvalni optimallashtirish" orqali butun fakultet jadvalini qayta taqsimlash tavsiya etiladi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resolutionOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {opt.status === 'FREE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3.5 h-3.5" /> Bo‘sh
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Info className="w-3.5 h-3.5" /> Ogohlantirish
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-slate-900">
                          {opt.exam_date} — {opt.start_time} dan {opt.end_time} gacha
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-indigo-700">
                          <Building2 className="w-3.5 h-3.5" /> {opt.room_name}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{opt.reason}</span>
                      </div>

                      {/* Tekshiruv qoidalari cheklisti */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="text-emerald-700 font-medium">✓ Guruh bo‘sh</span>
                        <span className="text-emerald-700 font-medium">✓ O‘qituvchi bo‘sh</span>
                        <span className="text-emerald-700 font-medium">✓ Xona bo‘sh</span>
                        <span className="text-emerald-700 font-medium">✓ Sig‘im yetarli</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyResolution(opt)}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer text-center"
                    >
                      Shu variantni qo‘llash
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveConflict(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BATAFSIL MA'LUMOT */}
      {detailConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                {getSeverityBadge(detailConflict.severity)}
                <h3 className="text-base font-bold text-slate-900">
                  To‘qnashuv tafsilotlari
                </h3>
              </div>
              <button
                onClick={() => setDetailConflict(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 mb-6">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Muammo turi:</span>
                <p className="p-2.5 rounded-lg bg-slate-50 font-mono text-[11px]">
                  {detailConflict.conflict_type}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">To‘liq tavsif:</span>
                <p className="p-3 rounded-lg bg-slate-50 leading-relaxed">
                  {detailConflict.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Guruh</span>
                  <span className="font-bold">{detailConflict.group_name || '—'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">O‘qituvchi</span>
                  <span className="font-bold">{detailConflict.teacher_name || '—'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Xona</span>
                  <span className="font-bold">{detailConflict.room_name || '—'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Vaqt</span>
                  <span className="font-bold">
                    {detailConflict.exam_date} {detailConflict.time_range}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDetailConflict(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Yopish
              </button>
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    const c = detailConflict;
                    setDetailConflict(null);
                    setActiveConflict(c);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                >
                  Tuzatish variantlari
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

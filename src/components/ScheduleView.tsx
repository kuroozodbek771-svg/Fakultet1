import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  GraduationCap,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  Download,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Exam, Group, Room, Subject, Teacher } from '../types';
import { exportScheduleToExcel } from '../utils/excelHandler';
import { generateSchedulePDF } from '../utils/pdfGenerator';

type ScheduleMode = 'WEEK' | 'DAY' | 'TABLE' | 'GROUP' | 'TEACHER' | 'ROOM';

interface ScheduleViewProps {
  onNavigateTab?: (tab: any) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onNavigateTab }) => {
  const {
    exams,
    groups,
    teachers,
    rooms,
    subjects,
    conflicts,
    currentUser,
    scheduleStatus
  } = useApp();

  const isStudent = currentUser.role === 'STUDENT';
  const isTeacher = currentUser.role === 'TEACHER';

  // Standart ko'rinish: Talaba bo'lsa faqat 'GROUP', O'qituvchi bo'lsa 'TEACHER', admin bo'lsa 'TABLE' yoki 'WEEK'
  const [mode, setMode] = useState<ScheduleMode>(() => {
    if (isStudent) return 'GROUP';
    if (isTeacher) return 'TEACHER';
    return 'TABLE';
  });

  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return currentUser.group_id || (groups[0]?.id || '');
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    return currentUser.teacher_id || (teachers[0]?.id || '');
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => rooms[0]?.id || '');

  const [selectedDate, setSelectedDate] = useState<string>('2026-06-15');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExamDetail, setSelectedExamDetail] = useState<Exam | null>(null);

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Konfliktli imtihonlar ID lar to'plami
  const conflictExamIds = new Set(conflicts.map((c) => c.exam_id));
  const relatedExamIds = new Set(conflicts.map((c) => c.related_exam_id).filter(Boolean));

  // Talaba va O'qituvchi faqat E'LON QILINGAN jadvalni ko'rishi kerak
  const visibleExams = React.useMemo(() => {
    let list = exams;

    // Agar talaba bo'lsa:
    if (isStudent) {
      list = list.filter((e) => e.group_id === selectedGroupId);
    } else if (isTeacher) {
      list = list.filter((e) => e.teacher_id === selectedTeacherId);
    } else {
      // Admin filterlari
      if (mode === 'GROUP') {
        list = list.filter((e) => e.group_id === selectedGroupId);
      } else if (mode === 'TEACHER') {
        list = list.filter((e) => e.teacher_id === selectedTeacherId);
      } else if (mode === 'ROOM') {
        list = list.filter((e) => e.room_id === selectedRoomId);
      } else if (mode === 'DAY') {
        list = list.filter((e) => e.exam_date === selectedDate);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => {
        const sub = subjectMap.get(e.subject_id)?.name.toLowerCase() || '';
        const grp = groupMap.get(e.group_id)?.name.toLowerCase() || '';
        const tch = teacherMap.get(e.teacher_id)?.full_name.toLowerCase() || '';
        const rm = roomMap.get(e.room_id)?.name.toLowerCase() || '';
        return sub.includes(q) || grp.includes(q) || tch.includes(q) || rm.includes(q);
      });
    }

    return list.sort((a, b) => {
      if (a.exam_date !== b.exam_date) return a.exam_date.localeCompare(b.exam_date);
      return a.start_time.localeCompare(b.start_time);
    });
  }, [exams, isStudent, isTeacher, mode, selectedGroupId, selectedTeacherId, selectedRoomId, selectedDate, searchQuery]);

  const getExamStatusColor = (examId: string) => {
    if (conflictExamIds.has(examId)) {
      return 'border-l-4 border-l-red-500 bg-red-50/50 hover:bg-red-50 text-red-950';
    }
    if (relatedExamIds.has(examId)) {
      return 'border-l-4 border-l-amber-500 bg-amber-50/50 hover:bg-amber-50 text-amber-950';
    }
    return 'border-l-4 border-l-emerald-500 bg-white hover:bg-slate-50 text-slate-900';
  };

  const handleExportPDF = () => {
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    generateSchedulePDF(
      visibleExams,
      groups,
      subjects,
      teachers,
      rooms,
      mode === 'GROUP' ? `${selectedGroup?.name || ''} Guruhi` : 'Fakultet Imtihon Jadvali',
      mode === 'GROUP' ? selectedGroup?.name : undefined
    );
  };

  const handleExportExcel = () => {
    exportScheduleToExcel(visibleExams, groups, subjects, teachers, rooms);
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha paneli */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isStudent
                ? 'Talaba Imtihon Jadvali'
                : isTeacher
                ? 'O‘qituvchi Imtihon Nazorati'
                : 'Fakultet Imtihon Jadvali'}
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {visibleExams.length} ta imtihon
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {scheduleStatus === 'E\'LON QILINGAN'
              ? '✅ Jadval fakultet rahbariyati tomonidan tasdiqlangan va e‘lon qilingan.'
              : '⚠️ Jadval tekshiruv va loyihalash jarayonida.'}
          </p>
        </div>

        {/* Eksport tugmalari */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>PDF yuklab olish</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Rejimlar va Filtrlash Paneli */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Rejim tablari (Faqat Admin va O'qituvchi uchun to'liq) */}
        {!isStudent && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setMode('TABLE')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'TABLE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jadval ro‘yxati
              </button>
              <button
                onClick={() => setMode('GROUP')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'GROUP' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guruh bo‘yicha
              </button>
              <button
                onClick={() => setMode('TEACHER')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'TEACHER' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                O‘qituvchi bo‘yicha
              </button>
              <button
                onClick={() => setMode('ROOM')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'ROOM' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Xona bo‘yicha
              </button>
              <button
                onClick={() => setMode('DAY')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'DAY' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kunlik taqsimot
              </button>
            </div>

            {/* Ranglar legendasi */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Muammosiz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>To‘qnashuvli</span>
              </div>
            </div>
          </div>
        )}

        {/* Filtr tanlovlari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Qidiruv */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Fan, guruh, o‘qituvchi yoki xona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Guruh tanlash */}
          {(mode === 'GROUP' || isStudent) && (
            <div>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} guruhi ({g.student_count} talaba)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* O'qituvchi tanlash */}
          {(mode === 'TEACHER' || isTeacher) && !isStudent && (
            <div>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Xona tanlash */}
          {mode === 'ROOM' && !isStudent && (
            <div>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}-xona ({r.room_type}, {r.capacity} o‘rin)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kun tanlash */}
          {mode === 'DAY' && !isStudent && (
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              >
              </input>
            </div>
          )}
        </div>
      </div>

      {/* Agar talaba yoki o'qituvchi bo'lsa va jadval hali e'lon qilinmagan bo'lsa */}
      {(isStudent || isTeacher) && scheduleStatus !== "E'LON QILINGAN" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 animate-in fade-in">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-extrabold text-amber-950 mb-0.5">
              Jadval tekshirish va tasdiqlash bosqichida
            </h3>
            <p className="text-amber-800 leading-relaxed">
              Fakultet ma‘muriyati tomonidan imtihon jadvali rasman e‘lon qilingach, ushbu sahifada to‘liq tasdiqlangan yakuniy muddatlar aks etadi. Hozirda qoralama reja ko‘rib chiqilmoqda.
            </p>
          </div>
        </div>
      )}

      {/* Imtihonlar ro'yxati / Kartochkalar */}
      {exams.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900">
            Imtihon jadvali mavjud emas.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Hozircha fakultetda hech qanday imtihon rejalashtirilmagan.
          </p>
          {currentUser.role === 'ADMIN' && onNavigateTab && (
            <button
              onClick={() => onNavigateTab('exams')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>Jadval yaratish</span>
            </button>
          )}
        </div>
      ) : visibleExams.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Imtihon jadvali topilmadi</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Tanlangan mezonlar bo‘yicha hozircha imtihonlar belgilanmagan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleExams.map((exam) => {
            const group = groupMap.get(exam.group_id);
            const subject = subjectMap.get(exam.subject_id);
            const teacher = teacherMap.get(exam.teacher_id);
            const room = roomMap.get(exam.room_id);
            const hasConflict = conflictExamIds.has(exam.id);

            return (
              <div
                key={exam.id}
                onClick={() => setSelectedExamDetail(exam)}
                className={`p-5 rounded-2xl border border-slate-200 shadow-xs transition-all cursor-pointer hover:shadow-md ${getExamStatusColor(
                  exam.id
                )}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {subject?.code || 'CS'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasConflict && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3" /> To‘qnashuv
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-slate-500">
                      {exam.exam_date}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 mb-2">
                  {subject?.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-indigo-700">
                      {exam.start_time} — {exam.end_time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {group?.name} ({group?.student_count} talaba)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {room?.name} auditoriyasi ({room?.building}, {room?.capacity} o‘rin)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher?.full_name}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{exam.notes || 'Yakuniy nazorat'}</span>
                  <span className="font-semibold text-indigo-600 hover:underline">
                    Batafsil ko‘rish →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedExamDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Imtihon Tafsiloti
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {subjectMap.get(selectedExamDetail.subject_id)?.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExamDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 mb-6">
              <div className="p-3 rounded-xl bg-slate-50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sana:</span>
                  <span className="font-bold">{selectedExamDetail.exam_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vaqti:</span>
                  <span className="font-bold text-indigo-700">
                    {selectedExamDetail.start_time} — {selectedExamDetail.end_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guruh:</span>
                  <span className="font-bold">
                    {groupMap.get(selectedExamDetail.group_id)?.name} (
                    {groupMap.get(selectedExamDetail.group_id)?.student_count} talaba)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">O‘qituvchi:</span>
                  <span className="font-bold">
                    {teacherMap.get(selectedExamDetail.teacher_id)?.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Xona:</span>
                  <span className="font-bold">
                    {roomMap.get(selectedExamDetail.room_id)?.name} (Sig‘imi:{' '}
                    {roomMap.get(selectedExamDetail.room_id)?.capacity})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Holat:</span>
                  <span className="font-bold">{selectedExamDetail.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedExamDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

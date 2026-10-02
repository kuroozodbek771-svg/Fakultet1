import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  Users,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Exam, ExamStatus } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const ExamsView: React.FC = () => {
  const {
    exams,
    groups,
    subjects,
    teachers,
    rooms,
    conflicts,
    addExam,
    updateExam,
    deleteExam,
    currentUser
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form fields
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [examDate, setExamDate] = useState('2026-06-15');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [status, setStatus] = useState<ExamStatus>('TEKSHIRILMOQDA');
  const [notes, setNotes] = useState('Yakuniy nazorat');
  const [formError, setFormError] = useState<string | null>(null);
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);

  // Delete
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const conflictExamIds = new Set(conflicts.map((c) => c.exam_id));

  const filteredExams = exams.filter((e) => {
    if (selectedGroupFilter !== 'ALL' && e.group_id !== selectedGroupFilter) return false;
    if (selectedDateFilter && e.exam_date !== selectedDateFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const sub = subjectMap.get(e.subject_id)?.name.toLowerCase() || '';
      const grp = groupMap.get(e.group_id)?.name.toLowerCase() || '';
      const tch = teacherMap.get(e.teacher_id)?.full_name.toLowerCase() || '';
      return sub.includes(q) || grp.includes(q) || tch.includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingExam(null);
    setSubjectId(subjects[0]?.id || '');
    setGroupId(groups[0]?.id || '');
    setTeacherId(teachers[0]?.id || '');
    setRoomId(rooms[0]?.id || '');
    setExamDate('2026-06-15');
    setStartTime('09:00');
    setEndTime('11:00');
    setStatus('TEKSHIRILMOQDA');
    setNotes('Yakuniy nazorat');
    setFormError(null);
    setCapacityWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setSubjectId(exam.subject_id);
    setGroupId(exam.group_id);
    setTeacherId(exam.teacher_id);
    setRoomId(exam.room_id);
    setExamDate(exam.exam_date);
    setStartTime(exam.start_time);
    setEndTime(exam.end_time);
    setStatus(exam.status);
    setNotes(exam.notes || '');
    setFormError(null);
    setCapacityWarning(null);
    setIsModalOpen(true);
  };

  // Sig'im tekshiruvi (dinamik ogohlantirish)
  const checkCapacity = (gId: string, rId: string) => {
    const grp = groups.find((g) => g.id === gId);
    const rm = rooms.find((r) => r.id === rId);
    if (grp && rm && grp.student_count > rm.capacity) {
      setCapacityWarning(
        `Diqqat: ${rm.name} auditoriyasi sig‘imi (${rm.capacity}) ${grp.name} guruhi talabalari sonidan (${grp.student_count}) kam!`
      );
    } else {
      setCapacityWarning(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Qat'iy maydonlar validatsiyasi
    if (!groupId) {
      setFormError('Hech qanday guruh tanlanmagan.');
      return;
    }
    if (!subjectId) {
      setFormError('Fan tanlanmagan.');
      return;
    }
    if (!teacherId) {
      setFormError('O‘qituvchi tanlanmagan.');
      return;
    }
    if (!roomId) {
      setFormError('Xona tanlanmagan.');
      return;
    }
    if (!examDate) {
      setFormError('Imtihon sanasi ko‘rsatilmagan.');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Boshlanish va tugash vaqti to‘liq ko‘rsatilmagan.');
      return;
    }
    if (startTime >= endTime) {
      setFormError('Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak.');
      return;
    }

    if (editingExam) {
      updateExam(editingExam.id, {
        subject_id: subjectId,
        group_id: groupId,
        teacher_id: teacherId,
        room_id: roomId,
        exam_date: examDate,
        start_time: startTime,
        end_time: endTime,
        status,
        notes: notes.trim()
      });
    } else {
      addExam({
        subject_id: subjectId,
        group_id: groupId,
        teacher_id: teacherId,
        room_id: roomId,
        exam_date: examDate,
        start_time: startTime,
        end_time: endTime,
        status,
        notes: notes.trim()
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Imtihonlar Boshqaruvi
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {exams.length} ta imtihon
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Barcha rejalashtirilgan nazoratlar, vaqt oraliqlari va xonalar taqsimoti.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi imtihon kiritish</span>
          </button>
        )}
      </div>

      {/* Qidiruv va filtr */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Fan, guruh yoki o‘qituvchi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
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

        <div>
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Fan va kod</th>
              <th className="p-3.5">Guruh</th>
              <th className="p-3.5">Sana va Vaqt</th>
              <th className="p-3.5">O‘qituvchi</th>
              <th className="p-3.5">Xona</th>
              <th className="p-3.5">Holati</th>
              <th className="p-3.5 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExams.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Imtihonlar topilmadi
                </td>
              </tr>
            ) : (
              filteredExams.map((exam) => {
                const group = groupMap.get(exam.group_id);
                const subject = subjectMap.get(exam.subject_id);
                const teacher = teacherMap.get(exam.teacher_id);
                const room = roomMap.get(exam.room_id);
                const hasConflict = conflictExamIds.has(exam.id);

                return (
                  <tr
                    key={exam.id}
                    className={`transition-colors ${
                      hasConflict ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {hasConflict && (
                          <span title="To‘qnashuv aniqlangan">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          </span>
                        )}
                        <div>
                          <p>{subject?.name || 'Fan'}</p>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">
                            {subject?.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {group?.name || 'Guruh'}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{exam.exam_date}</p>
                      <span className="font-mono text-[11px] text-indigo-700 font-semibold">
                        {exam.start_time} — {exam.end_time}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{teacher?.full_name || '—'}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">
                        {room?.name || '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        (Sig‘im: {room?.capacity})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hasConflict
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {hasConflict ? 'To‘qnashuvli' : exam.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {currentUser.role === 'ADMIN' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(exam)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExamToDelete(exam)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingExam ? 'Imtihonni tahrirlash' : 'Yangi imtihon belgilash'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {capacityWarning && (
              <div className="p-3 mb-4 rounded-xl bg-orange-50 text-orange-800 text-xs font-semibold flex items-center gap-2 border border-orange-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-orange-600" />
                <span>{capacityWarning}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Fan tanlash */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fan *</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) — {s.credits} ECTS
                    </option>
                  ))}
                </select>
              </div>

              {/* Guruh tanlash */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Akademik guruh *</label>
                <select
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value);
                    checkCapacity(e.target.value, roomId);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.student_count} nafar talaba)
                    </option>
                  ))}
                </select>
              </div>

              {/* O'qituvchi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nazoratchi o‘qituvchi *</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Xona */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Auditoriya / Xona *</label>
                <select
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    checkCapacity(groupId, e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.building}, sig‘imi: {r.capacity} o‘rin)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sana va Vaqt */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sana *</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlanish *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tugash *</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Izoh */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh / Nazorat turi</label>
                <input
                  type="text"
                  placeholder="Yakuniy nazorat, Yozma ish..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      <ConfirmModal
        isOpen={!!examToDelete}
        title="Imtihonni bekor qilish"
        message="Haqiqatan ham ushbu imtihonni jadvaldan butunlay olib tashlamoqchimisiz?"
        confirmLabel="O‘chirish"
        onConfirm={() => {
          if (examToDelete) {
            deleteExam(examToDelete.id);
            setExamToDelete(null);
          }
        }}
        onCancel={() => setExamToDelete(null)}
      />
    </div>
  );
};

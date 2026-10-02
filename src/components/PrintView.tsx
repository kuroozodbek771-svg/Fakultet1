import React, { useState } from 'react';
import { Printer, ArrowLeft, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PrintView: React.FC = () => {
  const { exams, groups, subjects, teachers, rooms } = useApp();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const printExams = exams
    .filter((e) => selectedGroupId === 'ALL' || e.group_id === selectedGroupId)
    .sort((a, b) => {
      if (a.exam_date !== b.exam_date) return a.exam_date.localeCompare(b.exam_date);
      return a.start_time.localeCompare(b.start_time);
    });

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Chop etish paneli (Chop etishda yashiriladi) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">A4 Chop Etish Ko‘rinishi</h2>
            <p className="text-xs text-slate-500">
              Devorga osish yoki rasmiy hujjat sifatida imzolash uchun mos format.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
          >
            <option value="ALL">Barcha guruhlar (Umumiy jadval)</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} guruhi
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish (Print)</span>
          </button>
        </div>
      </div>

      {/* A4 Formati qog‘ozi */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg max-w-[210mm] mx-auto print:p-0 print:border-none print:shadow-none">
        {/* Universitet Sarlavhasi */}
        <div className="text-center pb-6 border-b-2 border-slate-900 mb-6">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
            FARG‘ONA DAVLAT TEXNIKA UNIVERSITETI
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1 uppercase">
            Kompyuter va Dasturiy Injiniring Fakulteti
          </p>
          <div className="mt-4 inline-block px-4 py-1 border border-slate-900 rounded font-black text-sm uppercase">
            {selectedGroup ? `${selectedGroup.name} GURUHI IMTIHON JADVALI` : 'FAKULTET IMTIHON JADVALI'}
          </div>
          <p className="text-xs text-slate-600 mt-1">2025/2026-o‘quv yili (Bahorgi semestr yakuniy nazoratlari)</p>
        </div>

        {/* Guruh ma'lumotlari */}
        {selectedGroup && (
          <div className="flex justify-between text-xs font-semibold text-slate-800 mb-4 px-1">
            <span>Fakultet: {selectedGroup.faculty}</span>
            <span>Kurs: {selectedGroup.course}-kurs</span>
            <span>Talabalar soni: {selectedGroup.student_count} nafar</span>
          </div>
        )}

        {/* Jadval */}
        <table className="w-full text-left text-xs border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900">
              <th className="p-2 border border-slate-900 text-center w-8">№</th>
              <th className="p-2 border border-slate-900 w-24">Sana</th>
              <th className="p-2 border border-slate-900 w-24">Vaqt</th>
              {selectedGroupId === 'ALL' && (
                <th className="p-2 border border-slate-900 w-20">Guruh</th>
              )}
              <th className="p-2 border border-slate-900">Fan nomi</th>
              <th className="p-2 border border-slate-900">O‘qituvchi (F.I.Sh.)</th>
              <th className="p-2 border border-slate-900 w-16 text-center">Xona</th>
            </tr>
          </thead>
          <tbody>
            {printExams.map((exam, idx) => {
              const group = groupMap.get(exam.group_id);
              const subject = subjectMap.get(exam.subject_id);
              const teacher = teacherMap.get(exam.teacher_id);
              const room = roomMap.get(exam.room_id);

              return (
                <tr key={exam.id} className="border-b border-slate-400">
                  <td className="p-2 border border-slate-900 text-center font-bold">
                    {idx + 1}
                  </td>
                  <td className="p-2 border border-slate-900 font-semibold">{exam.exam_date}</td>
                  <td className="p-2 border border-slate-900 font-bold">
                    {exam.start_time}–{exam.end_time}
                  </td>
                  {selectedGroupId === 'ALL' && (
                    <td className="p-2 border border-slate-900 font-bold">{group?.name}</td>
                  )}
                  <td className="p-2 border border-slate-900 font-semibold">
                    {subject?.name}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      ({subject?.code})
                    </span>
                  </td>
                  <td className="p-2 border border-slate-900">{teacher?.full_name}</td>
                  <td className="p-2 border border-slate-900 text-center font-bold text-slate-900">
                    {room?.name}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Imzo qismi */}
        <div className="mt-12 pt-6 flex justify-between items-end text-xs font-bold text-slate-900">
          <div>
            <p className="mb-8">Fakultet Dekani:</p>
            <p className="border-t border-slate-800 pt-1 w-48">_________________ (imzo)</p>
          </div>

          <div>
            <p className="mb-8">O‘quv-uslubiy bo‘lim boshlig‘i:</p>
            <p className="border-t border-slate-800 pt-1 w-48">_________________ (imzo)</p>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400">
          Ushbu jadval EXAMGUARD avtomatlashtirilgan tizimi orqali to‘qnashuvlarsiz shakllantirildi.
        </div>
      </div>
    </div>
  );
};

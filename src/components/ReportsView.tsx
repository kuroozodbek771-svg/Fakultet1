import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Send,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  FileText,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportScheduleToExcel, exportConflictsToExcel } from '../utils/excelHandler';
import { generateSchedulePDF } from '../utils/pdfGenerator';
import { formatTelegramGroupSchedule, formatTelegramDailyDigest } from '../utils/telegramFormatter';

export const ReportsView: React.FC = () => {
  const {
    exams,
    groups,
    subjects,
    teachers,
    rooms,
    conflicts,
    qualityScore
  } = useApp();

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [selectedTelegramDate, setSelectedTelegramDate] = useState('2026-06-15');
  const [copiedTelegram, setCopiedTelegram] = useState(false);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const telegramMessage = selectedGroup
    ? formatTelegramGroupSchedule(selectedGroup, exams, subjects, teachers, rooms)
    : '';

  const handleCopyTelegram = () => {
    navigator.clipboard.writeText(telegramMessage);
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 2000);
  };

  const handleExportFullExcel = () => {
    exportScheduleToExcel(exams, groups, subjects, teachers, rooms, 'Fakultet_Umumiy_Imtihon_Jadvali.xlsx');
  };

  const handleExportGroupExcel = () => {
    const groupExams = exams.filter((e) => e.group_id === selectedGroupId);
    exportScheduleToExcel(
      groupExams,
      groups,
      subjects,
      teachers,
      rooms,
      `Imtihon_Jadvali_${selectedGroup?.name || 'Guruh'}.xlsx`
    );
  };

  const handleExportConflictsExcel = () => {
    exportConflictsToExcel(conflicts);
  };

  const handleExportPDF = () => {
    generateSchedulePDF(exams, groups, subjects, teachers, rooms, 'Fakultet Imtihon Jadvali');
  };

  const handleExportGroupPDF = () => {
    const groupExams = exams.filter((e) => e.group_id === selectedGroupId);
    generateSchedulePDF(
      groupExams,
      groups,
      subjects,
      teachers,
      rooms,
      `${selectedGroup?.name || 'Guruh'} Jadvali`,
      selectedGroup?.name
    );
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hisobotlar va Eksport Markazi
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Fakultet imtihon jadvallarini Excel, PDF formatlarida yuklab olish va Telegram orqali e‘lon qilish.
        </p>
      </div>

      {/* 1. Eksport kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Umumiy jadval eksport */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Fakultet Umumiy Jadvali
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Barcha {groups.length} ta guruh va {exams.length} ta imtihon to‘liq ma‘lumotlari bilan.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleExportFullExcel}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel yuklab olish (.xlsx)</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PDF yuklab olish (A4)</span>
            </button>
          </div>
        </div>

        {/* Guruh jadvali eksport */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Guruh Bo‘yicha Jadval
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Muayyan guruh talabalari uchun ajratilgan rasmiy jadval formati.
            </p>

            <div className="mt-3">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Guruhni tanlang:
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.student_count} talaba)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleExportGroupExcel}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Guruh Excel jadvali</span>
            </button>
            <button
              onClick={handleExportGroupPDF}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Guruh PDF jadvali</span>
            </button>
          </div>
        </div>

        {/* To'qnashuvlar hisoboti */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-red-50 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              To‘qnashuvlar Tahlili Hisoboti
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Jadval tekshiruvi natijasida aniqlangan barcha {conflicts.length} ta xatolik va ogohlantirishlar ro‘yxati.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100">
            <button
              onClick={handleExportConflictsExcel}
              className="w-full py-2.5 px-4 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xatoliklar hisobotini yuklash</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TELEGRAM UCHUN TAYYOR XABAR GENERATORI */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Telegram Kanallari Uchun Xabar Generatori
              </h2>
              <p className="text-xs text-slate-500">
                Guruhlar yoki fakultet kanallari uchun chiroyli formatlangan e‘lon matni
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyTelegram}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              copiedTelegram
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            {copiedTelegram ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedTelegram ? 'Nusxalandi!' : 'Xabarni nusxalash'}</span>
          </button>
        </div>

        {/* Telegram xabari ko'rinishi */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800">
          {telegramMessage}
        </div>
      </div>
    </div>
  );
};

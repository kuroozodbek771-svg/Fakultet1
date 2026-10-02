import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  AlertCircle,
  FileCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { ExcelImportRow, Exam } from '../types';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelHandler';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    groups,
    subjects,
    teachers,
    rooms,
    bulkImportExams,
    addGroup,
    addSubject,
    addTeacher,
    addRoom
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<{
    rows: ExcelImportRow[];
    validCount: number;
    invalidCount: number;
    totalCount: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsParsing(true);

    try {
      const result = await parseExcelFile(file, groups, subjects, teachers, rooms);
      setParseResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Faylni o‘qishda xatolik yuz berdi');
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Faqat to'g'ri satrlarni import qilish
  const handleImportValid = () => {
    if (!parseResult || parseResult.validCount === 0) return;

    const validRows = parseResult.rows.filter((r) => r.is_valid);
    const newExamsToImport: Omit<Exam, 'id' | 'created_at' | 'updated_at'>[] = [];

    // Ob'ektlarni topish yoki agar yangi bo'lsa avtomatik kiritish
    validRows.forEach((row) => {
      // 1. Guruh
      let group = groups.find((g) => g.name.toLowerCase() === row.group_name.toLowerCase());
      let groupId = group?.id;
      if (!groupId) {
        groupId = `g-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        addGroup({
          name: row.group_name,
          faculty: 'Kompyuter injiniringi',
          course: 1,
          student_count: row.student_count || 28
        });
      }

      // 2. Fan
      let subject = subjects.find((s) => s.name.toLowerCase() === row.subject_name.toLowerCase());
      let subjectId = subject?.id;
      if (!subjectId) {
        subjectId = `s-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        addSubject({
          name: row.subject_name,
          code: row.subject_code || 'CS100',
          credits: 5,
          department: 'Umumiy kafedra'
        });
      }

      // 3. O'qituvchi
      let teacher = teachers.find((t) => t.full_name.toLowerCase() === row.teacher_name.toLowerCase());
      let teacherId = teacher?.id;
      if (!teacherId) {
        teacherId = `t-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        addTeacher({
          full_name: row.teacher_name,
          department: 'Kafedra',
          email: `${row.teacher_name.toLowerCase().replace(/[^a-z]/g, '')}@examguard.uz`
        });
      }

      // 4. Xona
      let room = rooms.find((r) => r.name.toLowerCase() === row.room_name.toLowerCase());
      let roomId = room?.id;
      if (!roomId) {
        roomId = `r-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        addRoom({
          name: row.room_name,
          building: 'Bosh bino',
          capacity: row.room_capacity || 40,
          room_type: 'Auditoriya'
        });
      }

      newExamsToImport.push({
        subject_id: subjectId,
        group_id: groupId,
        teacher_id: teacherId,
        room_id: roomId,
        exam_date: row.exam_date,
        start_time: row.start_time,
        end_time: row.end_time,
        status: 'TEKSHIRILMOQDA',
        notes: 'Excel orqali yuklangan'
      });
    });

    bulkImportExams(newExamsToImport);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });

    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Excel orqali imtihon jadvalini yuklash
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                .xlsx, .xls va .csv formatlaridagi rasmiy fakultet faylini tahlil qilish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shablon yuklab olish havolasi */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-5">
          <div className="flex items-center gap-2 text-slate-700">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Excel namunaviy shablonini ko‘chirib oling:</span>
          </div>
          <button
            onClick={downloadExcelTemplate}
            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
          >
            Shablonni yuklab olish (.xlsx)
          </button>
        </div>

        {/* Fayl yuklanmagan holat: Drag & Drop qutisi */}
        {!parseResult && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all mb-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />

            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-sm font-bold text-slate-900">
              Excel faylini shu yerga tashlang yoki tanlash uchun bosing
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Qo‘llab-quvvatlanadi: .xlsx, .xls, .csv (maksimal 10 MB)
            </p>
          </div>
        )}

        {/* Loading holati */}
        {isParsing && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-700">Excel fayl tahlil qilinmoqda…</p>
          </div>
        )}

        {/* Xatolik xabari */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">{errorMessage}</p>
                <p className="text-amber-700 text-[11px]">Iltimos, avval Excel faylini tanlang.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shrink-0 shadow-xs"
            >
              Fayl yuklash
            </button>
          </div>
        )}

        {/* Tahlil natijalari va validatsiya hisoboti */}
        {parseResult && (
          <div className="space-y-4">
            {/* Statistika kartochkasi */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Fayl muvaffaqiyatli yuklandi: {selectedFile?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>{parseResult.totalCount} ta imtihon satri topildi</span>
              </div>

              <div className="flex items-center gap-4 text-xs pt-2">
                <span className="text-emerald-700 font-bold">
                  ✓ To‘g‘ri satrlar: {parseResult.validCount} ta
                </span>
                <span className="text-red-600 font-bold">
                  ✗ Xatoli satrlar: {parseResult.invalidCount} ta
                </span>
              </div>
            </div>

            {/* Xatoli satrlar jadvali */}
            {parseResult.invalidCount > 0 && (
              <div>
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Aniqlangan xatoliklar (ushbu satrlar o‘tkazib yuboriladi):</span>
                </h4>

                <div className="max-h-48 overflow-y-auto border border-red-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-red-50/80 text-red-900 border-b border-red-200 sticky top-0">
                      <tr>
                        <th className="p-2.5 font-bold">Satr</th>
                        <th className="p-2.5 font-bold">Maydon</th>
                        <th className="p-2.5 font-bold">Xatolik sababi</th>
                        <th className="p-2.5 font-bold">Tavsiya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100">
                      {parseResult.rows
                        .filter((r) => !r.is_valid)
                        .map((row) =>
                          row.errors.map((err, i) => (
                            <tr key={`${row.row_number}-${i}`} className="hover:bg-red-50/40">
                              <td className="p-2.5 font-mono font-bold text-red-700">
                                {row.row_number}-satr
                              </td>
                              <td className="p-2.5 font-semibold text-slate-800">{err.field}</td>
                              <td className="p-2.5 text-red-600">{err.error}</td>
                              <td className="p-2.5 text-slate-500 italic">{err.suggestion}</td>
                            </tr>
                          ))
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* To'g'ri satrlar namunasi */}
            {parseResult.validCount > 0 && (
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  Import qilinadigan to‘g‘ri satrlar namunasi:
                </h4>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-2">№</th>
                        <th className="p-2">Fan</th>
                        <th className="p-2">Guruh</th>
                        <th className="p-2">O‘qituvchi</th>
                        <th className="p-2">Sana</th>
                        <th className="p-2">Vaqt</th>
                        <th className="p-2">Xona</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.rows
                        .filter((r) => r.is_valid)
                        .slice(0, 5)
                        .map((row) => (
                          <tr key={row.row_number}>
                            <td className="p-2 font-mono">{row.row_number}</td>
                            <td className="p-2 font-semibold">{row.subject_name}</td>
                            <td className="p-2">{row.group_name}</td>
                            <td className="p-2">{row.teacher_name}</td>
                            <td className="p-2">{row.exam_date}</td>
                            <td className="p-2 font-bold text-indigo-700">
                              {row.start_time}-{row.end_time}
                            </td>
                            <td className="p-2">{row.room_name}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tugmalar paneli */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
          <div>
            {parseResult && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Boshqa fayl tanlash
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>

            {!parseResult ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('Hech qanday fayl yuklanmagan. Iltimos, avval Excel faylini tanlang.');
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-400 hover:bg-slate-500 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Import qilish</span>
              </button>
            ) : parseResult.validCount > 0 ? (
              <button
                type="button"
                onClick={handleImportValid}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>To‘g‘ri satrlarni import qilish ({parseResult.validCount})</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  Building,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const SubjectsView: React.FC = () => {
  const { subjects, exams, addSubject, updateSubject, deleteSubject, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(5);
  const [department, setDepartment] = useState('Dasturiy injiniring');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const departments = Array.from(new Set(subjects.map((s) => s.department)));

  const filteredSubjects = subjects.filter((s) => {
    if (departmentFilter !== 'ALL' && s.department !== departmentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setCredits(5);
    setDepartment('Dasturiy injiniring');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setCredits(sub.credits);
    setDepartment(sub.department);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Fan nomi kiritilishi shart!');
      return;
    }
    if (!code.trim()) {
      setFormError('Fan kodi kiritilishi shart!');
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        credits: Number(credits),
        department: department.trim()
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        credits: Number(credits),
        department: department.trim()
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
              O‘quv Fanlari
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {subjects.length} ta fan
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Fakultet o‘quv rejasidagi fanlar, kredit miqdori va kafedralar ro‘yxati.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi fan qo‘shish</span>
          </button>
        )}
      </div>

      {/* Qidiruv va filtr */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Fan nomi yoki kodi bo‘yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">Barcha kafedralar</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Fan nomi</th>
              <th className="p-3.5">Fan kodi</th>
              <th className="p-3.5">Kredit</th>
              <th className="p-3.5">Kafedra</th>
              <th className="p-3.5">Jadvaldagi soni</th>
              <th className="p-3.5 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Fanlar topilmadi
                </td>
              </tr>
            ) : (
              filteredSubjects.map((s) => {
                const subExamCount = exams.filter((e) => e.subject_id === s.id).length;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-600">{s.code}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-indigo-50 text-indigo-700">
                        {s.credits} ECTS
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{s.department}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {subExamCount} ta imtihon
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {currentUser.role === 'ADMIN' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Tahrirlash"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSubjectToDelete(s)}
                            title="O‘chirish"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingSubject ? 'Fanni tahrirlash' : 'Yangi fan qo‘shish'}
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
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fan nomi *</label>
                <input
                  type="text"
                  placeholder="Masalan: Dasturlash asoslari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fan kodi *</label>
                  <input
                    type="text"
                    placeholder="CS101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kredit (ECTS)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kafedra *</label>
                <input
                  type="text"
                  placeholder="Axborot texnologiyalari"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
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
        isOpen={!!subjectToDelete}
        title="Fanni o‘chirish"
        message={`Haqiqatan ham "${subjectToDelete?.name}" fanini va unga biriktirilgan barcha imtihonlarni o‘chirmoqchimisiz?`}
        confirmLabel="O‘chirish"
        onConfirm={() => {
          if (subjectToDelete) {
            deleteSubject(subjectToDelete.id);
            setSubjectToDelete(null);
          }
        }}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
};

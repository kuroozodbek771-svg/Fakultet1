import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  X,
  AlertCircle,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Teacher } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface TeachersViewProps {
  onViewSchedule: (teacherId: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ onViewSchedule }) => {
  const { teachers, exams, subjects, groups, rooms, addTeacher, updateTeacher, deleteTeacher, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Axborot texnologiyalari');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const departments = Array.from(new Set(teachers.map((t) => t.department)));

  const filteredTeachers = teachers.filter((t) => {
    if (departmentFilter !== 'ALL' && t.department !== departmentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.full_name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFullName('');
    setDepartment('Axborot texnologiyalari');
    setEmail('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFullName(t.full_name);
    setDepartment(t.department);
    setEmail(t.email);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('O‘qituvchining F.I.Sh. kiritilishi shart!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('To‘g‘ri elektron pochta manzilini kiriting!');
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        full_name: fullName.trim(),
        department: department.trim(),
        email: email.trim().toLowerCase()
      });
    } else {
      addTeacher({
        full_name: fullName.trim(),
        department: department.trim(),
        email: email.trim().toLowerCase()
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
              Professor-o‘qituvchilar
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {teachers.length} nafar o‘qituvchi
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Imtihon qabul qiluvchi professor, dotsent va assistent-o‘qituvchilar tarkibi.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi o‘qituvchi qo‘shish</span>
          </button>
        )}
      </div>

      {/* Qidiruv va filtr */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="O‘qituvchi ismi, email yoki kafedrasi bo‘yicha qidirish..."
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

      {/* Ro'yxat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => {
          const teacherExams = exams.filter((e) => e.teacher_id === t.id);

          return (
            <div
              key={t.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {t.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {t.full_name}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{t.email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kafedra:</span>
                    <span className="font-semibold">{t.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Biriktirilgan imtihonlar:</span>
                    <span className="font-bold text-indigo-700">
                      {teacherExams.length} ta
                    </span>
                  </div>
                </div>

                {/* Biriktirilgan imtihonlar ro'yxatidan qisqa namuna */}
                {teacherExams.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Yaqin imtihonlari:
                    </span>
                    {teacherExams.slice(0, 2).map((te) => {
                      const sub = subjects.find((s) => s.id === te.subject_id);
                      const grp = groups.find((g) => g.id === te.group_id);
                      return (
                        <div
                          key={te.id}
                          className="text-[11px] p-2 rounded-lg bg-indigo-50/50 border border-indigo-100/50 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 truncate">
                            {sub?.name || 'Fan'} ({grp?.name || 'Guruh'})
                          </span>
                          <span className="text-slate-500 font-mono shrink-0 ml-2">
                            {te.exam_date.slice(5)} {te.start_time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Amallar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onViewSchedule(t.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Jadvalini ko‘rish</span>
                </button>

                {currentUser.role === 'ADMIN' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTeacherToDelete(t)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingTeacher ? 'O‘qituvchini tahrirlash' : 'Yangi o‘qituvchi qo‘shish'}
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
                <label className="block font-bold text-slate-700 mb-1">
                  F.I.Sh. (ilmiy unvoni bilan) *
                </label>
                <input
                  type="text"
                  placeholder="dots. Aziz Karimov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Elektron pochta (Email) *</label>
                <input
                  type="email"
                  placeholder="a.karimov@examguard.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
        isOpen={!!teacherToDelete}
        title="O‘qituvchini o‘chirish"
        message={`Haqiqatan ham "${teacherToDelete?.full_name}" o‘qituvchisini va unga biriktirilgan imtihonlarni o‘chirmoqchimisiz?`}
        confirmLabel="O‘chirish"
        onConfirm={() => {
          if (teacherToDelete) {
            deleteTeacher(teacherToDelete.id);
            setTeacherToDelete(null);
          }
        }}
        onCancel={() => setTeacherToDelete(null)}
      />
    </div>
  );
};

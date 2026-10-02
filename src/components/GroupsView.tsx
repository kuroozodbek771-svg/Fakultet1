import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Group } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface GroupsViewProps {
  onViewSchedule: (groupId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ onViewSchedule }) => {
  const { groups, exams, addGroup, updateGroup, deleteGroup, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Modal holati: Qo'shish / Tahrirlash
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Form maydonlari
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('Kompyuter injiniringi');
  const [course, setCourse] = useState(1);
  const [studentCount, setStudentCount] = useState(28);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const filteredGroups = groups.filter((g) => {
    if (courseFilter !== 'ALL' && g.course !== Number(courseFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.faculty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setName('');
    setFaculty('Kompyuter injiniringi');
    setCourse(1);
    setStudentCount(28);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setEditingGroup(group);
    setName(group.name);
    setFaculty(group.faculty);
    setCourse(group.course);
    setStudentCount(group.student_count);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Guruh nomi kiritilishi shart!');
      return;
    }
    if (studentCount <= 0) {
      setFormError('Talabalar soni musbat son bo‘lishi lozim!');
      return;
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: name.trim(),
        faculty: faculty.trim(),
        course: Number(course),
        student_count: Number(studentCount)
      });
    } else {
      addGroup({
        name: name.trim(),
        faculty: faculty.trim(),
        course: Number(course),
        student_count: Number(studentCount)
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
              Akademik Guruhlar
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {groups.length} ta guruh
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Fakultet talabalar guruhlari ro‘yxati, kurslar va talabalar soni.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi guruh qo‘shish</span>
          </button>
        )}
      </div>

      {/* Qidiruv va filtrlash */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Guruh nomi yoki fakultet bo‘yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">Barcha kurslar</option>
            <option value="1">1-kurs</option>
            <option value="2">2-kurs</option>
            <option value="3">3-kurs</option>
            <option value="4">4-kurs</option>
          </select>
        </div>
      </div>

      {/* Guruhlar jadvali */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Guruh nomi</th>
              <th className="p-3.5">Fakultet</th>
              <th className="p-3.5">Kurs</th>
              <th className="p-3.5">Talabalar soni</th>
              <th className="p-3.5">Imtihonlar</th>
              <th className="p-3.5 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Guruhlar topilmadi
                </td>
              </tr>
            ) : (
              filteredGroups.map((g) => {
                const groupExamCount = exams.filter((e) => e.group_id === g.id).length;
                return (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {g.name.slice(0, 2)}
                      </div>
                      <span>{g.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{g.faculty}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                        {g.course}-kurs
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {g.student_count} nafar
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                        {groupExamCount} ta imtihon
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewSchedule(g.id)}
                          title="Guruh jadvalini ko‘rish"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        {currentUser.role === 'ADMIN' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(g)}
                              title="Tahrirlash"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setGroupToDelete(g)}
                              title="O‘chirish"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
                {editingGroup ? 'Guruh ma‘lumotlarini tahrirlash' : 'Yangi akademik guruh qo‘shish'}
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
                <label className="block font-bold text-slate-700 mb-1">Guruh nomi *</label>
                <input
                  type="text"
                  placeholder="Masalan: 614-24"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fakultet *</label>
                <input
                  type="text"
                  placeholder="Kompyuter injiniringi"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kurs</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={1}>1-kurs</option>
                    <option value={2}>2-kurs</option>
                    <option value={3}>3-kurs</option>
                    <option value={4}>4-kurs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Talabalar soni *</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
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

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!groupToDelete}
        title="Guruhni o‘chirish"
        message={`Haqiqatan ham "${groupToDelete?.name}" guruhini va unga tegishli barcha imtihonlarni o‘chirmoqchimisiz? Bu amal qaytarilmaydi.`}
        confirmLabel="O‘chirish"
        onConfirm={() => {
          if (groupToDelete) {
            deleteGroup(groupToDelete.id);
            setGroupToDelete(null);
          }
        }}
        onCancel={() => setGroupToDelete(null)}
      />
    </div>
  );
};

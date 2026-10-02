import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Monitor,
  FlaskConical,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Room, RoomType } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const RoomsView: React.FC = () => {
  const { rooms, exams, addRoom, updateRoom, deleteRoom, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('Bosh bino');
  const [capacity, setCapacity] = useState(40);
  const [roomType, setRoomType] = useState<RoomType>('Auditoriya');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const buildings = Array.from(new Set(rooms.map((r) => r.building)));

  const filteredRooms = rooms.filter((r) => {
    if (buildingFilter !== 'ALL' && r.building !== buildingFilter) return false;
    if (typeFilter !== 'ALL' && r.room_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.building.toLowerCase().includes(q);
    }
    return true;
  });

  const getRoomTypeIcon = (type: RoomType) => {
    switch (type) {
      case 'Kompyuter xonasi':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case 'Laboratoriya':
        return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'Maxsus xona':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <Building2 className="w-4 h-4 text-indigo-600" />;
    }
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setName('');
    setBuilding('Bosh bino');
    setCapacity(40);
    setRoomType('Auditoriya');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rm: Room) => {
    setEditingRoom(rm);
    setName(rm.name);
    setBuilding(rm.building);
    setCapacity(rm.capacity);
    setRoomType(rm.room_type);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Xona raqami yoki nomi kiritilishi shart!');
      return;
    }
    if (capacity <= 0) {
      setFormError('Xona sig‘imi musbat son bo‘lishi lozim!');
      return;
    }

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        name: name.trim(),
        building: building.trim(),
        capacity: Number(capacity),
        room_type: roomType
      });
    } else {
      addRoom({
        name: name.trim(),
        building: building.trim(),
        capacity: Number(capacity),
        room_type: roomType
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
              O‘quv Xonalari va Auditoriyalar
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {rooms.length} ta xona
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Fakultet auditoriyalari, kompyuter laboratoriyalari va o‘rinlar sig‘imi.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi xona qo‘shish</span>
          </button>
        )}
      </div>

      {/* Qidiruv va filtr */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Xona raqami yoki bino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">Barcha binolar</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">Barcha turlar</option>
            <option value="Auditoriya">Auditoriya</option>
            <option value="Kompyuter xonasi">Kompyuter xonasi</option>
            <option value="Laboratoriya">Laboratoriya</option>
            <option value="Maxsus xona">Maxsus xona</option>
          </select>
        </div>
      </div>

      {/* Xonalar Grid ko'rinishi */}
      {rooms.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-3">
            🏫
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Hozircha xona mavjud emas.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Imtihonlarni joylashtirish uchun birinchi auditoriya yoki laboratoriya xonasini qo‘shing.
          </p>
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Xona qo‘shish</span>
            </button>
          )}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Mos xona topilmadi</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Qidiruv yoki filtr mezonlariga mos keluvchi auditoriya mavjud emas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map((r) => {
          const roomExamCount = exams.filter((e) => e.room_id === r.id).length;

          return (
            <div
              key={r.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100">{getRoomTypeIcon(r.room_type)}</div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{r.name}</h3>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {r.room_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bino:</span>
                    <span className="font-semibold text-slate-800">{r.building}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sig‘imi:</span>
                    <span className="font-bold text-indigo-700">{r.capacity} o‘rin</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Jadvalda:</span>
                    <span className="font-semibold">{roomExamCount} ta imtihon</span>
                  </div>
                </div>
              </div>

              {currentUser.role === 'ADMIN' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRoomToDelete(r)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoom ? 'Xonani tahrirlash' : 'Yangi o‘quv xonasi qo‘shish'}
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
                <label className="block font-bold text-slate-700 mb-1">Xona raqami / nomi *</label>
                <input
                  type="text"
                  placeholder="301"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bino *</label>
                <input
                  type="text"
                  placeholder="Bosh bino"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xona turi</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as RoomType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  >
                    <option value="Auditoriya">Auditoriya</option>
                    <option value="Kompyuter xonasi">Kompyuter xonasi</option>
                    <option value="Laboratoriya">Laboratoriya</option>
                    <option value="Maxsus xona">Maxsus xona</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sig‘imi (o‘rin) *</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
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

      {/* CONFIRM DELETE */}
      <ConfirmModal
        isOpen={!!roomToDelete}
        title="Xonani o‘chirish"
        message={`Haqiqatan ham "${roomToDelete?.name}" xonasini va ushbu xonadagi barcha imtihonlarni o‘chirmoqchimisiz?`}
        confirmLabel="O‘chirish"
        onConfirm={() => {
          if (roomToDelete) {
            deleteRoom(roomToDelete.id);
            setRoomToDelete(null);
          }
        }}
        onCancel={() => setRoomToDelete(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Layers, RotateCcw, X, Plus, Calendar, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionsModal: React.FC<VersionsModalProps> = ({ isOpen, onClose }) => {
  const { versions, restoreVersion, createVersionSnapshot, currentUser } = useApp();

  const [newVersionName, setNewVersionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;
    createVersionSnapshot(newVersionName.trim());
    setNewVersionName('');
    setIsCreating(false);
  };

  const handleRestore = (id: string, name: string) => {
    if (window.confirm(`Haqiqatan ham "${name}" jadval versiyasini tiklamoqchimisiz?`)) {
      restoreVersion(id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Jadval Versiyalari Tarixi</h3>
              <p className="text-xs text-slate-500">
                Saqlangan snapshotlar va istalgan oldingi holatga qaytish imkoniyati.
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

        {/* Yangi versiya yaratish tugmasi */}
        {currentUser.role === 'ADMIN' && (
          <div className="mb-4">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 px-3 border border-dashed border-indigo-300 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Hozirgi jadvaldan yangi versiya snapshot olish</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <input
                  type="text"
                  placeholder="Versiya nomi (masalan: 2-bosqich yakuniy)"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Versiyalar ro'yxati */}
        <div className="space-y-3">
          {versions.map((ver, idx) => (
            <div
              key={ver.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{ver.name}</span>
                  {idx === 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      So‘nggi
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span>Yaratuvchi: {ver.created_by}</span>
                  <span>•</span>
                  <span>{new Date(ver.created_at).toLocaleString('uz-UZ')}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">{ver.exam_count} ta imtihon</span>
                  <span>•</span>
                  <span className={ver.conflict_count > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {ver.conflict_count} ta to‘qnashuv
                  </span>
                </div>
              </div>

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => handleRestore(ver.id, ver.name)}
                  title="Ushbu versiyani tiklash"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tiklash</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

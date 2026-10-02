import React, { useState } from 'react';
import { History, X, Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.user_name.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tizim Harakatlar Tarixi (Audit Log)
              </h3>
              <p className="text-xs text-slate-500">
                Administrator va tizim tomonidan amalga oshirilgan barcha o‘zgarishlar jurnali.
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

        {/* Qidiruv */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Harakat yoki foydalanuvchi bo‘yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Jurnal ro'yxati */}
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">Jurnal yozuvlari topilmadi</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                      {log.entity_type}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Foydalanuvchi: {log.user_name}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString('uz-UZ')}
                </span>
              </div>
            ))
          )}
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

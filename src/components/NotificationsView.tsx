import React from 'react';
import { Bell, Calendar, AlertTriangle, CheckCircle2, Info, Building2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsView: React.FC = () => {
  const { currentUser, scheduleStatus, conflicts, exams } = useApp();

  const notifications = [
    {
      id: 'notif-1',
      title: scheduleStatus === 'E\'LON QILINGAN' ? 'Imtihon jadvali rasman e\'lon qilindi' : 'Imtihon jadvali tekshiruv bosqichida',
      message: scheduleStatus === 'E\'LON QILINGAN' 
        ? 'Fakultet dekanati tomonidan 2026-yilgi yakuniy nazorat imtihonlari jadvali tasdiqlandi va rasman e\'lon qilindi.'
        : 'Jadval hozirda o‘quv bo‘limi tomonidan optimallashtirilmoqda va tekshirilmoqda.',
      time: 'Bugun, 09:30',
      type: scheduleStatus === 'E\'LON QILINGAN' ? 'SUCCESS' : 'INFO',
      icon: Calendar
    },
    {
      id: 'notif-2',
      title: 'Auditoriyalar va xona sig‘imi nazorati',
      message: 'Barcha talabalar o‘z guruhlariga ajratilgan xonalarga imtihon boshlanishidan 15 daqiqa oldin yetib kelishlari so‘raladi.',
      time: 'Kecha, 16:45',
      type: 'INFO',
      icon: Building2
    },
    ...(conflicts.length > 0 && currentUser.role === 'ADMIN' ? [{
      id: 'notif-3',
      title: `${conflicts.length} ta to‘qnashuv aniqlandi`,
      message: 'Jadvalda guruh, o‘qituvchi yoki xona to‘qnashuvlari mavjud. Iltimos, Optimallashtirish bo‘limidan foydalaning.',
      time: 'Yaqinda',
      type: 'WARNING',
      icon: AlertTriangle
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Bildirishnomalar</h1>
            <p className="text-xs text-slate-500">
              Imtihon jadvali yangiliklari, xona o‘zgarishlari va rasmiy e'lonlar
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
          {notifications.length} ta xabar
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                n.type === 'WARNING'
                  ? 'border-amber-200 bg-amber-50/20'
                  : n.type === 'SUCCESS'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'WARNING'
                      ? 'bg-amber-100 text-amber-700'
                      : n.type === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  Sparkles,
  Users,
  BookOpen,
  GraduationCap,
  Building2,
  FileText,
  BarChart3,
  Printer,
  Settings,
  FileSpreadsheet,
  UserCheck,
  Search,
  Bell,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab =
  | 'dashboard'
  | 'schedule'
  | 'conflicts'
  | 'optimizer'
  | 'groups'
  | 'subjects'
  | 'teachers'
  | 'rooms'
  | 'exams'
  | 'reports'
  | 'print'
  | 'settings'
  | 'users'
  | 'teacher_exams'
  | 'student_search'
  | 'notifications'
  | 'profile';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExcelImport: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.FC<any>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExcelImport,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentUser, conflicts } = useApp();

  const criticalAndHighCount = conflicts.filter(
    (c) => c.severity === 'KRITIK' || c.severity === 'YUQORI'
  ).length;

  // 1. ADMIN MENYUSI (👤 Foydalanuvchilar faqat ADMINga ko'rinadi)
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'groups', label: 'Guruhlar', icon: Users },
    { id: 'subjects', label: 'Fanlar', icon: BookOpen },
    { id: 'teachers', label: 'O‘qituvchilar', icon: GraduationCap },
    { id: 'rooms', label: 'Xonalar', icon: Building2 },
    { id: 'exams', label: 'Imtihonlar', icon: FileText },
    { id: 'schedule', label: 'Jadval', icon: Calendar },
    {
      id: 'conflicts',
      label: 'To‘qnashuvlar',
      icon: AlertTriangle,
      badge: conflicts.length > 0 ? conflicts.length : undefined
    },
    { id: 'optimizer', label: 'Optimallashtirish', icon: Sparkles },
    { id: 'reports', label: 'Hisobotlar', icon: BarChart3 },
    { id: 'users', label: 'Foydalanuvchilar', icon: UserCheck },
    { id: 'settings', label: 'Sozlamalar & Demo', icon: Settings }
  ];

  // 2. O‘QITUVCHI MENYUSI (Foydalanuvchilar bo'limi yo'q)
  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'schedule', label: 'Mening jadvalim', icon: Calendar },
    { id: 'teacher_exams', label: 'Mening imtihonlarim', icon: FileText },
    { id: 'rooms', label: 'Xonalar', icon: Building2 },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
    { id: 'profile', label: 'Profil', icon: UserIcon }
  ];

  // 3. TALABA MENYUSI (Foydalanuvchilar bo'limi yo'q)
  const studentNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'schedule', label: 'Mening jadvalim', icon: Calendar },
    { id: 'student_search', label: 'Imtihon qidirish', icon: Search },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
    { id: 'profile', label: 'Profil', icon: UserIcon }
  ];

  const navItems =
    currentUser.role === 'ADMIN'
      ? adminNavItems
      : currentUser.role === 'TEACHER'
      ? teacherNavItems
      : studentNavItems;

  const handleItemClick = (id: ActiveTab) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Profil kartochkasi */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.full_name}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigatsiya menyusi */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : criticalAndHighCount > 0
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin tezkor import banner */}
      {currentUser.role === 'ADMIN' && (
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => {
              onOpenExcelImport();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel import qilish</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop doimiy sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile yopiladigan drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

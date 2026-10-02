import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ScheduleView } from './components/ScheduleView';
import { ConflictsCenterView } from './components/ConflictsCenterView';
import { OptimizerView } from './components/OptimizerView';
import { GroupsView } from './components/GroupsView';
import { SubjectsView } from './components/SubjectsView';
import { TeachersView } from './components/TeachersView';
import { RoomsView } from './components/RoomsView';
import { ExamsView } from './components/ExamsView';
import { ReportsView } from './components/ReportsView';
import { PrintView } from './components/PrintView';
import { SettingsView } from './components/SettingsView';
import { UsersManagementView } from './components/UsersManagementView';
import { Forbidden403View } from './components/Forbidden403View';
import { NotificationsView } from './components/NotificationsView';
import { UserProfileView } from './components/UserProfileView';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { ExcelImportModal } from './components/ExcelImportModal';
import { VersionsModal } from './components/VersionsModal';
import { AuditLogsModal } from './components/AuditLogsModal';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();

  // URL orqali kirilganda tekshirish (/admin/users)
  const getInitialTab = (): ActiveTab => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin/users' || path === '/users') {
        return 'users';
      }
    }
    return currentUser.role === 'STUDENT' ? 'schedule' : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);

  // URL va Tab sinxronizatsiyasi
  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'users') {
        if (window.location.pathname !== '/admin/users') {
          window.history.pushState(null, '', '/admin/users');
        }
      } else {
        if (window.location.pathname === '/admin/users') {
          window.history.pushState(null, '', '/');
        }
      }
    }
  };

  // Brauzer tarixi (Back / Forward) hodisasini tinglash
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/users' || path === '/users') {
        setActiveTabState('users');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modal va panel holatlari
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);

  const handleSelectConflict = (conflictId: string) => {
    setSelectedConflictId(conflictId);
    setActiveTab('conflicts');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenExcelImport={() => setIsExcelImportOpen(true)}
            onSelectConflict={handleSelectConflict}
          />
        );
      case 'schedule':
        return <ScheduleView onNavigateTab={setActiveTab} />;
      case 'conflicts':
        return <ConflictsCenterView initialSelectedConflictId={selectedConflictId} />;
      case 'optimizer':
        return <OptimizerView />;
      case 'groups':
        return (
          <GroupsView
            onViewSchedule={(groupId) => {
              setActiveTab('schedule');
            }}
          />
        );
      case 'subjects':
        return <SubjectsView />;
      case 'teachers':
        return (
          <TeachersView
            onViewSchedule={(teacherId) => {
              setActiveTab('schedule');
            }}
          />
        );
      case 'rooms':
        return <RoomsView />;
      case 'exams':
        return <ExamsView />;
      case 'reports':
        return <ReportsView />;
      case 'print':
        return <PrintView />;
      case 'settings':
        return <SettingsView />;
      
      // ADMIN ICHIDAGI ALOHIDA SAHIFA: /admin/users (RBAC himoyalangan)
      case 'users':
        if (currentUser.role !== 'ADMIN') {
          return (
            <Forbidden403View
              onGoHome={() => {
                setActiveTab('dashboard');
              }}
            />
          );
        }
        return <UsersManagementView />;

      // O'qituvchi va talaba uchun maxsus bo'limlar
      case 'teacher_exams':
        return <ExamsView />;
      case 'student_search':
        return <ScheduleView onNavigateTab={setActiveTab} />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <UserProfileView />;

      default:
        return (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenExcelImport={() => setIsExcelImportOpen(true)}
            onSelectConflict={handleSelectConflict}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Yuqori navigatsiya paneli */}
      <Navbar
        onOpenAI={() => setIsAIOpen(true)}
        onOpenVersions={() => setIsVersionsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenExcelImport={() => setIsExcelImportOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Chap yon menyu */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedConflictId(null);
            setActiveTab(tab);
          }}
          onOpenExcelImport={() => setIsExcelImportOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Asosiy kontent maydoni */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Modallar va Drawers */}
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
      />
      <VersionsModal
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
      />
      <AuditLogsModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

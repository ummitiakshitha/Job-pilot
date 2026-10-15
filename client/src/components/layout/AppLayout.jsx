import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ApplicationFormModal from '../applications/ApplicationFormModal';

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleApplicationCreated = () => {
    setIsNewAppModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-ivory-100 text-stone-800 flex flex-col relative selection:bg-forest-100 selection:text-forest-900">
      {/* Quiet, natural background ambient glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-sage-100/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[450px] bg-sand-100/50 blur-[130px] rounded-full pointer-events-none" />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onOpenNewAppModal={() => setIsNewAppModalOpen(true)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 h-full z-10">
            <Sidebar
              isCollapsed={false}
              setIsCollapsed={() => setMobileSidebarOpen(false)}
              onOpenNewAppModal={() => {
                setMobileSidebarOpen(false);
                setIsNewAppModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Navbar
          onOpenNewAppModal={() => setIsNewAppModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet context={{ refreshTrigger, triggerRefresh: () => setRefreshTrigger((p) => p + 1) }} />
        </main>
      </div>

      {/* Global Track New Application Modal */}
      <ApplicationFormModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSuccess={handleApplicationCreated}
      />
    </div>
  );
};

export default AppLayout;

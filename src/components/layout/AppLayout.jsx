import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { moduleToPath, ROUTES } from '../../routes/routeConfig';

export const AppLayout = ({ activeModule, onSelectModule, onGoToPublicWebsite, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectModule = (mod) => {
    if (onSelectModule) {
      onSelectModule(mod);
    } else {
      navigate(moduleToPath(mod));
    }
  };

  const handleGoToPublic = () => {
    if (onGoToPublicWebsite) {
      onGoToPublicWebsite();
    } else {
      navigate(ROUTES.HOME);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSelectModule={handleSelectModule}
        onGoToPublicWebsite={handleGoToPublic}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50/70 p-3 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

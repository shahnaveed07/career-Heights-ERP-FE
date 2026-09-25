import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDefaultRouteForRole, ROUTES } from '../routes/routeConfig';
import { INSTITUTE_CONFIG } from '../config/instituteConfig';

export const NotFoundView = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  const handleReturnHome = () => {
    if (isAuthenticated && currentUser) {
      navigate(getDefaultRouteForRole(currentUser.role));
    } else {
      navigate(ROUTES.HOME);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white font-black shadow-xs">
              CH
            </div>
            <div>
              <span className="block text-sm font-black tracking-tight text-blue-900">
                CAREER HEIGHTS
              </span>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Education ERP · Kashmir
              </span>
            </div>
          </div>

          <button
            onClick={handleReturnHome}
            className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" />
            <span>{isAuthenticated ? 'My Dashboard' : 'Public Website'}</span>
          </button>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 border border-blue-100 text-blue-900">
            <HelpCircle className="h-10 w-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wider uppercase mb-3">
            Error 404 · Page Not Found
          </span>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Resource Not Located
          </h1>

          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            The page or record you requested does not exist on Career Heights ERP or may have been relocated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>

            <button
              onClick={handleReturnHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
            >
              <GraduationCap className="h-4 w-4" />
              <span>{isAuthenticated ? 'Return to Dashboard' : 'Return to Home'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        {INSTITUTE_CONFIG.name} · {INSTITUTE_CONFIG.headOffice.shortTitle}
      </footer>
    </div>
  );
};

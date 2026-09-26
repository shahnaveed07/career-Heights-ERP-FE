import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  LogIn,
  MapPin,
  Phone,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { PUBLIC_NAV_ITEMS } from '../../data/publicNavItems';

export const PublicNavbar = ({
  activePage = 'home',
  onNavigate,
  onOpenLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when screen resizes to desktop width (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Handle body overflow lock when mobile menu is open, and restore correctly when closed
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    onOpenLogin();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top micro bar with institute regional presence (visible on sm+ screens >= 640px) */}
      <div className="hidden border-b border-slate-100 bg-slate-900 py-1.5 px-3 sm:px-6 lg:px-8 text-xs text-slate-300 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] truncate">
            <span className="flex items-center gap-1.5 text-blue-300 font-medium shrink-0">
              <MapPin className="h-3 w-3 text-blue-400 shrink-0" />
              Academic Excellence in J&amp;K
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 truncate hidden md:inline">
              Campuses: Handwara, Qaziabad, Dangiwacha, Kalambad, Unso
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => handleLinkClick('contact')}
              className="text-slate-300 hover:text-white transition flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
            >
              <Phone className="h-3 w-3 text-blue-400" />
              <span>Desk: +91 94190 12001</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={handleLoginClick}
              className="font-semibold text-blue-300 hover:text-white transition flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
            >
              <Shield className="h-3 w-3" />
              <span>ERP Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2 sm:gap-2.5 text-left rounded-lg p-0.5 shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
          aria-label="Career Heights Home"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white shadow-xs ring-1 ring-blue-900/20 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold tracking-tight text-slate-950 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                CAREER HEIGHTS
              </span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-blue-900 uppercase shrink-0 hidden xs:inline">
                Kashmir
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5 leading-none truncate max-w-[170px] sm:max-w-none">
              Coaching Classes &amp; Academic Institute
            </p>
          </div>
        </button>

        {/* Single Desktop Navigation (no duplicated arrays) */}
        <nav
          className="hidden lg:flex items-center gap-0.5 xl:gap-1"
          aria-label="Main Navigation"
        >
          {PUBLIC_NAV_ITEMS.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                type="button"
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative px-2.5 py-1.5 xl:px-3 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-lg transition whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900 ${
                  isActive
                    ? 'text-blue-900 bg-blue-50/90 font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 xl:left-3 xl:right-3 h-0.5 bg-blue-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions: Student Login / ERP Login CTA (Desktop only, >= 1024px) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoginClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-2xs whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
            title="Student &amp; Parent ERP Access"
          >
            <LogIn className="h-3.5 w-3.5 text-blue-800 shrink-0" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={handleLoginClick}
            className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
          >
            <span>ERP Portal</span>
          </button>
        </div>

        {/* Mobile / Tablet Controls (< 1024px) */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
          <button
            type="button"
            onClick={handleLoginClick}
            className="flex sm:hidden items-center gap-1 rounded-lg bg-blue-900 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition shadow-2xs whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
            aria-label="Login to ERP"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Login</span>
          </button>

          {/* Accessible Hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900 shrink-0"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
          style={{
            animation: 'publicNavFadeDown 0.18s ease-out forwards',
          }}
        >
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {PUBLIC_NAV_ITEMS.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold text-left transition focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    isActive
                      ? 'bg-blue-50 font-bold text-blue-950 border border-blue-100'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{link.label}</span>
                  {isActive ? (
                    <span className="h-2 w-2 rounded-full bg-blue-900" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-5 border-t border-slate-100 pt-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Authorized Portal Access
            </p>
            <button
              type="button"
              onClick={handleLoginClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <LogIn className="h-4 w-4" />
              <span>Login to Student / ERP Portal</span>
            </button>
            <div className="text-center pt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                Helpline: +91 94190 12001 (Handwara HQ)
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

import { useState } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  LogIn,
  MapPin,
  Phone,
  ChevronDown,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export const PublicNavbar = ({
  activePage = 'home',
  onNavigate,
  onOpenLogin,
  branches = [],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branchesDropdownOpen, setBranchesDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'courses', label: 'Courses' },
    { id: 'batches', label: 'Batches' },
    { id: 'results', label: 'Results' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'branches', label: 'Branches' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    setBranchesDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition shadow-2xs">
      {/* Top micro bar with institute regional presence */}
      <div className="hidden border-b border-slate-100 bg-slate-900 py-1.5 px-4 text-xs text-slate-300 sm:block sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-blue-300 font-medium">
              <MapPin className="h-3 w-3 text-blue-400" />
              Coaching &amp; Academic Excellence in Jammu &amp; Kashmir
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Campuses: Handwara, Qaziabad, Dangiwacha, Kalambad, Unso
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => onNavigate('contact')}
              className="text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              <Phone className="h-3 w-3 text-blue-400" />
              <span>Admissions Desk: +91 94190 12001</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenLogin}
              className="font-semibold text-blue-300 hover:text-white transition flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              <span>ERP Staff &amp; Faculty Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <button
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white shadow-sm ring-1 ring-blue-900/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-slate-950 text-base sm:text-lg">
                CAREER HEIGHTS
              </span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-blue-900 uppercase">
                Kashmir
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Coaching Classes &amp; Academic Institute
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
                  isActive
                    ? 'text-blue-900 bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-blue-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action: Student Login / ERP Login CTA */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-2xs"
            title="Student & Parent ERP Access"
          >
            <LogIn className="h-3.5 w-3.5 text-blue-800" />
            <span>Student Login</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
          >
            <span>ERP Portal</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenLogin}
            className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-900 flex items-center gap-1"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Login</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition ${
                    isActive
                      ? 'bg-blue-50 font-bold text-blue-950'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Authorized Portal Access
            </p>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-2.5 text-xs font-bold text-white shadow-xs"
            >
              <LogIn className="h-4 w-4" />
              <span>Login to Student / ERP Portal</span>
            </button>
            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">
                Helpline: +91 94190 12001 (Handwara)
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  BookOpen,
  Calendar,
  Award,
  Users,
} from 'lucide-react';
import { PUBLIC_NAV_ITEMS } from '../../data/publicNavItems';

export const PublicFooter = ({ onNavigate, onOpenLogin, branches = [] }) => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      {/* Upper Footer: Campus network highlight */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Kashmir Educational Network
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                5 Campuses Providing Standardized Coaching
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Handwara (HQ), Qaziabad, Dangiwacha, Kalambad, and Unso centers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('contact')}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs"
              >
                Reach Admissions Desk
              </button>
              <button
                onClick={onOpenLogin}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                ERP Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white font-black">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-lg">
                  CAREER HEIGHTS
                </span>
                <p className="text-xs text-slate-400">
                  Coaching Classes &amp; Academic Institute · Kashmir
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Dedicated coaching institute in Jammu &amp; Kashmir delivering
              disciplined academic preparation for Pre-Medical (NEET),
              Engineering (JEE), and Secondary Foundation classes with continuous
              academic tracking and parent communication.
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Head Office: Campus Tower, Main Chowk, Handwara, J&amp;K</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Phone: +91 94190 12001 / +91 94190 12002</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Email: contact@careerheights.demo</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="hover:text-white transition flex items-center gap-1.5 focus:outline-none focus:underline"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Wings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Academic Wings
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Pre-Medical Wing (NEET)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                <span>Engineering Wing (JEE)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                <span>Foundation &amp; Olympiad Wing</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                <span>Integrated Science Composite</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                <span>CHTQ Talent Quest Scholarship</span>
              </li>
            </ul>
          </div>

          {/* Student & Parent Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Digital Portals
            </h4>
            <p className="text-[11px] text-slate-400">
              Secure access for enrolled students, guardians, and faculty.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenLogin}
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <span>Student Portal</span>
                <span className="text-[10px] text-blue-400">Login &rarr;</span>
              </button>

              <button
                onClick={onOpenLogin}
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <span>Parent Oversight Desk</span>
                <span className="text-[10px] text-emerald-400">Access &rarr;</span>
              </button>

              <button
                onClick={onOpenLogin}
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <span>Faculty &amp; Staff Login</span>
                <span className="text-[10px] text-slate-400">ERP &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lower footer copyright */}
        <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Career Heights Coaching Classes.
            All rights reserved. (Jammu &amp; Kashmir).
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400 font-medium">
              Regional Education Network
            </span>
            <span>•</span>
            <button
              onClick={() => onNavigate('branches')}
              className="hover:text-slate-300"
            >
              5 Active Campuses
            </button>
            <span>•</span>
            <button
              onClick={onOpenLogin}
              className="text-blue-400 hover:underline"
            >
              ERP System Access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

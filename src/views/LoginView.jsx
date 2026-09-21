import { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export const LoginView = () => {
  const { login, loginAsDemoRole } = useAuth();
  const [email, setEmail] = useState('ceo@careerheights.demo');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setError(res.message || 'Login failed');
      }
      setLoading(false);
    }, 250);
  };
  const demoAccounts = [
    {
      role: 'ceo',
      label: 'CEO / Super Admin',
      email: 'ceo@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Full org-wide oversight across all 5 branches, financial KPIs, drill-down hierarchy.',
      badgeColor: 'bg-blue-900 text-white',
    },
    {
      role: 'hq_admin',
      label: 'HQ Admin',
      email: 'admin@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Central operations, branch auditing, academic approvals and policy control.',
      badgeColor: 'bg-indigo-700 text-white',
    },
    {
      role: 'branch_admin',
      label: 'Branch Admin',
      email: 'branch@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Handwara Branch day-to-day operations, batch management & document validation.',
      branch: 'Handwara',
      badgeColor: 'bg-slate-800 text-white',
    },
    {
      role: 'faculty',
      label: 'Faculty',
      email: 'faculty@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Dr. Rahul Sharma (Physics HOD): attendance marking, syllabus tracking, remarks.',
      branch: 'Handwara',
      badgeColor: 'bg-emerald-700 text-white',
    },
    {
      role: 'student',
      label: 'Student',
      email: 'student@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Aarav Sharma (JEE-A, CH-2026-001): timetable, DPPs, test analytics, doubt desk.',
      branch: 'Handwara',
      badgeColor: 'bg-sky-700 text-white',
    },
    {
      role: 'parent',
      label: 'Parent',
      email: 'parent@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Parent of Aarav Sharma: fee status, live attendance percentage, exam marks.',
      branch: 'Handwara',
      badgeColor: 'bg-amber-800 text-white',
    },
    {
      role: 'counsellor',
      label: 'Counsellor',
      email: 'counsellor@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Mehak Khan: Admissions CRM, lead pipeline, follow-ups, CHTQ conversions.',
      branch: 'Handwara',
      badgeColor: 'bg-purple-700 text-white',
    },
    {
      role: 'accountant',
      label: 'Accountant',
      email: 'accountant@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Imran Lone: Fee collections, receipt generator, overdue tracking, reconciliation.',
      branch: 'Handwara',
      badgeColor: 'bg-teal-700 text-white',
    },
    {
      role: 'hr_manager',
      label: 'HR Manager',
      email: 'hr@careerheights.demo',
      passwordHint: 'Demo@123',
      desc: 'Parveena Akhtar: Staff profiles, faculty leaves, attendance rates, payroll records.',
      badgeColor: 'bg-rose-700 text-white',
    },
  ];
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900 text-white shadow-lg shadow-blue-900/20 mb-3">
          <span className="text-2xl font-black tracking-wider">CH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          CAREER HEIGHTS
        </h1>
        <p className="mt-1 text-sm font-semibold tracking-wide text-blue-900 uppercase">
          Centralized Multi-Branch Education ERP
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Handwara • Qaziabad • Dangiwacha • Kalambad • Unso
        </p>
      </div>

      {/* Main Login Card and Demo Selector */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Left Column: Direct Login Form */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Sign in to ERP Console
                </h2>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Demo Prototype
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Authenticate with authorized institutional credentials.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Institutional Email Address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. ceo@careerheights.demo"
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <span className="text-[10px] font-medium text-slate-400">
                      Demo: Demo@123
                    </span>
                  </div>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span>Remember terminal</span>
                  </label>
                  <span className="text-[11px] text-blue-900 font-semibold cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition focus:outline-hidden"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Enter ERP System</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Role-Based Access Control Protected • Career Heights Education
            </div>
          </div>

          {/* Right Column: 1-Click Demo Accounts Selector */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50/60">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Instant Demo Accounts Access</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select any persona to instantly test their tailored dashboard
                  and permissions.
                </p>
              </div>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                1-Click Sign In
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.role}
                  onClick={() => loginAsDemoRole(acc.role)}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-900 hover:shadow-md transition text-left relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${acc.badgeColor}`}
                      >
                        {acc.label}
                      </span>
                      {acc.branch && (
                        <span className="text-[10px] font-medium text-slate-400">
                          {acc.branch}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                      {acc.email}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {acc.desc}
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>Pass: {acc.passwordHint}</span>
                    <span className="font-semibold text-blue-900 group-hover:underline flex items-center gap-0.5">
                      Launch &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Organization Footer */}
      <div className="mt-6 text-center text-xs text-slate-500">
        <p>
          Enterprise Hierarchy: HQ &rarr; Branch (5) &rarr; Wing &rarr; Class
          &rarr; Batch &rarr; Student
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Demo data seeded for review • All rights reserved &copy; 2026 Career
          Heights Education
        </p>
      </div>
    </div>
  );
};

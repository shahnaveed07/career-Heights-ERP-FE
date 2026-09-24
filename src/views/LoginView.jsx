import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SYSTEM_ROLES, ROLE_LABELS } from "../utils/permissionManager";
import { getDefaultRouteForRole, ROUTES } from "../routes/routeConfig";

const DEMO_ACCOUNTS = [
  {
    role: SYSTEM_ROLES.SUPER_ADMIN,
    label: "SuperAdmin / Owner",
    email: "ceo@careerheights.demo",
  },
  {
    role: SYSTEM_ROLES.HQ_ADMIN,
    label: "HQ Admin",
    email: "admin@careerheights.demo",
  },
  {
    role: SYSTEM_ROLES.BRANCH_ADMIN,
    label: "Admin",
    email: "branch@careerheights.demo",
  },
  {
    role: SYSTEM_ROLES.ACCOUNTANT_COORDINATOR,
    label: "Accountant / Coordinator",
    email: "accountant@careerheights.demo",
  },
  {
    role: SYSTEM_ROLES.TEACHER,
    label: "Teacher",
    email: "faculty@careerheights.demo",
  },
  {
    role: SYSTEM_ROLES.STUDENT,
    label: "Student",
    email: "student@careerheights.demo",
  },
  {
    role: SYSTEM_ROLES.PARENT,
    label: "Parent / Guardian",
    email: "parent@careerheights.demo",
  },
  {
    role: SYSTEM_ROLES.HR,
    label: "HR",
    email: "hr@careerheights.demo",
  },
];

export const LoginView = ({ onBackToHome }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAccount = useMemo(
    () => DEMO_ACCOUNTS.find((account) => account.role === selectedRole),
    [selectedRole],
  );

  const handleDemoRoleChange = (role) => {
    setSelectedRole(role);
    setError("");

    const account = DEMO_ACCOUNTS.find((item) => item.role === role);

    if (account) {
      setEmail(account.email);
      setPassword("Demo@123");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError("Please enter your email address and password.");
      return;
    }

    setLoading(true);

    window.setTimeout(() => {
      const result = login(normalizedEmail, normalizedPassword);

      if (!result.success) {
        setError(
          result.message || "Unable to sign in. Please check your credentials.",
        );
        setLoading(false);
      } else {
        const fromPath = location.state?.from?.pathname;
        const targetRoute =
          fromPath && fromPath !== ROUTES.LOGIN
            ? fromPath
            : getDefaultRouteForRole(result.user?.role || selectedRole);
        navigate(targetRoute, { replace: true });
      }
    }, 350);
  };

  const handleForgotPassword = () => {
    setError("Password recovery will be available in the production version.");
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="grid min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
            {/* Brand Panel */}
            <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.20),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),_transparent_35%)]" />

              <div className="relative z-10 p-10 xl:p-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg">
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-bold tracking-[0.18em] text-white">
                      CAREER HEIGHTS
                    </p>
                    <p className="text-xs text-slate-400">Education ERP</p>
                  </div>
                </div>

                <div className="mt-20 max-w-md">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                    Centralized Management Platform
                  </p>

                  <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                    One system for every
                    <span className="block text-blue-400">
                      Career Heights branch.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
                    Manage students, admissions, attendance, academics, fees,
                    examinations and branch operations from one centralized ERP.
                  </p>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3 p-10 pt-0 xl:p-12 xl:pt-0">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold">5 Branches</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Centralized HQ visibility
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold">Role Based</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Access by responsibility
                  </p>
                </div>
              </div>
            </section>

            {/* Login Panel */}
            <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
              <div className="mx-auto w-full max-w-md">
                {/* Mobile Branding */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-bold tracking-[0.16em] text-slate-900">
                      CAREER HEIGHTS
                    </p>
                    <p className="text-xs text-slate-500">Education ERP</p>
                  </div>
                </div>

                {/* Heading */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onBackToHome) onBackToHome();
                      else navigate(ROUTES.HOME);
                    }}
                    className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-700 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>&larr; Return to Institute Website</span>
                  </button>

                  <div className="mb-4 flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-700">
                        ERP DEMO ENVIRONMENT
                      </span>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to access the Career Heights ERP.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <span className="text-sm font-bold">!</span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-red-800">
                        Sign-in failed
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="erp-email"
                      className="mb-2 block text-xs font-semibold text-slate-700"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="erp-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError("");
                        }}
                        placeholder="you@careerheights.com"
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="erp-password"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-semibold text-blue-700 transition hover:text-blue-900"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="erp-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError("");
                        }}
                        placeholder="Enter your password"
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember */}
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />

                    <span className="text-xs font-medium text-slate-600">
                      Keep me signed in on this device
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-blue-700 hover:shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in to ERP
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Access */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Demo access
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Select a role to load demo credentials.
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Demo Only
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <select
                      value={selectedRole}
                      onChange={(event) =>
                        handleDemoRoleChange(event.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                    >
                      <option value="">Select demo role</option>

                      {DEMO_ACCOUNTS.map((account) => (
                        <option key={account.role} value={account.role}>
                          {account.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {selectedAccount && (
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-blue-900">
                            {selectedAccount.label}
                          </p>

                          <p className="mt-1 text-xs text-blue-700">
                            {selectedAccount.email}
                          </p>
                        </div>

                        <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-100 bg-white/80 px-3 py-2">
                        <span className="text-[11px] font-medium text-slate-500">
                          Demo password
                        </span>

                        <code className="text-[11px] font-bold text-slate-700">
                          Demo@123
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-[11px] leading-5 text-slate-400">
                    Authorized users only · Career Heights Education
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Frontend demonstration environment · 2026
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

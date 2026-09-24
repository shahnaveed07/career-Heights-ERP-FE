import { useNavigate, Outlet } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeRole, ROLE_LABELS, SYSTEM_ROLES } from '../utils/permissionManager';
import { getDefaultRouteForRole } from './routeConfig';

/**
 * Route-level RBAC Gate.
 * Enforces granular permissions (module.action) or role whitelist before rendering route contents.
 * Directly typed URLs lacking clearance are blocked with a clear institutional notice.
 */
export const PermissionGuard = ({
  module,
  action = 'view',
  allowedRoles,
  children,
}) => {
  const { currentUser, can, hasRole } = useAuth();
  const navigate = useNavigate();

  const canonicalRole = normalizeRole(currentUser?.role);
  const displayRole = ROLE_LABELS[canonicalRole] || currentUser?.role || 'Guest';

  // SuperAdmin always has full clearance
  if (canonicalRole === SYSTEM_ROLES.SUPER_ADMIN) {
    return children ? children : <Outlet />;
  }

  // Check role whitelist if provided
  let roleAllowed = true;
  if (allowedRoles && allowedRoles.length > 0) {
    roleAllowed = hasRole(allowedRoles);
  }

  // Check granular permission if module is provided
  let permissionAllowed = true;
  if (module) {
    permissionAllowed = can(module, action);
  }

  const hasAccess = roleAllowed && permissionAllowed;

  if (!hasAccess) {
    const defaultRoute = getDefaultRouteForRole(currentUser?.role);
    const requiredPermission = module ? `${module}.${action}` : allowedRoles?.join(' or ');

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-sm border border-rose-100">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Institutional RBAC Boundary</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h2>

        <p className="text-sm text-slate-500 max-w-md mb-3 leading-relaxed">
          Your current account role (<strong className="text-slate-800">{displayRole}</strong>) does not have authorization clearance to access this route.
        </p>

        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-600 mb-6 font-mono">
          Required Clearance: <span className="font-bold text-rose-700">{requiredPermission}</span>
        </div>

        <button
          onClick={() => navigate(defaultRoute)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Authorized Dashboard
        </button>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS, INITIAL_BRANCHES } from '../data/mockData';
import {
  checkPermission,
  canAccessBranch as checkBranchAccess,
  normalizeRole,
  SYSTEM_ROLES,
  ROLE_LABELS,
} from '../utils/permissionManager';
import {
  canUserAccessAllBranches,
  getUserAssignedBranchIds,
  getUserPrimaryBranchId,
  getUserAccessibleBranchObjects,
  canUserSelectBranch,
  validateBranchSwitch,
  resolveInitialActiveBranch,
} from '../utils/branchAccessModel';

const AuthContext = createContext(void 0);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('career_heights_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          // Normalize legacy role aliases on load
          const canonical = normalizeRole(parsed.role);
          if (canonical && canonical !== parsed.role) {
            parsed.role = canonical;
            parsed.roleTitle = ROLE_LABELS[canonical] || parsed.roleTitle;
          }
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // UI Working Mode: 'view' (VIEW ONLY - strict inspection) vs 'edit' (EDIT MODE - permitted mutations)
  const [uiMode, setUiMode] = useState(() => {
    return localStorage.getItem('career_heights_ui_mode') || 'edit';
  });

  // Exactly ONE branch can be ACTIVE at a time (or 'all' for authorized central leadership)
  const [activeBranchId, setActiveBranchId] = useState(() => {
    const saved = localStorage.getItem('career_heights_active_branch');
    return resolveInitialActiveBranch(currentUser, saved, INITIAL_BRANCHES);
  });

  const [branchSwitchError, setBranchSwitchError] = useState(null);
  const [customRolesRegistry, setCustomRolesRegistry] = useState([]);

  useEffect(() => {
    localStorage.setItem('career_heights_ui_mode', uiMode);
  }, [uiMode]);

  useEffect(() => {
    localStorage.setItem('career_heights_active_branch', activeBranchId);
  }, [activeBranchId]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('career_heights_user', JSON.stringify(currentUser));
      // Reconcile active branch against user permissions:
      // If current active branch is unauthorized, snap safely to authorized primary/first assigned branch
      const safeBranch = resolveInitialActiveBranch(currentUser, activeBranchId, INITIAL_BRANCHES);
      if (safeBranch !== activeBranchId) {
        setActiveBranchId(safeBranch);
      }
    } else {
      localStorage.removeItem('career_heights_user');
    }
  }, [currentUser]);

  const toggleUiMode = () => {
    setUiMode((prev) => (prev === 'view' ? 'edit' : 'view'));
  };

  /**
   * Safely switches the single active branch.
   * If target branch is unauthorized (e.g., normal admin selecting an unassigned branch or 'all'),
   * this operation fails safely without altering state.
   */
  const setActiveBranch = (targetBranchId) => {
    const validation = validateBranchSwitch(currentUser, targetBranchId, INITIAL_BRANCHES);
    if (!validation.allowed) {
      console.warn(`[BranchAccess] Switch to "${targetBranchId}" denied: ${validation.reason}`);
      setBranchSwitchError(validation.reason);
      return { success: false, reason: validation.reason };
    }

    setBranchSwitchError(null);
    setActiveBranchId(targetBranchId);
    return { success: true, effectiveBranch: targetBranchId };
  };

  const login = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    let entry = DEMO_USERS[normalizedEmail];

    // Check email aliases if not directly found
    if (!entry) {
      entry = Object.values(DEMO_USERS).find(
        (e) => e.user?.email?.toLowerCase() === normalizedEmail
      );
    }

    if (!entry) {
      return {
        success: false,
        message: 'Invalid credentials. Please pick an authorized demo account below.',
      };
    }
    if (password !== entry.passwordHint) {
      return {
        success: false,
        message: 'Incorrect password. Demo password is Demo@123',
      };
    }

    const user = { ...entry.user };
    const canonicalRole = normalizeRole(user.role);
    user.role = canonicalRole;
    user.roleTitle = ROLE_LABELS[canonicalRole] || user.roleTitle;

    setCurrentUser(user);
    setBranchSwitchError(null);

    const initialBranch = resolveInitialActiveBranch(user, null, INITIAL_BRANCHES);
    setActiveBranchId(initialBranch);

    return { success: true, user };
  };

  const loginAsDemoRole = (targetRoleKey) => {
    const targetCanonical = normalizeRole(targetRoleKey);

    const entry = Object.values(DEMO_USERS).find((e) => {
      const entryCanonical = normalizeRole(e.user.role);
      return entryCanonical === targetCanonical;
    });

    if (entry) {
      const user = { ...entry.user };
      user.role = targetCanonical;
      user.roleTitle = ROLE_LABELS[targetCanonical] || user.roleTitle;
      setCurrentUser(user);
      setBranchSwitchError(null);

      const initialBranch = resolveInitialActiveBranch(user, null, INITIAL_BRANCHES);
      setActiveBranchId(initialBranch);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveBranchId('all');
    setBranchSwitchError(null);
  };

  /**
   * Check whether current user satisfies one of the given role keys
   */
  const hasRole = (roles) => {
    if (!currentUser) return false;
    const currentCanonical = normalizeRole(currentUser.role);
    if (currentCanonical === SYSTEM_ROLES.SUPER_ADMIN) return true;

    const list = Array.isArray(roles) ? roles : [roles];
    return list.some((r) => normalizeRole(r) === currentCanonical);
  };

  /**
   * Check granular permission for the active user considering current UI Mode.
   * If uiMode === 'view' and action !== 'view', returns false.
   */
  const can = (module, action = 'view') => {
    return checkPermission(currentUser, module, action, uiMode, customRolesRegistry);
  };

  /**
   * Check if user is authorized to perform the action ignoring UI Mode
   * (for displaying disabled button tooltips/reason messages).
   */
  const isAuthorized = (module, action = 'view') => {
    return checkPermission(currentUser, module, action, 'edit', customRolesRegistry);
  };

  /**
   * Check if user is allowed to access/modify a specific branch
   */
  const canAccessBranch = (branchId) => {
    return checkBranchAccess(currentUser, branchId);
  };

  const assignedBranchIds = getUserAssignedBranchIds(currentUser);
  const primaryBranchId = getUserPrimaryBranchId(currentUser);
  const canAccessAllBranches = canUserAccessAllBranches(currentUser);
  const accessibleBranches = getUserAccessibleBranchObjects(currentUser, INITIAL_BRANCHES);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        // Single Active Branch Focus
        activeBranchId,
        activeBranchFilter: activeBranchId, // backwards-compatible alias
        setActiveBranch,
        setActiveBranchFilter: setActiveBranch, // backwards-compatible alias
        branchSwitchError,
        clearBranchSwitchError: () => setBranchSwitchError(null),
        // Membership & Clearance
        assignedBranchIds,
        primaryBranchId,
        canAccessAllBranches,
        accessibleBranches,
        canSelectBranch: (bId) => canUserSelectBranch(currentUser, bId, INITIAL_BRANCHES),
        // UI Mode & Granular RBAC
        uiMode,
        setUiMode,
        toggleUiMode,
        can,
        isAuthorized,
        canAccessBranch,
        login,
        loginAsDemoRole,
        logout,
        hasRole,
        customRolesRegistry,
        setCustomRolesRegistry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

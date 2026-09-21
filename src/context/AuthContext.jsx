import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../data/mockData';
import { checkPermission, getUserAccessibleBranches } from '../utils/permissionManager';

const AuthContext = createContext(void 0);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('career_heights_user');
    if (saved) {
      try {
        return JSON.parse(saved);
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

  const [activeBranchFilter, setActiveBranchFilter] = useState(() => {
    return localStorage.getItem('career_heights_active_branch') || 'all';
  });

  useEffect(() => {
    localStorage.setItem('career_heights_ui_mode', uiMode);
  }, [uiMode]);

  useEffect(() => {
    localStorage.setItem('career_heights_active_branch', activeBranchFilter);
  }, [activeBranchFilter]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('career_heights_user', JSON.stringify(currentUser));
      // Ensure branch filter adheres to user permissions
      const isSuperOrHq = currentUser.role === 'ceo' || currentUser.role === 'super_admin' || currentUser.role === 'hq_admin';
      const assigned = currentUser.assignedBranchIds || (currentUser.branchId ? [currentUser.branchId] : []);

      if (!isSuperOrHq) {
        // If current filter is 'all' or not in assigned, snap to primary/first assigned branch
        if (activeBranchFilter === 'all' || !assigned.includes(activeBranchFilter)) {
          const defaultBranch = currentUser.branchId || assigned[0] || 'b-hdw';
          setActiveBranchFilter(defaultBranch);
        }
      }
    } else {
      localStorage.removeItem('career_heights_user');
    }
  }, [currentUser]);

  const toggleUiMode = () => {
    setUiMode((prev) => (prev === 'view' ? 'edit' : 'view'));
  };

  const login = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const entry = DEMO_USERS[normalizedEmail];
    if (!entry) {
      return {
        success: false,
        message: 'Invalid demo credentials. Please pick an authorized demo account below.',
      };
    }
    if (password !== entry.passwordHint) {
      return {
        success: false,
        message: 'Incorrect password. Demo password is Demo@123',
      };
    }

    const user = entry.user;
    setCurrentUser(user);

    const isSuperOrHq = user.role === 'ceo' || user.role === 'super_admin' || user.role === 'hq_admin';
    if (isSuperOrHq) {
      setActiveBranchFilter('all');
    } else {
      const assigned = user.assignedBranchIds || (user.branchId ? [user.branchId] : []);
      setActiveBranchFilter(user.branchId || assigned[0] || 'b-hdw');
    }

    return { success: true };
  };

  const loginAsDemoRole = (role) => {
    // Map aliases
    let targetRole = role;
    if (role === 'super_admin') targetRole = 'ceo';
    if (role === 'teacher') targetRole = 'faculty';
    if (role === 'admin') targetRole = 'branch_admin';
    if (role === 'accountant_coordinator') targetRole = 'accountant';

    const entry = Object.values(DEMO_USERS).find((e) => e.user.role === targetRole);
    if (entry) {
      const user = entry.user;
      setCurrentUser(user);
      const isSuperOrHq = user.role === 'ceo' || user.role === 'super_admin' || user.role === 'hq_admin';
      if (isSuperOrHq) {
        setActiveBranchFilter('all');
      } else {
        const assigned = user.assignedBranchIds || (user.branchId ? [user.branchId] : []);
        setActiveBranchFilter(user.branchId || assigned[0] || 'b-hdw');
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveBranchFilter('all');
  };

  const hasRole = (roles) => {
    if (!currentUser) return false;
    const isSuperOrHq = currentUser.role === 'ceo' || currentUser.role === 'super_admin' || currentUser.role === 'hq_admin';
    if (isSuperOrHq) return true;

    // Normalize roles for backward compatibility
    const currentRole = currentUser.role;
    return roles.some((r) => {
      if (r === currentRole) return true;
      if (r === 'teacher' && currentRole === 'faculty') return true;
      if (r === 'admin' && currentRole === 'branch_admin') return true;
      if (r === 'accountant_coordinator' && currentRole === 'accountant') return true;
      if (r === 'accountant' && currentRole === 'accountant_coordinator') return true;
      return false;
    });
  };

  /**
   * Check granular permission for the active user considering current UI Mode.
   * If uiMode === 'view' and action !== 'view', returns false.
   */
  const can = (module, action = 'view') => {
    return checkPermission(currentUser, module, action, uiMode);
  };

  /**
   * Check if user is allowed to perform the action ignoring UI Mode (for showing disabled states / hints)
   */
  const isAuthorized = (module, action = 'view') => {
    return checkPermission(currentUser, module, action, 'edit');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeBranchFilter,
        setActiveBranchFilter,
        uiMode,
        setUiMode,
        toggleUiMode,
        can,
        isAuthorized,
        login,
        loginAsDemoRole,
        logout,
        hasRole,
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


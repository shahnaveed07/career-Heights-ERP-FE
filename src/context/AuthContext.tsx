import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  activeBranchFilter: string; // 'all' or branch id ('b-hdw', 'b-qzb', etc.)
  setActiveBranchFilter: (branchId: string) => void;
  login: (email: string, password: string) => { success: boolean; message?: string };
  loginAsDemoRole: (role: Role) => void;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('career_heights_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Opens directly into login page on first load
  });

  const [activeBranchFilter, setActiveBranchFilter] = useState<string>('all');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('career_heights_user', JSON.stringify(currentUser));
      if (currentUser.branchId && (currentUser.role === 'branch_admin' || currentUser.role === 'faculty')) {
        setActiveBranchFilter(currentUser.branchId);
      }
    } else {
      localStorage.removeItem('career_heights_user');
    }
  }, [currentUser]);

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const entry = DEMO_USERS[normalizedEmail];
    if (!entry) {
      return { success: false, message: 'Invalid demo credentials. Please pick an authorized demo account below.' };
    }
    if (password !== entry.passwordHint) {
      return { success: false, message: 'Incorrect password. Demo password is Demo@123' };
    }
    setCurrentUser(entry.user);
    if (entry.user.branchId && entry.user.role !== 'ceo' && entry.user.role !== 'hq_admin') {
      setActiveBranchFilter(entry.user.branchId);
    } else {
      setActiveBranchFilter('all');
    }
    return { success: true };
  };

  const loginAsDemoRole = (role: Role) => {
    const entry = Object.values(DEMO_USERS).find(e => e.user.role === role);
    if (entry) {
      setCurrentUser(entry.user);
      if (entry.user.branchId && entry.user.role !== 'ceo' && entry.user.role !== 'hq_admin') {
        setActiveBranchFilter(entry.user.branchId);
      } else {
        setActiveBranchFilter('all');
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveBranchFilter('all');
  };

  const hasRole = (roles: Role[]) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ceo' || currentUser.role === 'hq_admin') return true;
    return roles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeBranchFilter,
        setActiveBranchFilter,
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

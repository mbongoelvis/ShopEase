import React, { createContext, useState, useContext } from 'react';
import { ApiUser, loginRequest, setAuthToken, apiRequest } from '../services/api';

export type UserRole = 'cashier' | 'stocker' | 'guard' | null;

interface AuthContextType {
  role: UserRole;
  user: ApiUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  mustChangePassword: boolean;
  setMustChangePassword: (v: boolean) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  user: null,
  login: async () => {},
  logout: () => {},
  mustChangePassword: false,
  setMustChangePassword: () => {},
  changePassword: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    const response = await loginRequest(email.trim(), password);
    const roleMap: Record<string, Exclude<UserRole, null>> = {
      CASHIER: 'cashier',
      STOCKER: 'stocker',
      SECURITY_GUARD: 'guard',
      GUARD: 'guard',
    };
    const normalizedRole = roleMap[response.user.role.toUpperCase()];
    if (!normalizedRole) {
      throw new Error('This account does not have a mobile app role');
    }
    setAuthToken(response.token);
    setUser(response.user);
    setRole(normalizedRole);
    setMustChangePassword(response.user.mustResetPassword);
  };

  const refreshUser = async () => {
    if (!user) return;
    const response = await apiRequest<{ user: ApiUser }>('/auth/me');
    setUser(response.user);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await apiRequest('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setMustChangePassword(false);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setRole(null);
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout, mustChangePassword, setMustChangePassword, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
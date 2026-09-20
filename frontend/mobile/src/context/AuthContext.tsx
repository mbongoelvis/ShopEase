import React, { createContext, useState, useContext } from 'react';

export type UserRole = 'cashier' | 'stocker' | 'guard' | null;

interface AuthContextType {
  role: UserRole;
  login: (selectedRole: UserRole) => void;
  logout: () => void;
  mustChangePassword: boolean;
  setMustChangePassword: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => {},
  logout: () => {},
  mustChangePassword: false,
  setMustChangePassword: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
    // show change-password modal on first login for test purposes
    setMustChangePassword(true);
  };
  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout, mustChangePassword, setMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
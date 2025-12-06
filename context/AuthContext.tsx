import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole } from '../types';
import { getUsers, createUser } from '../services/storageService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, documentId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for persisted session in localStorage (simple mechanism)
    const storedUser = localStorage.getItem('portal_session');
    if (storedUser) {
      setState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    const users = getUsers();
    const validUser = users.find(u => u.email === email && u.password === password);

    if (validUser) {
      // Don't store password in session
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = validUser;
      localStorage.setItem('portal_session', JSON.stringify(safeUser));
      setState({
        user: safeUser,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      throw new Error('Credenciales inválidas');
    }
  };

  const register = async (name: string, email: string, documentId: string, password: string) => {
    const newUser = await createUser({
      name,
      email,
      documentId,
      password,
      role: UserRole.USER // Always register as user
    });

     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem('portal_session', JSON.stringify(safeUser));
    setState({
      user: safeUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('portal_session');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
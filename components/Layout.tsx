import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldCheck, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar / Mobile Header */}
      <aside className="bg-accent text-white w-full md:w-64 flex-shrink-0 flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-gray-700">
          <div className="bg-primary p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Portal Facturas</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {user?.role === UserRole.ADMIN && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin') ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Administración</span>
            </Link>
          )}
          
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard') ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Mis Facturas</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="mb-4 px-4">
            <p className="text-sm text-gray-400">Logueado como:</p>
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {user?.role === UserRole.ADMIN && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">
                    Administrador
                </span>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
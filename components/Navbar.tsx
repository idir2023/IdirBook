import React from 'react';
import { BookOpen, LogOut, LayoutGrid, PlusCircle, Shield, Sun, Moon } from 'lucide-react';
import { User, ViewState } from '../types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogin: () => void;
  onLogout: () => void;
  notificationCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  currentView, 
  onNavigate, 
  onLogin, 
  onLogout, 
  notificationCount,
  theme,
  onToggleTheme
}) => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-library-navy dark:bg-slate-900 text-white shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('marketplace')}>
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-lg group-hover:bg-library-orange transition-colors">
               <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-white">IdirBook</h1>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              type="button"
              onClick={() => onNavigate('marketplace')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === 'marketplace' ? 'text-library-orange' : 'text-gray-300 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
              <span className="hidden md:inline">Marketplace</span>
            </button>

            {user && (
              <button 
                type="button"
                onClick={() => onNavigate('dashboard')}
                className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-library-orange' : 'text-gray-300 hover:text-white'}`}
              >
                <PlusCircle size={18} />
                <span className="hidden md:inline">Dashboard</span>
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-library-orange text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}

            {user?.isAdmin && (
              <button 
                type="button"
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === 'admin' ? 'text-library-orange' : 'text-gray-300 hover:text-white'}`}
              >
                <Shield size={18} />
                <span className="hidden md:inline">Admin Portal</span>
              </button>
            )}

            <div className="h-6 w-px bg-white/20 mx-2 hidden md:block"></div>
            
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3">
                   <div className="text-right">
                     <p className="text-sm font-medium text-white">{user.name}</p>
                     {user.isAdmin && <p className="text-[10px] uppercase tracking-wider text-library-orange text-right leading-none">Admin</p>}
                   </div>
                   <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-white/20" />
                </div>
                <button 
                  type="button"
                  onClick={onLogout} 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut size={20} className="text-gray-300 hover:text-white" />
                </button>
              </div>
            ) : (
              <Button variant="action" onClick={onLogin} className="!px-8">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
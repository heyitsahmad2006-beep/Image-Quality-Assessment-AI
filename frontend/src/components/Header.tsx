import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, LogOut, Cpu, BarChart2, History, Home } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  modelMode?: string;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, modelMode }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-900/30 bg-dark-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl btn-3d-purple flex items-center justify-center text-white shadow-purple-glow">
            <ShieldCheck className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
              IQA <span className="text-purple-400">VISION AI</span>
            </span>
            <span className="block text-[10px] text-gray-400 font-mono tracking-wider uppercase">
              Quality Suitability Engine
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-purple-400 flex items-center space-x-1.5 transition-colors">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link to="/dashboard" className="hover:text-purple-400 flex items-center space-x-1.5 transition-colors">
            <Cpu className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link to="/history" className="hover:text-purple-400 flex items-center space-x-1.5 transition-colors">
            <History className="w-4 h-4" />
            <span>History</span>
          </Link>
          <Link to="/performance" className="hover:text-purple-400 flex items-center space-x-1.5 transition-colors">
            <BarChart2 className="w-4 h-4" />
            <span>Model Status</span>
          </Link>
        </nav>

        {/* Model Mode Indicator & User Menu */}
        <div className="flex items-center space-x-4">
          {modelMode && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-purple-300 font-mono">{modelMode}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-dark-850 px-3 py-1.5 rounded-xl border border-purple-900/40">
                <UserIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">{user.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-dark-850 hover:bg-red-950/60 text-gray-400 hover:text-red-400 border border-purple-900/30 hover:border-red-500/40 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-dark-850 hover:bg-dark-800 border border-purple-900/40 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white btn-3d-purple shadow-purple-glow"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

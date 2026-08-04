import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/30 text-purple-400">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white">404 — Page Not Found</h1>
      <p className="text-sm text-gray-400 max-w-md">
        The requested page does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-xl btn-3d-purple text-white font-bold text-sm flex items-center space-x-2 shadow-purple-glow"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </button>
    </div>
  );
};

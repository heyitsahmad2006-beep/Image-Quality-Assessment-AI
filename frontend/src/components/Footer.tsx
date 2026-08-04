import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full glass-panel border-t border-purple-900/30 bg-dark-950 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-gray-300">Image Quality Assessment AI v1.0.0</span>
        </div>

        <div className="flex items-center space-x-2 text-center md:text-left text-gray-400">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Responsible AI Note: High-confidence AI assessment derived from validated performance test benchmarks. Real-world accuracy depends on camera sensors, illumination, and domain distributions.
          </span>
        </div>

        <div className="text-gray-500 font-mono">
          © 2026 Image Quality Assessment Platform
        </div>
      </div>
    </footer>
  );
};

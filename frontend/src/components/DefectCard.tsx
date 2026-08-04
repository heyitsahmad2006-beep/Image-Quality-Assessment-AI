import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Sun,
  Moon,
  Zap,
  Activity,
  ShieldAlert,
  Crop,
  Maximize2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { DefectDetail } from '../types';

interface DefectCardProps {
  name: string;
  detail: DefectDetail;
}

const DEFECT_ICONS: Record<string, React.ReactNode> = {
  blur: <Eye className="w-5 h-5 text-blue-400" />,
  glare: <Sun className="w-5 h-5 text-amber-400" />,
  darkness: <Moon className="w-5 h-5 text-indigo-400" />,
  overexposure: <Zap className="w-5 h-5 text-yellow-400" />,
  motion_artifacts: <Activity className="w-5 h-5 text-red-400" />,
  occlusion: <ShieldAlert className="w-5 h-5 text-orange-400" />,
  poor_framing: <Crop className="w-5 h-5 text-teal-400" />,
  low_resolution: <Maximize2 className="w-5 h-5 text-purple-400" />,
};

export const DefectCard: React.FC<DefectCardProps> = ({ name, detail }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'moderate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const formattedName = name.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const icon = DEFECT_ICONS[name] || <AlertCircle className="w-5 h-5 text-purple-400" />;

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 relative flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-dark-900 border border-purple-900/40">
              {icon}
            </div>
            <h4 className="font-bold text-white text-base">{formattedName}</h4>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase border ${getStatusColor(detail.status)}`}>
            {detail.status}
          </span>
        </div>

        {/* Severity Progress Bar */}
        <div className="space-y-1.5 my-3">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-400">Severity</span>
            <span className="text-white font-bold">{detail.severity.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-dark-900 overflow-hidden border border-purple-900/30">
            <motion.div
              className={`h-full rounded-full ${
                detail.severity < 25
                  ? 'bg-emerald-500'
                  : detail.severity < 50
                  ? 'bg-amber-500'
                  : detail.severity < 75
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, detail.severity)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Short Explanation */}
        <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
          {detail.explanation || 'Analyzed by multi-task quality head.'}
        </p>
      </div>

      {/* Expandable Section */}
      <div className="mt-4 pt-3 border-t border-purple-900/20">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-purple-400 hover:text-purple-300 font-medium"
        >
          <span>Confidence: {(detail.confidence * 100).toFixed(0)}%</span>
          <span className="flex items-center space-x-1">
            <span>{isExpanded ? 'Less' : 'Details'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 text-xs text-gray-400 bg-dark-900/60 p-3 rounded-lg border border-purple-900/30"
            >
              <div>
                <span className="text-purple-300 font-semibold block mb-0.5">Recommendation:</span>
                <p className="text-gray-300">{detail.recommendation || 'No action needed.'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

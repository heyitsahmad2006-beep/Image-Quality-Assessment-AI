import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, ArrowRight, Eye, Sun, Moon, Zap, Activity, ShieldAlert, Crop, Maximize2, CheckCircle2, Sparkles, Layers, Sliders } from 'lucide-react';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { CircularQualityMeter } from '../components/CircularQualityMeter';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const defectsList = [
    { name: 'Blur & Softness', icon: <Eye className="w-5 h-5 text-blue-400" />, desc: 'Laplacian variance & Sobel edge sharpness detection' },
    { name: 'Specular Glare', icon: <Sun className="w-5 h-5 text-amber-400" />, desc: 'Highlight saturation & specular reflection heuristics' },
    { name: 'Darkness / Shadow', icon: <Moon className="w-5 h-5 text-indigo-400" />, desc: 'Luminance histogram & shadow clipping analysis' },
    { name: 'Overexposure', icon: <Zap className="w-5 h-5 text-yellow-400" />, desc: 'Blown-out white pixel ratio & highlight distribution' },
    { name: 'Motion Artifacts', icon: <Activity className="w-5 h-5 text-red-400" />, desc: 'Gradient directional consistency & motion streaks' },
    { name: 'Occlusion', icon: <ShieldAlert className="w-5 h-5 text-orange-400" />, desc: 'Foreground obstruction & border blockage heuristics' },
    { name: 'Poor Framing', icon: <Crop className="w-5 h-5 text-teal-400" />, desc: 'Subject border proximity & rule-of-thirds centering' },
    { name: 'Low Resolution', icon: <Maximize2 className="w-5 h-5 text-purple-400" />, desc: 'Megapixel adequacy for downstream computer vision' },
  ];

  return (
    <div className="w-full bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>High-Confidence AI Computer Vision Suitability Engine</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Evaluate Image Quality for <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
            Downstream AI Models
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Multi-task computer vision architecture detecting 8 critical defect categories, computing explainable technical metrics, and returning deterministic suitability decisions in milliseconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl btn-3d-purple text-white font-bold text-base flex items-center justify-center space-x-3 shadow-purple-glow"
          >
            <span>Launch Image Analysis</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/performance')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-200 font-semibold text-base border border-purple-900/50 hover:border-purple-500/50 transition-all"
          >
            View Model Metrics
          </button>
        </motion.div>
      </section>

      {/* Live Interactive Gauge Preview Card */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="glass-panel rounded-3xl p-8 max-w-4xl mx-auto relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 bg-purple-900/40 text-purple-300 text-xs font-mono rounded-bl-xl border-l border-b border-purple-500/30">
          Live Interactive Meter Preview
        </div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Dual Meter Assessment Preview</h3>
          <p className="text-xs text-gray-400">Combined Speedometer Gauge & Circular Quality Progress Ring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
          <CircularQualityMeter score={84} category="Best" size={220} />
          <SpeedometerGauge score={84} suitability="Highly Suitable" />
        </div>
      </motion.section>

      {/* 8 Defect Categories Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">8 Comprehensive Quality Defect Detectors</h2>
          <p className="text-sm text-gray-400">Combining PyTorch deep neural features with OpenCV statistical analysis</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {defectsList.map((defect, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-dark-900 border border-purple-900/40">
                  {defect.icon}
                </div>
                <h4 className="font-bold text-white text-base">{defect.name}</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{defect.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works & Architecture */}
      <section className="glass-panel rounded-3xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">System Architecture & Pipeline</h2>
          <p className="text-sm text-gray-400">From raw image byte ingestion to multi-task quality score fusion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-dark-900/60 p-6 rounded-2xl border border-purple-900/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center text-purple-400 font-bold">1</div>
            <h4 className="text-lg font-bold text-white">1. Preprocessing & Validation</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              MIME validation, corrupt file detection, EXIF orientation correction, RGB conversion, and safe filename generation.
            </p>
          </div>
          <div className="bg-dark-900/60 p-6 rounded-2xl border border-purple-900/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center text-purple-400 font-bold">2</div>
            <h4 className="text-lg font-bold text-white">2. Multi-Task Vision AI</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Shared ConvNeXt / EfficientNet backbone extracting visual features into 8 distinct defect heads and suitability classification.
            </p>
          </div>
          <div className="bg-dark-900/60 p-6 rounded-2xl border border-purple-900/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center text-purple-400 font-bold">3</div>
            <h4 className="text-lg font-bold text-white">3. Score Fusion & Feedback</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Mathematical score fusion combining AI heads with OpenCV metrics into a 0-100 score and actionable recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Responsible AI Disclaimer Banner */}
      <section className="p-6 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start space-x-4">
        <ShieldCheck className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-gray-300">
          <h4 className="font-bold text-purple-200 text-sm">Validated Performance & Transparency</h4>
          <p>
            This system is built for validated empirical performance. It displays high-confidence AI assessment derived from controlled benchmark test sets without falsely claiming unvalidated 100% real-world accuracy.
          </p>
        </div>
      </section>
    </div>
  );
};

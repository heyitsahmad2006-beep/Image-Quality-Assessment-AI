import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, ShieldCheck, FileText, AlertTriangle, Layers } from 'lucide-react';
import { CircularQualityMeter } from '../components/CircularQualityMeter';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { DefectCard } from '../components/DefectCard';
import { AnalysisResponse } from '../types';
import { api } from '../api/client';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [result, setResult] = useState<AnalysisResponse | null>(location.state?.result || null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    if (id && (!result || result.analysis_id !== id)) {
      fetchAnalysisResult(id);
    }
  }, [id]);

  const fetchAnalysisResult = async (analysisId: string) => {
    setLoading(true);
    try {
      const res = await api.getAnalysis(analysisId);
      setResult(res);
    } catch (err) {
      console.error('Failed to load analysis result:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-300 font-semibold">Loading Assessment Report...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Analysis Report Not Found</h3>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-xl btn-3d-purple text-white text-sm font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const modeLabel = result.mode || (result.model_mode === 'pretrained_iqa' ? 'AI Model Mode' : 'Heuristic Fallback Mode');
  const iqaScore = result.iqa_model?.normalized_score ?? result.overall_quality_score;
  const techScore = result.technical_quality_score ?? (100 - (result.score_breakdown?.weighted_defect_severity || 0)).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-grid-pattern">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-300 hover:text-white border border-purple-900/40 transition-all text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-3 text-xs text-gray-400">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Processed in <strong className="text-white font-mono">{result.processing_time_ms} ms</strong></span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 font-mono">
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Main Dual Gauge Assessment Banner */}
      <div className="glass-panel rounded-3xl p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-purple-900/30 pb-4">
          <div>
            <div className="text-xs text-purple-400 uppercase font-semibold tracking-wider">Analysis ID: {result.analysis_id}</div>
            <h2 className="text-2xl font-black text-white truncate max-w-xl">{result.filename}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400">Analysis Reliability: <strong className="text-white font-mono">{(result.confidence * 100).toFixed(0)}%</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center py-4">
          <CircularQualityMeter score={result.overall_quality_score} category={result.quality_category} size={230} />
          <SpeedometerGauge score={result.overall_quality_score} suitability={result.suitability} />
        </div>
      </div>

      {/* Quality Score Source Breakdown Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 border border-purple-500/30">
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>Quality Score Source & Hybrid Breakdown</span>
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
            {modeLabel}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-dark-900/80 p-4 rounded-xl border border-purple-900/40">
            <span className="text-xs text-gray-400 uppercase font-semibold">Pretrained IQA Score</span>
            <p className="text-xl font-black text-purple-300 font-mono mt-1">{iqaScore}</p>
            <span className="text-[10px] text-gray-400">Weight: 75%</span>
          </div>

          <div className="bg-dark-900/80 p-4 rounded-xl border border-purple-900/40">
            <span className="text-xs text-gray-400 uppercase font-semibold">Technical Quality</span>
            <p className="text-xl font-black text-emerald-400 font-mono mt-1">{techScore}</p>
            <span className="text-[10px] text-gray-400">Weight: 25%</span>
          </div>

          <div className="bg-dark-900/80 p-4 rounded-xl border border-purple-900/40">
            <span className="text-xs text-gray-400 uppercase font-semibold">Final Fused Score</span>
            <p className="text-xl font-black text-white font-mono mt-1">{result.overall_quality_score}</p>
            <span className="text-[10px] text-gray-400">100% Calibrated</span>
          </div>

          <div className="bg-dark-900/80 p-4 rounded-xl border border-purple-900/40">
            <span className="text-xs text-gray-400 uppercase font-semibold">Neural Model</span>
            <p className="text-sm font-bold text-gray-200 mt-1 truncate">{result.iqa_model?.name || 'NIMA_MobileNet_NR'}</p>
            <span className="text-[10px] text-gray-400">Device: {result.iqa_model?.device || 'cpu'}</span>
          </div>
        </div>
      </div>

      {/* Recommendations Box */}
      <div className="glass-panel rounded-2xl p-6 space-y-3 border-l-4 border-l-purple-500">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Improvement Recommendations</span>
        </h3>
        <ul className="space-y-2">
          {result.recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-gray-200 flex items-start space-x-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Technical Image Metrics Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>Technical Image Statistics</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <StatCard label="Resolution" value={`${result.technical_metrics.width} x ${result.technical_metrics.height}`} />
          <StatCard label="Megapixels" value={`${result.technical_metrics.megapixels} MP`} />
          <StatCard label="Mean Brightness" value={result.technical_metrics.mean_brightness} />
          <StatCard label="Laplacian Var" value={result.technical_metrics.laplacian_variance} />
          <StatCard label="Highlight Clip %" value={`${result.technical_metrics.highlight_clipping_percent}%`} />
          <StatCard label="Glare Area %" value={`${result.technical_metrics.glare_pixel_percent}%`} />
        </div>
      </div>

      {/* 8 Defect Result Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <span>8 Defect Category Breakdown</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(result.defects).map(([name, detail]) => (
            <DefectCard key={name} name={name} detail={detail} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="glass-panel p-4 rounded-xl">
    <span className="text-xs text-gray-400 uppercase font-semibold">{label}</span>
    <p className="text-base font-bold text-white font-mono mt-1">{value}</p>
  </div>
);

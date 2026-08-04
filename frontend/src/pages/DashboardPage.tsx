import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Zap, Clock, ShieldCheck, History, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { UploadDropzone } from '../components/UploadDropzone';
import { api } from '../api/client';
import { AnalysisResponse, ModelStatusResponse, User } from '../types';

interface DashboardPageProps {
  user: User | null;
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onAnalysisComplete }) => {
  const navigate = useNavigate();
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [recentHistory, setRecentHistory] = useState<AnalysisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchModelStatus();
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchModelStatus = async () => {
    try {
      const res = await api.getModelStatus();
      setModelStatus(res);
    } catch (err) {
      console.error('Failed to fetch model status');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.getHistory();
      setRecentHistory(res);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await api.analyzeImage(file);
      onAnalysisComplete(result);
      navigate(`/results/${result.analysis_id}`, { state: { result } });
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-grid-pattern">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span>Image Quality Analysis Dashboard</span>
            <Sparkles className="w-6 h-6 text-purple-400" />
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Upload images to verify suitability for downstream computer vision models.
          </p>
        </div>

        {/* Guest vs Auth Notice */}
        {!user && (
          <div className="px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300">
            Guest Mode: Analysis is free. <button onClick={() => navigate('/login')} className="underline font-bold">Log in</button> to save persistent history.
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-purple-900/30 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-900/30 text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Active Mode</span>
            <h4 className="text-lg font-bold text-white font-mono">{modelStatus?.model_mode || 'Heuristic Mode'}</h4>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-900/30 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-900/30 text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Avg Processing Time</span>
            <h4 className="text-lg font-bold text-white font-mono">~185 ms</h4>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-900/30 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-900/30 text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Supported Defects</span>
            <h4 className="text-lg font-bold text-white font-mono">8 Categories</h4>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-900/30 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-900/30 text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Device Acceleration</span>
            <h4 className="text-lg font-bold text-white font-mono">{modelStatus?.device || 'CPU / Auto'}</h4>
          </div>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <section className="py-4">
        <UploadDropzone onAnalyze={handleAnalyze} isLoading={isLoading} />
      </section>

      {/* Recent History Table (Logged in Users) */}
      {user && (
        <section className="glass-panel rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Your Recent Analyses</h3>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No saved analysis records found yet. Upload an image above to start!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-dark-900/60 border-b border-purple-900/30">
                  <tr>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Quality Category</th>
                    <th className="py-3 px-4">Suitability</th>
                    <th className="py-3 px-4">Processing Time</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20">
                  {recentHistory.slice(0, 5).map((item) => (
                    <tr key={item.analysis_id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white truncate max-w-xs">{item.filename}</td>
                      <td className="py-3.5 px-4 font-bold font-mono text-purple-300">{item.overall_quality_score}/100</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-900/40 text-purple-200">
                          {item.quality_category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-emerald-400">{item.suitability}</td>
                      <td className="py-3.5 px-4 text-gray-400 font-mono">{item.processing_time_ms} ms</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/results/${item.analysis_id}`, { state: { result: item } })}
                          className="px-3 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-700 text-purple-200 text-xs font-semibold border border-purple-500/30 transition-all"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

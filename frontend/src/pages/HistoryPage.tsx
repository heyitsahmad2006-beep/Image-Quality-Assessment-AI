import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Trash2, ExternalLink, Search, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { AnalysisResponse, User } from '../types';

interface HistoryPageProps {
  user: User | null;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory();
      setHistory(res);
    } catch (err) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis record?')) return;
    try {
      await api.deleteAnalysis(id);
      setHistory(history.filter((item) => item.analysis_id !== id));
    } catch (err) {
      alert('Failed to delete analysis record.');
    }
  };

  const filteredHistory = history.filter((item) =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.suitability.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Login Required for Saved History</h2>
        <p className="text-sm text-gray-400">
          Guest analyses are not permanently stored. Log in to keep an audit trail of all quality assessments.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-xl btn-3d-purple text-white font-bold text-sm"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-grid-pattern">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
            <HistoryIcon className="w-8 h-8 text-purple-400" />
            <span>Analysis Audit History</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Saved image assessment records for user {user.username}</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search filenames..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-900 border border-purple-900/40 text-white text-sm outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading analysis history...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <p className="text-gray-300 font-semibold">No saved analysis records match your query.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl btn-3d-purple text-white text-sm font-bold"
          >
            Analyze New Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div
              key={item.analysis_id}
              onClick={() => navigate(`/results/${item.analysis_id}`, { state: { result: item } })}
              className="glass-panel glass-panel-hover rounded-2xl p-6 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-900/40 text-purple-300">
                    {item.quality_category}
                  </span>
                  <button
                    onClick={(e) => handleDelete(item.analysis_id, e)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold text-white text-base truncate mb-1">{item.filename}</h4>
                <p className="text-xs text-gray-400 font-mono">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-purple-900/20">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Overall Quality</span>
                  <span className="text-xl font-black text-purple-300 font-mono">{item.overall_quality_score}/100</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Suitability</span>
                  <span className="text-xs font-bold text-emerald-400">{item.suitability}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

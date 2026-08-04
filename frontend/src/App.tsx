import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { AboutLimitationsPage } from './pages/AboutLimitationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { User, TokenResponse, AnalysisResponse } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [modelMode, setModelMode] = useState<string>('Heuristic Mode');
  const [latestResult, setLatestResult] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    checkAuth();
    fetchModelStatus();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('iqa_token');
    if (token) {
      try {
        const u = await api.getMe();
        setUser(u);
      } catch (err) {
        localStorage.removeItem('iqa_token');
        setUser(null);
      }
    }
  };

  const fetchModelStatus = async () => {
    try {
      const res = await api.getModelStatus();
      setModelMode(res.model_mode);
    } catch (err) {
      console.error('Failed to fetch model status');
    }
  };

  const handleLoginSuccess = (tokenData: TokenResponse) => {
    localStorage.setItem('iqa_token', tokenData.access_token);
    setUser({
      id: tokenData.user_id,
      username: tokenData.username,
      email: tokenData.email,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('iqa_token');
    setUser(null);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-950 text-gray-100 font-sans">
        <Header user={user} onLogout={handleLogout} modelMode={modelMode} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={<DashboardPage user={user} onAnalysisComplete={(res) => setLatestResult(res)} />}
            />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage user={user} />} />
            <Route path="/performance" element={<ModelPerformancePage />} />
            <Route path="/about" element={<AboutLimitationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;

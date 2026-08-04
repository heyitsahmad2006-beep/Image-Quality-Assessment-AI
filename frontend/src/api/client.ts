import axios from 'axios';
import { AnalysisResponse, ModelStatusResponse, User, TokenResponse } from '../types';

const getApiBaseUrl = (): string => {
  // If window is available and accessed via any LAN IP or hostname (e.g. 192.168.x.x, localhost, etc.)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000/api/v1`;
  }
  
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60s timeout for high-res images
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('iqa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Image Analysis
  analyzeImage: async (file: File): Promise<AnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<AnalysisResponse>('/analysis/analyze', formData);
    return response.data;
  },

  getHistory: async (): Promise<AnalysisResponse[]> => {
    const response = await apiClient.get<AnalysisResponse[]>('/analysis/history');
    return response.data;
  },

  getAnalysis: async (id: string): Promise<AnalysisResponse> => {
    const response = await apiClient.get<AnalysisResponse>(`/analysis/${id}`);
    return response.data;
  },

  deleteAnalysis: async (id: string): Promise<void> => {
    await apiClient.delete(`/analysis/${id}`);
  },

  // Auth
  register: async (data: any): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (data: any): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  // System & Model Status
  getModelStatus: async (): Promise<ModelStatusResponse> => {
    const response = await apiClient.get<ModelStatusResponse>('/model/status');
    return response.data;
  },

  getModelMetrics: async (): Promise<any> => {
    const response = await apiClient.get('/model/metrics');
    return response.data;
  },
};

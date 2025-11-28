import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6989';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:6989/voice/stream';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const endpoints = {
  upload: '/ingest/upload',
  analyze: '/intelligence/analyze',
  calculate: '/estimation/calculate',
  history: (clientId: string) => `/intelligence/history/${clientId}`,
};

export const getWebSocketUrl = () => WS_URL;

// Helper to handle partial errors gracefully
export const safeRequest = async <T>(request: Promise<any>, fallback: T): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.message === 'Network Error') {
      console.warn(`Backend unreachable (${API_BASE_URL}). Using mock data for demo.`);
    } else {
      console.warn("API Request Failed:", error);
    }
    return fallback;
  }
};
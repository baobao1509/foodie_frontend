import axios from 'axios';

// Default Spring Boot Port and API path (relative routing via reverse proxy to bypass CORS)
const DEFAULT_BASE_URL = '/api/v1';

export const getBaseUrl = (): string => {
  const saved = localStorage.getItem('foodievn_api_base_url');
  if (saved && (saved.includes('localhost:8080') || saved.trim() === '')) {
    localStorage.removeItem('foodievn_api_base_url');
    return DEFAULT_BASE_URL;
  }
  return saved || DEFAULT_BASE_URL;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web',
  },
});

export const updateApiBaseUrl = (newUrl: string) => {
  const cleanedBase = newUrl.replace(/\/auth\/login\/?$/, '').replace(/\/$/, '');
  localStorage.setItem('foodievn_api_base_url', cleanedBase);
  api.defaults.baseURL = cleanedBase;
};

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getLiveStats = async () => {
  try {
    const res = await api.get('/api/live');
    if (res.data && typeof res.data === 'object') {
      return res.data;
    }
    console.warn("Unexpected live stats response format:", res.data);
    return null;
  } catch (err) {
    console.error("Failed to fetch live stats", err.message || err);
    return null;
  }
};

export const getForecast = async () => {
  try {
    const res = await api.get('/api/forecast');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    console.warn("Unexpected forecast response format:", res.data);
    return [];
  } catch (err) {
    console.error("Failed to fetch forecast", err.message || err);
    return [];
  }
};

export default api;

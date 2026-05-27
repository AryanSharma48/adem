import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Assuming backend is on port 8000
});

export const getLiveStats = async () => {
  try {
    const res = await api.get('/api/live');
    return res.data;
  } catch (err) {
    console.error("Failed to fetch live stats", err);
    return null;
  }
};

export const getForecast = async () => {
  try {
    const res = await api.get('/api/forecast');
    return res.data;
  } catch (err) {
    console.error("Failed to fetch forecast", err);
    return [];
  }
};

export default api;

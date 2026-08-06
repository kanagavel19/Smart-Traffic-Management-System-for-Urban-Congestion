import axios from 'axios';

// Get backend server URL based on hostname
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://127.0.0.1:5000/api' : '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const trafficAPI = {
  getIntersections: () => api.get('/traffic/intersections'),
  getSignals: () => api.get('/traffic/signals'),
  updateSignal: (id: string, updateData: any) => api.patch(`/traffic/signals/${id}`, updateData),
  getCameras: () => api.get('/traffic/cameras'),
  getIncidents: () => api.get('/traffic/incidents'),
  reportIncident: (incData: any) => api.post('/traffic/incidents', incData),
  resolveIncident: (id: string) => api.patch(`/traffic/incidents/${id}/resolve`),
};

export const complaintAPI = {
  create: (formData: any) => {
    // If formData is FormData, let Axios determine Content-Type
    return api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => api.get('/complaints'),
  updateStatus: (id: string, statusData: any) => api.patch(`/complaints/${id}/status`, statusData),
};

export const emergencyAPI = {
  getAll: () => api.get('/emergencies'),
  dispatch: (data: any) => api.post('/emergencies/dispatch', data),
};

export const weatherAPI = {
  get: () => api.get('/weather'),
  update: (data: any) => api.post('/weather', data),
};

export const analyticsAPI = {
  getStats: () => api.get('/analytics'),
};

export default api;

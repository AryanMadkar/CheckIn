// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    // Request interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
              withCredentials: true
            });
            localStorage.setItem('accessToken', response.data.accessToken);
            return this.api.request(error.config);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post('/auth/register-user', userData);
    return response.data;
  }

  async registerOrganization(orgData) {
    const response = await this.api.post('/auth/register-organization', orgData);
    return response.data;
  }

  async logout() {
    await this.api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  }

  async getUserProfile() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // QR methods
  async getActiveQR(qrType = 'check-in') {
    const response = await this.api.get(`/qr/active?qrType=${qrType}`);
    return response.data;
  }

  async generateQR(qrType) {
    const response = await this.api.post('/qr/generate', { qrType });
    return response.data;
  }

  // Attendance methods
  async scanQR(scanData) {
    const response = await this.api.post('/attendance/scan', scanData);
    return response.data;
  }

  async getAttendanceRecords(page = 1, limit = 20) {
    const response = await this.api.get(`/attendance/records?page=${page}&limit=${limit}`);
    return response.data;
  }
}

export default new ApiService();

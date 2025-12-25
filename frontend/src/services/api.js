import axios from 'axios';

// 1️⃣ Define API base URL with proper fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 3️⃣ Console log to confirm resolved value at runtime
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('- Resolved API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2️⃣ API calls constructed with base URL
export const authAPI = {
  login: (credentials) => {
    console.log('Making login request to:', `${API_BASE_URL}/login`);
    return api.post('/login', credentials);
  },
  signup: (userData) => {
    console.log('Making signup request to:', `${API_BASE_URL}/signup`);
    return api.post('/signup', userData);
  },
};

export default api;
// services/api.js (FRONTEND - Next.js)
import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

export default API;
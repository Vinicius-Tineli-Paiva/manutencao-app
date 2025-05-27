import axios from 'axios';

// Defina a URL base do seu backend
// Lembre-se que o backend está rodando em http://localhost:3000 no seu MacBook
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opcional: Adicione um interceptor para incluir o token JWT em cada requisição
// Isso será importante para as rotas protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      // Adicione a verificação para 'config.headers'
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
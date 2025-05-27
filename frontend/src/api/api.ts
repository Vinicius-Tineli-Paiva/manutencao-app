import axios from 'axios';

// Defina a URL base do seu backend
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

api.interceptors.response.use(
  (response) => response, // Se a resposta for sucesso, apenas passe-a
  (error) => {
    // Verifique se o erro é uma resposta HTTP e se o status é 401 ou 403
    if (error.response.status === 401 || error.response.status === 403) {
        console.warn('Token inválido ou expirado. Redirecionando para login.');
        // Limpa o token para garantir que o usuário não tente usar um token inválido novamente
        localStorage.removeItem('jwtToken');
        // Redireciona o usuário para a página inicial (que no nosso App.tsx
        // leva para AuthPage se não estiver autenticado)
        window.location.href = '/';
    }
    
    return Promise.reject(error); // Rejeita a Promise para que o erro seja tratado no catch() do componente
  }
);

export default api;
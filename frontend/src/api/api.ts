import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken'); 
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `JWT ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de resposta, como token expirado
api.interceptors.response.use(
  (response) => response, // Se a resposta for sucesso, apenas passe-a
  (error) => {
    // Verifique se o erro é uma resposta HTTP e se o status é 401 (Não autorizado) ou 403 (Proibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Obtenha a URL da requisição que gerou o erro
        const originalRequestUrl = error.config.url;

        // **PONTO CHAVE: NÃO REDIRECIONE se a requisição original for para login ou registro**
        // Isso permite que o componente AuthPage.tsx lide com o erro de credenciais.
        if (originalRequestUrl && (originalRequestUrl.includes('/auth/login') || originalRequestUrl.includes('/auth/register'))) {
            // Apenas loga e passa o erro adiante para o bloco catch do componente
            console.warn('Erro de autenticação para login/registro. Permitindo que o componente trate.');
            return Promise.reject(error);
        }

        console.warn('Token inválido ou expirado. Redirecionando para login.');
        // Limpa o token para garantir que o usuário não tente usar um token inválido novamente
        localStorage.removeItem('jwtToken');
        // Redireciona o usuário para a página inicial (que deve levar ao login se não autenticado)
        // Você pode usar o history/navigate aqui se estiver dentro de um contexto React Router
        // Mas para simplificar, window.location.href é aceitável para um redirect global
        window.location.href = '/'; 
    }
    return Promise.reject(error); // Rejeita a Promise para que o erro seja tratado no catch() do componente
  }
);

export { api };
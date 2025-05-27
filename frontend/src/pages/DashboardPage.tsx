import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import api from '../api/api'; // Importe a instância do Axios
import { AxiosError } from 'axios';

// Definindo o tipo Asset (deve ser o mesmo que no seu backend/modelos)
interface Asset {
  id: string; // Ou number, dependendo do tipo no seu DB
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface DashboardPageProps {
  onLogout: () => void; // Função que o componente pai (App.tsx) passará
}

function DashboardPage({ onLogout }: DashboardPageProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<{ assets: Asset[] }>('/assets'); // Rota para listar ativos
        setAssets(response.data.assets);
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error('Erro ao buscar ativos:', axiosError.response?.data || axiosError.message);
        setError((axiosError.response?.data as { message?: string })?.message || 'Falha ao carregar ativos.');
        // Opcional: Redirecionar para login se o token for inválido/expirado (401)
        if (axiosError.response?.status === 401) {
          localStorage.removeItem('jwtToken');
          // window.location.href = '/'; // Redirecionar para a página de login
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []); // O array vazio garante que o useEffect rode apenas uma vez ao montar o componente

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/'; // Redireciona para a página de login
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Meus Ativos
        </Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Carregando ativos...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && assets.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Você ainda não tem ativos cadastrados.
        </Alert>
      )}

      {!loading && !error && assets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          {/* Lista de ativos. Por enquanto, um placeholder. */}
          <Typography variant="h6">Lista de Ativos:</Typography>
          <ul>
            {assets.map((asset) => (
              <li key={asset.id}>
                {asset.name} - {asset.description || 'Sem descrição'}
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
}

export default DashboardPage;
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/api'; // Importe a instância do Axios
import { AxiosError } from 'axios';
import AddAssetDialog from '../components/AddAssetDialog';

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
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);

    // Função para buscar os ativos (extraída para ser chamada facilmente)
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      // Rota para listar ativos. Lembre-se de acessar response.data.assets!
      const response = await api.get<{ assets: Asset[] }>('/assets');
      setAssets(response.data.assets);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao buscar ativos:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Falha ao carregar ativos.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para carregar os ativos quando o componente montar
  useEffect(() => {
    fetchAssets();
    // Adicione 'fetchAssets' aqui se o seu linter reclamar.
    // Embora a função seja estável, alguns linters podem pedir.
  }, [ /* Não precisa de onLogout aqui, pois a busca é para carregar inicial */ ]);

  // Função para abrir o modal de adicionar ativo
  const handleOpenAddAssetDialog = () => {
    setOpenAddAssetDialog(true);
  };

  // Função para fechar o modal de adicionar ativo
  const handleCloseAddAssetDialog = () => {
    setOpenAddAssetDialog(false);
  };

  // Função chamada pelo AddAssetDialog quando um ativo é adicionado com sucesso
  const handleAssetAdded = (newAsset: Asset) => {
    setAssets((prevAssets) => [...prevAssets, newAsset]); // Adiciona o novo ativo à lista
    handleCloseAddAssetDialog(); // Fecha o modal após adicionar
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este ativo?')) {
      return; // O usuário cancelou
    }

    try {
      setLoading(true); 
      setError(null);
      await api.delete(`/assets/${assetId}`);
      // Remove o ativo da lista localmente após a exclusão bem-sucedida
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId));
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Error deleting asset:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Failed to delete asset.');
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    onLogout();
  };

  return (
 <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Assets
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAddAssetDialog}
            sx={{ mr: 2 }}
          >
            Adicionar Ativo
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </Box>
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
          Você ainda não possui nenhum ativo.
        </Alert>
      )}

      {!loading && !error && assets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Lista de Ativos:</Typography>
          <ul>
            {assets.map((asset) => (
              <li key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  **{asset.name}** - {asset.description || 'No description'}
                </Typography>
                <IconButton
                  aria-label="delete"
                  color="error" // Cor vermelha para o ícone de exclusão
                  onClick={() => handleDeleteAsset(asset.id)} // Passa o ID do ativo para a função
                >
                  <DeleteIcon />
                </IconButton>
              </li>
            ))}
          </ul>
        </Box>
      )}

      <AddAssetDialog
        open={openAddAssetDialog}
        onClose={handleCloseAddAssetDialog}
        onAssetAdded={handleAssetAdded}
      />
    </Box>
  );
}

export default DashboardPage;
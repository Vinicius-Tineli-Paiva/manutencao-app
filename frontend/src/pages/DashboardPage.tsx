import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { api } from '../api/api';
import { AxiosError } from 'axios';
import AddAssetDialog from '../components/AddAssetDialog';
import EditAssetDialog from '../components/EditAssetDialog';
import UpcomingMaintenances from '../components/maintenances/upcomingMaintenances'
import type { Asset } from '../types';
interface DashboardPageProps {
  onLogout: () => void; 
}

function DashboardPage({ onLogout }: DashboardPageProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [openEditAssetDialog, setOpenEditAssetDialog] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

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
  }, []);

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

  // Função para abrir o modal de edição
  const handleOpenEditAssetDialog = (asset: Asset) => {
    setAssetToEdit(asset); // Define qual ativo será editado
    setOpenEditAssetDialog(true);
  };

  // Função para fechar o modal de edição
  const handleCloseEditAssetDialog = () => {
    setOpenEditAssetDialog(false);
    setAssetToEdit(null); 
  };

  // Função chamada pelo EditAssetDialog quando um ativo é atualizado com sucesso
  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset))
    );
    handleCloseEditAssetDialog(); // Fecha o modal após a atualização
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
          Meus Ativos
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

      {/* NOVO: Componente para exibir manutenções próximas/vencidas */}
      <UpcomingMaintenances />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Loading assets...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && assets.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You don't have any assets registered yet.
        </Alert>
      )}

      {!loading && !error && assets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Asset List:</Typography>
          <ul>
            {assets.map((asset) => (
              <li key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  **{asset.name}** - {asset.description || 'No description'}
                </Typography>
                <Box> {/* Agrupa os botões de Editar e Excluir */}
                  <IconButton
                    aria-label="edit"
                    color="info" // Cor azul para o ícone de edição
                    onClick={() => handleOpenEditAssetDialog(asset)} // Abre o modal de edição
                    sx={{ mr: 1 }} // Margem à direita para separar
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={() => handleDeleteAsset(asset.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </li>
            ))}
          </ul>
        </Box>
      )}

      {/* Renderização dos componentes de modal */}
      <AddAssetDialog
        open={openAddAssetDialog}
        onClose={handleCloseAddAssetDialog}
        onAssetAdded={handleAssetAdded}
      />
      <EditAssetDialog
        open={openEditAssetDialog}
        onClose={handleCloseEditAssetDialog}
        assetToEdit={assetToEdit} // Passa o ativo que está sendo editado
        onAssetUpdated={handleAssetUpdated} // Função para lidar com a atualização
      />
    </Box>
  );
}

export default DashboardPage;
// frontend/src/pages/AssetDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { api } from '../api/api';
import { AxiosError } from 'axios';
import type { Asset, Maintenance } from '../types';
import EditAssetDialog from '../components/EditAssetDialog';
import AddMaintenanceDialog from '../components/AddMaintenanceDialog';
import AssetMaintenanceList from '../components/maintenances/AssetMaintenanceList';

function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [loadingMaintenances, setLoadingMaintenances] = useState(true);
  const [errorAsset, setErrorAsset] = useState<string | null>(null);
  const [errorMaintenances, setErrorMaintenances] = useState<string | null>(null);

  const [openEditAssetDialog, setOpenEditAssetDialog] = useState(false);
  const [openAddMaintenanceDialog, setOpenAddMaintenanceDialog] = useState(false);

  const [maintenancesRefreshKey, setMaintenancesRefreshKey] = useState(0);

  // Função para buscar os detalhes do ativo
  const fetchAsset = async () => {
    if (!id) {
      setErrorAsset('ID do ativo não fornecido.');
      setLoadingAsset(false);
      return;
    }
    setLoadingAsset(true);
    setErrorAsset(null);
    try {
      // Rota para buscar os detalhes de um ativo.
      const response = await api.get<Asset>(`/assets/${id}`);
      setAsset(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao buscar detalhes do ativo:', axiosError.response?.data || axiosError.message);
      setErrorAsset((axiosError.response?.data as { message?: string })?.message || 'Falha ao carregar detalhes do ativo.');
      setAsset(null);
    } finally {
      setLoadingAsset(false);
    }
  };

  // Função para buscar as manutenções do ativo
  const fetchMaintenances = async () => {
    if (!id) {
      setErrorMaintenances('ID do ativo não fornecido para buscar manutenções.');
      setLoadingMaintenances(false);
      return;
    }
    setLoadingMaintenances(true);
    setErrorMaintenances(null);
    try {
      const response = await api.get<{ maintenances: Maintenance[] }>(`/maintenances/asset/${id}`);
      const sortedMaintenances = response.data.maintenances.sort((a, b) => {
        const dateA = a.next_due_date ? new Date(a.next_due_date).getTime() : Infinity;
        const dateB = b.next_due_date ? new Date(b.next_due_date).getTime() : Infinity;
        return dateA - dateB;
      });
      setMaintenances(sortedMaintenances);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao buscar manutenções do ativo:', axiosError.response?.data || axiosError.message);
      setErrorMaintenances((axiosError.response?.data as { message?: string })?.message || 'Falha ao carregar manutenções.');
      setMaintenances([]);
    } finally {
      setLoadingMaintenances(false);
    }
  };

  // Chama fetchAsset e fetchMaintenances quando o ID muda
  useEffect(() => {
    fetchAsset();
    fetchMaintenances(); 
  }, [id, maintenancesRefreshKey]); 

  const handleOpenEditAssetDialog = () => {
    setOpenEditAssetDialog(true);
  };

  const handleCloseEditAssetDialog = () => {
    setOpenEditAssetDialog(false);
    fetchAsset(); // Re-fetch asset para garantir que os detalhes sejam atualizados após edição
  };

  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAsset(updatedAsset); // Atualiza o estado do ativo localmente
    handleCloseEditAssetDialog(); // Fecha o modal
  };

  const handleAddMaintenance = () => {
    setOpenAddMaintenanceDialog(true);
  };

  const handleMaintenanceAdded = () => {
    setOpenAddMaintenanceDialog(false);
    setMaintenancesRefreshKey(prevKey => prevKey + 1); // Força o re-fetch das manutenções
  };

  const handleMaintenanceDeleted = () => {
    setMaintenancesRefreshKey(prevKey => prevKey + 1); // Força o re-fetch das manutenções
  };

  const handleEditMaintenance = (maintenance: Maintenance) => {
    alert(`Funcionalidade de Editar Manutenção para: ${maintenance.service_description} (ID: ${maintenance.id}) será implementada em breve!`);
  };

  if (loadingAsset) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando detalhes do ativo...</Typography>
      </Container>
    );
  }

  if (errorAsset) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{errorAsset}</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Voltar para o Dashboard
        </Button>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Ativo não encontrado ou não carregado.</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Voltar para o Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Detalhes do Ativo: {asset.name} 
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenEditAssetDialog}
            startIcon={<EditIcon />}
            sx={{ mr: 2 }}
          >
            Editar Ativo
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleAddMaintenance}
            sx={{ mr: 2 }}
          >
            Adicionar Manutenção
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Informações do Ativo
        </Typography>
        <Typography variant="body1">
          **Nome:** {asset.name}
        </Typography>
        <Typography variant="body1">
          **Descrição:** {asset.description || 'Nenhuma descrição fornecida.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Criado em: {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Última atualização: {asset.updated_at ? new Date(asset.updated_at).toLocaleDateString() : 'N/A'}
        </Typography>
      </Paper>

      <AssetMaintenanceList
        maintenances={maintenances}
        loading={loadingMaintenances}
        error={errorMaintenances}
        onMaintenanceDeleted={handleMaintenanceDeleted}
        onEditMaintenance={handleEditMaintenance}
      />

      {/* O asset deve existir para passá-lo ao EditAssetDialog */}
      {asset && (
        <EditAssetDialog
          open={openEditAssetDialog}
          onClose={handleCloseEditAssetDialog}
          assetToEdit={asset} // Passa o objeto asset completo para o modal de edição
          onAssetUpdated={handleAssetUpdated}
        />
      )}
      {asset && (
        <AddMaintenanceDialog
          open={openAddMaintenanceDialog}
          onClose={() => setOpenAddMaintenanceDialog(false)}
          onMaintenanceAdded={handleMaintenanceAdded}
          initialAssetId={asset.id}
        />
      )}
    </Container>
  );
}

export default AssetDetailPage;
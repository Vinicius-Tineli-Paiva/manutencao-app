import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button, useTheme, Stack, IconButton, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

import { api } from '../api/api';
import type { Asset, Maintenance } from '../types';
import EditAssetDialog from '../components/EditAssetDialog';
import AddMaintenanceDialog from '../components/AddMaintenanceDialog';
import AssetMaintenanceList from '../components/maintenances/AssetMaintenanceList';
import EditMaintenanceDialog from '../components/maintenances/EditMaintenanceDialog';

function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme(); 

  const [asset, setAsset] = useState<Asset | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [loadingMaintenances, setLoadingMaintenances] = useState(true);
  const [errorAsset, setErrorAsset] = useState<string | null>(null);
  const [errorMaintenances, setErrorMaintenances] = useState<string | null>(null);

  const [openEditAssetDialog, setOpenEditAssetDialog] = useState(false);
  const [openAddMaintenanceDialog, setOpenAddMaintenanceDialog] = useState(false);
  const [openEditMaintenanceDialog, setOpenEditMaintenanceDialog] = useState(false);
  const [maintenanceToEdit, setMaintenanceToEdit] = useState<Maintenance | null>(null);

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
      const response = await api.get<Asset>(`/assets/${id}`);
      setAsset(response.data);
    } catch (err: any) {
      const axiosError = err;
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
    } catch (err: any) {
      const axiosError = err;
      console.error('Erro ao buscar manutenções do ativo:', axiosError.response?.data || axiosError.message);
      setErrorMaintenances((axiosError.response?.data as { message?: string })?.message || 'Falha ao carregar manutenções.');
      setMaintenances([]);
    } finally {
      setLoadingMaintenances(false);
    }
  };

  // Chama fetchAsset e fetchMaintenances quando o ID muda ou a chave de refresh
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

  const handleDeleteAsset = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este ativo? Todas as manutenções associadas também serão excluídas!')) {
      return;
    }
    try {
      if (asset?.id) {
        await api.delete(`/assets/${asset.id}`);
        alert('Ativo excluído com sucesso!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const axiosError = err;
      alert(`Erro ao excluir ativo: ${(axiosError.response?.data as { message?: string })?.message || axiosError.message}`);
    }
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
    setMaintenanceToEdit(maintenance);
    setOpenEditMaintenanceDialog(true);
  };

  const handleCloseEditMaintenanceDialog = () => {
    setOpenEditMaintenanceDialog(false);
    setMaintenanceToEdit(null);
  };

  const handleMaintenanceUpdated = (updatedMaintenance: Maintenance) => {
    // Atualiza a lista localmente para refletir a mudança imediatamente
    setMaintenances((prevMaintenances) =>
      prevMaintenances.map((m) => (m.id === updatedMaintenance.id ? updatedMaintenance : m))
    );
    handleCloseEditMaintenanceDialog();
    setMaintenancesRefreshKey(prevKey => prevKey + 1); 
  };

  // Renderização de estados de carregamento/erro para o ativo 
  if (loadingAsset) {
    return (
      <Box sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 100%)`
      }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, color: theme.palette.text.secondary }}>Carregando detalhes do ativo...</Typography>
      </Box>
    );
  }

  if (errorAsset) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 100%)`
      }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}>{errorAsset}</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Voltar para o Dashboard
        </Button>
      </Box>
    );
  }

  if (!asset) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 100%)`
      }}>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}>Ativo não encontrado ou não carregado.</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Voltar para o Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 100%)`,
      minHeight: '100vh', 
      width: '100vw', 
      boxSizing: 'border-box', 
      py: 4, 
    }}>
      <Container maxWidth="md"> 
        {/* CORREÇÃO AQUI: elevation deve ser um número */}
        <Paper elevation={6} sx={{ p: 4, borderRadius: theme.shape.borderRadius }}>
          {/* Cabeçalho do Ativo */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 2, sm: 0 } }}>
              <IconButton onClick={() => navigate('/dashboard')} color="primary" aria-label="voltar">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" sx={{
                fontWeight: theme.typography.fontWeightBold,
                color: theme.palette.text.primary,
              }}>
                Detalhes do Ativo: {asset.name}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="info" // Cor para editar
                onClick={handleOpenEditAssetDialog}
                startIcon={<EditIcon />}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteAsset}
                startIcon={<DeleteIcon />}
              >
                Excluir
              </Button>
            </Stack>
          </Box>

          {/* Informações do Ativo */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Descrição: {asset.description || 'Nenhuma descrição fornecida.'}
              </Typography>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" color="text.secondary">
                Criado em: {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" color="text.secondary">
                Última atualização: {asset.updated_at ? new Date(asset.updated_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          {/* Seção de Manutenções delegada ao AssetMaintenanceList */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" sx={{
                fontWeight: theme.typography.fontWeightMedium,
                color: theme.palette.primary.main,
              }}>
                Manutenções
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddMaintenance}
                startIcon={<BuildIcon />}
              >
                Adicionar Manutenção
              </Button>
            </Box>

            {/* O AssetMaintenanceList será renderizado AQUI, SEM MODIFICAÇÕES NESTE ARQUIVO. */}
            <AssetMaintenanceList
              maintenances={maintenances}
              loading={loadingMaintenances}
              error={errorMaintenances}
              onMaintenanceDeleted={handleMaintenanceDeleted}
              onEditMaintenance={handleEditMaintenance}
              onMaintenanceUpdated={handleMaintenanceUpdated}
            />
          </Box>
        </Paper>
      </Container>

      {/* Modals */}
      {asset && (
        <EditAssetDialog
          open={openEditAssetDialog}
          onClose={handleCloseEditAssetDialog}
          assetToEdit={asset}
          onAssetUpdated={handleAssetUpdated}
        />
      )}
      {asset && ( // Garante que asset.id existe antes de passar
        <AddMaintenanceDialog
          open={openAddMaintenanceDialog}
          onClose={() => setOpenAddMaintenanceDialog(false)}
          onMaintenanceAdded={handleMaintenanceAdded}
          initialAssetId={asset.id || ''} // Usando o id do asset como initialAssetId
        />
      )}

      {/* Renderização do EditMaintenanceDialog */}
      {maintenanceToEdit && (
        <EditMaintenanceDialog
          open={openEditMaintenanceDialog}
          onClose={handleCloseEditMaintenanceDialog}
          maintenanceToEdit={maintenanceToEdit}
          onMaintenanceUpdated={handleMaintenanceUpdated}
        />
      )}
    </Box>
  );
}

export default AssetDetailPage;
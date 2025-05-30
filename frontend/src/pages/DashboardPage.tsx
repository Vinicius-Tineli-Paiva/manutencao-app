// frontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, IconButton, List, ListItem, ListItemText, Paper, Grid, useTheme, Container, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { api } from '../api/api';
import AddAssetDialog from '../components/AddAssetDialog';
import EditAssetDialog from '../components/EditAssetDialog';
import UpcomingMaintenances from '../components/maintenances/upcomingMaintenances';
import type { Asset } from '../types';
import AddMaintenanceDialog from '../components/AddMaintenanceDialog';
import { useNavigate } from 'react-router-dom';

interface DashboardPageProps {
  onLogout: () => void;
}

function DashboardPage({ onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [openEditAssetDialog, setOpenEditAssetDialog] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [openAddMaintenanceDialog, setOpenAddMaintenanceDialog] = useState(false);
  const [maintenancesRefreshKey, setMaintenancesRefreshKey] = useState(0);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ assets: Asset[] }>('/assets');
      setAssets(response.data.assets);
    } catch (err: any) {
      const axiosError = err;
      console.error('Erro ao buscar ativos:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Falha ao carregar ativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleOpenAddAssetDialog = () => {
    setOpenAddAssetDialog(true);
  };

  const handleCloseAddAssetDialog = () => {
    setOpenAddAssetDialog(false);
  };

  const handleAssetAdded = (newAsset: Asset) => {
    setAssets((prevAssets) => [...prevAssets, newAsset]);
    handleCloseAddAssetDialog();
    setMaintenancesRefreshKey(prevKey => prevKey + 1);
  };

  const handleOpenEditAssetDialog = (asset: Asset) => {
    setAssetToEdit(asset);
    setOpenEditAssetDialog(true);
  };

  const handleCloseEditAssetDialog = () => {
    setOpenEditAssetDialog(false);
    setAssetToEdit(null);
  };

  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset))
    );
    handleCloseEditAssetDialog();
    fetchAssets();
    setMaintenancesRefreshKey(prevKey => prevKey + 1);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este ativo?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.delete(`/assets/${assetId}`);
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId));
      setMaintenancesRefreshKey(prevKey => prevKey + 1);
      alert('Ativo excluído com sucesso!');
    } catch (err: any) {
      const axiosError = err;
      console.error('Error deleting asset:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Failed to delete asset.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const handleMaintenanceAdded = () => {
    setOpenAddMaintenanceDialog(false);
    setMaintenancesRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <Box sx={{
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 100%)`,
      minHeight: '100vh',
      width: '100vw',
      boxSizing: 'border-box',
      py: 4,
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 4,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="h4" component="h1" sx={{
            fontWeight: theme.typography.fontWeightBold,
            color: 'black',
            mb: { xs: 2, md: 0 },
          }}>
            Dashboard de Manutenção
          </Typography>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAddAssetDialog}
              startIcon={<AddCircleOutlineIcon />}
              fullWidth={window.innerWidth < theme.breakpoints.values.md}
            >
              Adicionar Ativo
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogoutClick}
              startIcon={<LogoutIcon />}
              fullWidth={window.innerWidth < theme.breakpoints.values.md}
            >
              Sair
            </Button>
          </Stack>
        </Box>

        {/* Main Section */}
        <Grid container spacing={3}>
          {/* Next maintenances */}
          <Grid>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom align="center" sx={{
                color: theme.palette.primary.main,
                mb: 2
              }}>
                Manutenções Próximas / Vencidas
              </Typography>
              <UpcomingMaintenances refreshKey={maintenancesRefreshKey} />
            </Paper>
          </Grid>

          {/* Asset List */}
          <Grid>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 2 }}>
                Meus Ativos
              </Typography>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body1" sx={{ ml: 2, color: theme.palette.text.secondary }}>Carregando ativos...</Typography>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: theme.shape.borderRadius }}>
                  {error}
                </Alert>
              )}

              {!loading && !error && assets.length === 0 && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: theme.shape.borderRadius }}>
                  Você ainda não possui ativos registrados. Clique em "Adicionar Ativo" para começar.
                </Alert>
              )}

              {!loading && !error && assets.length > 0 && (
                <List sx={{ mt: 1, p: 0 }}>
                  {assets.map((asset) => (
                    <ListItem
                      key={asset.id}
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            aria-label="edit"
                            color="info"
                            onClick={() => handleOpenEditAssetDialog(asset)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => {
                              if (asset.id) {
                                handleDeleteAsset(asset.id);
                              } else {
                                console.warn("Attempted to delete asset with undefined ID.");
                                alert("Erro: Não foi possível excluir o ativo sem um ID válido.");
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      }
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: theme.shape.borderRadius,
                        mb: 1.5,
                        boxShadow: theme.shadows[1],
                        '&:hover': {
                          boxShadow: theme.shadows[3],
                          transform: 'translateY(-2px)',
                          transition: '0.2s',
                        },
                        pr: { xs: 8, sm: 12 },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Button
                            variant="text"
                            onClick={() => navigate(`/assets/${asset.id}`)}
                            sx={{
                              textTransform: 'none',
                              justifyContent: 'flex-start',
                              p: 0,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline',
                                color: theme.palette.primary.dark,
                              },
                            }}
                          >
                            <Typography variant="body1" component="span" fontWeight="bold">
                              {asset.name}
                            </Typography>
                          </Button>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {asset.description || 'Nenhuma descrição.'}
                          </Typography>
                        }
                        sx={{
                            maxWidth: { xs: 'calc(100% - 60px)', sm: 'calc(100% - 100px)' },
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Modals */}
      <AddAssetDialog
        open={openAddAssetDialog}
        onClose={handleCloseAddAssetDialog}
        onAssetAdded={handleAssetAdded}
      />
      <EditAssetDialog
        open={openEditAssetDialog}
        onClose={handleCloseEditAssetDialog}
        assetToEdit={assetToEdit}
        onAssetUpdated={handleAssetUpdated}
      />
      <AddMaintenanceDialog
        open={openAddMaintenanceDialog}
        onClose={() => setOpenAddMaintenanceDialog(false)}
        onMaintenanceAdded={handleMaintenanceAdded}
        initialAssetId={''}
      />
    </Box>
  );
}

export default DashboardPage;
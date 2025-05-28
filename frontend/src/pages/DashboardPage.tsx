import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, IconButton, List, ListItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { api } from '../api/api';
import type { AxiosError } from 'axios';
import AddAssetDialog from '../components/AddAssetDialog';
import EditAssetDialog from '../components/EditAssetDialog';
import UpcomingMaintenances from '../components/maintenances/upcomingMaintenances'
import type { Asset } from '../types';
import AddMaintenanceDialog from '../components/AddMaintenanceDialog';
import { useNavigate } from 'react-router-dom';

interface DashboardPageProps {
  onLogout: () => void;
}

function DashboardPage({ onLogout }: DashboardPageProps) {
  const navigate = useNavigate();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [openEditAssetDialog, setOpenEditAssetDialog] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [openAddMaintenanceDialog, setOpenAddMaintenanceDialog] = useState(false);
  const [maintenancesRefreshKey, setMaintenancesRefreshKey] = useState(0);

  // Função para buscar os ativos 
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
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

  // useEffect para carregar os ativos 
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
    // Força o refresh em UpcomingMaintenances ao adicionar um novo ativo
    setMaintenancesRefreshKey(prevKey => prevKey + 1);
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
    handleCloseEditAssetDialog();
    fetchAssets(); // Re-fetch assets para garantir que as manutenções sejam atualizadas se o nome do ativo mudar
    setMaintenancesRefreshKey(prevKey => prevKey + 1);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este ativo? Todas as manutenções associadas também serão excluídas!')) {
      return; 
    }

    try {
      setLoading(true);
      setError(null);
      await api.delete(`/assets/${assetId}`);
      // Remove o ativo da lista localmente após a exclusão bem-sucedida
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId));
      //orça o refresh em UpcomingMaintenances ao deletar um ativo
      setMaintenancesRefreshKey(prevKey => prevKey + 1);
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

  const handleMaintenanceAdded = () => {
    setOpenAddMaintenanceDialog(false); // Fecha o modal
    // Incrementa a chave para forçar o refresh das manutenções em UpcomingMaintenances
    setMaintenancesRefreshKey(prevKey => prevKey + 1);
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

          <Button
            variant="contained"
            color="success" 
            onClick={() => setOpenAddMaintenanceDialog(true)}
            sx={{ mr: 2 }}
          >
            Adicionar Manutenção
          </Button>

          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </Box>
      </Box>

      {/* Componente para exibir manutenções próximas/vencidas */}
      <UpcomingMaintenances refreshKey={maintenancesRefreshKey} />

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
          Você ainda não possui ativos registrados.
        </Alert>
      )}

      {!loading && !error && assets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Lista de Ativos:</Typography>
          {/* Usando componentes List e ListItem do Material-UI para melhor semântica e estilização */}
          <List sx={{ mt: 1, bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
            {assets.map((asset) => (
              <ListItem
                key={asset.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #eee',
                  '&:last-child': { borderBottom: 'none' }, // Remove a borda do último item
                  py: 1.5,
                }}
              >
                {/* Transforma o nome do ativo em um Button clicável para navegar. */}
                {/* Usamos component="span" na Typography para que o Button não altere a semântica de texto. */}
                <Typography variant="body1" component="span">
                  <Button
                    variant="text" // Estilo de botão de texto para parecer um link
                    // Ao clicar, navega para a rota de detalhes do ativo usando o ID do ativo.
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    sx={{
                      textTransform: 'none', // Remove o uppercase padrão do botão
                      justifyContent: 'flex-start', // Alinha o texto à esquerda
                      p: 0, // Remove padding padrão do botão
                      // Efeitos visuais no hover para simular um link
                      '&:hover': {
                        backgroundColor: 'transparent', // Mantém o background transparente no hover
                        textDecoration: 'underline' // Adiciona sublinhado no hover
                      }
                    }}
                  >
                    <Typography variant="body1" component="span" fontWeight="bold">{asset.name}</Typography>
                  </Button>
                  {' '} - {asset.description || 'Nenhuma descrição.'}
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
                </Box>
              </ListItem>
            ))}
          </List>
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
      <AddMaintenanceDialog
        open={openAddMaintenanceDialog}
        onClose={() => setOpenAddMaintenanceDialog(false)}
        onMaintenanceAdded={handleMaintenanceAdded}
      />
    </Box>
  );
}

export default DashboardPage;
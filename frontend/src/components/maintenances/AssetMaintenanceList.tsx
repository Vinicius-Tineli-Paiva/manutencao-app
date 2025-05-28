import React from 'react';
import { Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Maintenance } from '../../types';
import { api } from '../../api/api';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom'; // NOVO: Importe useParams para pegar o asset_id

interface AssetMaintenanceListProps {
  maintenances: Maintenance[];
  loading: boolean;
  error: string | null;
  onMaintenanceDeleted: () => void;
  onEditMaintenance: (maintenance: Maintenance) => void;
}

function AssetMaintenanceList({
  maintenances,
  loading,
  error,
  onMaintenanceDeleted,
  onEditMaintenance
}: AssetMaintenanceListProps) {
  const { id: assetId } = useParams<{ id: string }>(); // Obtém o assetId da URL do pai

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!assetId) {
      alert('Erro: ID do ativo não encontrado para excluir a manutenção.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir esta manutenção?')) {
      return;
    }
    try {
      // AJUSTADO: Usando a rota exata do seu backend: /maintenances/asset/:asset_id/:id
      await api.delete(`/maintenances/asset/${assetId}/${maintenanceId}`);
      onMaintenanceDeleted(); // Notifica o pai para re-buscar as manutenções
      alert('Manutenção excluída com sucesso!');
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao excluir manutenção:', axiosError.response?.data || axiosError.message);
      alert((axiosError.response?.data as { message?: string })?.message || 'Falha ao excluir manutenção.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manutenções do Ativo
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>Carregando manutenções...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : maintenances.length === 0 ? (
        <Typography variant="body1">Nenhuma manutenção registrada para este ativo.</Typography>
      ) : (
        <List>
          {maintenances.map((m) => {
            const nextDueDate = m.next_due_date ? new Date(m.next_due_date) : null;
            const today = new Date();
            const isOverdue = nextDueDate && nextDueDate < today && nextDueDate.toDateString() !== today.toDateString();
            const isDueSoon = nextDueDate && nextDueDate >= today && (nextDueDate.getTime() - today.getTime()) < (7 * 24 * 60 * 60 * 1000);

            return (
              <React.Fragment key={m.id}>
                <ListItem
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    backgroundColor: isOverdue ? 'rgba(255, 0, 0, 0.08)' : (isDueSoon ? 'rgba(255, 255, 0, 0.08)' : 'inherit'),
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {m.service_description}
                        {isOverdue && <Typography component="span" color="error" sx={{ ml: 1, fontWeight: 'normal' }}>(Vencida)</Typography>}
                        {!isOverdue && isDueSoon && <Typography component="span" color="primary" sx={{ ml: 1, fontWeight: 'normal' }}>(Próxima)</Typography>}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Concluída em: {new Date(m.completion_date).toLocaleDateString()}
                        </Typography>
                        {m.next_due_date && (
                          <Typography variant="body2" color="text.secondary">
                            Próxima Manutenção: {new Date(m.next_due_date).toLocaleDateString()}
                          </Typography>
                        )}
                        {m.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Notas: {m.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Box>
                    <IconButton
                      aria-label="edit maintenance"
                      color="info"
                      onClick={() => onEditMaintenance(m)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete maintenance"
                      color="error"
                      onClick={() => {
                          if (m.id) {
                              handleDeleteMaintenance(m.id);
                          } else {
                              console.warn("Attempted to delete maintenance with undefined ID.");
                              alert('Erro: ID da manutenção não encontrado.');
                          }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Paper>
  );
}

export default AssetMaintenanceList;
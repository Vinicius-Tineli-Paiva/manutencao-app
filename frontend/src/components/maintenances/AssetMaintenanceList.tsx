import React, { useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 
import type { Maintenance } from '../../types';
import { api } from '../../api/api';
import { updateMaintenance } from '../../api/maintenanceApi';
import { useParams } from 'react-router-dom';
import ConfirmCompletionDialog from './ConfirmCompletionDialog';

interface AssetMaintenanceListProps {
  maintenances: Maintenance[];
  loading: boolean;
  error: string | null;
  onMaintenanceDeleted: () => void;
  onEditMaintenance: (maintenance: Maintenance) => void;
  onMaintenanceUpdated: (updatedMaintenance: Maintenance) => void;
}

function AssetMaintenanceList({
  maintenances,
  loading,
  error,
  onMaintenanceDeleted,
  onEditMaintenance,
  onMaintenanceUpdated
}: AssetMaintenanceListProps) {
  const { id: assetId } = useParams<{ id: string }>();

  const [openConfirmCompletionDialog, setOpenConfirmCompletionDialog] = useState(false);
  const [maintenanceToConfirmCompletion, setMaintenanceToConfirmCompletion] = useState<Maintenance | null>(null);

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!assetId) {
      alert('Erro: ID do ativo não encontrado para excluir a manutenção.');
      return;
    }
    if (!maintenanceId) {
      console.error('Erro: ID da manutenção a ser excluída é indefinido.');
      alert('Erro: ID da manutenção não encontrado para exclusão.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja EXCLUIR permanentemente esta manutenção?')) {
      return;
    }
    try {
      await api.delete(`/maintenances/asset/${assetId}/${maintenanceId}`);
      onMaintenanceDeleted();
      alert('Manutenção excluída com sucesso!');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err && (err as any).response.data) {
        const errorMessage = (err as any).response.data.message || 'Falha ao excluir manutenção.';
        console.error('Erro ao excluir manutenção:', errorMessage, err);
        alert(errorMessage);
      } else if (err instanceof Error) {
        console.error('Um erro inesperado ocorreu:', err.message);
        alert(err.message || 'Um erro inesperado ocorreu ao excluir manutenção.');
      } else {
        console.error('Um erro completamente inesperado ocorreu:', err);
        alert('Um erro inesperado ocorreu ao excluir manutenção.');
      }
    }
  };

  const handleToggleCompletion = async (maintenance: Maintenance, isChecked: boolean) => {
    if (!assetId) {
      alert('Erro: ID do ativo não encontrado para atualizar a manutenção.');
      return;
    }
    if (!maintenance.id) {
      console.error('Erro: ID da manutenção é indefinido.');
      alert('Erro: ID da manutenção não encontrado.');
      return;
    }

    if (isChecked) {
      setMaintenanceToConfirmCompletion(maintenance);
      setOpenConfirmCompletionDialog(true);
    } else {
      try {
        const updatedData = {
          is_completed: isChecked, 
          completion_date: null,
          notes: null,
        };
        const updatedMaintenance = await updateMaintenance(
          assetId,
          maintenance.id,
          updatedData
        );
        onMaintenanceUpdated(updatedMaintenance);
      } catch (err) {
        console.error('Erro ao reverter status da manutenção:', err);
        alert('Erro ao reverter status da manutenção.');
      }
    }
  };

  const handleConfirmCompletion = async (maintenanceId: string, completionDate: string, notes: string) => {
    if (!assetId) {
      alert('Erro: ID do ativo não encontrado para atualizar a manutenção.');
      return;
    }
    try {
      const updatedData = {
        is_completed: true,
        completion_date: completionDate,
        notes: notes,
      };
      const updatedMaintenance = await updateMaintenance(
        assetId,
        maintenanceId,
        updatedData
      );
      onMaintenanceUpdated(updatedMaintenance);
      setOpenConfirmCompletionDialog(false);
      setMaintenanceToConfirmCompletion(null);
    } catch (err) {
      console.error('Erro ao confirmar conclusão da manutenção:', err);
      alert('Erro ao confirmar conclusão da manutenção.');
    }
  };

  const pendingMaintenances = maintenances.filter(m => !m.is_completed);
  const completedMaintenances = maintenances.filter(m => m.is_completed);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>Carregando manutenções...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : (
        <React.Fragment>
          {/* SEÇÃO: Manutenções Pendentes */}
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Manutenções Pendentes
            {pendingMaintenances.length === 0 && <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>(Nenhuma pendente)</Typography>}
          </Typography>
          {pendingMaintenances.length === 0 ? (
            <Typography variant="body1">Nenhuma manutenção pendente para este ativo.</Typography>
          ) : (
            <List>
              {pendingMaintenances.map((m) => {
                const nextDueDate = m.next_due_date ? new Date(m.next_due_date) : null;
                const today = new Date();
                const isOverdue = nextDueDate && nextDueDate < today && nextDueDate.toDateString() !== today.toDateString();
                const sevenDaysFromNow = new Date(today);
                sevenDaysFromNow.setDate(today.getDate() + 7);
                const isDueSoon = nextDueDate && nextDueDate >= today && nextDueDate <= sevenDaysFromNow;

                let bgColor = 'inherit';
                if (isOverdue) {
                  bgColor = 'rgba(255, 0, 0, 0.08)';
                } else if (isDueSoon) {
                  bgColor = 'rgba(255, 193, 7, 0.08)';
                }

                return (
                  <React.Fragment key={m.id}>
                    <ListItem
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        backgroundColor: bgColor,
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {m.service_description}
                            {isOverdue && <Typography component="span" color="error" sx={{ ml: 1, fontWeight: 'normal' }}>(Vencida)</Typography>}
                            {!isOverdue && isDueSoon && <Typography component="span" color="warning" sx={{ ml: 1, fontWeight: 'normal' }}>(Próxima)</Typography>}
                          </Typography>
                        }
                        secondary={
                          <>
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
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={m.is_completed}
                              onChange={(e) => handleToggleCompletion(m, e.target.checked)}
                              name="is_completed"
                            />
                          }
                          label="Concluída"
                          sx={{ mr: 1 }}
                        />
                        <IconButton
                          aria-label="edit maintenance"
                          color="info"
                          onClick={() => onEditMaintenance(m)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        {/* ICONE DA LIXEIRA AQUI PARA MANUTENÇÕES PENDENTES */}
                        <IconButton
                           aria-label="delete maintenance"
                           color="error"
                           onClick={() => { if (m.id) handleDeleteMaintenance(m.id); }}
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

          {/* SEÇÃO: Manutenções Concluídas */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Manutenções Concluídas
            {completedMaintenances.length === 0 && <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>(Nenhuma concluída)</Typography>}
          </Typography>
          {completedMaintenances.length === 0 ? (
            <Typography variant="body1">Nenhuma manutenção concluída para este ativo.</Typography>
          ) : (
            <List>
              {completedMaintenances.map((m) => (
                <React.Fragment key={m.id}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      backgroundColor: 'rgba(144, 238, 144, 0.08)',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {m.service_description}
                          <Typography component="span" color="success" sx={{ ml: 1, fontWeight: 'normal' }}>(Concluída)</Typography>
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Concluída em: {m.completion_date ? new Date(m.completion_date).toLocaleDateString() : 'N/A'}
                          </Typography>
                          {m.next_due_date && (
                            <Typography variant="body2" color="text.secondary">
                              Próxima Prevista: {new Date(m.next_due_date).toLocaleDateString()}
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={m.is_completed}
                            onChange={(e) => handleToggleCompletion(m, e.target.checked)}
                            name="is_completed"
                          />
                        }
                        label="Concluída"
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        aria-label="edit maintenance"
                        color="info"
                        onClick={() => onEditMaintenance(m)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      {/* ICONE DA LIXEIRA AQUI PARA MANUTENÇÕES CONCLUÍDAS */}
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
              ))}
            </List>
          )}
        </React.Fragment>
      )}

      <ConfirmCompletionDialog
        open={openConfirmCompletionDialog}
        onClose={() => setOpenConfirmCompletionDialog(false)}
        maintenance={maintenanceToConfirmCompletion}
        onConfirm={handleConfirmCompletion}
      />

    </Paper>
  );
}

export default AssetMaintenanceList;
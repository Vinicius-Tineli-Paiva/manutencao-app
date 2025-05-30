import { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, CircularProgress } from '@mui/material';
import { api } from '../../api/api';
import type { Maintenance } from '../../types';

interface EditMaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  maintenanceToEdit: Maintenance | null; 
  onMaintenanceUpdated: (updatedMaintenance: Maintenance) => void;
}

function EditMaintenanceDialog({
  open,
  onClose,
  maintenanceToEdit,
  onMaintenanceUpdated,
}: EditMaintenanceDialogProps) {
  const [serviceDescription, setServiceDescription] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && maintenanceToEdit) {
      setServiceDescription(maintenanceToEdit.service_description);
      setCompletionDate(maintenanceToEdit.completion_date ? new Date(maintenanceToEdit.completion_date).toISOString().split('T')[0] : '');
      setNextDueDate(maintenanceToEdit.next_due_date ? new Date(maintenanceToEdit.next_due_date).toISOString().split('T')[0] : '');
      setNotes(maintenanceToEdit.notes || '');
      setError(null);
    } else if (!open) {
      setServiceDescription('');
      setCompletionDate('');
      setNextDueDate('');
      setNotes('');
      setError(null);
    }
  }, [open, maintenanceToEdit]);

  const handleUpdateMaintenance = async () => {
    if (!maintenanceToEdit?.id || !maintenanceToEdit?.asset_id) {
      setError('Erro: ID da manutenção ou do ativo não encontrado para atualização.');
      return;
    }
    if (!serviceDescription.trim() || !completionDate.trim()) {
      setError('Descrição do serviço e data de conclusão são obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        service_description: serviceDescription,
        completion_date: completionDate,
        next_due_date: nextDueDate || null, 
        notes: notes || null, 
      };

      const response = await api.put<Maintenance>(
        `/maintenances/asset/${maintenanceToEdit.asset_id}/${maintenanceToEdit.id}`,
        updatedData
      );
      onMaintenanceUpdated(response.data); 
      onClose();
    } catch (err: unknown) { 
      if (typeof err === 'object' && err !== null && 'response' in err && (err as any).response.data) { 
        const errorMessage = (err as any).response.data.message || 'Falha na requisição.';
        console.error('Erro de requisição:', errorMessage, err);
        setError(errorMessage);
      } else if (err instanceof Error) { 
        console.error('Um erro inesperado ocorreu:', err.message);
        setError(err.message || 'Um erro inesperado ocorreu ao atualizar manutenção.');
      } else {
        console.error('Um erro completamente inesperado ocorreu:', err);
        setError('Um erro inesperado ocorreu ao atualizar manutenção.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Manutenção</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Descrição do Serviço"
          type="text"
          fullWidth
          variant="outlined"
          value={serviceDescription}
          onChange={(e) => setServiceDescription(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Data de Conclusão"
          type="date"
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          value={completionDate}
          onChange={(e) => setCompletionDate(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Próxima Data de Manutenção"
          type="date"
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Notas"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleUpdateMaintenance} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditMaintenanceDialog;
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { createMaintenance } from '../api/maintenanceApi'; // Importe a função de criação
import type { Maintenance } from '../types'; // Importe a interface Maintenance

interface AddMaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  onMaintenanceAdded: () => void;
  initialAssetId: string; // ID do ativo ao qual a manutenção será adicionada
}

function AddMaintenanceDialog({ open, onClose, onMaintenanceAdded, initialAssetId }: AddMaintenanceDialogProps) {
  const [serviceDescription, setServiceDescription] = useState<string>('');
  const [nextDueDate, setNextDueDate] = useState<string>(''); // Formato 'yyyy-MM-dd'
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetar estados quando o modal é aberto ou fechado
  useEffect(() => {
    if (!open) {
      setServiceDescription('');
      setNextDueDate('');
      setNotes('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Previne o comportamento padrão do formulário
    setError(null);

    if (!serviceDescription.trim()) {
      setError('A descrição do serviço é obrigatória.');
      return;
    }

    if (!nextDueDate) {
      setError('A próxima data prevista é obrigatória.');
    return;
  }

    setLoading(true);
    try {

      const newMaintenanceData: Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description' | 'completion_date' | 'is_completed'> = {
        asset_id: initialAssetId,
        service_description: serviceDescription.trim(),
        next_due_date: nextDueDate, 
        notes: notes ? notes.trim() : null, 
      };

      await createMaintenance(newMaintenanceData); 
      onMaintenanceAdded();
      onClose(); // Fecha o modal
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Falha ao adicionar manutenção.';
      setError(errorMessage);
      console.error('Erro ao adicionar manutenção:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar Nova Manutenção</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Descrição do Serviço"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              fullWidth
              required
              error={!!error && error.includes('descrição do serviço')}
              helperText={!!error && error.includes('descrição do serviço') ? error : ''}
            />
            <TextField
              label="Próxima Data Prevista"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Notas (Opcional)"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit" // Botão de submit do formulário
          variant="contained"
          color="primary"
          onClick={handleSubmit} // Garante que a função handleSubmit seja chamada
          disabled={loading || !serviceDescription.trim()}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Adicionando...' : 'Adicionar Manutenção'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMaintenanceDialog;
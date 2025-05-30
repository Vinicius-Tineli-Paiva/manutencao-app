import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Typography, Alert, CircularProgress } from '@mui/material';
import { format, isFuture, parseISO } from 'date-fns'; 
import type { Maintenance } from '../../types';

interface ConfirmCompletionDialogProps {
  open: boolean;
  onClose: () => void;
  maintenance: Maintenance | null;
  onConfirm: (maintenanceId: string, completionDate: string, notes: string) => void;
}

function ConfirmCompletionDialog({ open, onClose, maintenance, onConfirm }: ConfirmCompletionDialogProps) {
  const [completionDate, setCompletionDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setCompletionDate(format(new Date(), 'yyyy-MM-dd'));
      setNotes(maintenance?.notes || '');
      setError(null);
      setLoading(false);
    }
  }, [open, maintenance]);

  const handleConfirmClick = async () => {
    if (!maintenance || !maintenance.id) {
      setError("Manutenção inválida ou ID não encontrado.");
      return;
    }
    if (!completionDate) {
      setError("A data de conclusão é obrigatória.");
      return;
    }

    const selectedDate = parseISO(completionDate);
    const today = new Date();
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    const formattedToday = format(today, 'yyyy-MM-dd');

    if (isFuture(selectedDate) && formattedSelectedDate !== formattedToday) {
      setError("A data de conclusão não pode ser uma data futura.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm(maintenance.id, completionDate, notes);
    } catch (err) {
      setError("Falha ao confirmar conclusão da manutenção. Tente novamente.");
      console.error("Erro ao confirmar conclusão no modal:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Conclusão da Manutenção</DialogTitle>
      <DialogContent>
        {maintenance ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body1">
              Você está confirmando a conclusão da manutenção: <strong>{maintenance.service_description}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Próxima data prevista: {maintenance.next_due_date ? new Date(maintenance.next_due_date).toLocaleDateString() : 'N/A'}
            </Typography>

            <TextField
              label="Data de Conclusão"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              error={!!error}
              helperText={error}
            />
            <TextField
              label="Notas de Conclusão (Opcional)"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
          </Stack>
        ) : (
          <Alert severity="warning">Nenhuma manutenção selecionada para confirmação.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmClick}
          color="primary"
          variant="contained"
          disabled={loading || !maintenance || !completionDate}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Confirmando...' : 'Confirmar Conclusão'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmCompletionDialog;
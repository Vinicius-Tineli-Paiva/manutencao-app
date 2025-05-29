import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Typography, Alert, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import type { Maintenance } from '../../types'; // <<< Esta é a importação CORRETA

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
      // Resetar estados ao abrir o modal, caso venha de uma tentativa anterior
      setCompletionDate(format(new Date(), 'yyyy-MM-dd')); // Data atual padrão
      setNotes(maintenance?.notes || ''); // Manter notas existentes se houver
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

    setLoading(true);
    setError(null);
    try {
      // Chama a função onConfirm passada via props
      await onConfirm(maintenance.id, completionDate, notes);
      // O onClose será chamado pelo componente pai após a atualização bem-sucedida
      // ou você pode chamá-lo aqui se preferir que o modal feche logo após a ação,
      // independentemente da atualização na lista principal.
      // onClose(); // Chama o onClose para fechar o modal
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
              error={!!error && error.includes("data de conclusão")}
              helperText={!!error && error.includes("data de conclusão") ? error : ''}
            />
            <TextField
              label="Notas de Conclusão (Opcional)"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
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
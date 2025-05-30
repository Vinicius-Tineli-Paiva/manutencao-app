import { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, CircularProgress } from '@mui/material';
import { api } from '../api/api'; 
import type { Asset } from '../types';

interface AddAssetResponse {
  message: string;
  asset: Asset; 
}

interface AddAssetDialogProps {
  open: boolean; 
  onClose: () => void; 
  onAssetAdded: (newAsset: Asset) => void;
}


function AddAssetDialog({ open, onClose, onAssetAdded }: AddAssetDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reseta o formulário e erros quando o modal é aberto ou fechado
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setError(null);
    }
  }, [open]);

  const handleAddAsset = async () => {
    if (!name.trim()) {
      setError('O nome do ativo é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send new data to backend
      const response = await api.post<AddAssetResponse>('/assets', {
        name,
        description,
      });
      onAssetAdded(response.data.asset);
      onClose(); 
    } catch (err: any) {
      if (err && err.response && err.response.data) {
        console.error('Erro ao adicionar ativo:', err.response.data || err.message);
        setError(err.response.data.message || 'Falha ao adicionar ativo.');
      } else {
        console.error('Um erro inesperado ocorreu:', err);
        setError('Um erro inesperado ocorreu ao adicionar ativo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Adicionar Novo Ativo</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Nome do Ativo"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Descrição (opcional)"
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleAddAsset} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salvar Ativo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddAssetDialog;
import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, CircularProgress } from '@mui/material';
import { api } from '../api/api'; // Certifique-se de que o caminho está correto
import { AxiosError } from 'axios';
import type { Asset } from '../types';

interface AddAssetResponse {
  message: string;
  asset: Asset; // O backend retorna o ativo criado dentro de 'asset'
}

// Definindo as props que o AddAssetDialog receberá
interface AddAssetDialogProps {
  open: boolean; // Controla se o modal está aberto
  onClose: () => void; // Função para fechar o modal
  onAssetAdded: (newAsset: Asset) => void; // Função para notificar o pai de um novo ativo
}


function AddAssetDialog({ open, onClose, onAssetAdded }: AddAssetDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reseta o formulário e erros quando o modal é aberto ou fechado
  React.useEffect(() => {
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
      // Envia os dados do novo ativo para o backend
      const response = await api.post<AddAssetResponse>('/assets', {
        name,
        description,
      });
      onAssetAdded(response.data.asset);
      onClose(); // Fecha o modal
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao adicionar ativo:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Falha ao adicionar ativo.');
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
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { api } from '../api/api';
import type { Asset } from '../types';

interface EditAssetDialogProps {
  open: boolean;
  onClose: () => void;
  assetToEdit: Asset | null; 
  onAssetUpdated: (updatedAsset: Asset) => void;
  onAssetAdded?: (newAsset: Asset) => void; 
}

function EditAssetDialog({ open, onClose, assetToEdit, onAssetUpdated, onAssetAdded }: EditAssetDialogProps) {
  // Inicializa os estados com os valores de assetToEdit se ele existir, senão vazio
  const [name, setName] = useState(assetToEdit?.name || '');
  const [description, setDescription] = useState(assetToEdit?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualizar os estados dos campos quando o 'assetToEdit' mudar (ou seja, quando o modal é aberto para um novo ativo)
  useEffect(() => {
    if (open) { 
      setName(assetToEdit?.name || '');
      setDescription(assetToEdit?.description || '');
      setError(null); 
    }
  }, [open, assetToEdit]); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('O nome do ativo é obrigatório.');
      setLoading(false);
      return;
    }

    try {
      if (assetToEdit) {
        const response = await api.put<Asset>(`/assets/${assetToEdit.id}`, {
          name: name,
          description: description,
        });
        onAssetUpdated(response.data);
      } else {
        const response = await api.post<Asset>('/assets', {
          name: name,
          description: description,
        });
        if (onAssetAdded) {
          onAssetAdded(response.data); 
        }
      }
      onClose(); 
    } catch (err: any) {
      const axiosError = err;
      console.error('Error updating/adding asset:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Falha ao salvar o ativo.');
    } finally {
      setLoading(false);
    }
  };

  const dialogTitle = assetToEdit ? 'Editar Ativo' : 'Adicionar Novo Ativo';
  const submitButtonText = assetToEdit ? 'Salvar Alterações' : 'Adicionar Ativo';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Nome do Ativo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            label="Descrição (Opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            disabled={loading}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditAssetDialog;
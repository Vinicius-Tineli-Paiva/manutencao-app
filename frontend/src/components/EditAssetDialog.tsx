import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '../api/api';
import { AxiosError } from 'axios';

// Definindo o tipo Asset (deve ser o mesmo que no seu backend/modelos)
interface Asset {
  id: string;
  user_id: string; // Embora não usemos diretamente, é bom manter para consistência
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Definindo as props que o EditAssetDialog receberá
interface EditAssetDialogProps {
  open: boolean; // Controla se o modal está aberto
  onClose: () => void; // Função para fechar o modal
  assetToEdit: Asset | null; // O ativo a ser editado (pode ser null se o modal não estiver aberto)
  onAssetUpdated: (updatedAsset: Asset) => void; // Função para notificar o pai do ativo atualizado
}

function EditAssetDialog({ open, onClose, assetToEdit, onAssetUpdated }: EditAssetDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UseEffect para preencher o formulário quando um 'assetToEdit' é passado
  useEffect(() => {
    if (open && assetToEdit) {
      setName(assetToEdit.name);
      setDescription(assetToEdit.description || ''); // Garante que a descrição não seja 'null'
      setError(null); // Limpa erros anteriores
    }
  }, [open, assetToEdit]); // Reage a mudanças em 'open' ou 'assetToEdit'

  const handleUpdateAsset = async () => {
    if (!name.trim()) {
      setError('Asset name cannot be empty.');
      return;
    }

    if (!assetToEdit) { // Garante que há um ativo para editar
        setError('No asset selected for editing.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Faz a requisição PUT para atualizar o ativo
      // O backend deve retornar o ativo atualizado
      const response = await api.put<Asset>(`/assets/${assetToEdit.id}`, {
        name,
        description,
      });

      onAssetUpdated(response.data); // Notifica o componente pai com o ativo atualizado
      onClose(); // Fecha o modal
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Error updating asset:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Failed to update asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Asset</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Asset Name"
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
          label="Description (optional)"
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
          Cancel
        </Button>
        <Button onClick={handleUpdateAsset} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditAssetDialog;
import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, CircularProgress, MenuItem, Box, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { api } from '../api/api'; 
import { createMaintenance } from '../api/maintenanceApi'; 
import type { Maintenance, Asset } from '../types'; 

// Definindo as props que o AddMaintenanceDialog receberá
interface AddMaintenanceDialogProps {
  open: boolean; // Controla se o modal está aberto
  onClose: () => void; // Função para fechar o modal
  onMaintenanceAdded: (newMaintenance: Maintenance) => void; // Função para notificar o pai de uma nova manutenção
}

function AddMaintenanceDialog({ open, onClose, onMaintenanceAdded }: AddMaintenanceDialogProps) {
  const [assetId, setAssetId] = useState<string>(''); // Para selecionar/digitar o ID do ativo
  const [serviceDescription, setServiceDescription] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]); // Estado para armazenar a lista de ativos
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  // Efeito para carregar a lista de ativos quando o modal for aberto
  useEffect(() => {
    if (open) {
      // Limpa os campos do formulário ao abrir
      setAssetId('');
      setServiceDescription('');
      setCompletionDate('');
      setNextDueDate('');
      setNotes('');
      setError(null);
      setAssetsError(null);
      
      const fetchAssetsForSelection = async () => {
        setAssetsLoading(true);
        try {
          // A API de assets retorna { assets: Asset[] }
          const response = await api.get<{ assets: Asset[] }>('/assets');
          setAssets(response.data.assets);
        } catch (err) {
          const axiosError = err as AxiosError;
          console.error('Erro ao buscar ativos para seleção:', axiosError.response?.data || axiosError.message);
          setAssetsError('Não foi possível carregar a lista de ativos.');
        } finally {
          setAssetsLoading(false);
        }
      };
      fetchAssetsForSelection();
    }
  }, [open]);

  const handleAddMaintenance = async () => {
    // Validações básicas
    if (!assetId) {
      setError('O ativo é obrigatório.');
      return;
    }
    if (!serviceDescription.trim()) {
      setError('A descrição do serviço é obrigatória.');
      return;
    }
    if (!completionDate) {
      setError('A data de conclusão é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Formata os dados para enviar à API
      const maintenanceData: Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'> = {
        asset_id: assetId,
        service_description: serviceDescription,
        completion_date: completionDate,
        next_due_date: nextDueDate || undefined, // Envia undefined se vazio, para que o backend não receba string vazia
        notes: notes || undefined, // Envia undefined se vazio
      };

      const newMaintenance = await createMaintenance(maintenanceData);
      onMaintenanceAdded(newMaintenance); // Notifica o componente pai
      onClose(); // Fecha o modal
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao adicionar manutenção:', axiosError.response?.data || axiosError.message);
      setError((axiosError.response?.data as { message?: string })?.message || 'Falha ao adicionar manutenção.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar Nova Manutenção</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {assetsError && <Alert severity="warning" sx={{ mb: 2 }}>{assetsError}</Alert>}

        {assetsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>Carregando ativos...</Typography>
          </Box>
        ) : (
          <TextField
            select
            margin="dense"
            label="Ativo"
            fullWidth
            variant="outlined"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            required
            sx={{ mb: 2 }}
            disabled={loading}
          >
            <MenuItem value="">
              <em>Selecione um ativo</em>
            </MenuItem>
            {assets.map((asset) => (
              <MenuItem key={asset.id} value={asset.id}>
                {asset.name} (ID: {asset.id})
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          margin="dense"
          label="Descrição do Serviço"
          type="text"
          fullWidth
          variant="outlined"
          value={serviceDescription}
          onChange={(e) => setServiceDescription(e.target.value)}
          required
          multiline
          rows={2}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Data de Conclusão"
          type="date" // Isso renderiza um seletor de data no navegador
          fullWidth
          variant="outlined"
          value={completionDate}
          onChange={(e) => setCompletionDate(e.target.value)}
          InputLabelProps={{
            shrink: true, // Garante que o label não sobreponha a data
          }}
          required
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Próxima Data de Vencimento (Opcional)"
          type="date"
          fullWidth
          variant="outlined"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Notas (Opcional)"
          type="text"
          fullWidth
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleAddMaintenance} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salvar Manutenção'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMaintenanceDialog;
import React, { useState, useEffect } from 'react';
import { getUpcomingMaintenances } from '../../api/maintenanceApi'; 
import type { Maintenance } from '../../types'; 
import { Typography, CircularProgress, List, ListItem, ListItemText, Paper, Box, Alert } from '@mui/material';

interface UpcomingMaintenancesProps {
  refreshKey: number; // Uma chave numérica que será incrementada para forçar o refresh
}

const UpcomingMaintenances: React.FC<UpcomingMaintenancesProps> = ({ refreshKey }) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMaintenances = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUpcomingMaintenances();
      const sortedMaintenances = data.sort((a, b) => {
        const dateA = a.next_due_date ? new Date(a.next_due_date).getTime() : Infinity;
        const dateB = b.next_due_date ? new Date(b.next_due_date).getTime() : Infinity;
        return dateA - dateB;
      });
      setMaintenances(sortedMaintenances);
    } catch (err: any) {
      console.error("Failed to fetch upcoming maintenances:", err);
      setError(err.response?.data?.message || err.message || 'Erro ao buscar manutenções.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [refreshKey]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100, mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Carregando manutenções...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Erro ao carregar manutenções: {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
      {maintenances.length === 0 ? (
        <Typography variant="body1">Nenhuma manutenção próxima ou vencida.</Typography>
      ) : (
        <List>
          {maintenances.map((maintenance) => {
            const nextDueDate = maintenance.next_due_date ? new Date(maintenance.next_due_date) : null;
            const today = new Date();
            // Comparar apenas as datas, ignorando a hora
            const isOverdue = nextDueDate && nextDueDate < today && nextDueDate.toDateString() !== today.toDateString();
            const isDueSoon = nextDueDate && nextDueDate >= today && (nextDueDate.getTime() - today.getTime()) < (7 * 24 * 60 * 60 * 1000); // Próximos 7 dias

            return (
              <ListItem
                key={maintenance.id}
                sx={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: isOverdue ? 'rgba(255, 0, 0, 0.1)' : (isDueSoon ? 'rgba(255, 255, 0, 0.1)' : 'inherit'),
                  '&:last-child': { borderBottom: 'none' }, // Remove borda do último item
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" component="span" fontWeight="bold">
                      {maintenance.asset_name} - {maintenance.service_description}
                    </Typography>
                  }
                  secondary={
                    <>
                      {nextDueDate ? (
                        <>
                          Vencimento: {nextDueDate.toLocaleDateString()}
                          {isOverdue && <Typography component="span" color="error" sx={{ ml: 1 }}>(Vencida)</Typography>}
                          {!isOverdue && isDueSoon && <Typography component="span" color="primary" sx={{ ml: 1 }}>(Próxima)</Typography>}
                        </>
                      ) : (
                        "Vencimento: Não definido"
                      )}
                      <br />
                      <Typography variant="body2" color="text.secondary" component="span">
                        Descrição do ativo: {maintenance.asset_description}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

export default UpcomingMaintenances;
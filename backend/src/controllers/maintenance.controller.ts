import { Request, Response } from 'express';
import {
  createMaintenance,
  getMaintenanceLogsByAssetId,
  getMaintenanceByIdAndAssetId,
  updateMaintenance,
  deleteMaintenance,
  getUpcomingAndOverdueMaintenances
} from '../services/maintenance.service';
import { getAssetByIdAndUserId } from '../services/asset.service'; // Para verificar a posse do ativo

/**
 * @description Creates a new maintenance record for a specific asset.
 * Requires asset_id, service_description in the request body.
 * completion_date is required if is_completed is true.
 */
export const createMaintenanceLog = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { asset_id, service_description, completion_date, next_due_date, notes, is_completed } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (!asset_id || !service_description) {
    return res.status(400).json({ message: 'Asset ID and service description are required.' });
  }
  // NOVA VALIDAÇÃO: Se marcada como concluída, a data de conclusão é obrigatória
  if (is_completed && !completion_date) {
    return res.status(400).json({ message: 'Completion date is required if maintenance is marked as completed.' });
  }

  try {
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to add maintenance to it.' });
    }

    const newMaintenance = await createMaintenance({
      asset_id,
      service_description,
      completion_date: completion_date || undefined, // undefined para evitar enviar string vazia
      next_due_date: next_due_date || undefined, // undefined para evitar enviar string vazia
      notes: notes || undefined, // undefined para evitar enviar string vazia
      is_completed: is_completed ?? false, // Padrão para false se não for fornecido
    });
    res.status(201).json({ message: 'Maintenance log created successfully.', maintenance: newMaintenance });
  } catch (error) {
    console.error('Error in createMaintenanceLog:', error);
    res.status(500).json({ message: 'Failed to create maintenance log.' });
  }
};

/**
 * @description Retrieves all maintenance records for a specific asset, ensuring asset ownership.
 * Requires asset ID as a URL parameter.
 */
export const getAssetMaintenanceLogs = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { asset_id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to view its maintenance logs.' });
    }

    const maintenances = await getMaintenanceLogsByAssetId(asset_id);
    res.status(200).json({ maintenances });
  } catch (error) {
    console.error('Error in getAssetMaintenanceLogs:', error);
    res.status(500).json({ message: 'Failed to retrieve maintenance logs.' });
  }
};

/**
 * @description Retrieves a single maintenance record, ensuring asset ownership.
 * Requires maintenance ID and asset ID as URL parameters.
 */
export const getMaintenanceLog = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { asset_id, id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to view its maintenance logs.' });
    }

    const maintenance = await getMaintenanceByIdAndAssetId(id, asset_id);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance log not found or does not belong to this asset.' });
    }
    res.status(200).json({ maintenance });
  } catch (error) {
    console.error('Error in getMaintenanceLog:', error);
    res.status(500).json({ message: 'Failed to retrieve maintenance log.' });
  }
};

/**
 * @description Updates an existing maintenance record, ensuring asset ownership.
 * Requires maintenance ID and asset ID as URL parameters and fields to update in the request body.
 */
export const updateMaintenanceLog = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { asset_id, id } = req.params;
  const { service_description, completion_date, next_due_date, notes, is_completed } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  // Validação: Pelo menos um campo para atualizar (fora o updated_at implícito)
  if (service_description === undefined && completion_date === undefined && next_due_date === undefined && notes === undefined && is_completed === undefined) {
    return res.status(400).json({ message: 'At least one field (service_description, completion_date, next_due_date, notes, or is_completed) is required for update.' });
  }

  // NOVA VALIDAÇÃO: Se está marcando como concluída, a data de conclusão é obrigatória
  // `is_completed === true` é para distinguir de `is_completed` ser `undefined`
  if (is_completed === true && !completion_date) {
    return res.status(400).json({ message: 'Completion date is required if maintenance is marked as completed.' });
  }

  try {
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to update its maintenance logs.' });
    }

    const updatedMaintenance = await updateMaintenance(id, asset_id, {
      service_description,
      completion_date: completion_date === '' ? null : completion_date, // Converte string vazia para null para o DB
      next_due_date: next_due_date === '' ? null : next_due_date, // Converte string vazia para null para o DB
      notes,
      is_completed,
    });

    if (!updatedMaintenance) {
      return res.status(404).json({ message: 'Maintenance log not found or does not belong to this asset.' });
    }

    res.status(200).json(updatedMaintenance);
  } catch (error) {
    console.error('Error in updateMaintenanceLog:', error);
    res.status(500).json({ message: 'Failed to update maintenance log.' });
  }
};

/**
 * @description Deletes a maintenance record, ensuring asset ownership.
 * Requires maintenance ID and asset ID as URL parameters.
 */
export const deleteMaintenanceLog = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { asset_id, id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to delete its maintenance logs.' });
    }

    const deleted = await deleteMaintenance(id, asset_id);
    if (!deleted) {
      return res.status(404).json({ message: 'Maintenance log not found or does not belong to this asset.' });
    }
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error in deleteMaintenanceLog:', error);
    res.status(500).json({ message: 'Failed to delete maintenance log.' });
  }
};

/**
 * @description Retrieves upcoming and overdue maintenance logs for all assets owned by the authenticated user.
 * This is for the main dashboard view.
 */
export const getDashboardMaintenanceSummary = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    // Passamos o user_id e a quantidade de dias para buscar as manutenções futuras e vencidas
    const upcomingAndOverdue = await getUpcomingAndOverdueMaintenances(userId, 7); // Busca para os próximos 7 dias
    res.status(200).json({ maintenances: upcomingAndOverdue });
  } catch (error) {
    console.error('Error in getDashboardMaintenanceSummary:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard maintenance summary.' });
  }
};
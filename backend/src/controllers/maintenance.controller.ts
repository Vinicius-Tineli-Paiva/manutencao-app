import { Request, Response } from 'express';
import { createMaintenance, getMaintenanceLogsByAssetId, getMaintenanceByIdAndAssetId, updateMaintenance, deleteMaintenance, getUpcomingAndOverdueMaintenances } from '../services/maintenance.service';
import { getAssetByIdAndUserId } from '../services/asset.service'; // To check asset ownership

/**
 * @description Creates a new maintenance record for a specific asset.
 * Requires asset_id, service_description, completion_date in the request body.
 */
export const createMaintenanceLog = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { asset_id, service_description, completion_date, next_due_date, notes } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (!asset_id || !service_description || !completion_date) {
    return res.status(400).json({ message: 'Asset ID, service description, and completion date are required.' });
  }

  try {
    // First, check if the asset exists and belongs to the user
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to add maintenance to it.' });
    }

    const newMaintenance = await createMaintenance({
      asset_id,
      service_description,
      completion_date,
      next_due_date,
      notes,
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
  const { asset_id } = req.params; // Get asset ID from URL

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    // First, check if the asset exists and belongs to the user
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
  const { asset_id, id } = req.params; // Get asset ID and maintenance ID from URL

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    // First, check if the asset exists and belongs to the user
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
  const { service_description, completion_date, next_due_date, notes } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  // At least one field should be provided for update
  if (service_description === undefined && completion_date === undefined && next_due_date === undefined && notes === undefined) {
    return res.status(400).json({ message: 'At least one field (service_description, completion_date, next_due_date, or notes) is required for update.' });
  }

  try {
    // First, check if the asset exists and belongs to the user
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to update its maintenance logs.' });
    }

    const updatedMaintenance = await updateMaintenance(id, asset_id, {
      service_description,
      completion_date,
      next_due_date,
      notes,
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
    // First, check if the asset exists and belongs to the user
    const asset = await getAssetByIdAndUserId(asset_id, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to delete its maintenance logs.' });
    }

    const deleted = await deleteMaintenance(id, asset_id);
    if (!deleted) {
      return res.status(404).json({ message: 'Maintenance log not found or does not belong to this asset.' });
    }
    res.status(204).send(); 
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
    // Fetch maintenances due in the next 7 days
    const upcomingAndOverdue = await getUpcomingAndOverdueMaintenances(userId, 7);
    res.status(200).json({ maintenances: upcomingAndOverdue });
  } catch (error) {
    console.error('Error in getDashboardMaintenanceSummary:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard maintenance summary.' });
  }
};
import { api } from './api';
import type { Maintenance } from '../types'; 

/**
 * @description Fetches a summary of maintenance tasks (upcoming and overdue) for the dashboard.
 * This corresponds to a GET request to `/api/maintenances/summary` on the backend.
 * @returns {Promise<Maintenance[]>} A promise that resolves with an array of Maintenance objects.
 */
export const getUpcomingMaintenances = async (): Promise<Maintenance[]> => {
  try {
    const response = await api.get<{ maintenances: Maintenance[] }>('/maintenances/summary');
    return response.data.maintenances;
  } catch (error) {
    console.error("Error fetching upcoming maintenances:", error);
    throw error;
  }
};

/**
 * Creates a new asset maintenance
 * POST /api/maintenances
 * @param {Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>} maintenanceData 
 * @returns {Promise<Maintenance>} 
 */
export const createMaintenance = async (
  maintenanceData: Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>
): Promise<Maintenance> => {
  try {
    const response = await api.post<{ maintenance: Maintenance }>('/maintenances', maintenanceData);
    return response.data.maintenance;
  } catch (error) {
    console.error("Error creating maintenance:", error);
    throw error;
  }
};

/**
 * Get all maintenance for a specific asset.
 * GET /api/maintenances/asset/:asset_id
 * @param {string} assetId 
 * @returns {Promise<Maintenance[]>} 
 */
export const getAssetMaintenances = async (assetId: string): Promise<Maintenance[]> => {
  try {
    const response = await api.get<{ maintenances: Maintenance[] }>(`/maintenances/asset/${assetId}`);
    return response.data.maintenances;
  } catch (error) {
    console.error(`Error fetching maintenances for asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Get details from a specific asset maintenance.
 * GET /api/maintenances/asset/:asset_id/:id
 * @param {string} assetId
 * @param {string} maintenanceId 
 * @returns {Promise<Maintenance>} 
 */
export const getMaintenanceById = async (assetId: string, maintenanceId: string): Promise<Maintenance> => {
  try {
    const response = await api.get<{ maintenance: Maintenance }>(`/maintenances/asset/${assetId}/${maintenanceId}`);
    return response.data.maintenance;
  } catch (error) {
    console.error(`Error fetching maintenance ${maintenanceId} for asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Update a maintenance
 * PUT /api/maintenances/asset/:asset_id/:id
 * @param {string} assetId 
 * @param {string} maintenanceId 
 * @param {Partial<Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>>} updateData 
 * @returns {Promise<Maintenance>} 
 */
export const updateMaintenance = async (
  assetId: string,
  maintenanceId: string,
  updateData: Partial<Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>>
): Promise<Maintenance> => {
  try {
    const response = await api.put<Maintenance>(`/maintenances/asset/${assetId}/${maintenanceId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating maintenance ${maintenanceId} for asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Exclude a maintenance
 * DELETE /api/maintenances/asset/:asset_id/:id
 * @param {string} assetId 
 * @param {string} maintenanceId 
 * @returns {Promise<void>}
 */
export const deleteMaintenance = async (assetId: string, maintenanceId: string): Promise<void> => {
  try {
    await api.delete(`/maintenances/asset/${assetId}/${maintenanceId}`);
  } catch (error) {
    console.error(`Error deleting maintenance ${maintenanceId} for asset ${assetId}:`, error);
    throw error;
  }
};
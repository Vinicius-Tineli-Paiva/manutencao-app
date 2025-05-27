import { api } from './api';
import type { Maintenance } from '../types'; 

/**
 * Busca o resumo de manutenções (próximas e vencidas) para o dashboard.
 * GET /api/maintenances/summary
 * @returns {Promise<Maintenance[]>} Uma promessa que resolve com um array de objetos Maintenance.
 */
export const getUpcomingMaintenances = async (): Promise<Maintenance[]> => {
  try {
    const response = await api.get<{ maintenances: Maintenance[] }>('/maintenances/summary');
    // Confere com o backend: res.status(200).json({ maintenances: upcomingAndOverdue });
    return response.data.maintenances;
  } catch (error) {
    console.error("Error fetching upcoming maintenances:", error);
    throw error;
  }
};

/**
 * Cria uma nova manutenção para um ativo.
 * POST /api/maintenances
 * @param {Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>} maintenanceData Os dados da nova manutenção.
 * @returns {Promise<Maintenance>} Uma promessa que resolve com o objeto da manutenção criada.
 */
export const createMaintenance = async (
  maintenanceData: Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>
): Promise<Maintenance> => {
  try {
    const response = await api.post<{ maintenance: Maintenance }>('/maintenances', maintenanceData);
    // Confere com o backend: res.status(201).json({ message: '...', maintenance: newMaintenance });
    return response.data.maintenance;
  } catch (error) {
    console.error("Error creating maintenance:", error);
    throw error;
  }
};

/**
 * Obtém todas as manutenções para um ativo específico.
 * GET /api/maintenances/asset/:asset_id
 * @param {string} assetId O ID do ativo.
 * @returns {Promise<Maintenance[]>} Uma promessa que resolve com um array de objetos Maintenance.
 */
export const getAssetMaintenances = async (assetId: string): Promise<Maintenance[]> => {
  try {
    const response = await api.get<{ maintenances: Maintenance[] }>(`/maintenances/asset/${assetId}`);
    // Confere com o backend: res.status(200).json({ maintenances });
    return response.data.maintenances;
  } catch (error) {
    console.error(`Error fetching maintenances for asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Obtém os detalhes de uma manutenção específica.
 * GET /api/maintenances/asset/:asset_id/:id
 * @param {string} assetId O ID do ativo ao qual a manutenção pertence.
 * @param {string} maintenanceId O ID da manutenção.
 * @returns {Promise<Maintenance>} Uma promessa que resolve com o objeto Maintenance.
 */
export const getMaintenanceById = async (assetId: string, maintenanceId: string): Promise<Maintenance> => {
  try {
    const response = await api.get<{ maintenance: Maintenance }>(`/maintenances/asset/${assetId}/${maintenanceId}`);
    // Confere com o backend: res.status(200).json({ maintenance });
    return response.data.maintenance;
  } catch (error) {
    console.error(`Error fetching maintenance ${maintenanceId} for asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Atualiza uma manutenção existente.
 * PUT /api/maintenances/asset/:asset_id/:id
 * @param {string} assetId O ID do ativo ao qual a manutenção pertence.
 * @param {string} maintenanceId O ID da manutenção a ser atualizada.
 * @param {Partial<Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>>} updateData Os campos a serem atualizados.
 * @returns {Promise<Maintenance>} Uma promessa que resolve com o objeto da manutenção atualizada.
 */
export const updateMaintenance = async (
  assetId: string,
  maintenanceId: string,
  updateData: Partial<Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>>
): Promise<Maintenance> => {
  try {
    const response = await api.put<Maintenance>(`/maintenances/asset/${assetId}/${maintenanceId}`, updateData);
    // Confere com o backend: res.status(200).json(updatedMaintenance); -> Retorna o objeto direto
    return response.data;
  } catch (error) {
    console.error(`Error updating maintenance ${maintenanceId} for asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Exclui uma manutenção.
 * DELETE /api/maintenances/asset/:asset_id/:id
 * @param {string} assetId O ID do ativo ao qual a manutenção pertence.
 * @param {string} maintenanceId O ID da manutenção a ser excluída.
 * @returns {Promise<void>} Uma promessa que resolve quando a exclusão é bem-sucedida.
 */
export const deleteMaintenance = async (assetId: string, maintenanceId: string): Promise<void> => {
  try {
    // Confere com o backend: res.status(204).send(); -> Não retorna corpo
    await api.delete(`/maintenances/asset/${assetId}/${maintenanceId}`);
  } catch (error) {
    console.error(`Error deleting maintenance ${maintenanceId} for asset ${assetId}:`, error);
    throw error;
  }
};
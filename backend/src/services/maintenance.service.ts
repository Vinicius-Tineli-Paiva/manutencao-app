import { query } from '../config/db';
import { Maintenance } from '../models/maintenance.model';

/**
 * @description Creates a new maintenance record for a specific asset.
 * @param maintenance The maintenance object to create.
 * @returns A Promise that resolves with the newly created Maintenance object.
 */
export const createMaintenance = async (maintenance: Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>): Promise<Maintenance> => {
  const { asset_id, service_description, completion_date, next_due_date, notes, is_completed } = maintenance;
  const text = `
    INSERT INTO maintenances (asset_id, service_description, completion_date, next_due_date, notes, is_completed)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, asset_id, service_description, completion_date, next_due_date, notes, is_completed, created_at, updated_at;
  `;
  // Usa '?? false' para garantir que is_completed tenha um valor booleano padrão
  const values = [asset_id, service_description, completion_date || null, next_due_date || null, notes, is_completed ?? false];
  try {
    const result = await query(text, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating maintenance:', error);
    throw new Error('Failed to create maintenance due to database error.');
  }
};

/**
 * @description Retrieves all maintenance records for a specific asset.
 * @param asset_id The ID of the asset whose maintenances are to be retrieved.
 * @returns A Promise that resolves with an array of Maintenance objects, ordered by creation date.
 */
export const getMaintenanceLogsByAssetId = async (asset_id: string): Promise<Maintenance[]> => {
  const text = `
    SELECT id, asset_id, service_description, completion_date, next_due_date, notes, is_completed, created_at, updated_at
    FROM maintenances
    WHERE asset_id = $1
    ORDER BY created_at DESC;
  `;
  const values = [asset_id];
  try {
    const result = await query(text, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching maintenance logs by asset ID:', error);
    throw new Error('Failed to retrieve maintenance logs due to database error.');
  }
};

/**
 * @description Retrieves a single maintenance record by its ID and ensures it belongs to the specified asset.
 * @param maintenance_id The ID of the maintenance record to retrieve.
 * @param asset_id The ID of the asset to which the maintenance record belongs.
 * @returns A Promise that resolves with the Maintenance object or null if not found.
 */
export const getMaintenanceByIdAndAssetId = async (maintenance_id: string, asset_id: string): Promise<Maintenance | null> => {
  const text = `
    SELECT id, asset_id, service_description, completion_date, next_due_date, notes, is_completed, created_at, updated_at
    FROM maintenances
    WHERE id = $1 AND asset_id = $2;
  `;
  const values = [maintenance_id, asset_id];
  try {
    const result = await query(text, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching maintenance by ID and asset ID:', error);
    throw new Error('Failed to retrieve maintenance due to database error.');
  }
};

/**
 * @description Updates an existing maintenance record.
 * @param maintenance_id The ID of the maintenance record to update.
 * @param asset_id The ID of the asset to which the maintenance record belongs (for authorization).
 * @param updates An object containing the fields to update.
 * @returns A Promise that resolves with the updated Maintenance object or null if not found or not belonging to the asset.
 */
export const updateMaintenance = async (
  maintenance_id: string,
  asset_id: string,
  updates: Partial<Omit<Maintenance, 'id' | 'asset_id' | 'created_at' | 'updated_at' | 'asset_name' | 'asset_description'>>
): Promise<Maintenance | null> => {
  const { service_description, completion_date, next_due_date, notes, is_completed } = updates;
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (service_description !== undefined) {
    setClauses.push(`service_description = $${paramIndex++}`);
    values.push(service_description);
  }
  if (completion_date !== undefined) {
    setClauses.push(`completion_date = $${paramIndex++}`);
    // Se completion_date for vazia, guarda como NULL no banco
    values.push(completion_date === '' ? null : completion_date);
  }
  if (next_due_date !== undefined) {
    setClauses.push(`next_due_date = $${paramIndex++}`);
    // Se next_due_date for vazia, guarda como NULL no banco
    values.push(next_due_date === '' ? null : next_due_date);
  }
  if (notes !== undefined) {
    setClauses.push(`notes = $${paramIndex++}`);
    values.push(notes);
  }
  // Adiciona is_completed para atualização
  if (is_completed !== undefined) {
    setClauses.push(`is_completed = $${paramIndex++}`);
    values.push(is_completed);
  }

  // Always update the updated_at timestamp
  setClauses.push(`updated_at = $${paramIndex++}`);
  values.push(new Date());

  if (setClauses.length === 0) {
    return null; // No fields to update (should not happen if updated_at is always included)
  }

  values.push(maintenance_id);
  values.push(asset_id);

  const text = `
    UPDATE maintenances
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex++} AND asset_id = $${paramIndex++}
    RETURNING id, asset_id, service_description, completion_date, next_due_date, notes, is_completed, created_at, updated_at;
  `;

  try {
    const result = await query(text, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating maintenance:', error);
    throw new Error('Failed to update maintenance due to database error.');
  }
};

/**
 * @description Deletes a maintenance record by its ID, ensuring it belongs to the specified asset.
 * @param maintenance_id The ID of the maintenance record to delete.
 * @param asset_id The ID of the asset to which the maintenance record belongs (for authorization).
 * @returns A Promise that resolves to true if deleted, false if not found or not belonging to the asset.
 */
export const deleteMaintenance = async (maintenance_id: string, asset_id: string): Promise<boolean> => {
  const text = 'DELETE FROM maintenances WHERE id = $1 AND asset_id = $2 RETURNING id;';
  const values = [maintenance_id, asset_id];
  try {
    const result = await query(text, values);
    return result.rowCount! > 0;
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    throw new Error('Failed to delete maintenance due to database error.');
  }
};

/**
 * @description Retrieves maintenance records that are due soon or overdue for a specific user's assets,
 * AND that are NOT yet completed.
 * @param user_id The ID of the user.
 * @param daysAhead The number of days in the future to consider for "due soon".
 * @returns A Promise that resolves with an array of Maintenance objects.
 */
export const getUpcomingAndOverdueMaintenances = async (user_id: string, daysAhead: number = 7): Promise<Maintenance[]> => {
  const text = `
    SELECT
        m.id,
        m.asset_id,
        m.service_description,
        m.completion_date,
        m.next_due_date,
        m.notes,
        m.is_completed, -- INCLUÍDO
        m.created_at,
        m.updated_at,
        a.name AS asset_name,
        a.description AS asset_description
    FROM maintenances m
    JOIN assets a ON m.asset_id = a.id
    WHERE a.user_id = $1
      AND m.is_completed = FALSE -- FILTRA APENAS AS NÃO CONCLUÍDAS
      AND m.next_due_date IS NOT NULL
      AND m.next_due_date <= CURRENT_DATE + ($2 * INTERVAL '1 day')
    ORDER BY m.next_due_date ASC, m.completion_date DESC;
  `;
  const values = [user_id, daysAhead];
  try {
    const result = await query(text, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching upcoming and overdue maintenances:', error);
    throw new Error('Failed to retrieve upcoming and overdue maintenances due to database error.');
  }
};
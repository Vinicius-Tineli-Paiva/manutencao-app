//Interaction with BD
import { query } from '../config/db';
import { Asset } from '../models/asset.model';

/**
 * @description Creates a new asset for a specific user.
 * @param asset The asset object containing user_id, name, and optional description.
 * @returns A Promise that resolves with the newly created Asset object.
 */
export const createAsset = async (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>): Promise<Asset> => {
  const { user_id, name, description } = asset;
  const text = 'INSERT INTO assets (user_id, name, description) VALUES ($1, $2, $3) RETURNING id, user_id, name, description, created_at, updated_at';
  const values = [user_id, name, description];
  try {
    const result = await query(text, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating asset:', error);
    throw new Error('Failed to create asset due to database error.');
  }
};

/**
 * @description Retrieves all assets belonging to a specific user.
 * @param user_id The ID of the user whose assets are to be retrieved.
 * @returns A Promise that resolves with an array of Asset objects.
 */
export const getAssetsByUserId = async (user_id: string): Promise<Asset[]> => {
  const text = 'SELECT id, user_id, name, description, created_at, updated_at FROM assets WHERE user_id = $1 ORDER BY name ASC';
  const values = [user_id];
  try {
    const result = await query(text, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching assets by user ID:', error);
    throw new Error('Failed to retrieve assets due to database error.');
  }
};

/**
 * @description Retrieves a single asset by its ID and user ID.
 * Ensures that the asset belongs to the requesting user.
 * @param asset_id The ID of the asset to retrieve.
 * @param user_id The ID of the user who owns the asset.
 * @returns A Promise that resolves with the Asset object or null if not found or not owned by user.
 */
export const getAssetByIdAndUserId = async (asset_id: string, user_id: string): Promise<Asset | null> => {
  const text = 'SELECT id, user_id, name, description, created_at, updated_at FROM assets WHERE id = $1 AND user_id = $2';
  const values = [asset_id, user_id];
  try {
    const result = await query(text, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching asset by ID and user ID:', error);
    throw new Error('Failed to retrieve asset due to database error.');
  }
};

/**
 * @description Updates an existing asset.
 * @param asset_id The ID of the asset to update.
 * @param user_id The ID of the user who owns the asset (for authorization).
 * @param updates An object containing the fields to update (name, description).
 * @returns A Promise that resolves with the updated Asset object or null if not found or not owned by user.
 */
export const updateAsset = async (asset_id: string, user_id: string, updates: Partial<Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Asset | null> => {
  const { name, description } = updates;
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(description);
  }

  if (setClauses.length === 0) {
    return null; 
  }

  values.push(asset_id);
  values.push(user_id);

  const text = `
    UPDATE assets
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
    RETURNING id, user_id, name, description, created_at, updated_at
  `;

  try {
    const result = await query(text, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw new Error('Failed to update asset due to database error.');
  }
};

/**
 * @description Deletes an asset by its ID and user ID.
 * Ensures that the asset belongs to the requesting user.
 * @param asset_id The ID of the asset to delete.
 * @param user_id The ID of the user who owns the asset.
 * @returns A Promise that resolves to true if deleted, false if not found or not owned by user.
 */
export const deleteAsset = async (asset_id: string, user_id: string): Promise<boolean> => {
  const text = 'DELETE FROM assets WHERE id = $1 AND user_id = $2 RETURNING id';
  const values = [asset_id, user_id];
  try {
    const result = await query(text, values);
    return result.rowCount! > 0;
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw new Error('Failed to delete asset due to database error.');
  }
};
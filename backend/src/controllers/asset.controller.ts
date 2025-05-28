import { Request, Response } from 'express';
import { createAsset, getAssetsByUserId, getAssetByIdAndUserId, updateAsset, deleteAsset } from '../services/asset.service';

/**
 * @description Creates a new asset for the authenticated user.
 * Requires 'name' and optionally 'description' in the request body.
 */
export const createNewAsset = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Get user ID from the authenticated request
  const { name, description } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (!name) {
    return res.status(400).json({ message: 'Asset name is required.' });
  }

  try {
    const newAsset = await createAsset({ user_id: userId, name, description });
    res.status(201).json({ message: 'Asset created successfully.', asset: newAsset });
  } catch (error) {
    console.error('Error in createNewAsset:', error);
    res.status(500).json({ message: 'Failed to create asset.' });
  }
};

/**
 * @description Retrieves all assets belonging to the authenticated user.
 */
export const getUserAssets = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const assets = await getAssetsByUserId(userId);
    res.status(200).json({ assets });
  } catch (error) {
    console.error('Error in getUserAssets:', error);
    res.status(500).json({ message: 'Failed to retrieve assets.' });
  }
};

/**
 * @description Retrieves a single asset by its ID, ensuring it belongs to the authenticated user.
 * Requires asset ID as a URL parameter.
 */
export const getAsset = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const assetId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const asset = await getAssetByIdAndUserId(assetId, userId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to view it.' });
    }
    res.status(200).json(asset);
  } catch (error) {
    console.error('Error in getAsset:', error);
    res.status(500).json({ message: 'Failed to retrieve asset.' });
  }
};

/**
 * @description Updates an existing asset by its ID, ensuring it belongs to the authenticated user.
 * Requires asset ID as a URL parameter and fields to update in the request body.
 */
export const updateExistingAsset = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const assetId = req.params.id;
  const { name, description } = req.body; // Allow partial updates

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  // Basic validation for at least one field to update
  if (name === undefined && description === undefined) {
    return res.status(400).json({ message: 'At least one field (name or description) is required for update.' });
  }

  try {
    const updatedAsset = await updateAsset(assetId, userId, { name, description });
    if (!updatedAsset) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to update it.' });
    }
    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error('Error in updateExistingAsset:', error);
    res.status(500).json({ message: 'Failed to update asset.' });
  }
};

/**
 * @description Deletes an asset by its ID, ensuring it belongs to the authenticated user.
 * Requires asset ID as a URL parameter.
 */
export const deleteExistingAsset = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const assetId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const deleted = await deleteAsset(assetId, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Asset not found or you do not have permission to delete it.' });
    }
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error in deleteExistingAsset:', error);
    res.status(500).json({ message: 'Failed to delete asset.' });
  }
};
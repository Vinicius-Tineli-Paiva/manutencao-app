//Define endpoints and routes are protected by middleware authenticateToken

import { Router } from 'express';
import { createNewAsset, getUserAssets, getAsset, updateExistingAsset, deleteExistingAsset } from '../controllers/asset.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken); 

router.post('/', createNewAsset);

router.get('/', getUserAssets);

router.get('/:id', getAsset);

router.put('/:id', updateExistingAsset);

router.delete('/:id', deleteExistingAsset);

export default router;

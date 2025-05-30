import { Router } from 'express';
import { createMaintenanceLog, getAssetMaintenanceLogs, getMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog, getDashboardMaintenanceSummary } from '../controllers/maintenance.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken); 

router.get('/summary', getDashboardMaintenanceSummary);

router.post('/', createMaintenanceLog);

router.get('/asset/:asset_id', getAssetMaintenanceLogs);

router.get('/asset/:asset_id/:id', getMaintenanceLog);

router.put('/asset/:asset_id/:id', updateMaintenanceLog);

router.delete('/asset/:asset_id/:id', deleteMaintenanceLog);


export default router;
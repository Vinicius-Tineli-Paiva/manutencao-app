import { Router } from 'express';
import { createMaintenanceLog, getAssetMaintenanceLogs, getMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog, getDashboardMaintenanceSummary } from '../controllers/maintenance.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; // Import authentication middleware

const router = Router();

// Apply authentication middleware to all maintenance routes
router.use(authenticateToken); // All routes below this line require a valid JWT

/**
 * @swagger
 * /maintenances/summary:
 * get:
 * summary: Get upcoming and overdue maintenance logs for all assets owned by the authenticated user.
 * tags: [Maintenances]
 * security:
 * - JWTAuth: []
 * responses:
 * 200:
 * description: A list of upcoming and overdue maintenance logs.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * maintenances:
 * type: array
 * items:
 * $ref: '#/components/schemas/Maintenance'
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 500:
 * description: Internal server error
 */
router.get('/summary', getDashboardMaintenanceSummary); // For the main dashboard

/**
 * @swagger
 * /maintenances:
 * post:
 * summary: Create a new maintenance log for a specific asset.
 * tags: [Maintenances]
 * security:
 * - JWTAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - asset_id
 * - service_description
 * - completion_date
 * properties:
 * asset_id:
 * type: string
 * format: uuid
 * description: ID of the asset this maintenance belongs to.
 * example: "123e4567-e89b-12d3-a456-426614174000"
 * service_description:
 * type: string
 * description: Description of the service performed.
 * example: "Oil change and filter replacement"
 * completion_date:
 * type: string
 * format: date
 * description: Date when the maintenance was completed (YYYY-MM-DD).
 * example: "2024-05-27"
 * next_due_date:
 * type: string
 * format: date
 * description: Optional date when the next similar maintenance is due (YYYY-MM-DD).
 * example: "2025-05-27"
 * notes:
 * type: string
 * description: Optional additional notes about the maintenance.
 * example: "Used synthetic oil, checked tire pressure."
 * responses:
 * 201:
 * description: Maintenance log created successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * maintenance:
 * $ref: '#/components/schemas/Maintenance'
 * 400:
 * description: Bad request (missing required fields)
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Asset not found or not owned by user
 * 500:
 * description: Internal server error
 */
router.post('/', createMaintenanceLog);

/**
 * @swagger
 * /maintenances/asset/{asset_id}:
 * get:
 * summary: Get all maintenance logs for a specific asset.
 * tags: [Maintenances]
 * security:
 * - JWTAuth: []
 * parameters:
 * - in: path
 * name: asset_id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the asset to retrieve maintenance logs for.
 * responses:
 * 200:
 * description: A list of maintenance logs for the specified asset.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * maintenances:
 * type: array
 * items:
 * $ref: '#/components/schemas/Maintenance'
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Asset not found or not owned by user
 * 500:
 * description: Internal server error
 */
router.get('/asset/:asset_id', getAssetMaintenanceLogs);

/**
 * @swagger
 * /maintenances/asset/{asset_id}/{id}:
 * get:
 * summary: Get a single maintenance log by its ID for a specific asset.
 * tags: [Maintenances]
 * security:
 * - JWTAuth: []
 * parameters:
 * - in: path
 * name: asset_id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the asset the maintenance log belongs to.
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the maintenance log to retrieve.
 * responses:
 * 200:
 * description: Maintenance log details.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * maintenance:
 * $ref: '#/components/schemas/Maintenance'
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Maintenance log not found or does not belong to the asset/user.
 * 500:
 * description: Internal server error
 */
router.get('/asset/:asset_id/:id', getMaintenanceLog);

/**
 * @swagger
 * /maintenances/asset/{asset_id}/{id}:
 * put:
 * summary: Update an existing maintenance log for a specific asset.
 * tags: [Maintenances]
 * security:
 * - JWTAuth: []
 * parameters:
 * - in: path
 * name: asset_id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the asset the maintenance log belongs to.
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the maintenance log to update.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * service_description:
 * type: string
 * description: New description of the service performed.
 * example: "Oil change and filter replacement (synthetic)"
 * completion_date:
 * type: string
 * format: date
 * description: New completion date (YYYY-MM-DD).
 * example: "2024-05-28"
 * next_due_date:
 * type: string
 * format: date
 * description: New optional next due date (YYYY-MM-DD).
 * example: "2025-05-28"
 * notes:
 * type: string
 * description: New optional additional notes.
 * example: "Used premium synthetic oil."
 * responses:
 * 200:
 * description: Maintenance log updated successfully.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Maintenance'
 * 400:
 * description: Bad request (no fields to update)
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Maintenance log not found or does not belong to the asset/user.
 * 500:
 * description: Internal server error
 */
router.put('/asset/:asset_id/:id', updateMaintenanceLog);

/**
 * @swagger
 * /maintenances/asset/{asset_id}/{id}:
 * delete:
 * summary: Delete a maintenance log by its ID for a specific asset.
 * tags: [Maintenances]
 * security:
 * - JWTAuth: []
 * parameters:
 * - in: path
 * name: asset_id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the asset the maintenance log belongs to.
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the maintenance log to delete.
 * responses:
 * 204:
 * description: Maintenance log deleted successfully (No Content).
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Maintenance log not found or does not belong to the asset/user.
 * 500:
 * description: Internal server error
 */
router.delete('/asset/:asset_id/:id', deleteMaintenanceLog);


export default router;
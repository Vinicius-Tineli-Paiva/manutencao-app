import { Router } from 'express';
import { createNewAsset, getUserAssets, getAsset, updateExistingAsset, deleteExistingAsset } from '../controllers/asset.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all asset routes
router.use(authenticateToken); // All routes below this line require a valid JWT

/**
 * @swagger
 * /assets:
 * post:
 * summary: Create a new asset for the authenticated user
 * tags: [Assets]
 * security:
 * - JWTAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * properties:
 * name:
 * type: string
 * description: Name of the asset (e.g., "My Car - Gol")
 * example: "Server Rack 1"
 * description:
 * type: string
 * description: Detailed description of the asset
 * example: "Dell PowerEdge R740, located in Datacenter A"
 * responses:
 * 201:
 * description: Asset created successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Asset'
 * 400:
 * description: Bad request (missing name)
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 500:
 * description: Internal server error
 */
router.post('/', createNewAsset);

/**
 * @swagger
 * /assets:
 * get:
 * summary: Get all assets for the authenticated user
 * tags: [Assets]
 * security:
 * - JWTAuth: []
 * responses:
 * 200:
 * description: A list of assets
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * assets:
 * type: array
 * items:
 * $ref: '#/components/schemas/Asset'
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 500:
 * description: Internal server error
 */
router.get('/', getUserAssets);

/**
 * @swagger
 * /assets/{id}:
 * get:
 * summary: Get a single asset by ID for the authenticated user
 * tags: [Assets]
 * security:
 * - JWTAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the asset to retrieve
 * responses:
 * 200:
 * description: Asset details
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Asset'
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Asset not found or not owned by user
 * 500:
 * description: Internal server error
 */
router.get('/:id', getAsset);

/**
 * @swagger
 * /assets/{id}:
 * put:
 * summary: Update an existing asset for the authenticated user
 * tags: [Assets]
 * security:
 * - JWTAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the asset to update
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * description: New name for the asset
 * example: "My New Car Name"
 * description:
 * type: string
 * description: New detailed description for the asset
 * example: "Updated description: Black, 2023 model."
 * responses:
 * 200:
 * description: Asset updated successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Asset'
 * 400:
 * description: Bad request (no fields to update)
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Asset not found or not owned by user
 * 500:
 * description: Internal server error
 */
router.put('/:id', updateExistingAsset);

/**
 * @swagger
 * /assets/{id}:
 * delete:
 * summary: Delete an asset for the authenticated user
 * tags: [Assets]
 * security:
 * - JWTAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: ID of the asset to delete
 * responses:
 * 204:
 * description: Asset deleted successfully (No Content)
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 404:
 * description: Asset not found or not owned by user
 * 500:
 * description: Internal server error
 */
router.delete('/:id', deleteExistingAsset);

export default router;

import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Register a new user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - email
 * - password
 * properties:
 * username:
 * type: string
 * description: Unique username
 * example: testuser
 * email:
 * type: string
 * format: email
 * description: Unique email address
 * example: test@example.com
 * password:
 * type: string
 * format: password
 * description: User password
 * example: StrongPassword123!
 * responses:
 * 201:
 * description: User registered successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * user:
 * type: object
 * properties:
 * id:
 * type: string
 * username:
 * type: string
 * email:
 * type: string
 * token:
 * type: string
 * 400:
 * description: Bad request (missing fields)
 * 409:
 * description: Username or email already taken
 * 500:
 * description: Internal server error
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Log in a user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - identifier
 * - password
 * properties:
 * identifier:
 * type: string
 * description: Username or email of the user
 * example: testuser or test@example.com
 * password:
 * type: string
 * format: password
 * description: User password
 * example: StrongPassword123!
 * responses:
 * 200:
 * description: User logged in successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * user:
 * type: object
 * properties:
 * id:
 * type: string
 * username:
 * type: string
 * email:
 * type: string
 * token:
 * type: string
 * 400:
 * description: Bad request (missing fields)
 * 401:
 * description: Invalid credentials
 * 500:
 * description: Internal server error
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 * post:
 * summary: Log out a user
 * tags: [Auth]
 * responses:
 * 200:
 * description: User logged out successfully
 */
router.post('/logout', logout);

export default router;
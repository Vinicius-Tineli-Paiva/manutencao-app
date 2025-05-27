import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';

// Extend the Request object to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

/**
 * @description Middleware to authenticate requests using JWT.
 * Extracts the token from the Authorization header (Bearer token), verifies it,
 * and attaches the decoded user ID to the request object for further use.
 * If authentication fails, it sends an appropriate error response.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get the Authorization header value
  const authHeader = req.headers['authorization'];
  // The token typically comes in the format "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // No token provided
    return res.status(401).json({ message: 'Authentication required: No token provided.' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    // Token is invalid or expired
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
  }

  // If token is valid, attach the user ID to the request object
  req.user = decoded;
  next(); // Proceed to the next middleware or route handler
};
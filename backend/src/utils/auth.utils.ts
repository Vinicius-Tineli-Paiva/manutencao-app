import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_if_not_set'; // Fallback for dev, but ensure it's set

/**
 * @description Hashes a plain text password using bcrypt.
 * @param password The plain text password to hash.
 * @returns A promise that resolves with the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10; // Standard salt rounds for security
  return bcrypt.hash(password, saltRounds);
};

/**
 * @description Compares a plain text password with a hashed password.
 * @param password The plain text password.
 * @param hash The hashed password from the database.
 * @returns A promise that resolves to true if passwords match, false otherwise.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * @description Generates a JSON Web Token (JWT) for a given user ID.
 * @param userId The ID of the user for whom to generate the token.
 * @returns The signed JWT string.
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

/**
 * @description Verifies a JWT and extracts the user ID.
 * @param token The JWT string to verify.
 * @returns The decoded payload (containing user ID) or null if verification fails.
 */
export const verifyToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};
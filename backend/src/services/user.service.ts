//Interaction with BD
import { query } from '../config/db';
import { User } from '../models/user.model';
import { hashPassword } from '../utils/auth.utils';

/**
 * @description Finds a user by their username or email.
 * @param identifier The username or email to search for.
 * @returns A Promise that resolves with the User object or null if not found.
 */
export const findUserByIdentifier = async (identifier: string): Promise<User | null> => {
  const text = 'SELECT id, username, email, password_hash FROM users WHERE username = $1 OR email = $2';
  const values = [identifier, identifier];
  try {
    const result = await query(text, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by identifier:', error);
    throw new Error('Database error during user lookup.');
  }
};

/**
 * @description Creates a new user in the database.
 * @param user The user object containing username, email, and plain text password.
 * @returns A Promise that resolves with the newly created User object (without password_hash).
 */
export const createUser = async (user: Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at'> & { password: string }): Promise<Omit<User, 'password_hash'> | null> => {
  const { username, email, password } = user;
  const passwordHash = await hashPassword(password);

  const text = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at, updated_at';
  const values = [username, email, passwordHash];
  try {
    const result = await query(text, values);
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') { // Duplicate key error (unique constraint violation)
      throw new Error('Username or email already exists.');
    }
    console.error('Error creating user:', error);
    throw new Error('Failed to create user due to database error.');
  }
};
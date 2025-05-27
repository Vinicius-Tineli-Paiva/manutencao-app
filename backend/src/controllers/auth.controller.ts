import { Request, Response } from 'express';
import { createUser, findUserByIdentifier } from '../services/user.service';
import { comparePassword, generateToken } from '../utils/auth.utils';
import { User } from '../models/user.model';

/**
 * @description Handles user registration.
 * Expects username, email, and password in the request body.
 */
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  try {
    const existingUser = await findUserByIdentifier(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already taken.' });
    }

    const newUser = await createUser({ username, email, password });
    if (newUser) {
      // Generate a token for the newly registered user for immediate login
      const token = generateToken(newUser.id!); // newUser.id is guaranteed here as it's from DB
      return res.status(201).json({
        message: 'User registered successfully.',
        user: { id: newUser.id, username: newUser.username, email: newUser.email },
        token
      });
    } else {
      return res.status(500).json({ message: 'Failed to register user.' });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.message.includes('Username or email already exists')) {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

/**
 * @description Handles user login.
 * Expects identifier (username or email) and password in the request body.
 */
export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body; // 'identifier' can be username or email

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier (username/email) and password are required.' });
  }

  try {
    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = generateToken(user.id!); // user.id is guaranteed here as it's from DB

    return res.status(200).json({
      message: 'Logged in successfully.',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

/**
 * @description Handles user logout.
 * For JWT, logout is primarily a client-side action (deleting the token).
 * This endpoint can be used to invalidate tokens on the server-side if a blacklist is implemented,
 * but for a basic JWT setup, it simply acknowledges the logout.
 */
export const logout = (req: Request, res: Response) => {
  // In a JWT-based system, logout is generally handled client-side by deleting the token.
  // If a token blacklist/revocation mechanism was implemented, it would go here.
  res.status(200).json({ message: 'Logged out successfully.' });
};
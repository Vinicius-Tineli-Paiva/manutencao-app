import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

/**
 * @description Creates a new PostgreSQL connection pool.
 * The connection string is retrieved from environment variables.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * @description Connects to the PostgreSQL database using the pool.
 * Tests the connection and logs success or error.
 */
export const connectDb = async (): Promise<void> => {
  try {
    await pool.connect();
    console.log('Successfully connected to the PostgreSQL database.');
  } catch (error) {
    console.error('Error connecting to the PostgreSQL database:', error);
    process.exit(1); // Exit the process if unable to connect to DB
  }
};

/**
 * @description Executes a SQL query using the shared PostgreSQL pool.
 * @param text The SQL query string.
 * @param params Optional parameters for the query.
 * @returns A Promise that resolves with the query result.
 */
export const query = (text: string, params?: any[]) => pool.query(text, params);
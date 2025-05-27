/**
 * @description Interface representing a User in the system.
 */
export interface User {
  id?: string;        // Optional: Database ID, typically auto-generated
  username: string;   // Unique username for login
  email: string;      // User's email address
  password_hash: string; // Hashed password
  created_at?: Date;  // Optional: Timestamp of creation
  updated_at?: Date;  // Optional: Timestamp of last update
}
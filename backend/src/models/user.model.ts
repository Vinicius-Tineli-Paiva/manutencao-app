/**
 * @description Interface representing a User in the system.
 */
export interface User {
  id?: string;       
  username: string;  
  email: string;  
  password_hash: string;
  created_at?: Date;  
  updated_at?: Date;  
}
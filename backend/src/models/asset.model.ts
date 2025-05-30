/**
 * @description Interface representing an Asset in the system.
 */
export interface Asset {
  id?: string;        
  user_id: string;    
  name: string;      
  description?: string; 
  created_at?: Date;  
  updated_at?: Date;  
}
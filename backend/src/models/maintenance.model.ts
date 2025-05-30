/**
 * @description Interface representing a Maintenance record in the system.
 */
export interface Maintenance {
  id?: string;
  asset_id: string;
  service_description: string;
  completion_date?: string;   
  next_due_date?: string;
  notes?: string;
  is_completed?: boolean;     
  created_at?: Date;
  updated_at?: Date;
  asset_name?: string;        
  asset_description?: string; 
}
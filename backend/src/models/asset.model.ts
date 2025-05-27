/**
 * @description Interface representing an Asset in the system.
 */
export interface Asset {
  id?: string;        // Optional: Database ID, typically auto-generated
  user_id: string;    // ID of the user who owns this asset
  name: string;       // Easy-to-remember name for the asset
  description?: string; // Optional: More detailed description (e.g., license plate, model)
  created_at?: Date;  // Optional: Timestamp of creation
  updated_at?: Date;  // Optional: Timestamp of last update
}
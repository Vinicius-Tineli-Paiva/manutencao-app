export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Asset {
  id?: string; 
  user_id: string;
  name: string;
  description?: string; // Opcional
  created_at?: string;
  updated_at?: string;
}

export interface Maintenance {
  id?: string; 
  asset_id: string;
  service_description: string;
  completion_date: string; 
  next_due_date?: string;  
  notes?: string;
  created_at?: string;
  updated_at?: string;
  asset_name?: string;
  asset_description?: string;
}
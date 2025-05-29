/**
 * @description Interface representing a Maintenance record in the system.
 */
export interface Maintenance {
  id?: string;
  asset_id: string;
  service_description: string;
  completion_date?: string;   // ALTERADO: Agora é opcional
  next_due_date?: string;
  notes?: string;
  is_completed?: boolean;     // ADICIONADO: Campo para status de conclusão
  created_at?: Date;
  updated_at?: Date;
  asset_name?: string;        // Opcional: Para joins em queries de dashboard/relatórios
  asset_description?: string; // Opcional: Para joins em queries de dashboard/relatórios
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      consumption_data: {
        Row: {
          actual_consumption: number | null
          confidence_interval: number | null
          created_at: string | null
          id: string
          predicted_consumption: number | null
          state_id: string
          timestamp: string
          updated_at: string | null
        }
        Insert: {
          actual_consumption?: number | null
          confidence_interval?: number | null
          created_at?: string | null
          id?: string
          predicted_consumption?: number | null
          state_id: string
          timestamp: string
          updated_at?: string | null
        }
        Update: {
          actual_consumption?: number | null
          confidence_interval?: number | null
          created_at?: string | null
          id?: string
          predicted_consumption?: number | null
          state_id?: string
          timestamp?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumption_data_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_models: {
        Row: {
          accuracy_score: number
          created_at: string | null
          id: string
          is_active: boolean | null
          last_trained_at: string | null
          model_type: string
          parameters: Json
          state_id: string
          updated_at: string | null
        }
        Insert: {
          accuracy_score?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_trained_at?: string | null
          model_type: string
          parameters?: Json
          state_id: string
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_trained_at?: string | null
          model_type?: string
          parameters?: Json
          state_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_models_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          confidence_percentage: number | null
          created_at: string | null
          date: string
          id: string
          predicted_consumption: number | null
          state_id: string | null
        }
        Insert: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          confidence_percentage?: number | null
          created_at?: string | null
          date: string
          id?: string
          predicted_consumption?: number | null
          state_id?: string | null
        }
        Update: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          confidence_percentage?: number | null
          created_at?: string | null
          date?: string
          id?: string
          predicted_consumption?: number | null
          state_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_data: {
        Row: {
          actual_consumption: number | null
          created_at: string | null
          date: string
          id: string
          state_id: string | null
        }
        Insert: {
          actual_consumption?: number | null
          created_at?: string | null
          date: string
          id?: string
          state_id?: string | null
        }
        Update: {
          actual_consumption?: number | null
          created_at?: string | null
          date?: string
          id?: string
          state_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_data_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string
          date: string
          holiday_name: string
          id: number
          is_holiday: boolean | null
          state_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          holiday_name: string
          id?: number
          is_holiday?: boolean | null
          state_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          holiday_name?: string
          id?: number
          is_holiday?: boolean | null
          state_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "holidays_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      model_metrics: {
        Row: {
          accuracy_percentage: number
          id: string
          last_updated: string | null
          mae: number
          model_name: string
          rmse: number
          state_id: string | null
          training_date: string | null
        }
        Insert: {
          accuracy_percentage: number
          id?: string
          last_updated?: string | null
          mae: number
          model_name: string
          rmse: number
          state_id?: string | null
          training_date?: string | null
        }
        Update: {
          accuracy_percentage?: number
          id?: string
          last_updated?: string | null
          mae?: number
          model_name?: string
          rmse?: number
          state_id?: string | null
          training_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_metrics_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      model_predictions: {
        Row: {
          actual_consumption: number | null
          created_at: string | null
          date: string
          id: string
          model_name: string
          predicted_consumption: number
          state_id: string | null
        }
        Insert: {
          actual_consumption?: number | null
          created_at?: string | null
          date: string
          id?: string
          model_name: string
          predicted_consumption: number
          state_id?: string | null
        }
        Update: {
          actual_consumption?: number | null
          created_at?: string | null
          date?: string
          id?: string
          model_name?: string
          predicted_consumption?: number
          state_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_predictions_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          created_at: string | null
          id: string
          name: string
          peak_demand: number
          population: number
          region: string
          total_capacity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          peak_demand?: number
          population: number
          region: string
          total_capacity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          peak_demand?: number
          population?: number
          region?: string
          total_capacity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          cloud_cover: number | null
          created_at: string | null
          date: string
          description: string | null
          feels_like: number | null
          humidity: number | null
          icon: string | null
          id: string
          pressure: number | null
          rainfall: number | null
          state_id: string | null
          temp_max: number | null
          temp_min: number | null
          temperature: number | null
          visibility: number | null
          wind_speed: number | null
        }
        Insert: {
          cloud_cover?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          feels_like?: number | null
          humidity?: number | null
          icon?: string | null
          id?: string
          pressure?: number | null
          rainfall?: number | null
          state_id?: string | null
          temp_max?: number | null
          temp_min?: number | null
          temperature?: number | null
          visibility?: number | null
          wind_speed?: number | null
        }
        Update: {
          cloud_cover?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          feels_like?: number | null
          humidity?: number | null
          icon?: string | null
          id?: string
          pressure?: number | null
          rainfall?: number | null
          state_id?: string | null
          temp_max?: number | null
          temp_min?: number | null
          temperature?: number | null
          visibility?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

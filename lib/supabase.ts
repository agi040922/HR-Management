import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: number
          name: string
          hourly_wage: number
          position: string
          phone: string | null
          start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          hourly_wage: number
          position: string
          phone?: string | null
          start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          hourly_wage?: number
          position?: string
          phone?: string | null
          start_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      work_schedules: {
        Row: {
          id: number
          employee_id: number
          date: string
          start_time: string
          end_time: string
          break_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          employee_id: number
          date: string
          start_time: string
          end_time: string
          break_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          employee_id?: number
          date?: string
          start_time?: string
          end_time?: string
          break_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      store_settings: {
        Row: {
          id: number
          store_name: string
          open_time: string
          close_time: string
          time_slot_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          store_name: string
          open_time: string
          close_time: string
          time_slot_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          store_name?: string
          open_time?: string
          close_time?: string
          time_slot_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      payroll_calculations: {
        Row: {
          id: number
          employee_id: number
          week_start_date: string
          regular_hours: number
          overtime_hours: number
          night_hours: number
          holiday_pay: number
          total_wage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          employee_id: number
          week_start_date: string
          regular_hours: number
          overtime_hours: number
          night_hours: number
          holiday_pay: number
          total_wage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          employee_id?: number
          week_start_date?: string
          regular_hours?: number
          overtime_hours?: number
          night_hours?: number
          holiday_pay?: number
          total_wage?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          bio: string | null
          department: string | null
          position: string | null
          employee_id: string | null
          hire_date: string | null
          birth_date: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          preferences: Record<string, any>
          settings: Record<string, any>
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          department?: string | null
          position?: string | null
          employee_id?: string | null
          hire_date?: string | null
          birth_date?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          preferences?: Record<string, any>
          settings?: Record<string, any>
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          department?: string | null
          position?: string | null
          employee_id?: string | null
          hire_date?: string | null
          birth_date?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          preferences?: Record<string, any>
          settings?: Record<string, any>
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// 기존 타입 파일에서 import
export type { Employee, WorkSchedule } from '@/types/employee'

export interface StoreSettings {
  id: number
  openTime: string
  closeTime: string
  timeSlotMinutes: number
}

// Supabase 테이블 타입 별칭
export type EmployeeRow = Database['public']['Tables']['employees']['Row']
export type WorkScheduleRow = Database['public']['Tables']['work_schedules']['Row']
export type StoreSettingsRow = Database['public']['Tables']['store_settings']['Row']
export type UserRow = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

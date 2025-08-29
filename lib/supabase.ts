import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 기본 클라이언트 (localStorage 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 쿠키 기반 클라이언트 (미들웨어와 SSR용)
export const supabaseCookie = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
        // 쿠키에도 저장
        document.cookie = `${key}=${value}; path=/; max-age=86400; secure; samesite=strict`
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
        // 쿠키에서도 제거
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    }
  }
})

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
          preferences: Record<string, unknown>
          settings: Record<string, unknown>
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

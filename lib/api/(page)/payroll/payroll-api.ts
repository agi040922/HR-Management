import { supabase } from '@/lib/supabase'
import { Store, Employee, WorkSchedule, WeeklyTemplate } from '@/types/payroll'

export class PayrollAPI {
  /**
   * 사용자의 모든 활성 스토어 조회
   */
  static async getStores(userId: string): Promise<Store[]> {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('owner_id', userId)
      .order('store_name')

    if (error) throw new Error(`스토어 조회 실패: ${error.message}`)
    return data || []
  }

  /**
   * 사용자의 모든 활성 직원 조회
   */
  static async getEmployees(userId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('owner_id', userId)
      .eq('is_active', true)
      .order('name')

    if (error) throw new Error(`직원 조회 실패: ${error.message}`)
    return data || []
  }

  /**
   * 특정 기간의 스케줄 조회
   */
  static async getSchedules(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<WorkSchedule[]> {
    const { data, error } = await supabase
      .from('work_schedule_templates')
      .select('*')
      .eq('owner_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')

    if (error) throw new Error(`스케줄 조회 실패: ${error.message}`)
    return data || []
  }

  /**
   * 사용자의 모든 주간 템플릿 조회
   */
  static async getWeeklyTemplates(userId: string): Promise<WeeklyTemplate[]> {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select('*')
      .eq('owner_id', userId)
      .order('template_name')

    if (error) throw new Error(`템플릿 조회 실패: ${error.message}`)
    return data || []
  }

  /**
   * 특정 스토어의 템플릿 조회
   */
  static async getStoreTemplates(userId: string, storeId: number): Promise<WeeklyTemplate[]> {
    const { data, error } = await supabase
      .from('weekly_schedules_templates')
      .select('*')
      .eq('owner_id', userId)
      .eq('store_id', storeId)
      .order('template_name')

    if (error) throw new Error(`스토어 템플릿 조회 실패: ${error.message}`)
    return data || []
  }
}

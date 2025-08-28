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
    return Array.isArray(data) ? data : []
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
    return Array.isArray(data) ? data : []
  }

  /**
   * 특정 기간의 스케줄 조회
   */
  static async getSchedules(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<WorkSchedule[]> {
    // 현재 스키마에는 work_schedules 테이블이 없으므로 
    // weekly_schedule_templates에서 스케줄 데이터를 조회
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select(`
        id,
        store_id,
        template_name,
        schedule_data,
        created_at
      `)
      .in('store_id', 
        supabase
          .from('store_settings')
          .select('id')
          .eq('owner_id', userId)
      )
      .eq('is_active', true)

    if (error) throw new Error(`스케줄 조회 실패: ${error.message}`)
    
    // 템플릿 데이터를 WorkSchedule 형태로 변환
    const schedules: WorkSchedule[] = []
    
    if (Array.isArray(data)) {
      data.forEach(template => {
        // schedule_data JSONB에서 요일별 스케줄 추출
        const scheduleData = template.schedule_data as any
        
        // 요일 매핑 (영어 -> 숫자)
        const dayMapping: { [key: string]: number } = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        }
        
        // 기간 내 모든 날짜에 대해 스케줄 생성
        const start = new Date(startDate)
        const end = new Date(endDate)
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay()
          const dayKey = Object.keys(dayMapping).find(key => dayMapping[key] === dayOfWeek)
          
          if (dayKey && scheduleData[dayKey]) {
            const dayData = scheduleData[dayKey]
            if (dayData.is_open && dayData.time_slots) {
              Object.entries(dayData.time_slots).forEach(([employeeId, timeSlot]: any) => {
                if (timeSlot.start_time && timeSlot.end_time) {
                  schedules.push({
                    id: template.id + parseInt(employeeId) * 1000 + dayOfWeek, // 고유 ID 생성
                    employee_id: parseInt(employeeId),
                    store_id: template.store_id,
                    owner_id: userId,
                    date: d.toISOString().split('T')[0],
                    start_time: timeSlot.start_time,
                    end_time: timeSlot.end_time,
                    break_minutes: timeSlot.break_minutes || 0,
                    is_holiday: dayOfWeek === 0 || dayOfWeek === 6 // 주말을 휴일로 간주
                  })
                }
              })
            }
          }
        }
      })
    }
    
    return schedules
  }

  /**
   * 사용자의 모든 주간 템플릿 조회
   */
  static async getWeeklyTemplates(userId: string): Promise<WeeklyTemplate[]> {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select(`
        id,
        template_name,
        store_id,
        is_active,
        created_at
      `)
      .in('store_id', 
        supabase
          .from('store_settings')
          .select('id')
          .eq('owner_id', userId)
      )
      .order('template_name')

    if (error) throw new Error(`템플릿 조회 실패: ${error.message}`)
    
    // 스키마에 owner_id가 없으므로 userId를 추가하여 반환
    const safeData = Array.isArray(data) ? data : []
    return safeData.map(template => ({
      ...template,
      owner_id: userId
    }))
  }

  /**
   * 특정 스토어의 템플릿 조회
   */
  static async getStoreTemplates(userId: string, storeId: number): Promise<WeeklyTemplate[]> {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select(`
        id,
        template_name,
        store_id,
        is_active,
        created_at
      `)
      .eq('store_id', storeId)
      .order('template_name')

    if (error) throw new Error(`스토어 템플릿 조회 실패: ${error.message}`)
    
    // 스키마에 owner_id가 없으므로 userId를 추가하여 반환
    const safeData = Array.isArray(data) ? data : []
    return safeData.map(template => ({
      ...template,
      owner_id: userId
    }))
  }
}

// 실제 스케줄 생성 관련 API 함수들

import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 스토어 데이터 타입
export interface StoreData {
  id: number
  owner_id: string
  store_name: string
  time_slot_minutes: number
  created_at?: string
  updated_at?: string
}

// 직원 데이터 타입  
export interface EmployeeData {
  id: number
  store_id?: number
  owner_id: string
  name: string
  hourly_wage: number
  position?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 템플릿 데이터 타입
export interface TemplateData {
  id: number
  store_id: number
  template_name: string
  schedule_data: any
  is_active: boolean
  created_at: string
  updated_at: string
}

// 예외사항 데이터 타입
export interface ExceptionData {
  id: number
  store_id?: number
  employee_id?: number
  template_id?: number
  date: string
  exception_type: 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL'
  start_time?: string
  end_time?: string
  notes?: string
  exception_data?: any
  affected_slots?: any[]
  created_at: string
  updated_at: string
}

// 실제 스케줄 데이터 타입
export interface ActualScheduleData {
  date: string
  dayName: string
  dayKey: string
  timeSlots: {
    [timeSlot: string]: {
      employees: EmployeeData[]
      isException: boolean
      exceptionType?: 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL'
      originalEmployees?: EmployeeData[]
      notes?: string
    }
  }
  isOpen: boolean
  totalHours: number
  totalEmployees: number
}

// 주간 실제 스케줄 타입
export interface WeeklyActualSchedule {
  weekStart: string
  weekEnd: string
  templateId: number
  templateName: string
  storeId: number
  days: ActualScheduleData[]
  totalWeeklyHours: number
  exceptionsCount: number
}

/**
 * 사용자의 모든 스토어 조회
 * @param userId 사용자 ID
 * @returns 스토어 목록
 */
export async function getUserStores(userId: string): Promise<StoreData[]> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('스토어 목록 로드 오류:', error);
    throw error;
  }
}

/**
 * 스토어의 모든 템플릿 조회
 * @param storeId 스토어 ID
 * @returns 템플릿 목록
 */
export async function getStoreTemplates(storeId: number): Promise<TemplateData[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('템플릿 목록 로드 오류:', error);
    throw error;
  }
}

/**
 * 스토어의 활성 직원 조회
 * @param storeId 스토어 ID
 * @param ownerId 소유자 ID
 * @returns 직원 목록
 */
export async function getStoreEmployees(storeId: number, ownerId: string): Promise<EmployeeData[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('store_id', storeId)
      .eq('owner_id', ownerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('직원 목록 로드 오류:', error);
    throw error;
  }
}

/**
 * 스토어의 모든 예외사항 조회
 * @param storeId 스토어 ID
 * @returns 예외사항 목록
 */
export async function getStoreExceptions(storeId: number): Promise<ExceptionData[]> {
  try {
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .select('*')
      .eq('store_id', storeId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('예외사항 로드 오류:', error);
    throw error;
  }
}

/**
 * 특정 기간의 실제 스케줄 생성
 * @param template 템플릿 데이터
 * @param employees 직원 목록
 * @param exceptions 예외사항 목록
 * @param startDate 시작 날짜 (YYYY-MM-DD)
 * @param endDate 종료 날짜 (YYYY-MM-DD)
 * @returns 실제 스케줄 데이터
 */
export function generateActualSchedule(
  template: TemplateData,
  employees: EmployeeData[],
  exceptions: ExceptionData[],
  startDate: string,
  endDate: string
): ActualScheduleData[] {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
  
  const actualSchedule: ActualScheduleData[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // 날짜별로 스케줄 생성
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    const dayKey = days[dayOfWeek === 0 ? 6 : dayOfWeek - 1] // 일요일(0)을 Saturday 다음으로
    const dayName = dayNames[days.indexOf(dayKey)]
    
    // 해당 날짜의 템플릿 데이터
    const dayTemplate = template.schedule_data[dayKey]
    
    // 해당 날짜의 예외사항들
    const dayExceptions = exceptions.filter(ex => ex.date === dateStr)
    
    const actualDay: ActualScheduleData = {
      date: dateStr,
      dayName,
      dayKey,
      timeSlots: {},
      isOpen: dayTemplate?.is_open || false,
      totalHours: 0,
      totalEmployees: 0
    }
    
    if (dayTemplate?.is_open && dayTemplate.time_slots) {
      // 템플릿의 시간대별 스케줄 처리
      Object.entries(dayTemplate.time_slots).forEach(([timeSlot, employeeIds]: [string, any]) => {
        if (Array.isArray(employeeIds)) {
          const slotEmployees = employees.filter(emp => employeeIds.includes(emp.id))
          
          actualDay.timeSlots[timeSlot] = {
            employees: slotEmployees,
            isException: false
          }
        }
      })
      
      // 예외사항 적용
      dayExceptions.forEach(exception => {
        if (exception.exception_type === 'CANCEL') {
          // 휴무: 해당 직원의 모든 시간대에서 제거
          Object.keys(actualDay.timeSlots).forEach(timeSlot => {
            const slot = actualDay.timeSlots[timeSlot]
            slot.originalEmployees = [...slot.employees]
            slot.employees = slot.employees.filter(emp => emp.id !== exception.employee_id)
            slot.isException = true
            slot.exceptionType = 'CANCEL'
            slot.notes = exception.notes || undefined
          })
        } else if (exception.exception_type === 'OVERRIDE') {
          // 시간 변경: 영향받는 시간대에서 기존 스케줄 수정
          if (exception.affected_slots) {
            exception.affected_slots.forEach((affectedSlot: any) => {
              const timeSlot = affectedSlot.time_slot
              if (actualDay.timeSlots[timeSlot]) {
                const slot = actualDay.timeSlots[timeSlot]
                slot.originalEmployees = [...slot.employees]
                slot.employees = slot.employees.filter(emp => emp.id !== exception.employee_id)
                slot.isException = true
                slot.exceptionType = 'OVERRIDE'
                slot.notes = exception.notes || undefined
              }
            })
          }
          
          // 새로운 시간대 추가 (OVERRIDE의 경우)
          if (exception.start_time && exception.end_time) {
            const newTimeSlot = `${exception.start_time}-${exception.end_time}`
            const employee = employees.find(emp => emp.id === exception.employee_id)
            if (employee) {
              actualDay.timeSlots[newTimeSlot] = {
                employees: [employee],
                isException: true,
                exceptionType: 'OVERRIDE',
                notes: exception.notes || undefined
              }
            }
          }
        } else if (exception.exception_type === 'ADDITIONAL') {
          // 추가 근무: 새로운 시간대 추가
          if (exception.start_time && exception.end_time) {
            const newTimeSlot = `${exception.start_time}-${exception.end_time}`
            const employee = employees.find(emp => emp.id === exception.employee_id)
            if (employee) {
              actualDay.timeSlots[newTimeSlot] = {
                employees: [employee],
                isException: true,
                exceptionType: 'ADDITIONAL',
                notes: exception.notes || undefined
              }
            }
          }
        }
      })
      
      // 총 시간 및 직원 수 계산
      const uniqueEmployees = new Set<number>()
      Object.entries(actualDay.timeSlots).forEach(([timeSlot, slot]) => {
        slot.employees.forEach(emp => uniqueEmployees.add(emp.id))
        
        // 시간 계산 (시간대 형식: "09:00-18:00")
        const [startTime, endTime] = timeSlot.split('-')
        if (startTime && endTime) {
          const start = new Date(`2000-01-01T${startTime}:00`)
          const end = new Date(`2000-01-01T${endTime}:00`)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          actualDay.totalHours += hours * slot.employees.length
        }
      })
      
      actualDay.totalEmployees = uniqueEmployees.size
    }
    
    actualSchedule.push(actualDay)
  }
  
  return actualSchedule
}

/**
 * 주간 실제 스케줄 생성
 * @param template 템플릿 데이터
 * @param employees 직원 목록
 * @param exceptions 예외사항 목록
 * @param weekStartDate 주 시작 날짜 (YYYY-MM-DD)
 * @returns 주간 실제 스케줄
 */
export function generateWeeklyActualSchedule(
  template: TemplateData,
  employees: EmployeeData[],
  exceptions: ExceptionData[],
  weekStartDate: string
): WeeklyActualSchedule {
  const startDate = new Date(weekStartDate)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  const days = generateActualSchedule(
    template,
    employees,
    exceptions,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  )
  
  const totalWeeklyHours = days.reduce((sum, day) => sum + day.totalHours, 0)
  const exceptionsCount = exceptions.filter(ex => {
    const exDate = new Date(ex.date)
    return exDate >= startDate && exDate <= endDate
  }).length
  
  return {
    weekStart: startDate.toISOString().split('T')[0],
    weekEnd: endDate.toISOString().split('T')[0],
    templateId: template.id,
    templateName: template.template_name,
    storeId: template.store_id,
    days,
    totalWeeklyHours,
    exceptionsCount
  }
}

/**
 * 예외사항 유형 라벨 반환
 * @param type 예외사항 유형
 * @returns 한글 라벨
 */
export function getExceptionTypeLabel(type: string): string {
  switch (type) {
    case 'CANCEL': return '휴무'
    case 'OVERRIDE': return '변경'
    case 'ADDITIONAL': return '추가'
    default: return type
  }
}

/**
 * 예외사항 유형 배지 변형 반환
 * @param type 예외사항 유형
 * @returns 배지 변형
 */
export function getExceptionTypeBadgeVariant(type: string): string {
  switch (type) {
    case 'CANCEL': return 'destructive'
    case 'OVERRIDE': return 'default'
    case 'ADDITIONAL': return 'secondary'
    default: return 'default'
  }
}

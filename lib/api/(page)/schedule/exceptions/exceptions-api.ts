// 예외사항 관리 핵심 API
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// 타입 정의
export interface StoreData {
  id: number
  owner_id: string
  store_name: string
  time_slot_minutes: number
  created_at?: string
  updated_at?: string
}

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

export interface TemplateData {
  id: number
  store_id: number
  template_name: string
  schedule_data: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExceptionData {
  id: number
  store_id?: number
  employee_id?: number
  template_id?: number
  date: string
  exception_type: 'CANCEL' | 'OVERRIDE' | 'EXTRA'
  start_time?: string
  end_time?: string
  notes?: string
  exception_data?: any
  affected_slots?: any[]
  created_at: string
  updated_at: string
}

export interface WorkingSlot {
  day: string
  dayName: string
  timeSlot: string
  employees: EmployeeData[]
}

export interface ExceptionWizardData {
  step: number
  template_id: number | null
  employee_id: number | null
  date: string
  exception_type: 'CANCEL' | 'OVERRIDE' | 'EXTRA' | null
  working_slots: WorkingSlot[]
  selected_slots: string[]
  start_time: string
  end_time: string
  notes: string
  exception_data: any
  affected_slots: any[]
}

// API 함수들
export async function getUserStores(userId: string): Promise<StoreData[]> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('스토어 목록 로드 오류:', error)
    throw error
  }
}

export async function getStoreTemplates(storeId: number): Promise<TemplateData[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('템플릿 목록 로드 오류:', error)
    throw error
  }
}

export async function getStoreEmployees(storeId: number, ownerId: string): Promise<EmployeeData[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('store_id', storeId)
      .eq('owner_id', ownerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('직원 목록 로드 오류:', error)
    throw error
  }
}

export async function getStoreExceptions(storeId: number): Promise<ExceptionData[]> {
  try {
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .select('*')
      .eq('store_id', storeId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('예외사항 로드 오류:', error)
    throw error
  }
}

export async function createException(
  exceptionData: Omit<ExceptionData, 'id' | 'created_at' | 'updated_at'>
): Promise<ExceptionData> {
  try {
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .insert([exceptionData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('예외사항 생성 오류:', error)
    throw error
  }
}

export async function deleteException(exceptionId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('schedule_exceptions')
      .delete()
      .eq('id', exceptionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('예외사항 삭제 오류:', error)
    throw error
  }
}

// 유틸리티 함수들
export function getEmployeeWorkingSlots(
  template: TemplateData,
  employeeId: number,
  targetDate: string,
  employees: EmployeeData[]
): WorkingSlot[] {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
  
  const targetDay = new Date(targetDate).getDay()
  const dayKey = days[targetDay === 0 ? 6 : targetDay - 1]
  const dayData = template.schedule_data[dayKey]
  
  if (!dayData?.is_open || !dayData.employees) return []

  const workingSlots: WorkingSlot[] = []
  
  // 새로운 구조: employees 객체에서 직원별 개별 시간 확인
  const employeeSchedule = dayData.employees[employeeId.toString()]
  
  if (employeeSchedule && employeeSchedule.start_time && employeeSchedule.end_time) {
    // 해당 직원의 근무 시간이 있는 경우
    const timeSlot = `${employeeSchedule.start_time}-${employeeSchedule.end_time}`
    
    // 같은 시간대에 근무하는 다른 직원들 찾기
    const sameTimeEmployees = employees.filter(emp => {
      const empSchedule = dayData.employees[emp.id.toString()]
      return empSchedule && 
             empSchedule.start_time === employeeSchedule.start_time &&
             empSchedule.end_time === employeeSchedule.end_time
    })
    
    workingSlots.push({
      day: dayKey,
      dayName: dayNames[days.indexOf(dayKey)],
      timeSlot,
      employees: sameTimeEmployees
    })
  }

  return workingSlots
}

export function buildExceptionDataFromWizard(
  wizardData: ExceptionWizardData,
  storeId: number
): Omit<ExceptionData, 'id' | 'created_at' | 'updated_at'> {
  // CANCEL 타입일 때 선택된 시간대에서 시작/종료 시간 추출
  let startTime = wizardData.start_time || undefined
  let endTime = wizardData.end_time || undefined
  
  if (wizardData.exception_type === 'CANCEL' && wizardData.selected_slots.length > 0) {
    const slots = wizardData.selected_slots.map(slot => {
      const [start, end] = slot.split('-')
      return { start, end }
    })
    startTime = slots[0]?.start
    endTime = slots[slots.length - 1]?.end
  }

  return {
    store_id: storeId,
    employee_id: wizardData.employee_id!,
    template_id: wizardData.template_id!,
    date: wizardData.date,
    exception_type: wizardData.exception_type!,
    start_time: startTime,
    end_time: endTime,
    notes: wizardData.notes || undefined,
    exception_data: {},
    affected_slots: []
  }
}

export function getExceptionTypeLabel(type: string): string {
  switch (type) {
    case 'CANCEL': return '휴무'
    case 'OVERRIDE': return '변경'
    case 'EXTRA': return '추가'
    default: return type
  }
}

export function getExceptionTypeBadgeVariant(type: string): string {
  switch (type) {
    case 'CANCEL': return 'destructive'
    case 'OVERRIDE': return 'default'
    case 'EXTRA': return 'secondary'
    default: return 'default'
  }
}

export function getThisWeekExceptions(exceptions: ExceptionData[]): ExceptionData[] {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return exceptions.filter(exception => {
    const exceptionDate = new Date(exception.date)
    return exceptionDate >= startOfWeek && exceptionDate <= endOfWeek
  })
}

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
  exception_type: 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL'
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
  exception_type: 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL' | null
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
  
  if (!dayData?.is_open || !dayData.time_slots) return []

  const workingSlots: WorkingSlot[] = []
  
  Object.entries(dayData.time_slots).forEach(([timeSlot, employeeIds]: [string, any]) => {
    if (Array.isArray(employeeIds) && employeeIds.includes(employeeId)) {
      const slotEmployees = employees.filter(emp => employeeIds.includes(emp.id))
      workingSlots.push({
        day: dayKey,
        dayName: dayNames[days.indexOf(dayKey)],
        timeSlot,
        employees: slotEmployees
      })
    }
  })

  return workingSlots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
}

export function buildExceptionDataFromWizard(
  wizardData: ExceptionWizardData,
  storeId: number
): Omit<ExceptionData, 'id' | 'created_at' | 'updated_at'> {
  const exceptionData = {
    original_schedule: wizardData.working_slots,
    selected_time_slots: wizardData.selected_slots,
    reason: wizardData.notes || null
  }
  
  const affectedSlots = wizardData.working_slots
    .filter(slot => wizardData.selected_slots.includes(slot.timeSlot))
    .map(slot => ({
      day: slot.day,
      time_slot: slot.timeSlot,
      original_employees: slot.employees.map(emp => emp.id),
      exception_type: wizardData.exception_type
    }))

  return {
    store_id: storeId,
    employee_id: wizardData.employee_id!,
    template_id: wizardData.template_id!,
    date: wizardData.date,
    exception_type: wizardData.exception_type!,
    start_time: wizardData.exception_type !== 'CANCEL' ? wizardData.start_time : null,
    end_time: wizardData.exception_type !== 'CANCEL' ? wizardData.end_time : null,
    notes: wizardData.notes || null,
    exception_data: exceptionData,
    affected_slots: affectedSlots
  }
}

export function getExceptionTypeLabel(type: string): string {
  switch (type) {
    case 'CANCEL': return '휴무'
    case 'OVERRIDE': return '변경'
    case 'ADDITIONAL': return '추가'
    default: return type
  }
}

export function getExceptionTypeBadgeVariant(type: string): string {
  switch (type) {
    case 'CANCEL': return 'destructive'
    case 'OVERRIDE': return 'default'
    case 'ADDITIONAL': return 'secondary'
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

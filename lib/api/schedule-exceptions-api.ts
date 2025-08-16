// 스케줄 예외사항 관련 API 함수들

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

// 근무 슬롯 타입
export interface WorkingSlot {
  day: string
  dayName: string
  timeSlot: string
  employees: EmployeeData[]
}

// 예외사항 위저드 데이터 타입
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
 * 특정 직원의 근무 스케줄 가져오기
 * @param template 템플릿 데이터
 * @param employeeId 직원 ID
 * @param targetDate 대상 날짜
 * @param employees 직원 목록
 * @returns 근무 슬롯 목록
 */
export function getEmployeeWorkingSlots(
  template: TemplateData,
  employeeId: number,
  targetDate: string,
  employees: EmployeeData[]
): WorkingSlot[] {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
  
  const targetDay = new Date(targetDate).getDay()
  const dayKey = days[targetDay === 0 ? 6 : targetDay - 1] // 일요일(0)을 Saturday 다음으로
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

/**
 * 새로운 예외사항 생성
 * @param exceptionData 예외사항 데이터
 * @returns 생성된 예외사항
 */
export async function createException(
  exceptionData: Omit<ExceptionData, 'id' | 'created_at' | 'updated_at'>
): Promise<ExceptionData> {
  try {
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .insert([exceptionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('예외사항 생성 오류:', error);
    throw error;
  }
}

/**
 * 예외사항 삭제
 * @param exceptionId 예외사항 ID
 * @returns 성공 여부
 */
export async function deleteException(exceptionId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('schedule_exceptions')
      .delete()
      .eq('id', exceptionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('예외사항 삭제 오류:', error);
    throw error;
  }
}

/**
 * 예외사항 위저드 데이터에서 예외사항 생성 데이터 구성
 * @param wizardData 위저드 데이터
 * @param storeId 스토어 ID
 * @returns 예외사항 생성용 데이터
 */
export function buildExceptionDataFromWizard(
  wizardData: ExceptionWizardData,
  storeId: number
): Omit<ExceptionData, 'id' | 'created_at' | 'updated_at'> {
  // exception_data와 affected_slots 구성
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

/**
 * 이번주 예외사항 필터링
 * @param exceptions 전체 예외사항 목록
 * @returns 이번주 예외사항
 */
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

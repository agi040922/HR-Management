import { supabase } from '@/lib/supabase'

export interface StoreData {
  id: number
  owner_id: string
  store_name: string
  open_time: string
  close_time: string
  time_slot_minutes: number
}

export interface EmployeeData {
  id: number
  store_id?: number
  owner_id: string
  name: string
  hourly_wage: number
  position?: string
  phone?: string
  start_date: string
  is_active: boolean
  labor_contract?: any | null
  created_at: string
  updated_at: string
}

export interface EmployeeFormData {
  store_id: number | null
  owner_id: string
  name: string
  hourly_wage: number
  position: string
  phone: string
  start_date: string
  is_active: boolean
  labor_contract?: any | null
}

export interface ScheduleTemplate {
  id: number
  store_id: number
  template_name: string
  schedule_data: any
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 스토어 데이터 로드
 */
export const fetchStores = async (userId: string): Promise<StoreData[]> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('스토어 로드 오류:', error)
    throw new Error('스토어 데이터를 불러오는데 실패했습니다')
  }

  return data || []
}

/**
 * 직원 데이터 로드
 */
export const fetchEmployees = async (userId: string): Promise<EmployeeData[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('직원 로드 오류:', error)
    throw new Error('직원 데이터를 불러오는데 실패했습니다')
  }

  return data || []
}

/**
 * 스케줄 템플릿 로드
 */
export const fetchScheduleTemplates = async (storeId: number): Promise<ScheduleTemplate[]> => {
  const { data, error } = await supabase
    .from('weekly_schedule_templates')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('스케줄 템플릿 로드 오류:', error)
    throw new Error('스케줄 템플릿을 불러오는데 실패했습니다')
  }

  return data || []
}

/**
 * 직원 생성
 */
export const createEmployee = async (employeeData: EmployeeFormData): Promise<EmployeeData> => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single()

  if (error) {
    console.error('직원 생성 오류:', error)
    throw new Error('직원 등록에 실패했습니다')
  }

  return data
}

/**
 * 스케줄 템플릿에 직원 추가 (근로계약서 로직 참고)
 */
export const addEmployeeToScheduleTemplate = async (
  employee: EmployeeData,
  template: ScheduleTemplate,
  workingHours: {
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
    workDaysPerWeek?: number
  }
): Promise<void> => {
  try {
    const templateData = template.schedule_data || {}
    
    // 근로시간 정보를 기반으로 스케줄 데이터 생성
    const workDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const employeeSchedule = {
      start_time: workingHours.startTime,
      end_time: workingHours.endTime,
      break_periods: workingHours.breakStartTime && workingHours.breakEndTime ? [
        {
          start: workingHours.breakStartTime,
          end: workingHours.breakEndTime,
          name: '휴게시간'
        }
      ] : []
    }

    // 주 근무일수에 따라 해당 요일에만 스케줄 추가
    const workDaysCount = workingHours.workDaysPerWeek || 5
    for (let i = 0; i < Math.min(workDaysCount, workDays.length); i++) {
      const day = workDays[i]
      if (!templateData[day]) {
        templateData[day] = {
          is_open: true,
          open_time: workingHours.startTime,
          close_time: workingHours.endTime,
          break_periods: [],
          employees: {}
        }
      }
      
      if (!templateData[day].employees) {
        templateData[day].employees = {}
      }
      
      // 새로 등록된 직원을 템플릿에 추가
      templateData[day].employees[employee.id] = employeeSchedule
    }

    // 템플릿 업데이트
    const { error: templateError } = await supabase
      .from('weekly_schedule_templates')
      .update({
        schedule_data: templateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', template.id)

    if (templateError) {
      console.error('템플릿 업데이트 오류:', templateError)
      // 근로계약서 페이지와 동일하게 에러를 던지지 않고 경고만 표시
      console.warn('스케줄 템플릿 업데이트에 실패했지만 직원 등록은 성공했습니다')
    }
  } catch (error) {
    console.error('템플릿 처리 오류:', error)
    throw error
  }
}

/**
 * 근로계약서와 함께 직원 생성 (근로계약서 로직 참고)
 */
export const createEmployeeWithContract = async (
  contract: any,
  storeId: number,
  userId: string,
  selectedTemplate?: ScheduleTemplate
): Promise<EmployeeData> => {
  try {
    // 근로계약서 정보를 바탕으로 직원 데이터 생성
    const employeeData: EmployeeFormData = {
      store_id: storeId,
      owner_id: userId,
      name: contract.employee.name,
      hourly_wage: contract.salary.salaryType === 'hourly' 
        ? contract.salary.basicSalary 
        : Math.round(contract.salary.basicSalary / (40 * 4)), // 월급을 시급으로 대략 계산
      position: contract.jobDescription || '근로자',
      phone: contract.employee.phone,
      start_date: contract.workStartDate,
      is_active: true,
      labor_contract: contract
    }

    // 직원 등록
    const employee = await createEmployee(employeeData)

    // 선택된 템플릿이 있다면 스케줄 템플릿에 직원 추가
    if (selectedTemplate) {
      await addEmployeeToScheduleTemplate(employee, selectedTemplate, {
        startTime: contract.workingHours.startTime,
        endTime: contract.workingHours.endTime,
        breakStartTime: contract.workingHours.breakStartTime,
        breakEndTime: contract.workingHours.breakEndTime,
        workDaysPerWeek: contract.workingHours.workDaysPerWeek
      })
    }

    return employee
  } catch (error) {
    console.error('근로계약서 직원 등록 오류:', error)
    throw error
  }
}

/**
 * 직원 수정
 */
export const updateEmployee = async (employeeId: number, employeeData: Partial<EmployeeFormData>): Promise<void> => {
  const { error } = await supabase
    .from('employees')
    .update(employeeData)
    .eq('id', employeeId)

  if (error) {
    console.error('직원 수정 오류:', error)
    throw new Error('직원 정보 수정에 실패했습니다')
  }
}

/**
 * 직원 삭제
 */
export const deleteEmployee = async (employeeId: number): Promise<void> => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId)

  if (error) {
    console.error('직원 삭제 오류:', error)
    throw new Error('직원 삭제에 실패했습니다')
  }
}

/**
 * 직원 상태 토글
 */
export const toggleEmployeeStatus = async (employeeId: number, currentStatus: boolean): Promise<void> => {
  const { error } = await supabase
    .from('employees')
    .update({ is_active: !currentStatus })
    .eq('id', employeeId)

  if (error) {
    console.error('직원 상태 변경 오류:', error)
    throw new Error('직원 상태 변경에 실패했습니다')
  }
}

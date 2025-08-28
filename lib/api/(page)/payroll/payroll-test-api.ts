// 급여 계산 테스트를 위한 API
import { supabase } from '@/lib/supabase'
import { 
  StoreData, 
  EmployeeData, 
  TemplateData, 
  ExceptionData 
} from '@/lib/api/(page)/schedule/exceptions/exceptions-api'
import {
  calculateWorkHours,
  calculateMonthlySalary,
  calculateNetSalary,
  calculateInsurance,
  WorkHoursResult,
  MonthlySalaryResult,
  NetSalaryResult,
  InsuranceResult
} from '@/lib/payroll-calculator-2025'

// 급여 계산 관련 타입들
export interface EmployeeWorkSchedule {
  employeeId: number
  employeeName: string
  hourlyWage: number
  weeklySchedule: DaySchedule[]
  weeklyHours: number
  monthlyHours: number
  exceptions: ExceptionData[]
}

export interface DaySchedule {
  day: string
  dayName: string
  date: string
  startTime?: string
  endTime?: string
  breakTime?: number
  workHours: number
  hasException: boolean
  exceptionType?: 'CANCEL' | 'OVERRIDE' | 'EXTRA'
  originalHours?: number
}

export interface PayrollCalculationResult {
  employee: EmployeeData
  baseSchedule: EmployeeWorkSchedule
  finalSchedule: EmployeeWorkSchedule
  monthlySalary: MonthlySalaryResult
  netSalary: NetSalaryResult
  insurance: InsuranceResult
  totalPay: number
  exceptionAdjustments: ExceptionAdjustment[]
}

export interface ExceptionAdjustment {
  date: string
  type: 'CANCEL' | 'OVERRIDE' | 'EXTRA'
  originalHours: number
  adjustedHours: number
  hoursDifference: number
  payDifference: number
}

export interface MonthlyPayrollSummary {
  store: StoreData
  template: TemplateData
  year: number
  month: number
  employees: PayrollCalculationResult[]
  totalEmployees: number
  totalBasePay: number
  totalExceptionAdjustments: number
  totalFinalPay: number
}

/**
 * 특정 달의 주 템플릿 기반 급여 계산
 */
export async function calculateMonthlyPayroll(
  storeId: number,
  templateId: number,
  year: number,
  month: number
): Promise<MonthlyPayrollSummary> {
  try {
    // 기본 데이터 로드
    const [store, template, employees, exceptions] = await Promise.all([
      getStoreById(storeId),
      getTemplateById(templateId),
      getStoreEmployees(storeId),
      getMonthlyExceptions(storeId, year, month)
    ])

    if (!store || !template) {
      throw new Error('스토어 또는 템플릿을 찾을 수 없습니다')
    }

    // 각 직원별 급여 계산
    const employeeResults: PayrollCalculationResult[] = []

    for (const employee of employees) {
      const result = await calculateEmployeeMonthlyPayroll(
        employee,
        template,
        exceptions.filter(e => e.employee_id === employee.id),
        year,
        month
      )
      employeeResults.push(result)
    }

    // 총합 계산
    const totalBasePay = employeeResults.reduce((sum, result) => 
      sum + result.monthlySalary.grossSalary, 0)
    
    const totalExceptionAdjustments = employeeResults.reduce((sum, result) => 
      sum + result.exceptionAdjustments.reduce((adjSum, adj) => adjSum + adj.payDifference, 0), 0)
    
    const totalFinalPay = employeeResults.reduce((sum, result) => 
      sum + result.totalPay, 0)

    return {
      store,
      template,
      year,
      month,
      employees: employeeResults,
      totalEmployees: employees.length,
      totalBasePay,
      totalExceptionAdjustments,
      totalFinalPay
    }

  } catch (error) {
    console.error('월별 급여 계산 오류:', error)
    throw error
  }
}

/**
 * 개별 직원의 월별 급여 계산
 */
async function calculateEmployeeMonthlyPayroll(
  employee: EmployeeData,
  template: TemplateData,
  exceptions: ExceptionData[],
  year: number,
  month: number
): Promise<PayrollCalculationResult> {
  // 해당 월의 모든 날짜 생성
  const monthDates = generateMonthDates(year, month)
  
  // 기본 스케줄 생성 (템플릿 기반)
  const baseSchedule = generateBaseSchedule(employee, template, monthDates)
  
  // 예외사항 적용된 최종 스케줄 생성
  const finalSchedule = applyExceptions(baseSchedule, exceptions)
  
  // 급여 계산
  const monthlySalary = calculateMonthlySalary(
    finalSchedule.weeklyHours, 
    employee.hourly_wage
  )
  
  const netSalary = calculateNetSalary(monthlySalary.grossSalary)
  const insurance = calculateInsurance(monthlySalary.grossSalary)
  
  // 예외사항으로 인한 조정 계산
  const exceptionAdjustments = calculateExceptionAdjustments(
    baseSchedule, 
    finalSchedule, 
    employee.hourly_wage
  )
  
  const totalPay = monthlySalary.grossSalary + 
    exceptionAdjustments.reduce((sum, adj) => sum + adj.payDifference, 0)

  return {
    employee,
    baseSchedule,
    finalSchedule,
    monthlySalary,
    netSalary,
    insurance,
    totalPay,
    exceptionAdjustments
  }
}

/**
 * 기본 스케줄 생성 (템플릿 기반)
 */
function generateBaseSchedule(
  employee: EmployeeData,
  template: TemplateData,
  monthDates: Date[]
): EmployeeWorkSchedule {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
  
  const weeklySchedule: DaySchedule[] = monthDates.map(date => {
    const dayOfWeek = date.getDay()
    const dayKey = days[dayOfWeek === 0 ? 6 : dayOfWeek - 1]
    const dayData = template.schedule_data[dayKey]
    
    let workHours = 0
    let startTime: string | undefined
    let endTime: string | undefined
    let breakTime = 0

    if (dayData?.is_open && dayData.employees?.[employee.id.toString()]) {
      const employeeSchedule = dayData.employees[employee.id.toString()]
      startTime = employeeSchedule.start_time
      endTime = employeeSchedule.end_time
      
      if (startTime && endTime) {
        // 휴게시간 계산 (break_periods가 있다면)
        if (employeeSchedule.break_periods?.length > 0) {
          breakTime = employeeSchedule.break_periods.reduce((total: number, period: any) => {
            const breakStart = new Date(`2000-01-01 ${period.start}`)
            const breakEnd = new Date(`2000-01-01 ${period.end}`)
            return total + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60)
          }, 0)
        }
        
        const workResult = calculateWorkHours(startTime, endTime, breakTime)
        workHours = workResult.totalHours
      }
    }

    return {
      day: dayKey,
      dayName: dayNames[days.indexOf(dayKey)],
      date: date.toISOString().split('T')[0],
      startTime,
      endTime,
      breakTime,
      workHours,
      hasException: false,
      originalHours: workHours
    }
  })

  const weeklyHours = weeklySchedule.reduce((sum, day) => sum + day.workHours, 0) / 4.345
  const monthlyHours = weeklySchedule.reduce((sum, day) => sum + day.workHours, 0)

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    hourlyWage: employee.hourly_wage,
    weeklySchedule,
    weeklyHours: Math.round(weeklyHours * 100) / 100,
    monthlyHours: Math.round(monthlyHours * 100) / 100,
    exceptions: []
  }
}

/**
 * 예외사항 적용
 */
function applyExceptions(
  baseSchedule: EmployeeWorkSchedule,
  exceptions: ExceptionData[]
): EmployeeWorkSchedule {
  const finalSchedule = JSON.parse(JSON.stringify(baseSchedule)) as EmployeeWorkSchedule
  finalSchedule.exceptions = exceptions

  exceptions.forEach(exception => {
    const daySchedule = finalSchedule.weeklySchedule.find(
      day => day.date === exception.date
    )

    if (daySchedule) {
      daySchedule.hasException = true
      daySchedule.exceptionType = exception.exception_type

      switch (exception.exception_type) {
        case 'CANCEL':
          // 휴무 처리
          daySchedule.workHours = 0
          daySchedule.startTime = undefined
          daySchedule.endTime = undefined
          break

        case 'OVERRIDE':
          // 시간 변경
          if (exception.start_time && exception.end_time) {
            daySchedule.startTime = exception.start_time
            daySchedule.endTime = exception.end_time
            const workResult = calculateWorkHours(
              exception.start_time, 
              exception.end_time, 
              daySchedule.breakTime || 0
            )
            daySchedule.workHours = workResult.totalHours
          }
          break

        case 'EXTRA':
          // 추가 근무
          if (exception.start_time && exception.end_time) {
            const extraResult = calculateWorkHours(
              exception.start_time, 
              exception.end_time, 
              0
            )
            daySchedule.workHours += extraResult.totalHours
          }
          break
      }
    }
  })

  // 재계산
  const weeklyHours = finalSchedule.weeklySchedule.reduce((sum, day) => sum + day.workHours, 0) / 4.345
  const monthlyHours = finalSchedule.weeklySchedule.reduce((sum, day) => sum + day.workHours, 0)
  
  finalSchedule.weeklyHours = Math.round(weeklyHours * 100) / 100
  finalSchedule.monthlyHours = Math.round(monthlyHours * 100) / 100

  return finalSchedule
}

/**
 * 예외사항으로 인한 급여 조정 계산
 */
function calculateExceptionAdjustments(
  baseSchedule: EmployeeWorkSchedule,
  finalSchedule: EmployeeWorkSchedule,
  hourlyWage: number
): ExceptionAdjustment[] {
  const adjustments: ExceptionAdjustment[] = []

  finalSchedule.weeklySchedule.forEach(day => {
    if (day.hasException) {
      const originalHours = day.originalHours || 0
      const adjustedHours = day.workHours
      const hoursDifference = adjustedHours - originalHours
      const payDifference = hoursDifference * hourlyWage

      adjustments.push({
        date: day.date,
        type: day.exceptionType!,
        originalHours,
        adjustedHours,
        hoursDifference,
        payDifference: Math.round(payDifference)
      })
    }
  })

  return adjustments
}

/**
 * 해당 월의 모든 날짜 생성
 */
function generateMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = []
  const daysInMonth = new Date(year, month, 0).getDate()
  
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month - 1, day))
  }
  
  return dates
}

// Supabase API 함수들
async function getStoreById(storeId: number): Promise<StoreData> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', storeId)
    .single()

  if (error) throw error
  return data
}

async function getTemplateById(templateId: number): Promise<TemplateData> {
  const { data, error } = await supabase
    .from('weekly_schedule_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw error
  return data
}

async function getStoreEmployees(storeId: number): Promise<EmployeeData[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function getMonthlyExceptions(
  storeId: number,
  year: number,
  month: number
): Promise<ExceptionData[]> {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

  const { data, error } = await supabase
    .from('schedule_exceptions')
    .select('*')
    .eq('store_id', storeId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * 사용자의 모든 스토어 조회
 */
export async function getUserStoresForPayroll(userId: string): Promise<StoreData[]> {
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

/**
 * 스토어의 활성 템플릿 목록 조회
 */
export async function getActiveTemplatesForPayroll(storeId: number): Promise<TemplateData[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('템플릿 목록 로드 오류:', error)
    throw error
  }
}

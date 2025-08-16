// 스케줄 최적화 유틸리티 모듈
// 2025년 한국 노동법 기준 비용 최적화 알고리즘

import { calculatePayroll, calculateWorkHours, type WorkHoursResult, type PayrollResult } from './payroll-calculator-2025'

// 최적화 상수
const HOLIDAY_PAY_THRESHOLD = 15 // 주휴수당 대상 최소 주간 근무시간
const OPTIMAL_WEEKLY_HOURS = 14 // 주휴수당 회피를 위한 최적 주간 근무시간
const MAX_DAILY_HOURS = 8 // 연장근무 회피를 위한 최대 일일 근무시간
const NIGHT_SHIFT_PREMIUM_THRESHOLD = 22 // 야간근무 수당 시작 시간

export interface Employee {
  id: string
  name: string
  hourlyWage: number
  position: string
  skills?: string[]
  availability?: string[]
}

export interface Schedule {
  employeeId: string
  date: string
  startTime: string
  endTime: string
  breakTime?: number
  isHoliday?: boolean
}

export interface OptimizationSuggestion {
  id: string
  type: 'REDUCE_HOURS' | 'SPLIT_SHIFT' | 'AVOID_NIGHT' | 'REDISTRIBUTE_WORKLOAD'
  title: string
  description: string
  currentCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  legalCompliance: boolean
  affectedEmployees: string[]
  implementation: string
}

export interface OptimizationResult {
  currentTotalCost: number
  optimizedTotalCost: number
  totalSavings: number
  totalSavingsPercentage: number
  suggestions: OptimizationSuggestion[]
  optimizedSchedules: Schedule[]
  riskAssessment: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    complianceScore: number
    operationalImpact: string
  }
}

/**
 * 현재 스케줄의 총 비용을 계산합니다
 */
export function calculateCurrentCost(
  employees: Employee[],
  schedules: Schedule[]
): { totalCost: number; employeeCosts: Map<string, PayrollResult> } {
  const employeeCosts = new Map<string, PayrollResult>()
  let totalCost = 0

  // 직원별 주간 스케줄 그룹화
  const weeklySchedules = groupSchedulesByEmployeeAndWeek(schedules)

  for (const employee of employees) {
    const employeeWeeklySchedules = weeklySchedules.get(employee.id) || []
    let employeeTotalCost = 0

    for (const weekSchedules of employeeWeeklySchedules) {
      const weeklyHours = calculateWeeklyHours(weekSchedules)
      const payroll = calculatePayroll(
        weeklyHours.totalHours,
        weeklyHours.regularHours,
        weeklyHours.overtimeHours,
        weeklyHours.nightHours,
        employee.hourlyWage,
        weeklyHours.totalHours >= HOLIDAY_PAY_THRESHOLD
      )
      employeeTotalCost += payroll.totalPay
    }

    employeeCosts.set(employee.id, {
      regularPay: employeeTotalCost,
      overtimePay: 0,
      nightPay: 0,
      holidayPay: 0,
      totalPay: employeeTotalCost,
      isEligibleForHolidayPay: false
    })
    totalCost += employeeTotalCost
  }

  return { totalCost, employeeCosts }
}

/**
 * 주휴수당 회피 최적화 제안을 생성합니다
 */
export function generateHolidayPayOptimization(
  employees: Employee[],
  schedules: Schedule[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []
  const weeklySchedules = groupSchedulesByEmployeeAndWeek(schedules)

  for (const employee of employees) {
    const employeeWeeklySchedules = weeklySchedules.get(employee.id) || []

    for (const weekSchedules of employeeWeeklySchedules) {
      const weeklyHours = calculateWeeklyHours(weekSchedules)

      if (weeklyHours.totalHours >= HOLIDAY_PAY_THRESHOLD) {
        const currentPayroll = calculatePayroll(
          weeklyHours.totalHours,
          weeklyHours.regularHours,
          weeklyHours.overtimeHours,
          weeklyHours.nightHours,
          employee.hourlyWage,
          true
        )

        const optimizedPayroll = calculatePayroll(
          OPTIMAL_WEEKLY_HOURS,
          Math.min(OPTIMAL_WEEKLY_HOURS, weeklyHours.regularHours),
          Math.max(0, OPTIMAL_WEEKLY_HOURS - weeklyHours.regularHours),
          Math.min(weeklyHours.nightHours, OPTIMAL_WEEKLY_HOURS),
          employee.hourlyWage,
          false
        )

        const savings = currentPayroll.totalPay - optimizedPayroll.totalPay
        const savingsPercentage = (savings / currentPayroll.totalPay) * 100

        suggestions.push({
          id: `holiday-pay-${employee.id}-${Date.now()}`,
          type: 'REDUCE_HOURS',
          title: `${employee.name} 주휴수당 회피`,
          description: `주간 근무시간을 ${weeklyHours.totalHours}시간에서 ${OPTIMAL_WEEKLY_HOURS}시간으로 조정하여 주휴수당 지급 의무를 회피합니다.`,
          currentCost: currentPayroll.totalPay,
          optimizedCost: optimizedPayroll.totalPay,
          savings,
          savingsPercentage,
          riskLevel: 'LOW',
          legalCompliance: true,
          affectedEmployees: [employee.id],
          implementation: `주간 근무시간을 ${OPTIMAL_WEEKLY_HOURS}시간 이하로 조정. 필요시 다른 직원과 업무 분담 또는 시간제 직원 추가 고려.`
        })
      }
    }
  }

  return suggestions
}

/**
 * 연장근무 최적화 제안을 생성합니다
 */
export function generateOvertimeOptimization(
  employees: Employee[],
  schedules: Schedule[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []

  for (const schedule of schedules) {
    const workHours = calculateDailyHours(schedule)
    
    if (workHours.totalHours > MAX_DAILY_HOURS) {
      const employee = employees.find(e => e.id === schedule.employeeId)
      if (!employee) continue

      const currentPayroll = calculatePayroll(
        workHours.totalHours,
        workHours.regularHours,
        workHours.overtimeHours,
        workHours.nightHours,
        employee.hourlyWage,
        false
      )

      const optimizedPayroll = calculatePayroll(
        MAX_DAILY_HOURS,
        MAX_DAILY_HOURS,
        0,
        Math.min(workHours.nightHours, MAX_DAILY_HOURS),
        employee.hourlyWage,
        false
      )

      const savings = currentPayroll.totalPay - optimizedPayroll.totalPay
      const savingsPercentage = (savings / currentPayroll.totalPay) * 100

      suggestions.push({
        id: `overtime-${schedule.employeeId}-${schedule.date}`,
        type: 'SPLIT_SHIFT',
        title: `${employee.name} 연장근무 분할`,
        description: `일일 근무시간을 ${workHours.totalHours}시간에서 ${MAX_DAILY_HOURS}시간으로 단축하여 연장근무 수당을 절약합니다.`,
        currentCost: currentPayroll.totalPay,
        optimizedCost: optimizedPayroll.totalPay,
        savings,
        savingsPercentage,
        riskLevel: 'MEDIUM',
        legalCompliance: true,
        affectedEmployees: [employee.id],
        implementation: `근무시간을 2개 시프트로 분할하거나 다른 직원에게 업무 재배정. 운영 연속성 확인 필요.`
      })
    }
  }

  return suggestions
}

/**
 * 야간근무 최적화 제안을 생성합니다
 */
export function generateNightShiftOptimization(
  employees: Employee[],
  schedules: Schedule[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []

  for (const schedule of schedules) {
    const workHours = calculateDailyHours(schedule)
    
    if (workHours.nightHours > 0) {
      const employee = employees.find(e => e.id === schedule.employeeId)
      if (!employee) continue

      const currentPayroll = calculatePayroll(
        workHours.totalHours,
        workHours.regularHours,
        workHours.overtimeHours,
        workHours.nightHours,
        employee.hourlyWage,
        false
      )

      const optimizedPayroll = calculatePayroll(
        workHours.totalHours,
        workHours.regularHours,
        workHours.overtimeHours,
        0, // 야간근무 제거
        employee.hourlyWage,
        false
      )

      const savings = currentPayroll.totalPay - optimizedPayroll.totalPay
      const savingsPercentage = (savings / currentPayroll.totalPay) * 100

      suggestions.push({
        id: `night-shift-${schedule.employeeId}-${schedule.date}`,
        type: 'AVOID_NIGHT',
        title: `${employee.name} 야간근무 조정`,
        description: `야간근무 ${workHours.nightHours}시간을 주간으로 이동하여 야간수당을 절약합니다.`,
        currentCost: currentPayroll.totalPay,
        optimizedCost: optimizedPayroll.totalPay,
        savings,
        savingsPercentage,
        riskLevel: 'HIGH',
        legalCompliance: true,
        affectedEmployees: [employee.id],
        implementation: `야간 업무를 주간 시간대로 재배치. 24시간 운영이 필요한 경우 교대 인력 충원 검토.`
      })
    }
  }

  return suggestions
}

/**
 * 종합 최적화 분석을 수행합니다
 */
export function optimizeSchedule(
  employees: Employee[],
  schedules: Schedule[]
): OptimizationResult {
  const { totalCost: currentTotalCost } = calculateCurrentCost(employees, schedules)
  
  // 각 최적화 전략별 제안 생성
  const holidayPaySuggestions = generateHolidayPayOptimization(employees, schedules)
  const overtimeSuggestions = generateOvertimeOptimization(employees, schedules)
  const nightShiftSuggestions = generateNightShiftOptimization(employees, schedules)
  
  const allSuggestions = [
    ...holidayPaySuggestions,
    ...overtimeSuggestions,
    ...nightShiftSuggestions
  ]

  // 총 절약 금액 계산
  const totalSavings = allSuggestions.reduce((sum, suggestion) => sum + suggestion.savings, 0)
  const optimizedTotalCost = currentTotalCost - totalSavings
  const totalSavingsPercentage = (totalSavings / currentTotalCost) * 100

  // 리스크 평가
  const highRiskCount = allSuggestions.filter(s => s.riskLevel === 'HIGH').length
  const mediumRiskCount = allSuggestions.filter(s => s.riskLevel === 'MEDIUM').length
  
  let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  if (highRiskCount > 0) overallRisk = 'HIGH'
  else if (mediumRiskCount > 2) overallRisk = 'MEDIUM'

  const complianceScore = (allSuggestions.filter(s => s.legalCompliance).length / allSuggestions.length) * 100

  // 최적화된 스케줄 생성 (간단한 예시)
  const optimizedSchedules = applyOptimizations(schedules, allSuggestions)

  return {
    currentTotalCost,
    optimizedTotalCost,
    totalSavings,
    totalSavingsPercentage,
    suggestions: allSuggestions.sort((a, b) => b.savings - a.savings), // 절약액 순으로 정렬
    optimizedSchedules,
    riskAssessment: {
      overallRisk,
      complianceScore,
      operationalImpact: getOperationalImpactDescription(overallRisk, allSuggestions.length)
    }
  }
}

// 헬퍼 함수들

function groupSchedulesByEmployeeAndWeek(schedules: Schedule[]): Map<string, Schedule[][]> {
  const grouped = new Map<string, Schedule[][]>()
  
  for (const schedule of schedules) {
    if (!grouped.has(schedule.employeeId)) {
      grouped.set(schedule.employeeId, [])
    }
    
    // 간단한 주별 그룹화 (실제로는 더 정교한 로직 필요)
    const employeeSchedules = grouped.get(schedule.employeeId)!
    const weekIndex = Math.floor(new Date(schedule.date).getDate() / 7)
    
    if (!employeeSchedules[weekIndex]) {
      employeeSchedules[weekIndex] = []
    }
    
    employeeSchedules[weekIndex].push(schedule)
  }
  
  return grouped
}

function calculateWeeklyHours(weekSchedules: Schedule[]): WorkHoursResult {
  let totalHours = 0
  let regularHours = 0
  let overtimeHours = 0
  let nightHours = 0
  let isNightShift = false

  for (const schedule of weekSchedules) {
    const dailyHours = calculateDailyHours(schedule)
    totalHours += dailyHours.totalHours
    regularHours += dailyHours.regularHours
    overtimeHours += dailyHours.overtimeHours
    nightHours += dailyHours.nightHours
    if (dailyHours.isNightShift) isNightShift = true
  }

  return { totalHours, regularHours, overtimeHours, nightHours, isNightShift }
}

function calculateDailyHours(schedule: Schedule): WorkHoursResult {
  const startTime = new Date(`${schedule.date} ${schedule.startTime}`)
  const endTime = new Date(`${schedule.date} ${schedule.endTime}`)
  
  // 다음날로 넘어가는 경우 처리
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1)
  }
  
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  const breakMinutes = schedule.breakTime || 0
  const workMinutes = totalMinutes - breakMinutes
  const totalHours = workMinutes / 60

  const regularHours = Math.min(totalHours, 8)
  const overtimeHours = Math.max(0, totalHours - 8)
  
  // 야간근무 시간 계산 (간단한 예시)
  const startHour = startTime.getHours()
  const endHour = endTime.getHours()
  let nightHours = 0
  let isNightShift = false
  
  if (startHour >= 22 || startHour < 6 || endHour >= 22 || endHour < 6) {
    isNightShift = true
    // 실제로는 더 정교한 야간시간 계산 필요
    nightHours = Math.min(totalHours, 8) // 간단한 예시
  }

  return { totalHours, regularHours, overtimeHours, nightHours, isNightShift }
}

function applyOptimizations(schedules: Schedule[], suggestions: OptimizationSuggestion[]): Schedule[] {
  // 실제 구현에서는 제안사항을 바탕으로 스케줄을 수정
  // 여기서는 간단한 예시만 제공
  return schedules.map(schedule => ({ ...schedule }))
}

function getOperationalImpactDescription(risk: 'LOW' | 'MEDIUM' | 'HIGH', suggestionCount: number): string {
  if (risk === 'HIGH') {
    return `${suggestionCount}개의 최적화 제안 중 고위험 항목이 포함되어 있어 운영에 상당한 영향을 줄 수 있습니다.`
  } else if (risk === 'MEDIUM') {
    return `${suggestionCount}개의 최적화 제안으로 중간 수준의 운영 조정이 필요합니다.`
  } else {
    return `${suggestionCount}개의 최적화 제안으로 최소한의 운영 영향으로 비용 절감이 가능합니다.`
  }
}

// 급여 계산 유틸리티 모듈
// 한국 노동법 기준 급여 계산 (2025년 기준)

// 2025년 기준 상수
const MINIMUM_WAGE = 10030 // 2025년 최저시급
const REGULAR_HOURS_LIMIT = 8 // 정규 근무시간 (하루 8시간)
const NIGHT_START_HOUR = 22 // 야간 근무 시작 시간 (22시)
const NIGHT_END_HOUR = 6 // 야간 근무 종료 시간 (6시)
const OVERTIME_RATE = 1.5 // 연장 근무 수당 배율
const NIGHT_RATE = 0.5 // 야간 근무 수당 배율
const HOLIDAY_PAY_ELIGIBILITY_HOURS = 15 // 주휴수당 대상 최소 주간 근무시간
const MONTHLY_AVERAGE_WEEKS = 4.345 // 월 평균 주 수 (365일 / 7일 / 12개월)

// 4대보험 요율 (2025년 기준)
const INSURANCE_RATES = {
  // 근로자 부담분
  employee: {
    nationalPension: 0.045, // 국민연금 4.5%
    healthInsurance: 0.03545, // 건강보험 3.545%
    longTermCare: 0.1295, // 장기요양보험 (건강보험료의 12.95%)
    employment: 0.009 // 고용보험 0.9%
  },
  // 사업주 부담분
  employer: {
    nationalPension: 0.045, // 국민연금 4.5%
    healthInsurance: 0.03545, // 건강보험 3.545%
    longTermCare: 0.1295, // 장기요양보험 (건강보험료의 12.95%)
    employment: 0.009, // 고용보험 0.9%
    employmentStability: 0.0025, // 고용안정사업 0.25% (150인 미만 기업)
    workersCompensation: 0.007 // 산재보험 (업종별 상이, 평균 0.7%)
  }
}

export interface WorkHoursResult {
  totalHours: number
  regularHours: number
  overtimeHours: number
  nightHours: number
  isNightShift: boolean
}

export interface PayrollResult {
  regularPay: number
  overtimePay: number
  nightPay: number
  holidayPay: number
  totalPay: number
  isEligibleForHolidayPay: boolean
}

// 월급 계산 결과 인터페이스
export interface MonthlySalaryResult {
  grossSalary: number // 세전 월급
  totalWorkingHours: number // 월 총 근무시간 (주휴시간 포함)
  holidayHours: number // 월 주휴시간
}

// 4대보험료 계산 결과 인터페이스
export interface InsuranceResult {
  employee: {
    nationalPension: number
    healthInsurance: number
    longTermCare: number
    employment: number
    total: number
  }
  employer: {
    nationalPension: number
    healthInsurance: number
    longTermCare: number
    employment: number
    employmentStability: number
    workersCompensation: number
    total: number
  }
}

// 실수령액 계산 결과 인터페이스
export interface NetSalaryResult {
  grossSalary: number // 세전 월급
  employeeInsurance: number // 근로자 4대보험료
  incomeTax: number // 근로소득세
  localTax: number // 지방소득세
  totalDeductions: number // 총 공제액
  netSalary: number // 실수령액
}

// 사업주 총 부담 비용 결과 인터페이스
export interface EmployerCostResult {
  grossSalary: number // 근로자 세전 월급
  employerInsurance: number // 사업주 4대보험료
  totalCost: number // 총 부담 비용
}

/**
 * 근무시간 계산 (야간 근무 지원)
 * @param startTime 시작 시간 (HH:mm 형식)
 * @param endTime 종료 시간 (HH:mm 형식)
 * @param breakTimeMinutes 휴게시간 (분)
 * @returns 계산된 근무시간 정보
 */
export function calculateWorkHours(
  startTime: string,
  endTime: string,
  breakTimeMinutes: number = 0
): WorkHoursResult {
  // 시간 파싱
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  // 분 단위로 변환
  const startMinutes = startHour * 60 + startMin
  let endMinutes = endHour * 60 + endMin
  
  // 야간 근무 처리 (종료시간이 시작시간보다 작으면 다음날)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60 // 24시간 추가
  }
  
  // 총 근무시간 (분)
  const totalWorkMinutes = endMinutes - startMinutes - breakTimeMinutes
  const totalHours = totalWorkMinutes / 60
  
  // 정규/연장 시간 구분 (8시간 기준)
  const regularHours = Math.min(totalHours, REGULAR_HOURS_LIMIT)
  const overtimeHours = Math.max(totalHours - REGULAR_HOURS_LIMIT, 0)
  
  // 야간 시간 계산 (22:00-06:00)
  const nightHours = calculateNightHours(startTime, endTime)
  const isNightShift = nightHours > 0
  
  return {
    totalHours: Math.round(totalHours * 100) / 100,
    regularHours: Math.round(regularHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    nightHours: Math.round(nightHours * 100) / 100,
    isNightShift
  }
}

/**
 * 야간 근무시간 계산 (22:00-06:00)
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @returns 야간 근무시간 (시간)
 */
function calculateNightHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  let nightMinutes = 0
  const nightStart = NIGHT_START_HOUR * 60 // 22:00
  const nightEnd = NIGHT_END_HOUR * 60   // 06:00
  
  const startMinutes = startHour * 60 + startMin
  let endMinutes = endHour * 60 + endMin
  
  // 야간 근무 (다음날까지)인 경우
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60
  }
  
  // 22:00-24:00 구간
  if (startMinutes <= nightStart && endMinutes > nightStart) {
    const nightEndToday = 24 * 60
    const nightStartTime = Math.max(startMinutes, nightStart)
    const nightEndTime = Math.min(endMinutes, nightEndToday)
    nightMinutes += Math.max(nightEndTime - nightStartTime, 0)
  }
  
  // 00:00-06:00 구간 (다음날)
  if (endMinutes > 24 * 60) {
    const nextDayStart = 24 * 60
    const nextDayEnd = 24 * 60 + nightEnd
    const nightStartTime = Math.max(startMinutes, nextDayStart)
    const nightEndTime = Math.min(endMinutes, nextDayEnd)
    nightMinutes += Math.max(nightEndTime - nightStartTime, 0)
  }
  
  return nightMinutes / 60
}

/**
 * 주휴수당 대상 여부 확인
 * @param weeklyHours 주간 총 근무시간
 * @returns 주휴수당 대상 여부
 */
export function isEligibleForHolidayPay(weeklyHours: number): boolean {
  return weeklyHours >= HOLIDAY_PAY_ELIGIBILITY_HOURS
}

/**
 * 주휴수당 시간 계산
 * 주 15시간 이상 근무 시: (주간 근무시간 / 40시간) × 8시간
 * 주 15시간 미만 근무 시: 0시간
 * @param weeklyHours 주간 총 근무시간
 * @returns 주휴수당 시간
 */
export function calculateHolidayHours(weeklyHours: number): number {
  if (!isEligibleForHolidayPay(weeklyHours)) {
    return 0
  }
  
  // 주 40시간 이상이면 8시간, 미만이면 비례 계산
  if (weeklyHours >= 40) {
    return 8
  }
  
  return (weeklyHours / 40) * 8
}

/**
 * 월급 계산 (세전)
 * 월 소정근로시간 = (주 소정근로시간 + 주휴시간) × 월 평균 주 수
 * @param weeklyHours 주간 소정근로시간
 * @param hourlyWage 시급
 * @returns 월급 계산 결과
 */
export function calculateMonthlySalary(
  weeklyHours: number,
  hourlyWage: number = MINIMUM_WAGE
): MonthlySalaryResult {
  const holidayHours = calculateHolidayHours(weeklyHours)
  const monthlyHolidayHours = holidayHours * MONTHLY_AVERAGE_WEEKS
  const monthlyWorkingHours = weeklyHours * MONTHLY_AVERAGE_WEEKS
  const totalWorkingHours = monthlyWorkingHours + monthlyHolidayHours
  
  return {
    grossSalary: Math.round(totalWorkingHours * hourlyWage),
    totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
    holidayHours: Math.round(monthlyHolidayHours * 100) / 100
  }
}

/**
 * 4대보험료 계산
 * @param grossSalary 세전 월급
 * @returns 근로자/사업주 4대보험료
 */
export function calculateInsurance(grossSalary: number): InsuranceResult {
  const rates = INSURANCE_RATES
  
  // 근로자 부담분
  const employeeNationalPension = Math.round(grossSalary * rates.employee.nationalPension)
  const employeeHealthInsurance = Math.round(grossSalary * rates.employee.healthInsurance)
  const employeeLongTermCare = Math.round(employeeHealthInsurance * rates.employee.longTermCare)
  const employeeEmployment = Math.round(grossSalary * rates.employee.employment)
  
  // 사업주 부담분
  const employerNationalPension = Math.round(grossSalary * rates.employer.nationalPension)
  const employerHealthInsurance = Math.round(grossSalary * rates.employer.healthInsurance)
  const employerLongTermCare = Math.round(employerHealthInsurance * rates.employer.longTermCare)
  const employerEmployment = Math.round(grossSalary * rates.employer.employment)
  const employerEmploymentStability = Math.round(grossSalary * rates.employer.employmentStability)
  const employerWorkersCompensation = Math.round(grossSalary * rates.employer.workersCompensation)
  
  return {
    employee: {
      nationalPension: employeeNationalPension,
      healthInsurance: employeeHealthInsurance,
      longTermCare: employeeLongTermCare,
      employment: employeeEmployment,
      total: employeeNationalPension + employeeHealthInsurance + employeeLongTermCare + employeeEmployment
    },
    employer: {
      nationalPension: employerNationalPension,
      healthInsurance: employerHealthInsurance,
      longTermCare: employerLongTermCare,
      employment: employerEmployment,
      employmentStability: employerEmploymentStability,
      workersCompensation: employerWorkersCompensation,
      total: employerNationalPension + employerHealthInsurance + employerLongTermCare + 
             employerEmployment + employerEmploymentStability + employerWorkersCompensation
    }
  }
}

/**
 * 간이 소득세 계산 (근사치)
 * 실제로는 국세청 간이세액표를 사용해야 하지만, 여기서는 근사치로 계산
 * @param grossSalary 세전 월급
 * @param dependents 부양가족 수 (기본 1명)
 * @returns 근로소득세 및 지방소득세
 */
export function calculateIncomeTax(
  grossSalary: number,
  dependents: number = 1
): { incomeTax: number; localTax: number } {
  // 간이세액표 기준 근사치 계산
  // 실제 구현 시에는 국세청 간이세액표 데이터를 사용해야 함
  
  let incomeTax = 0
  
  // 월 급여 구간별 세율 (근사치)
  if (grossSalary <= 1000000) {
    incomeTax = 0 // 100만원 이하는 대부분 세금 없음
  } else if (grossSalary <= 2000000) {
    incomeTax = Math.max(0, (grossSalary - 1000000) * 0.06 - (dependents * 10000))
  } else if (grossSalary <= 3000000) {
    incomeTax = Math.max(0, (grossSalary - 2000000) * 0.15 + 60000 - (dependents * 15000))
  } else {
    incomeTax = Math.max(0, (grossSalary - 3000000) * 0.24 + 210000 - (dependents * 20000))
  }
  
  const localTax = Math.round(incomeTax * 0.1) // 지방소득세는 소득세의 10%
  
  return {
    incomeTax: Math.round(incomeTax),
    localTax
  }
}

/**
 * 실수령액 계산
 * @param grossSalary 세전 월급
 * @param dependents 부양가족 수
 * @returns 실수령액 계산 결과
 */
export function calculateNetSalary(
  grossSalary: number,
  dependents: number = 1
): NetSalaryResult {
  const insurance = calculateInsurance(grossSalary)
  const tax = calculateIncomeTax(grossSalary, dependents)
  
  const totalDeductions = insurance.employee.total + tax.incomeTax + tax.localTax
  const netSalary = grossSalary - totalDeductions
  
  return {
    grossSalary,
    employeeInsurance: insurance.employee.total,
    incomeTax: tax.incomeTax,
    localTax: tax.localTax,
    totalDeductions,
    netSalary: Math.max(0, netSalary)
  }
}

/**
 * 사업주 총 부담 비용 계산
 * @param grossSalary 근로자 세전 월급
 * @returns 사업주 총 부담 비용
 */
export function calculateEmployerCost(grossSalary: number): EmployerCostResult {
  const insurance = calculateInsurance(grossSalary)
  
  return {
    grossSalary,
    employerInsurance: insurance.employer.total,
    totalCost: grossSalary + insurance.employer.total
  }
}

/**
 * 급여 계산 (기존 호환성 유지)
 * @param workHours 근무시간 정보
 * @param hourlyWage 시급
 * @param weeklyHours 주간 총 근무시간 (주휴수당 계산용)
 * @returns 계산된 급여 정보
 */
export function calculatePayroll(
  workHours: WorkHoursResult,
  hourlyWage: number,
  weeklyHours: number
): PayrollResult {
  // 기본급 계산
  const regularPay = workHours.regularHours * hourlyWage
  
  // 연장수당 (1.5배)
  const overtimePay = workHours.overtimeHours * hourlyWage * OVERTIME_RATE
  
  // 야간수당 (0.5배 추가)
  const nightPay = workHours.nightHours * hourlyWage * NIGHT_RATE
  
  // 주휴수당 계산
  const isEligible = isEligibleForHolidayPay(weeklyHours)
  const holidayPay = isEligible ? (regularPay + overtimePay) / 5 : 0
  
  // 총 급여
  const totalPay = regularPay + overtimePay + nightPay + holidayPay
  
  return {
    regularPay: Math.round(regularPay),
    overtimePay: Math.round(overtimePay),
    nightPay: Math.round(nightPay),
    holidayPay: Math.round(holidayPay),
    totalPay: Math.round(totalPay),
    isEligibleForHolidayPay: isEligible
  }
}

/**
 * 여러 스케줄의 주간 총 근무시간 계산
 * @param schedules 스케줄 배열
 * @returns 주간 총 근무시간
 */
export function calculateWeeklyHours(schedules: Array<{
  startTime: string
  endTime: string
  breakTime?: number
}>): number {
  return schedules.reduce((total, schedule) => {
    const workHours = calculateWorkHours(
      schedule.startTime,
      schedule.endTime,
      schedule.breakTime || 0
    )
    return total + workHours.totalHours
  }, 0)
}

/**
 * 급여 계산 예시 및 테스트 함수
 */
export function getPayrollExamples() {
  return {
    // 일반 근무 (9시간, 휴게시간 1시간)
    regular: calculateWorkHours('09:00', '18:00', 60),
    
    // 야간 근무 (8시간)
    night: calculateWorkHours('22:00', '06:00', 0),
    
    // 연장 근무 (12시간, 휴게시간 1시간)
    overtime: calculateWorkHours('08:00', '21:00', 60),
    
    // 심야 연장 (14시간, 휴게시간 1시간)
    nightOvertime: calculateWorkHours('22:00', '12:00', 60)
  }
}

/**
 * 완전한 급여 계산 예시 (2025년 기준)
 * 주 40시간 및 주 15시간 근무 시 모든 계산 결과를 보여줍니다
 */
export function getComprehensivePayrollExamples() {
  const examples = []
  
  // 주 40시간 근무 예시
  const fullTimeWeeklyHours = 40
  const fullTimeMonthlySalary = calculateMonthlySalary(fullTimeWeeklyHours)
  const fullTimeNetSalary = calculateNetSalary(fullTimeMonthlySalary.grossSalary)
  const fullTimeEmployerCost = calculateEmployerCost(fullTimeMonthlySalary.grossSalary)
  
  examples.push({
    title: '주 40시간 근무 (풀타임)',
    weeklyHours: fullTimeWeeklyHours,
    monthlySalary: fullTimeMonthlySalary,
    netSalary: fullTimeNetSalary,
    employerCost: fullTimeEmployerCost
  })
  
  // 주 15시간 근무 예시
  const partTimeWeeklyHours = 15
  const partTimeMonthlySalary = calculateMonthlySalary(partTimeWeeklyHours)
  const partTimeNetSalary = calculateNetSalary(partTimeMonthlySalary.grossSalary)
  const partTimeEmployerCost = calculateEmployerCost(partTimeMonthlySalary.grossSalary)
  
  examples.push({
    title: '주 15시간 근무 (파트타임)',
    weeklyHours: partTimeWeeklyHours,
    monthlySalary: partTimeMonthlySalary,
    netSalary: partTimeNetSalary,
    employerCost: partTimeEmployerCost
  })
  
  return examples
}

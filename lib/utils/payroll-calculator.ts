import { Employee, WorkSchedule, PayrollData, PayrollTotals } from '@/types/payroll'

/**
 * 날짜 유틸리티 함수들
 */
export class DateUtils {
  static getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  static getEndOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + 6
    return new Date(d.setDate(diff))
  }

  static getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  static getEndOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }
}

/**
 * 급여 계산 클래스
 */
export class PayrollCalculator {
  private static readonly MINIMUM_WAGE_2025 = 10030 // 2025년 최저시급
  private static readonly WEEKLY_HOURS_FOR_HOLIDAY_PAY = 15 // 주휴수당 대상 최소 시간
  private static readonly OVERTIME_THRESHOLD = 40 // 연장근무 기준 시간
  private static readonly NIGHT_START_HOUR = 22 // 야간근무 시작 시간
  private static readonly NIGHT_END_HOUR = 6 // 야간근무 종료 시간

  /**
   * 단일 직원의 급여 계산
   */
  static calculateEmployeePayroll(
    employee: Employee,
    schedules: WorkSchedule[]
  ): PayrollData {
    // 스케줄 배열 안전성 확인
    const safeSchedules = Array.isArray(schedules) ? schedules : []
    const employeeSchedules = safeSchedules.filter(s => s.employee_id === employee.id)
    
    let totalHours = 0
    let regularHours = 0
    let overtimeHours = 0
    let nightHours = 0

    // 각 스케줄별 시간 계산
    employeeSchedules.forEach(schedule => {
      const { hours, nightWorkHours } = this.calculateScheduleHours(schedule)
      totalHours += hours
      nightHours += nightWorkHours
    })

    // 정규시간과 연장시간 분리
    if (totalHours <= this.OVERTIME_THRESHOLD) {
      regularHours = totalHours
      overtimeHours = 0
    } else {
      regularHours = this.OVERTIME_THRESHOLD
      overtimeHours = totalHours - this.OVERTIME_THRESHOLD
    }

    // 급여 계산
    const regularPay = regularHours * employee.hourly_wage
    const overtimePay = overtimeHours * employee.hourly_wage * 1.5
    const nightPay = nightHours * employee.hourly_wage * 0.5

    // 주휴수당 계산 (주 15시간 이상 근무 시)
    const isEligibleForHolidayPay = totalHours >= this.WEEKLY_HOURS_FOR_HOLIDAY_PAY
    const holidayPay = isEligibleForHolidayPay ? (regularPay + overtimePay) / 5 : 0

    const totalPay = regularPay + overtimePay + nightPay + holidayPay

    // 월급 및 실수령액 계산
    const monthlySalary = this.calculateMonthlySalary(totalHours, employee.hourly_wage, isEligibleForHolidayPay)
    const netSalary = this.calculateNetSalary(monthlySalary)

    return {
      employee,
      weeklyHours: totalHours,
      regularHours,
      overtimeHours,
      nightHours,
      regularPay,
      overtimePay,
      nightPay,
      holidayPay,
      totalPay,
      isEligibleForHolidayPay,
      monthlySalary,
      netSalary
    }
  }

  /**
   * 개별 스케줄의 근무시간 계산
   */
  private static calculateScheduleHours(schedule: WorkSchedule): {
    hours: number
    nightWorkHours: number
  } {
    const startTime = new Date(`2000-01-01T${schedule.start_time}`)
    const endTime = new Date(`2000-01-01T${schedule.end_time}`)
    
    // 다음날로 넘어가는 경우 처리
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1)
    }

    const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    const workMinutes = totalMinutes - schedule.break_minutes
    const hours = workMinutes / 60

    // 야간근무 시간 계산
    const nightWorkHours = this.calculateNightHours(schedule.start_time, schedule.end_time)

    return { hours, nightWorkHours }
  }

  /**
   * 야간근무 시간 계산 (22:00 ~ 06:00)
   */
  private static calculateNightHours(startTime: string, endTime: string): number {
    const start = parseInt(startTime.split(':')[0])
    const end = parseInt(endTime.split(':')[0])
    
    let nightHours = 0

    // 22시 이후 시작하는 경우
    if (start >= this.NIGHT_START_HOUR) {
      if (end <= this.NIGHT_END_HOUR) {
        // 22시 이후 시작해서 6시 이전 종료
        nightHours = end + (24 - start)
      } else if (end >= this.NIGHT_START_HOUR) {
        // 22시 이후 시작해서 22시 이후 종료 (다음날)
        nightHours = this.NIGHT_END_HOUR + (24 - start)
      } else {
        // 22시 이후 시작해서 일반 시간 종료
        nightHours = this.NIGHT_END_HOUR + (24 - start)
      }
    } else if (end <= this.NIGHT_END_HOUR) {
      // 일반 시간 시작해서 6시 이전 종료
      nightHours = end
    }

    return Math.max(0, nightHours)
  }

  /**
   * 월급 계산 (주휴수당 포함)
   */
  private static calculateMonthlySalary(
    weeklyHours: number, 
    hourlyWage: number, 
    isEligibleForHolidayPay: boolean
  ): number {
    const weeklyAverage = 4.345 // 월 평균 주수
    const holidayHours = isEligibleForHolidayPay ? 8 : 0 // 주휴시간
    
    return (weeklyHours + holidayHours) * weeklyAverage * hourlyWage
  }

  /**
   * 실수령액 계산 (4대보험, 소득세 제외)
   */
  private static calculateNetSalary(monthlySalary: number): number {
    const insuranceRate = 0.089 // 4대보험 근로자 부담률 (약 8.9%)
    const incomeTaxRate = 0.03 // 간이세액 (약 3%)
    
    const deductions = monthlySalary * (insuranceRate + incomeTaxRate)
    return monthlySalary - deductions
  }

  /**
   * 급여 데이터 배열의 합계 계산
   */
  static calculateTotals(payrollData: PayrollData[]): PayrollTotals {
    // 배열 안전성 확인
    if (!Array.isArray(payrollData)) {
      return {
        totalEmployees: 0,
        totalHours: 0,
        totalRegularPay: 0,
        totalOvertimePay: 0,
        totalNightPay: 0,
        totalHolidayPay: 0,
        totalPay: 0
      }
    }

    return {
      totalEmployees: payrollData.length,
      totalHours: payrollData.reduce((sum, data) => sum + (data.weeklyHours || 0), 0),
      totalRegularPay: payrollData.reduce((sum, data) => sum + (data.regularPay || 0), 0),
      totalOvertimePay: payrollData.reduce((sum, data) => sum + (data.overtimePay || 0), 0),
      totalNightPay: payrollData.reduce((sum, data) => sum + (data.nightPay || 0), 0),
      totalHolidayPay: payrollData.reduce((sum, data) => sum + (data.holidayPay || 0), 0),
      totalPay: payrollData.reduce((sum, data) => sum + (data.totalPay || 0), 0)
    }
  }
}

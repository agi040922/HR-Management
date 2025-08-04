/**
 * 급여 계산 유틸리티 모듈
 * 
 * 야간 근무, 연장 근무, 주휴수당 등을 정확히 계산하는 함수들을 제공합니다.
 * 2024년 노동법 기준으로 작성되었습니다.
 */

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
  let startMinutes = startHour * 60 + startMin
  let endMinutes = endHour * 60 + endMin
  
  // 야간 근무 처리 (종료시간이 시작시간보다 작으면 다음날)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60 // 24시간 추가
  }
  
  // 총 근무시간 (분)
  const totalWorkMinutes = endMinutes - startMinutes - breakTimeMinutes
  const totalHours = totalWorkMinutes / 60
  
  // 정규/연장 시간 구분 (8시간 기준)
  const regularLimit = 8
  const regularHours = Math.min(totalHours, regularLimit)
  const overtimeHours = Math.max(totalHours - regularLimit, 0)
  
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
  const nightStart = 22 * 60 // 22:00
  const nightEnd = 6 * 60   // 06:00
  
  let startMinutes = startHour * 60 + startMin
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
  return weeklyHours >= 15 // 주 15시간 이상
}

/**
 * 급여 계산
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
  const overtimePay = workHours.overtimeHours * hourlyWage * 1.5
  
  // 야간수당 (0.5배 추가)
  const nightPay = workHours.nightHours * hourlyWage * 0.5
  
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

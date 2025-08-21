// 직원 및 스케줄 관련 타입 정의
import { LaborContract } from './labor-contract'

export interface Employee {
  id: number
  store_id?: number
  owner_id: string
  name: string
  hourlyWage: number
  position?: string
  phone?: string
  startDate: string
  isActive: boolean
  laborContract?: LaborContract | null  // 근로계약서 정보 (JSONB)
  createdAt?: string
  updatedAt?: string
}

export interface WorkSchedule {
  id: number
  employeeId: number
  date: string
  startTime: string
  endTime: string
  breakTime?: number // 휴게시간 (분)
  isOvertime?: boolean
  isNightShift?: boolean
}

export interface PayrollCalculation {
  employeeId: number
  employeeName: string
  weeklyHours: number
  regularPay: number
  overtimePay: number
  nightShiftPay: number
  weeklyHolidayPay: number // 주휴수당
  totalPay: number
  insuranceFee: number
  finalPay: number
}

export interface OptimizationSuggestion {
  type: 'REDUCE_HOURS' | 'SPLIT_SCHEDULE' | 'ADJUST_BREAKS'
  title: string
  description: string
  currentCost: number
  optimizedCost: number
  savings: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

// react-big-schedule용 이벤트 타입
export interface ScheduleEvent {
  id: number
  start: string
  end: string
  resourceId: number
  title: string
  bgColor?: string
  showPopover?: boolean
}

export interface ScheduleResource {
  id: number
  name: string
  groupOnly?: boolean
}

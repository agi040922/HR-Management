"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  User,
  Calendar
} from 'lucide-react'
import { Employee, WorkSchedule, PayrollCalculation } from '@/types/employee'
import dayjs from 'dayjs'

interface PayrollDashboardProps {
  employees: Employee[]
  schedules: WorkSchedule[]
}

export function PayrollDashboard({ employees, schedules }: PayrollDashboardProps) {
  
  // 주간 근무시간 계산
  const calculateWeeklyHours = (employeeId: number): number => {
    return schedules
      .filter(s => s.employeeId === employeeId)
      .reduce((total, schedule) => {
        const hours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
          dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
        )
        const breakHours = (schedule.breakTime || 0) / 60
        return total + (hours - breakHours)
      }, 0)
  }

  // 연장근무 계산 (8시간 초과)
  const calculateOvertimeHours = (employeeId: number): number => {
    return schedules
      .filter(s => s.employeeId === employeeId)
      .reduce((total, schedule) => {
        const dailyHours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
          dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
        )
        const breakHours = (schedule.breakTime || 0) / 60
        const workHours = dailyHours - breakHours
        return total + Math.max(0, workHours - 8)
      }, 0)
  }

  // 야간근무 계산 (22시-06시)
  const calculateNightShiftHours = (employeeId: number): number => {
    return schedules
      .filter(s => s.employeeId === employeeId)
      .reduce((total, schedule) => {
        const startHour = parseInt(schedule.startTime.split(':')[0])
        const endHour = parseInt(schedule.endTime.split(':')[0])
        
        let nightHours = 0
        // 22시 이후 시작
        if (startHour >= 22) {
          nightHours += Math.min(endHour, 24) - startHour
        }
        // 06시 이전 종료
        if (endHour <= 6) {
          nightHours += endHour - Math.max(startHour, 0)
        }
        // 22시 이전 시작, 06시 이후 종료 (야간시간 포함)
        if (startHour < 22 && endHour > 6) {
          nightHours += 8 // 22시-06시 = 8시간
        }
        
        return total + nightHours
      }, 0)
  }

  // 급여 계산
  const calculatePayroll = (employee: Employee): PayrollCalculation => {
    const weeklyHours = calculateWeeklyHours(employee.id)
    const overtimeHours = calculateOvertimeHours(employee.id)
    const nightShiftHours = calculateNightShiftHours(employee.id)
    const regularHours = weeklyHours - overtimeHours
    
    // 기본급 (정규시간)
    const regularPay = regularHours * employee.hourlyWage
    
    // 연장근무수당 (1.5배)
    const overtimePay = overtimeHours * employee.hourlyWage * 1.5
    
    // 야간근무수당 (0.5배 추가)
    const nightShiftPay = nightShiftHours * employee.hourlyWage * 0.5
    
    // 주휴수당 (주 15시간 이상 시 8시간 일당)
    const weeklyHolidayPay = weeklyHours >= 15 ? employee.hourlyWage * 8 : 0
    
    // 총 급여
    const totalPay = regularPay + overtimePay + nightShiftPay + weeklyHolidayPay
    
    // 4대 보험료 (직원 부담분 - 대략 9%)
    const insuranceFee = totalPay * 0.09
    
    // 최종 지급액
    const finalPay = totalPay - insuranceFee
    
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      weeklyHours,
      regularPay,
      overtimePay,
      nightShiftPay,
      weeklyHolidayPay,
      totalPay,
      insuranceFee,
      finalPay
    }
  }

  const payrollData = employees.map(calculatePayroll)
  
  // 전체 통계
  const totalPayroll = payrollData.reduce((sum, p) => sum + p.totalPay, 0)
  const totalHolidayPay = payrollData.reduce((sum, p) => sum + p.weeklyHolidayPay, 0)
  const employeesWithHolidayPay = payrollData.filter(p => p.weeklyHolidayPay > 0).length

  return (
    <div className="space-y-6">
      {/* 전체 급여 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 급여 지출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              이번 주 전체
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주휴수당 총액</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalHolidayPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {employeesWithHolidayPay}명 대상
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 시급</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{Math.round(employees.reduce((sum, emp) => sum + emp.hourlyWage, 0) / employees.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              전체 직원 평균
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">절약 가능액</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₩{totalHolidayPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              15시간 미만 조정 시
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 직원별 급여 상세 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            직원별 급여 계산서
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollData.map((payroll) => {
              const employee = employees.find(emp => emp.id === payroll.employeeId)!
              const isHolidayPayApplicable = payroll.weeklyHours >= 15
              
              return (
                <Card key={payroll.employeeId} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{payroll.employeeName}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₩{payroll.finalPay.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">최종 지급액</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">근무시간</div>
                      <div className="font-medium">{payroll.weeklyHours.toFixed(1)}시간</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">시급</div>
                      <div className="font-medium">₩{employee.hourlyWage.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">기본급</div>
                      <div className="font-medium">₩{payroll.regularPay.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">총 급여</div>
                      <div className="font-medium">₩{payroll.totalPay.toLocaleString()}</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    {/* 연장근무수당 */}
                    {payroll.overtimePay > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-600">연장근무수당 (1.5배)</span>
                        <span className="font-medium">+₩{payroll.overtimePay.toLocaleString()}</span>
                      </div>
                    )}

                    {/* 야간근무수당 */}
                    {payroll.nightShiftPay > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">야간근무수당 (0.5배)</span>
                        <span className="font-medium">+₩{payroll.nightShiftPay.toLocaleString()}</span>
                      </div>
                    )}

                    {/* 주휴수당 */}
                    <div className="flex justify-between text-sm">
                      <span className={isHolidayPayApplicable ? "text-red-600" : "text-gray-400"}>
                        주휴수당 ({payroll.weeklyHours.toFixed(1)}시간)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isHolidayPayApplicable ? '+' : ''}₩{payroll.weeklyHolidayPay.toLocaleString()}
                        </span>
                        <Badge variant={isHolidayPayApplicable ? "destructive" : "secondary"}>
                          {isHolidayPayApplicable ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {isHolidayPayApplicable ? "적용" : "미적용"}
                        </Badge>
                      </div>
                    </div>

                    {/* 4대 보험료 */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">4대 보험료 (9%)</span>
                      <span className="font-medium">-₩{payroll.insuranceFee.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">실수령액</span>
                    <span className="text-xl font-bold">₩{payroll.finalPay.toLocaleString()}</span>
                  </div>

                  {/* 최적화 제안 */}
                  {isHolidayPayApplicable && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">절약 제안:</span>
                        <span>
                          주 15시간 미만으로 조정하면 ₩{payroll.weeklyHolidayPay.toLocaleString()} 절약 가능
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <Button>
          <DollarSign className="h-4 w-4 mr-2" />
          급여 지급 처리
        </Button>
        <Button variant="outline">
          <Calculator className="h-4 w-4 mr-2" />
          급여명세서 출력
        </Button>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          최적화 제안 보기
        </Button>
      </div>
    </div>
  )
}

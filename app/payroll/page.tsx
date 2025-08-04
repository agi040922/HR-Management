"use client"

import React, { useState, useEffect } from 'react'
import { exampleEmployees, exampleSchedules } from '@/data/example-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, DollarSign, AlertTriangle, Download, Filter, Search, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Employee, WorkSchedule } from '@/lib/supabase'

interface PayrollData {
  employee: Employee
  weeklyHours: number
  regularHours: number
  overtimeHours: number
  nightHours: number
  regularPay: number
  overtimePay: number
  nightPay: number
  holidayPay: number
  totalPay: number
  isEligibleForHolidayPay: boolean
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('current-week')

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  // 데이터 변경 시 급여 계산
  useEffect(() => {
    if (employees.length > 0 && schedules.length > 0) {
      calculatePayroll()
    }
  }, [employees, schedules])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 직원 데이터 로드
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)

      if (employeesError) {
        console.error('직원 데이터 로드 오류:', employeesError)
        setError('직원 데이터를 불러오는데 실패했습니다. 예제 데이터를 사용합니다.')
        setEmployees(exampleEmployees)
      } else {
        const formattedEmployees: Employee[] = employeesData.map(emp => ({
          id: emp.id,
          name: emp.name,
          hourlyWage: emp.hourly_wage,
          position: emp.position,
          phone: emp.phone || '',
          startDate: emp.start_date,
          isActive: true
        }))
        setEmployees(formattedEmployees)
      }

      // 스케줄 데이터 로드
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('work_schedules')
        .select('*')

      if (schedulesError) {
        console.error('스케줄 데이터 로드 오류:', schedulesError)
        setSchedules(exampleSchedules)
      } else {
        const formattedSchedules: WorkSchedule[] = schedulesData.map(schedule => ({
          id: schedule.id,
          employeeId: schedule.employee_id,
          date: schedule.date,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          breakTime: schedule.break_time
        }))
        setSchedules(formattedSchedules)
      }

    } catch (err) {
      console.error('데이터 로드 중 오류:', err)
      setError('데이터를 불러오는데 실패했습니다. 예제 데이터를 사용합니다.')
      setEmployees(exampleEmployees)
      setSchedules(exampleSchedules)
    } finally {
      setLoading(false)
    }
  }

  const calculatePayroll = () => {
    const payrollResults: PayrollData[] = employees.map(employee => {
      const employeeSchedules = schedules.filter(schedule => schedule.employeeId === employee.id)
      
      let totalHours = 0
      let regularHours = 0
      let overtimeHours = 0
      let nightHours = 0

      employeeSchedules.forEach(schedule => {
        const start = new Date(`2024-01-01 ${schedule.startTime}`)
        const end = new Date(`2024-01-01 ${schedule.endTime}`)
        const workHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) - ((schedule.breakTime || 0) / 60)
        
        totalHours += workHours
        
        // 8시간 초과 시 연장근무
        if (workHours > 8) {
          regularHours += 8
          overtimeHours += workHours - 8
        } else {
          regularHours += workHours
        }
        
        // 야간근무 계산 (22시-06시)
        const startHour = start.getHours()
        const endHour = end.getHours()
        if (startHour >= 22 || endHour <= 6) {
          nightHours += Math.min(workHours, 2) // 최대 2시간으로 가정
        }
      })

      const regularPay = regularHours * employee.hourlyWage
      const overtimePay = overtimeHours * employee.hourlyWage * 1.5
      const nightPay = nightHours * employee.hourlyWage * 0.5
      const isEligibleForHolidayPay = totalHours >= 15
      const holidayPay = isEligibleForHolidayPay ? (regularPay + overtimePay) / 5 : 0
      const totalPay = regularPay + overtimePay + nightPay + holidayPay

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
        isEligibleForHolidayPay
      }
    })

    setPayrollData(payrollResults)
  }

  // 필터링된 데이터
  const filteredPayrollData = payrollData.filter(data => {
    const matchesSearch = data.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'holiday-eligible' && data.isEligibleForHolidayPay) ||
                         (filterStatus === 'holiday-not-eligible' && !data.isEligibleForHolidayPay)
    
    return matchesSearch && matchesFilter
  })

  // 총계 계산
  const totals = filteredPayrollData.reduce((acc, data) => ({
    totalEmployees: acc.totalEmployees + 1,
    totalHours: acc.totalHours + data.weeklyHours,
    totalRegularPay: acc.totalRegularPay + data.regularPay,
    totalOvertimePay: acc.totalOvertimePay + data.overtimePay,
    totalHolidayPay: acc.totalHolidayPay + data.holidayPay,
    totalPay: acc.totalPay + data.totalPay
  }), {
    totalEmployees: 0,
    totalHours: 0,
    totalRegularPay: 0,
    totalOvertimePay: 0,
    totalHolidayPay: 0,
    totalPay: 0
  })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">급여 데이터를 계산하는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* 오류 메시지 */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-800">{error}</span>
          </div>
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Calculator className="h-8 w-8" />
            급여 대시보드
          </h1>
          <p className="text-muted-foreground">
            직원별 급여를 정확하게 계산하고 주휴수당을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="직원명 또는 직책으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="필터 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직원</SelectItem>
                <SelectItem value="holiday-eligible">주휴수당 대상</SelectItem>
                <SelectItem value="holiday-not-eligible">주휴수당 미대상</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-week">이번 주</SelectItem>
                <SelectItem value="last-week">지난 주</SelectItem>
                <SelectItem value="current-month">이번 달</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 급여 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>급여 계산 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">직원명</TableHead>
                  <TableHead className="font-semibold">직책</TableHead>
                  <TableHead className="font-semibold text-center">시급</TableHead>
                  <TableHead className="font-semibold text-center">근무시간</TableHead>
                  <TableHead className="font-semibold text-center">기본급</TableHead>
                  <TableHead className="font-semibold text-center">연장수당</TableHead>
                  <TableHead className="font-semibold text-center">야간수당</TableHead>
                  <TableHead className="font-semibold text-center">주휴수당</TableHead>
                  <TableHead className="font-semibold text-center">총 급여</TableHead>
                  <TableHead className="font-semibold text-center">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayrollData.map((data) => (
                  <TableRow key={data.employee.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{data.employee.name}</TableCell>
                    <TableCell>{data.employee.position}</TableCell>
                    <TableCell className="text-center">{data.employee.hourlyWage.toLocaleString()}원</TableCell>
                    <TableCell className="text-center">{data.weeklyHours.toFixed(1)}시간</TableCell>
                    <TableCell className="text-center">{data.regularPay.toLocaleString()}원</TableCell>
                    <TableCell className="text-center">
                      {data.overtimePay > 0 ? (
                        <span className="text-orange-600 font-medium">{data.overtimePay.toLocaleString()}원</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {data.nightPay > 0 ? (
                        <span className="text-purple-600 font-medium">{data.nightPay.toLocaleString()}원</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {data.holidayPay > 0 ? (
                        <span className="text-red-600 font-medium">{data.holidayPay.toLocaleString()}원</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-green-600">{data.totalPay.toLocaleString()}원</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {data.isEligibleForHolidayPay ? (
                        <Badge variant="destructive">주휴수당</Badge>
                      ) : (
                        <Badge variant="secondary">미적용</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* 총계 행 */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-10 gap-4 text-sm font-semibold bg-gray-100 p-3 rounded">
              <div className="col-span-4">총계</div>
              <div className="text-center">{totals.totalRegularPay.toLocaleString()}원</div>
              <div className="text-center text-orange-600">{totals.totalOvertimePay.toLocaleString()}원</div>
              <div className="text-center">-</div>
              <div className="text-center text-red-600">{totals.totalHolidayPay.toLocaleString()}원</div>
              <div className="text-center text-green-600 text-lg">{totals.totalPay.toLocaleString()}원</div>
              <div></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

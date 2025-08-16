"use client"

import React, { useState, useEffect } from 'react'
import { exampleEmployees, exampleSchedules } from '@/data/example-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, DollarSign, AlertTriangle, Download, Filter, Search, Calendar, Users, Clock, TrendingUp, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Employee, WorkSchedule } from '@/lib/supabase'
import { 
  calculateWorkHours, 
  calculatePayroll, 
  calculateWeeklyHours,
  isEligibleForHolidayPay,
  calculateMonthlySalary,
  calculateNetSalary,
  type WorkHoursResult,
  type PayrollResult 
} from '@/lib/payroll-calculator-2025'

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
  monthlySalary?: number
  netSalary?: number
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
  const [showTooltip, setShowTooltip] = useState(false)
  const [stores, setStores] = useState<any[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  // 데이터 변경 시 급여 계산
  useEffect(() => {
    if (employees.length > 0) {
      calculatePayrollData()
    }
  }, [employees, schedules, selectedStoreId])

  // 스토어 변경 시 데이터 재로드
  useEffect(() => {
    if (selectedStoreId) {
      loadData()
    }
  }, [selectedStoreId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 스토어 데이터 로드
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)

      if (!storesError && storesData) {
        setStores(storesData)
        if (storesData.length > 0 && !selectedStoreId) {
          setSelectedStoreId(storesData[0].id)
        }
      }

      // 직원 데이터 로드 (선택된 스토어 기준)
      let employeesQuery = supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
      
      if (selectedStoreId) {
        employeesQuery = employeesQuery.eq('store_id', selectedStoreId)
      }

      const { data: employeesData, error: employeesError } = await employeesQuery

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

      // 스케줄 데이터 로드 (work_schedules 테이블 사용)
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
      
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('work_schedules')
        .select('*')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])

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
          breakTime: schedule.break_time || 0
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

  const calculatePayrollData = () => {
    const payrollResults: PayrollData[] = employees.map(employee => {
      const employeeSchedules = schedules.filter(schedule => schedule.employeeId === employee.id)
      
      // 스케줄별 근무시간 계산
      const workHoursResults: WorkHoursResult[] = employeeSchedules.map(schedule => 
        calculateWorkHours(schedule.startTime, schedule.endTime, schedule.breakTime || 0)
      )
      
      // 주간 총 근무시간
      const weeklyHours = calculateWeeklyHours(employeeSchedules.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        breakTime: s.breakTime || 0
      })))
      
      // 시간별 합계 계산
      const totalRegularHours = workHoursResults.reduce((sum, wh) => sum + wh.regularHours, 0)
      const totalOvertimeHours = workHoursResults.reduce((sum, wh) => sum + wh.overtimeHours, 0)
      const totalNightHours = workHoursResults.reduce((sum, wh) => sum + wh.nightHours, 0)
      
      // 급여 계산 (첫 번째 스케줄 기준으로 계산, 실제로는 합계 사용)
      const combinedWorkHours: WorkHoursResult = {
        totalHours: weeklyHours,
        regularHours: totalRegularHours,
        overtimeHours: totalOvertimeHours,
        nightHours: totalNightHours,
        isNightShift: totalNightHours > 0
      }
      
      const payrollResult: PayrollResult = calculatePayroll(
        combinedWorkHours,
        employee.hourlyWage,
        weeklyHours
      )
      
      // 월급 및 실수령액 계산
      const monthlySalaryResult = calculateMonthlySalary(weeklyHours, employee.hourlyWage)
      const netSalaryResult = calculateNetSalary(monthlySalaryResult.grossSalary)

      return {
        employee,
        weeklyHours,
        regularHours: totalRegularHours,
        overtimeHours: totalOvertimeHours,
        nightHours: totalNightHours,
        regularPay: payrollResult.regularPay,
        overtimePay: payrollResult.overtimePay,
        nightPay: payrollResult.nightPay,
        holidayPay: payrollResult.holidayPay,
        totalPay: payrollResult.totalPay,
        isEligibleForHolidayPay: payrollResult.isEligibleForHolidayPay,
        monthlySalary: monthlySalaryResult.grossSalary,
        netSalary: netSalaryResult.netSalary
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calculator className="h-4 w-4" />
              <p>급여 데이터를 계산하는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            급여 대시보드
            {/* 툴팁을 제목 옆으로 이동 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              
              {showTooltip && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowTooltip(false)}
                  />
                  <div className="absolute top-8 left-0 z-50 w-80 p-4 bg-white rounded-lg border shadow-lg">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">급여 대시보드 사용법:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 스토어를 선택하여 해당 직원들의 급여를 확인하세요</li>
                        <li>• 검색창에서 직원명이나 직책으로 필터링할 수 있습니다</li>
                        <li>• 주휴수당은 주 15시간 이상 근무 시 자동 적용됩니다</li>
                        <li>• 월급은 주휴수당이 포함된 예상 월급입니다</li>
                        <li>• 실수령액은 4대보험과 소득세가 제외된 금액입니다</li>
                        <li>• 행을 클릭하면 자세한 계산 공식을 볼 수 있습니다</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </h1>
          
          {/* 스토어 선택 */}
          <Select 
            value={selectedStoreId?.toString() || ''} 
            onValueChange={(value) => setSelectedStoreId(parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="스토어 선택" />
            </SelectTrigger>
            <SelectContent>
              {stores.map(store => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.store_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 통계 정보 */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{filteredPayrollData.length}명</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span>{totals.totalHours.toFixed(1)}시간</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>{totals.totalPay.toLocaleString()}원</span>
            </div>
          </div>
          
          {/* 다운로드 버튼 */}
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              엑셀 다운로드
            </Button>
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        직원별 급여를 정확하게 계산하고 주휴수당을 관리하세요 (2025년 노동법 기준)
      </p>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg border p-4">
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
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-week">이번 주</SelectItem>
              <SelectItem value="last-week">지난 주</SelectItem>
              <SelectItem value="current-month">이번 달</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 급여 테이블 */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            급여 계산 상세
          </h3>
        </div>
        
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
                <TableHead className="font-semibold text-center">주급</TableHead>
                <TableHead className="font-semibold text-center">월급(예상)</TableHead>
                <TableHead className="font-semibold text-center">실수령액</TableHead>
                <TableHead className="font-semibold text-center">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrollData.map((data) => (
                <React.Fragment key={data.employee.id}>
                  <TableRow 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => {
                      const newExpanded = new Set(expandedRows)
                      if (newExpanded.has(data.employee.id)) {
                        newExpanded.delete(data.employee.id)
                      } else {
                        newExpanded.add(data.employee.id)
                      }
                      setExpandedRows(newExpanded)
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {expandedRows.has(data.employee.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        {data.employee.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {data.employee.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{data.employee.hourlyWage.toLocaleString()}원</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        {data.weeklyHours.toFixed(1)}h
                      </div>
                    </TableCell>
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
                      <span className="font-medium text-blue-600">
                        {data.monthlySalary ? data.monthlySalary.toLocaleString() : '-'}원
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-indigo-600">
                        {data.netSalary ? data.netSalary.toLocaleString() : '-'}원
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {data.isEligibleForHolidayPay ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">주휴수당</Badge>
                      ) : (
                        <Badge variant="secondary">미적용</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* 드릴다운 상세 정보 */}
                  {expandedRows.has(data.employee.id) && (
                    <TableRow>
                      <TableCell colSpan={12} className="bg-gray-50 p-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            {data.employee.name}님의 상세 계산 공식
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 주급 계산 */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium text-gray-900 mb-3">주급 계산</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>기본급 ({data.regularHours.toFixed(1)}h × {data.employee.hourlyWage.toLocaleString()}원)</span>
                                  <span className="font-medium">{data.regularPay.toLocaleString()}원</span>
                                </div>
                                {data.overtimeHours > 0 && (
                                  <div className="flex justify-between text-orange-600">
                                    <span>연장수당 ({data.overtimeHours.toFixed(1)}h × {data.employee.hourlyWage.toLocaleString()}원 × 1.5)</span>
                                    <span className="font-medium">{data.overtimePay.toLocaleString()}원</span>
                                  </div>
                                )}
                                {data.nightHours > 0 && (
                                  <div className="flex justify-between text-purple-600">
                                    <span>야간수당 ({data.nightHours.toFixed(1)}h × {data.employee.hourlyWage.toLocaleString()}원 × 0.5)</span>
                                    <span className="font-medium">{data.nightPay.toLocaleString()}원</span>
                                  </div>
                                )}
                                {data.isEligibleForHolidayPay && (
                                  <div className="flex justify-between text-red-600">
                                    <span>주휴수당 ((기본급 + 연장수당) ÷ 5)</span>
                                    <span className="font-medium">{data.holidayPay.toLocaleString()}원</span>
                                  </div>
                                )}
                                <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                                  <span>주급 합계</span>
                                  <span>{data.totalPay.toLocaleString()}원</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 월급 및 실수령액 계산 */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium text-gray-900 mb-3">월급 및 실수령액</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>주간 근무시간</span>
                                  <span className="font-medium">{data.weeklyHours.toFixed(1)}시간</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>주휴수당 대상</span>
                                  <span className="font-medium">{data.isEligibleForHolidayPay ? 'O (15시간 이상)' : 'X (15시간 미만)'}</span>
                                </div>
                                <div className="flex justify-between text-blue-600">
                                  <span>예상 월급 (주휴수당 포함)</span>
                                  <span className="font-medium">{data.monthlySalary ? data.monthlySalary.toLocaleString() : '-'}원</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  월급 = (주간근무시간 + 주휴시간) × 월평균주수(4.345) × 시급
                                </div>
                                <div className="border-t pt-2">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>4대보험료 (근로자 부담)</span>
                                    <span>약 {data.monthlySalary ? Math.round(data.monthlySalary * 0.089).toLocaleString() : '-'}원</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>소득세 (간이세액)</span>
                                    <span>약 {data.monthlySalary ? Math.round(data.monthlySalary * 0.03).toLocaleString() : '-'}원</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-indigo-600 mt-2">
                                    <span>실수령액</span>
                                    <span>{data.netSalary ? data.netSalary.toLocaleString() : '-'}원</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            * 계산은 2025년 노동법 기준이며, 실제 급여는 회사 정책에 따라 달라질 수 있습니다.
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* 총계 행 */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
            <div className="col-span-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span>총계 ({totals.totalEmployees}명)</span>
            </div>
            <div className="text-center">{totals.totalRegularPay.toLocaleString()}원</div>
            <div className="text-center text-orange-600">{totals.totalOvertimePay.toLocaleString()}원</div>
            <div className="text-center">-</div>
            <div className="text-center text-red-600">{totals.totalHolidayPay.toLocaleString()}원</div>
            <div className="text-center text-green-600 text-lg font-bold">{totals.totalPay.toLocaleString()}원</div>
            <div className="col-span-3"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

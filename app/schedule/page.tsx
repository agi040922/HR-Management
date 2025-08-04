"use client"

import React, { useState, useEffect } from 'react'
import { ScheduleCalendar } from '@/components/schedule-calendar'
import { exampleEmployees, exampleSchedules } from '@/data/example-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Clock, DollarSign, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Employee, WorkSchedule } from '@/lib/supabase'

export default function SchedulePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [storeSettings, setStoreSettings] = useState({
    openTime: '09:00',
    closeTime: '22:00',
    timeSlotMinutes: 30
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 직원 추가 다이얼로그 상태
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    hourlyWage: '',
    phone: ''
  })

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

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
        // DB 데이터를 프론트엔드 타입으로 변환
        const formattedEmployees: Employee[] = employeesData.map(emp => ({
          id: emp.id,
          name: emp.name,
          hourlyWage: emp.hourly_wage,
          position: emp.position,
          phone: emp.phone || '',
          startDate: emp.start_date,
          isActive: true // DB에서 로드된 직원은 모두 활성 상태로 간주
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
        // DB 데이터를 프론트엔드 타입으로 변환
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

      // 가게 설정 로드
      const { data: settingsData, error: settingsError } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()

      if (settingsError) {
        console.error('가게 설정 로드 오류:', settingsError)
        // 기본값 유지
      } else {
        setStoreSettings({
          openTime: settingsData.open_time,
          closeTime: settingsData.close_time,
          timeSlotMinutes: settingsData.time_slot_minutes
        })
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

  // 스케줄 추가 핸들러
  const handleScheduleAdd = async (employeeId: number, date: string, startTime: string, endTime: string) => {
    try {
      const { data, error } = await supabase
        .from('work_schedules')
        .insert({
          employee_id: employeeId,
          date,
          start_time: startTime,
          end_time: endTime,
          break_time: 0
        })
        .select()
        .single()

      if (error) {
        console.error('스케줄 추가 오류 상세:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          data: { employeeId, date, startTime, endTime }
        })
        alert(`스케줄 추가에 실패했습니다: ${error.message}`)
        return
      }

      // 성공시 로컬 상태 업데이트
      const newSchedule: WorkSchedule = {
        id: data.id,
        employeeId: data.employee_id,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        breakTime: data.break_time
      }
      setSchedules(prev => [...prev, newSchedule])
      console.log('스케줄 추가 성공:', newSchedule)
    } catch (err) {
      console.error('스케줄 추가 중 예외 오류:', {
        error: err,
        message: err instanceof Error ? err.message : '알 수 없는 오류',
        stack: err instanceof Error ? err.stack : undefined,
        data: { employeeId, date, startTime, endTime }
      })
      alert(`스케줄 추가에 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    }
  }

  // 스케줄 편집 핸들러
  const handleScheduleEdit = (scheduleId: number) => {
    console.log('스케줄 편집:', scheduleId)
    // TODO: 실제 스케줄 편집 로직 구현
  }

  const handleScheduleDelete = async (scheduleId: number) => {
    try {
      const { error } = await supabase
        .from('work_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) {
        console.error('스케줄 삭제 오류:', error)
        alert('스케줄 삭제에 실패했습니다.')
        return
      }

      // 성공시 로컬 상태에서 제거
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId))
      console.log('스케줄 삭제 성공:', scheduleId)
    } catch (err) {
      console.error('스케줄 삭제 중 오류:', err)
      alert('스케줄 삭제에 실패했습니다.')
    }
  }

  // 각 직원의 주간 근무시간 계산
  const getEmployeeWeeklyHours = (employeeId: number): number => {
    return schedules
      .filter(schedule => schedule.employeeId === employeeId)
      .reduce((total, schedule) => {
        const start = new Date(`2024-01-01 ${schedule.startTime}`)
        const end = new Date(`2024-01-01 ${schedule.endTime}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + hours - ((schedule.breakTime || 0) / 60)
      }, 0)
  }

  const handleStoreSettingsChange = async (newSettings: typeof storeSettings) => {
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          open_time: newSettings.openTime,
          close_time: newSettings.closeTime,
          time_slot_minutes: newSettings.timeSlotMinutes
        })
        .eq('id', 1) // 첫 번째 가게 설정 업데이트

      if (error) {
        console.error('가게 설정 업데이트 오류:', error)
        alert('가게 설정 저장에 실패했습니다.')
        return
      }

      setStoreSettings(newSettings)
      console.log('가게 설정 업데이트 성공:', newSettings)
    } catch (err) {
      console.error('가게 설정 업데이트 중 오류:', err)
      alert('가게 설정 저장에 실패했습니다.')
    }
  }

  // 직원 추가 핸들러
  const handleAddEmployee = async () => {
    try {
      // 입력값 검증
      if (!newEmployee.name || !newEmployee.position || !newEmployee.hourlyWage) {
        alert('이름, 직책, 시급은 필수 입력 항목입니다.')
        return
      }

      const hourlyWage = parseInt(newEmployee.hourlyWage)
      if (isNaN(hourlyWage) || hourlyWage <= 0) {
        alert('올바른 시급을 입력해주세요.')
        return
      }

      const { data, error } = await supabase
        .from('employees')
        .insert({
          name: newEmployee.name,
          position: newEmployee.position,
          hourly_wage: hourlyWage,
          phone: newEmployee.phone || null,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('직원 추가 오류:', error)
        alert('직원 추가에 실패했습니다.')
        return
      }

      // 성공시 로컬 상태 업데이트
      const addedEmployee: Employee = {
        id: data.id,
        name: data.name,
        hourlyWage: data.hourly_wage,
        position: data.position,
        phone: data.phone || '',
        startDate: data.start_date,
        isActive: true
      }
      setEmployees(prev => [...prev, addedEmployee])

      // 폼 초기화 및 다이얼로그 닫기
      setNewEmployee({
        name: '',
        position: '',
        hourlyWage: '',
        phone: ''
      })
      setIsAddEmployeeOpen(false)
      
      console.log('직원 추가 성공:', addedEmployee)
      alert('직원이 성공적으로 추가되었습니다.')
    } catch (err) {
      console.error('직원 추가 중 오류:', err)
      alert('직원 추가에 실패했습니다.')
    }
  }

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">아르바이트 스케줄 관리</h1>
        <p className="text-muted-foreground">
          아르바이트생들의 근무 시간을 효율적으로 관리하고 주휴수당을 최적화하세요
        </p>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-4">
        <Button onClick={() => setIsAddEmployeeOpen(true)}>
          <Users className="h-4 w-4 mr-2" />
          직원 추가
        </Button>
        <Button variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          일괄 스케줄 설정
        </Button>
        <Button variant="outline">
          <DollarSign className="h-4 w-4 mr-2" />
          임금 최적화 제안
        </Button>
      </div>

      {/* 직원 추가 다이얼로그 */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>직원 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름
              </Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="직원 이름을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                직책
              </Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                className="col-span-3"
                placeholder="예: 아르바이트, 매니저"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyWage" className="text-right">
                시급
              </Label>
              <Input
                id="hourlyWage"
                type="number"
                value={newEmployee.hourlyWage}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, hourlyWage: e.target.value }))}
                className="col-span-3"
                placeholder="예: 10000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                전화번호
              </Label>
              <Input
                id="phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
                placeholder="예: 010-1234-5678 (선택사항)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddEmployee}>
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 메인 스케줄 캘린더 */}
      <ScheduleCalendar
        employees={employees}
        schedules={schedules}
        storeSettings={storeSettings}
        onScheduleAdd={handleScheduleAdd}
        onScheduleEdit={handleScheduleEdit}
        onScheduleDelete={handleScheduleDelete}
        onStoreSettingsChange={handleStoreSettingsChange}
      />
    </div>
  )
}

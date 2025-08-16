'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, AlertTriangle, HelpCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { 
  getUserStores, 
  getStoreTemplates, 
  getStoreEmployees, 
  getStoreExceptions,
  generateWeeklyActualSchedule,
  getExceptionTypeLabel,
  getExceptionTypeBadgeVariant,
  type StoreData,
  type TemplateData,
  type EmployeeData,
  type ExceptionData,
  type WeeklyActualSchedule,
  type ActualScheduleData
} from '@/lib/api/actual-schedule-api'

export default function SchedulePage() {
  const { user } = useAuth()
  
  // 상태 관리
  const [stores, setStores] = useState<StoreData[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [exceptions, setExceptions] = useState<ExceptionData[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyActualSchedule | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showCurrentWeekExceptions, setShowCurrentWeekExceptions] = useState(false)

  // 현재 주 시작 날짜 계산
  useEffect(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // 일요일을 주 시작으로
    setCurrentWeekStart(startOfWeek.toISOString().split('T')[0])
  }, [])

  // 사용자 스토어 로드
  useEffect(() => {
    if (user?.id) {
      loadUserStores()
    }
  }, [user])

  // 선택된 스토어의 데이터 로드
  useEffect(() => {
    if (selectedStoreId && user?.id) {
      loadStoreData()
    }
  }, [selectedStoreId, user])

  // 실제 스케줄 생성
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0 && employees.length > 0) {
      generateSchedule()
    }
  }, [selectedTemplateId, templates, employees, exceptions, currentWeekStart])

  const loadUserStores = async () => {
    try {
      setLoading(true)
      const storeList = await getUserStores(user!.id)
      setStores(storeList)
      
      if (storeList.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storeList[0].id)
      }
    } catch (err) {
      setError('스토어 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadStoreData = async () => {
    try {
      setLoading(true)
      const [templateList, employeeList, exceptionList] = await Promise.all([
        getStoreTemplates(selectedStoreId!),
        getStoreEmployees(selectedStoreId!, user!.id),
        getStoreExceptions(selectedStoreId!)
      ])
      
      setTemplates(templateList)
      setEmployees(employeeList)
      setExceptions(exceptionList)
      
      // 첫 번째 활성 템플릿 자동 선택
      const activeTemplate = templateList.find(t => t.is_active)
      if (activeTemplate && !selectedTemplateId) {
        setSelectedTemplateId(activeTemplate.id)
      }
    } catch (err) {
      setError('스토어 데이터를 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateSchedule = () => {
    try {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
      if (!selectedTemplate) return

      const schedule = generateWeeklyActualSchedule(
        selectedTemplate,
        employees,
        exceptions,
        currentWeekStart
      )
      
      setWeeklySchedule(schedule)
    } catch (err) {
      setError('스케줄 생성에 실패했습니다.')
      console.error(err)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(currentWeekStart)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeekStart(newDate.toISOString().split('T')[0])
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot.replace('-', ' ~ ')
  }

  // 현재 주의 예외사항 필터링
  const getCurrentWeekExceptions = () => {
    if (!weeklySchedule) return []
    
    const startDate = new Date(weeklySchedule.weekStart)
    const endDate = new Date(weeklySchedule.weekEnd)
    
    return exceptions.filter(exception => {
      const exceptionDate = new Date(exception.date)
      return exceptionDate >= startDate && exceptionDate <= endDate
    })
  }

  // 모든 시간대 수집
  const getAllTimeSlots = () => {
    if (!weeklySchedule) return []
    
    const timeSlots = new Set<string>()
    weeklySchedule.days.forEach(day => {
      Object.keys(day.timeSlots).forEach(slot => timeSlots.add(slot))
    })
    
    return Array.from(timeSlots).sort()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">스케줄을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold mb-2">오류가 발생했습니다</p>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  const currentWeekExceptions = getCurrentWeekExceptions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">실제 스케줄</h1>
          
          {/* 컨트롤 */}
          <div className="flex items-center gap-3">
            <Select 
              value={selectedStoreId?.toString() || ''} 
              onValueChange={(value) => setSelectedStoreId(parseInt(value))}
            >
              <SelectTrigger className="w-40">
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

            <Select 
              value={selectedTemplateId?.toString() || ''} 
              onValueChange={(value) => setSelectedTemplateId(parseInt(value))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="템플릿 선택" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.is_active).map(template => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 통계 정보 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {weeklySchedule && `${formatDate(weeklySchedule.weekStart)} ~ ${formatDate(weeklySchedule.weekEnd)}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{weeklySchedule?.totalWeeklyHours.toFixed(1)}시간</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span>{weeklySchedule?.exceptionsCount}건</span>
            </div>
          </div>

          {/* 도움말 툴팁 */}
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
                <div className="absolute top-8 right-0 z-50 w-80 p-4 bg-white rounded-lg border shadow-lg">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">실제 스케줄 사용법:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 스토어와 템플릿을 선택하세요</li>
                      <li>• 화살표 버튼으로 다른 주를 확인할 수 있습니다</li>
                      <li>• 오렌지색 배경은 예외사항이 적용된 시간대입니다</li>
                      <li>• 예외사항 목록에서 현재 주의 변경사항을 확인하세요</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 주간 스케줄 테이블 */}
      {weeklySchedule && (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">시간</TableHead>
                {weeklySchedule.days.map((day: ActualScheduleData) => (
                  <TableHead key={day.date} className="text-center min-w-32">
                    <div className="space-y-1">
                      <div className="font-medium">{day.dayName}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(day.date)}</div>
                      {!day.isOpen && (
                        <Badge variant="secondary" className="text-xs">휴무</Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {getAllTimeSlots().map(timeSlot => (
                <TableRow key={timeSlot}>
                  <TableCell className="font-medium text-sm">
                    {formatTimeSlot(timeSlot)}
                  </TableCell>
                  {weeklySchedule.days.map((day: ActualScheduleData) => {
                    const slot = day.timeSlots[timeSlot]
                    return (
                      <TableCell key={day.date} className="p-2">
                        {slot ? (
                          <div className={`p-2 rounded text-xs ${
                            slot.isException 
                              ? 'bg-orange-50 border border-orange-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            {slot.isException && (
                              <Badge 
                                variant={getExceptionTypeBadgeVariant(slot.exceptionType!) as any}
                                className="text-xs mb-1"
                              >
                                {getExceptionTypeLabel(slot.exceptionType!)}
                              </Badge>
                            )}
                            
                            <div className="space-y-1">
                              {slot.employees.length === 0 ? (
                                <span className="text-muted-foreground">직원 없음</span>
                              ) : (
                                slot.employees.map(employee => (
                                  <div key={employee.id} className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{employee.name}</span>
                                  </div>
                                ))
                              )}
                            </div>
                            
                            {slot.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {slot.notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-xs">-</div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 현재 주 예외사항 */}
      {currentWeekExceptions.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">이번 주 예외사항</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCurrentWeekExceptions(!showCurrentWeekExceptions)}
              >
                {showCurrentWeekExceptions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showCurrentWeekExceptions ? '숨기기' : '보기'}
              </Button>
            </div>
          </div>
          
          {showCurrentWeekExceptions && (
            <div className="p-4 space-y-3">
              {currentWeekExceptions.map(exception => {
                const employee = employees.find(emp => emp.id === exception.employee_id)
                return (
                  <div key={exception.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={getExceptionTypeBadgeVariant(exception.exception_type) as any}>
                        {getExceptionTypeLabel(exception.exception_type)}
                      </Badge>
                      <div>
                        <div className="font-medium">{employee?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(exception.date).toLocaleDateString('ko-KR')}
                          {exception.start_time && exception.end_time && 
                            ` • ${exception.start_time} ~ ${exception.end_time}`
                          }
                        </div>
                      </div>
                    </div>
                    {exception.notes && (
                      <div className="text-sm text-muted-foreground italic max-w-xs">
                        {exception.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 스케줄이 없는 경우 */}
      {!weeklySchedule && !loading && (
        <div className="p-12 text-center bg-gray-50 rounded-lg border">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">스케줄을 생성할 수 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            스토어와 템플릿을 선택해주세요.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 활성화된 템플릿이 있는지 확인하세요</p>
            <p>• 직원이 등록되어 있는지 확인하세요</p>
          </div>
        </div>
      )}
    </div>
  )
}
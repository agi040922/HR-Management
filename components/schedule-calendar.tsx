"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock, User, Plus, Settings, Save, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Employee, WorkSchedule } from '@/types/employee'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

interface StoreSettings {
  openTime: string
  closeTime: string
  timeSlotMinutes: number
}

interface ScheduleCalendarProps {
  employees: Employee[]
  schedules: WorkSchedule[]
  storeSettings?: StoreSettings
  onScheduleAdd?: (employeeId: number, date: string, startTime: string, endTime: string) => void
  onScheduleEdit?: (scheduleId: number) => void
  onScheduleDelete?: (scheduleId: number) => void
  onStoreSettingsChange?: (settings: StoreSettings) => void
}

export function ScheduleCalendar({ 
  employees, 
  schedules, 
  storeSettings = { openTime: '09:00', closeTime: '22:00', timeSlotMinutes: 30 },
  onScheduleAdd, 
  onScheduleEdit, 
  onScheduleDelete,
  onStoreSettingsChange
}: ScheduleCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(dayjs())
  const [showSettings, setShowSettings] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{date: string, timeSlot: string} | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

  // 주간 날짜 생성 (월요일부터 일요일)
  const getWeekDays = (date: dayjs.Dayjs) => {
    const startOfWeek = date.startOf('week').add(1, 'day') // 월요일부터 시작
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'))
  }

  const weekDays = getWeekDays(currentWeek)
  
  // 가게 영업시간에 맞는 타임슬롯 생성
  const generateTimeSlots = () => {
    const openHour = parseInt(storeSettings.openTime.split(':')[0])
    const openMinute = parseInt(storeSettings.openTime.split(':')[1])
    const closeHour = parseInt(storeSettings.closeTime.split(':')[0])
    const closeMinute = parseInt(storeSettings.closeTime.split(':')[1])
    
    const slots = []
    let currentTime = dayjs().hour(openHour).minute(openMinute)
    const endTime = dayjs().hour(closeHour).minute(closeMinute)
    
    while (currentTime.isBefore(endTime)) {
      slots.push(currentTime.format('HH:mm'))
      currentTime = currentTime.add(storeSettings.timeSlotMinutes, 'minute')
    }
    
    return slots
  }
  
  const timeSlots = generateTimeSlots()

  // 특정 날짜와 시간대의 스케줄 찾기
  const getScheduleForTimeSlot = (employeeId: number, date: dayjs.Dayjs, timeSlot: string) => {
    return schedules.find(schedule => {
      if (schedule.employeeId !== employeeId) return false
      if (schedule.date !== date.format('YYYY-MM-DD')) return false
      
      const slotTime = dayjs(`2000-01-01 ${timeSlot}`)
      const startTime = dayjs(`2000-01-01 ${schedule.startTime}`)
      const endTime = dayjs(`2000-01-01 ${schedule.endTime}`)
      
      return (slotTime.isAfter(startTime) || slotTime.isSame(startTime)) && slotTime.isBefore(endTime)
    })
  }

  // 주간 근무시간 계산
  const calculateWeeklyHours = (employeeId: number) => {
    const weekStart = weekDays[0].format('YYYY-MM-DD')
    const weekEnd = weekDays[6].format('YYYY-MM-DD')
    
    return schedules
      .filter(s => s.employeeId === employeeId && s.date >= weekStart && s.date <= weekEnd)
      .reduce((total, schedule) => {
        const hours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
          dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
        )
        return total + hours
      }, 0)
  }

  // 근무시간에 따른 색상 반환
  const getScheduleColor = (schedule: WorkSchedule) => {
    const hours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
      dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
    )
    
    if (hours >= 8) return 'bg-red-500 hover:bg-red-600'
    if (hours >= 6) return 'bg-orange-500 hover:bg-orange-600'
    if (hours >= 4) return 'bg-green-500 hover:bg-green-600'
    return 'bg-blue-500 hover:bg-blue-600'
  }

  return (
    <div className="space-y-6">
      {/* 헤더 - 주간 네비게이션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              아르바이트 스케줄 관리
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold min-w-[200px] text-center">
                {weekDays[0].format('YYYY년 MM월 DD일')} ~ {weekDays[6].format('MM월 DD일')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(dayjs())}
              >
                오늘
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-1" />
                가게 설정
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 가게 설정 패널 */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              가게 운영 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="openTime">오픈 시간</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={storeSettings.openTime}
                  onChange={(e) => onStoreSettingsChange?.({ ...storeSettings, openTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="closeTime">마감 시간</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={storeSettings.closeTime}
                  onChange={(e) => onStoreSettingsChange?.({ ...storeSettings, closeTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="timeSlot">타임슬롯 단위</Label>
                <Select
                  value={storeSettings.timeSlotMinutes.toString()}
                  onValueChange={(value) => onStoreSettingsChange?.({ ...storeSettings, timeSlotMinutes: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15분</SelectItem>
                    <SelectItem value="30">30분</SelectItem>
                    <SelectItem value="60">1시간</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm text-blue-800">
                <strong>현재 설정:</strong> {storeSettings.openTime} - {storeSettings.closeTime} 
                ({storeSettings.timeSlotMinutes}분 단위, 총 {timeSlots.length}개 타임슬롯)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 스케줄 그리드 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* 헤더 */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 bg-gray-50 font-medium text-center">시간</div>
                {weekDays.map(day => (
                  <div key={day.format('YYYY-MM-DD')} className="p-3 bg-gray-50 font-medium text-center">
                    <div>{day.format('ddd')}</div>
                    <div className="text-sm text-gray-600">{day.format('M/D')}</div>
                  </div>
                ))}
              </div>
              
              {/* 타임슬롯별 그리드 */}
              {timeSlots.map(timeSlot => (
                <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100">
                  <div className="p-2 bg-gray-50 text-sm font-medium text-center">
                    {timeSlot}
                  </div>
                  {weekDays.map(day => (
                    <div key={`${day.format('YYYY-MM-DD')}-${timeSlot}`} className="p-1 min-h-[50px] border-r border-gray-100">
                      {employees.map(employee => {
                        const schedule = getScheduleForTimeSlot(employee.id, day, timeSlot)
                        if (!schedule) return null
                        
                        return (
                          <div
                            key={`${employee.id}-${schedule.id}`}
                            className="mb-1 p-1 rounded text-xs cursor-pointer hover:opacity-80"
                            style={{ backgroundColor: '#3b82f6' + '20', borderLeft: `3px solid #3b82f6` }}
                            onClick={() => onScheduleEdit?.(schedule.id)}
                          >
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-gray-600">{schedule.startTime}-{schedule.endTime}</div>
                          </div>
                        )
                      })}
                      
                      {/* 스케줄 추가 버튼 */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-6 text-xs opacity-0 hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSelectedSlot({
                                date: day.format('YYYY-MM-DD'),
                                timeSlot: timeSlot
                              })
                              setSelectedEmployees([])
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>스케줄 추가</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">날짜 및 시간</Label>
                              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                                {selectedSlot && (
                                  <>
                                    {dayjs(selectedSlot.date).format('YYYY년 MM월 DD일 (대소라)')}
                                    <br />
                                    {selectedSlot.timeSlot} ~ {(() => {
                                      const currentIndex = timeSlots.indexOf(selectedSlot.timeSlot)
                                      return currentIndex < timeSlots.length - 1 ? timeSlots[currentIndex + 1] : selectedSlot.timeSlot
                                    })()}
                                  </>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">직원 선택 (다중 선택 가능)</Label>
                              <div className="mt-2 grid grid-cols-1 gap-2">
                                {employees.map(employee => {
                                  const isSelected = selectedEmployees.includes(employee.id)
                                  return (
                                    <Button
                                      key={employee.id}
                                      variant={isSelected ? "default" : "outline"}
                                      className={`justify-start h-auto p-3 transition-all ${
                                        isSelected ? 'bg-blue-600 text-white border-blue-600' : ''
                                      }`}
                                      onClick={() => {
                                        setSelectedEmployees(prev => 
                                          prev.includes(employee.id)
                                            ? prev.filter(id => id !== employee.id)
                                            : [...prev, employee.id]
                                        )
                                      }}
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <div className={`w-3 h-3 rounded-full ${
                                          isSelected ? 'bg-white' : 'bg-blue-500'
                                        }`}></div>
                                        <div className="text-left flex-1">
                                          <div className="font-medium">{employee.name}</div>
                                          <div className={`text-xs ${
                                            isSelected ? 'text-blue-100' : 'text-muted-foreground'
                                          }`}>
                                            {employee.position} · {employee.hourlyWage.toLocaleString()}원/시
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <X className="h-4 w-4 ml-auto" />
                                        )}
                                      </div>
                                    </Button>
                                  )
                                })}
                              </div>
                              
                              {/* 선택된 직원 수 표시 */}
                              {selectedEmployees.length > 0 && (
                                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                                  선택된 직원: {selectedEmployees.length}명
                                </div>
                              )}
                              
                              {/* 스케줄 추가 버튼 */}
                              <div className="mt-4 flex gap-2">
                                <Button
                                  className="flex-1"
                                  disabled={selectedEmployees.length === 0}
                                  onClick={() => {
                                    if (selectedSlot && selectedEmployees.length > 0) {
                                      const nextSlotIndex = timeSlots.indexOf(selectedSlot.timeSlot) + 1
                                      const endTime = nextSlotIndex < timeSlots.length ? timeSlots[nextSlotIndex] : selectedSlot.timeSlot
                                      
                                      // 선택된 모든 직원에게 스케줄 추가
                                      selectedEmployees.forEach(employeeId => {
                                        onScheduleAdd?.(employeeId, selectedSlot.date, selectedSlot.timeSlot, endTime)
                                      })
                                      
                                      setSelectedSlot(null)
                                      setSelectedEmployees([])
                                    }
                                  }}
                                >
                                  스케줄 추가 ({selectedEmployees.length}명)
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSlot(null)
                                    setSelectedEmployees([])
                                  }}
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

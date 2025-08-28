'use client'

import React from 'react'
import { Calendar, Clock, User, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PayrollCalculationResult } from '@/lib/api/(page)/payroll/payroll-test-api'

interface PayrollHeatmapProps {
  employee: PayrollCalculationResult
  year: number
  month: number
}

export default function PayrollHeatmap({ employee, year, month }: PayrollHeatmapProps) {
  // 해당 월의 모든 날짜 생성
  const generateCalendarDays = () => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
    const days = []

    // 이전 달 빈 공간
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // 현재 달 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dateString = date.toISOString().split('T')[0]
      const daySchedule = employee.finalSchedule.weeklySchedule.find(
        schedule => schedule.date === dateString
      )
      
      days.push({
        day,
        date: dateString,
        dayOfWeek: date.getDay(),
        schedule: daySchedule
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  // 근무 시간에 따른 색상 강도 계산 (0-8시간 기준)
  const getWorkHoursColor = (hours: number, hasException: boolean) => {
    if (hours === 0) {
      return hasException ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-200'
    }
    
    const intensity = Math.min(hours / 8, 1) // 8시간을 최대로 정규화
    const alpha = 0.2 + (intensity * 0.6) // 0.2에서 0.8까지
    
    if (hasException) {
      return `bg-orange-${Math.round(alpha * 500)} border-orange-${Math.round(alpha * 500)}`
    }
    
    return `bg-blue-${Math.round(alpha * 500)} border-blue-${Math.round(alpha * 500)}`
  }

  // 예외사항 타입별 색상
  const getExceptionColor = (type: string) => {
    switch (type) {
      case 'CANCEL': return 'bg-red-100 border-red-300 text-red-700'
      case 'OVERRIDE': return 'bg-orange-100 border-orange-300 text-orange-700'
      case 'EXTRA': return 'bg-green-100 border-green-300 text-green-700'
      default: return 'bg-gray-100 border-gray-300 text-gray-700'
    }
  }

  // 예외사항 아이콘
  const getExceptionIcon = (type: string) => {
    switch (type) {
      case 'CANCEL': return '🚫'
      case 'OVERRIDE': return '🔄'
      case 'EXTRA': return '➕'
      default: return '❓'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          {employee.employee.name}의 근무 히트맵
          <span className="text-sm font-normal text-gray-500">
            ({year}년 {month}월)
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* 범례 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">근무 강도:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                <span className="text-xs">없음</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-200 border border-blue-200 rounded"></div>
                <span className="text-xs">적음</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded"></div>
                <span className="text-xs">많음</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">예외사항:</span>
              <div className="flex items-center gap-1">
                <span>🚫</span>
                <span className="text-xs">휴무</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔄</span>
                <span className="text-xs">변경</span>
              </div>
              <div className="flex items-center gap-1">
                <span>➕</span>
                <span className="text-xs">추가</span>
              </div>
            </div>
          </div>

          {/* 캘린더 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((dayName, index) => (
              <div 
                key={dayName} 
                className={`text-center text-xs font-medium py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* 캘린더 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => {
              if (!dayData) {
                return <div key={index} className="h-16"></div>
              }

              const { day, dayOfWeek, schedule } = dayData
              const workHours = schedule?.workHours || 0
              const hasException = schedule?.hasException || false
              const exceptionType = schedule?.exceptionType

              return (
                <div
                  key={day}
                  className={`
                    relative h-16 border-2 rounded-lg p-1 transition-all duration-200 hover:shadow-md cursor-pointer
                    ${dayOfWeek === 0 ? 'border-red-200' : dayOfWeek === 6 ? 'border-blue-200' : 'border-gray-200'}
                    ${workHours > 0 ? getWorkHoursColor(workHours, hasException) : 'bg-gray-50'}
                  `}
                  title={`${month}/${day} - ${workHours.toFixed(1)}시간 ${hasException ? `(${exceptionType})` : ''}`}
                >
                  {/* 날짜 */}
                  <div className={`text-xs font-medium ${
                    dayOfWeek === 0 ? 'text-red-600' : 
                    dayOfWeek === 6 ? 'text-blue-600' : 
                    'text-gray-700'
                  }`}>
                    {day}
                  </div>

                  {/* 근무 시간 */}
                  {workHours > 0 && (
                    <div className="text-xs text-center mt-1">
                      <div className="font-medium">
                        {workHours.toFixed(1)}h
                      </div>
                      {schedule?.startTime && schedule?.endTime && (
                        <div className="text-xs opacity-75">
                          {schedule.startTime.substring(0, 5)}-{schedule.endTime.substring(0, 5)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 예외사항 아이콘 */}
                  {hasException && (
                    <div className="absolute top-0 right-0 text-xs">
                      {getExceptionIcon(exceptionType || '')}
                    </div>
                  )}

                  {/* 오늘 표시 */}
                  {new Date().toDateString() === new Date(year, month - 1, day).toDateString() && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 통계 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {employee.finalSchedule.monthlyHours.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">총 근무시간</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {employee.finalSchedule.weeklySchedule.filter(d => d.workHours > 0).length}
              </div>
              <div className="text-xs text-gray-600">근무일수</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {employee.exceptionAdjustments.length}
              </div>
              <div className="text-xs text-gray-600">예외사항</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {(employee.finalSchedule.monthlyHours / employee.finalSchedule.weeklySchedule.filter(d => d.workHours > 0).length || 0).toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">평균 근무시간</div>
            </div>
          </div>

          {/* 예외사항 상세 */}
          {employee.exceptionAdjustments.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                예외사항 상세
              </h4>
              <div className="space-y-1">
                {employee.exceptionAdjustments.map((adjustment, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-amber-700">
                      {adjustment.date} 
                      <Badge 
                        variant={
                          adjustment.type === 'CANCEL' ? 'destructive' : 
                          adjustment.type === 'OVERRIDE' ? 'default' : 'secondary'
                        }
                        className="ml-1 text-xs"
                      >
                        {adjustment.type === 'CANCEL' ? '휴무' : 
                         adjustment.type === 'OVERRIDE' ? '변경' : '추가'}
                      </Badge>
                    </span>
                    <span className={`font-medium ${
                      adjustment.hoursDifference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {adjustment.hoursDifference >= 0 ? '+' : ''}
                      {adjustment.hoursDifference.toFixed(1)}시간
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

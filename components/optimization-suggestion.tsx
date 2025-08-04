"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Calculator,
  Users,
  Calendar,
  Lightbulb
} from 'lucide-react'
import { Employee, WorkSchedule, OptimizationSuggestion } from '@/types/employee'
import dayjs from 'dayjs'

interface OptimizationSuggestionProps {
  employees: Employee[]
  schedules: WorkSchedule[]
}

export function OptimizationSuggestionComponent({ employees, schedules }: OptimizationSuggestionProps) {
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null)

  // 현재 주휴수당 계산
  const calculateCurrentHolidayPay = () => {
    return employees.reduce((total, employee) => {
      const weeklyHours = schedules
        .filter(s => s.employeeId === employee.id)
        .reduce((hours, schedule) => {
          const workHours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
            dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
          )
          return hours + workHours
        }, 0)
      
      return total + (weeklyHours >= 15 ? employee.hourlyWage * 8 : 0)
    }, 0)
  }

  // 최적화 제안 생성
  const generateOptimizations = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = []
    const currentHolidayPay = calculateCurrentHolidayPay()

    employees.forEach(employee => {
      const weeklyHours = schedules
        .filter(s => s.employeeId === employee.id)
        .reduce((hours, schedule) => {
          const workHours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
            dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
          )
          return hours + workHours
        }, 0)

      if (weeklyHours >= 15) {
        const holidayPay = employee.hourlyWage * 8
        suggestions.push({
          type: 'REDUCE_HOURS',
          title: `${employee.name} 근무시간 조정`,
          description: `주 ${weeklyHours.toFixed(1)}시간을 14시간으로 단축하여 주휴수당 절약`,
          currentCost: holidayPay,
          optimizedCost: 0,
          savings: holidayPay,
          riskLevel: 'LOW'
        })
      }

      // 긴 연속 근무 시간 분할 제안
      const longShifts = schedules.filter(s => {
        if (s.employeeId !== employee.id) return false
        const hours = dayjs(`${s.date} ${s.endTime}`).diff(
          dayjs(`${s.date} ${s.startTime}`), 'hour', true
        )
        return hours > 6
      })

      if (longShifts.length > 0) {
        suggestions.push({
          type: 'SPLIT_SCHEDULE',
          title: `${employee.name} 근무시간 분할`,
          description: `6시간 이상 연속 근무를 2-3시간씩 분할하여 효율성 증대`,
          currentCost: 0,
          optimizedCost: 0,
          savings: employee.hourlyWage * 0.5, // 휴게시간 효율성
          riskLevel: 'MEDIUM'
        })
      }
    })

    // 전체 스케줄 최적화
    if (currentHolidayPay > 0) {
      suggestions.push({
        type: 'ADJUST_BREAKS',
        title: '전체 스케줄 최적화',
        description: '모든 직원을 주 14시간 이하로 조정하여 주휴수당 완전 절약',
        currentCost: currentHolidayPay,
        optimizedCost: 0,
        savings: currentHolidayPay,
        riskLevel: 'HIGH'
      })
    }

    return suggestions
  }

  const optimizations = generateOptimizations()
  const totalSavings = optimizations.reduce((sum, opt) => sum + opt.savings, 0)

  // 리스크 레벨별 색상
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // 최적화된 스케줄 예시 생성
  const generateOptimizedSchedule = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (!employee) return []

    // 14시간을 3-4일에 분산 배치
    return [
      { day: '월', time: '09:00-13:00', hours: 4 },
      { day: '수', time: '14:00-18:00', hours: 4 },
      { day: '금', time: '09:00-13:00', hours: 4 },
      { day: '토', time: '16:00-18:00', hours: 2 }
    ]
  }

  return (
    <div className="space-y-6">
      {/* 최적화 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">절약 가능 총액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₩{totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              주간 기준
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최적화 제안</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizations.length}개</div>
            <p className="text-xs text-muted-foreground">
              실행 가능한 제안
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연간 절약액</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₩{(totalSavings * 52).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              52주 기준 예상
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">법적 리스크</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">낮음</div>
            <p className="text-xs text-muted-foreground">
              합법적 최적화
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 최적화 제안 상세 */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">최적화 제안</TabsTrigger>
          <TabsTrigger value="schedule">최적 스케줄</TabsTrigger>
          <TabsTrigger value="simulation">절약 시뮬레이션</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                인건비 최적화 제안
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((opt, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{opt.title}</h3>
                          <Badge className={getRiskColor(opt.riskLevel)}>
                            {opt.riskLevel === 'LOW' ? '안전' : opt.riskLevel === 'MEDIUM' ? '보통' : '주의'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {opt.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          ₩{opt.savings.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">절약</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">현재 비용</div>
                        <div className="font-medium">₩{opt.currentCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">최적화 후</div>
                        <div className="font-medium">₩{opt.optimizedCost.toLocaleString()}</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={selectedOptimization === `${index}` ? "default" : "outline"}
                      onClick={() => setSelectedOptimization(selectedOptimization === `${index}` ? null : `${index}`)}
                    >
                      {selectedOptimization === `${index}` ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          선택됨
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          이 제안 적용
                        </>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                최적화된 스케줄 예시
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {employees.map(employee => {
                  const optimizedSchedule = generateOptimizedSchedule(employee.id)
                  const totalHours = optimizedSchedule.reduce((sum, shift) => sum + shift.hours, 0)
                  
                  return (
                    <div key={employee.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{totalHours}시간/주</div>
                          <Badge variant="secondary">주휴수당 미적용</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {optimizedSchedule.map((shift, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded">
                            <div className="font-medium text-blue-900">{shift.day}요일</div>
                            <div className="text-sm text-blue-700">{shift.time}</div>
                            <div className="text-xs text-blue-600">{shift.hours}시간</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <div className="text-sm text-green-800">
                          <strong>절약 효과:</strong> 주휴수당 ₩{(employee.hourlyWage * 8).toLocaleString()} 절약
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                절약 시뮬레이션
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">현재 상황</h3>
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      ₩{calculateCurrentHolidayPay().toLocaleString()}
                    </div>
                    <div className="text-sm text-red-700">주간 주휴수당</div>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">최적화 후</h3>
                    <div className="text-2xl font-bold text-green-600 mb-2">₩0</div>
                    <div className="text-sm text-green-700">주간 주휴수당</div>
                  </div>
                  
                  <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">연간 절약</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      ₩{(calculateCurrentHolidayPay() * 52).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">52주 기준</div>
                  </div>
                </div>

                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-3">⚠️ 주의사항</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• 근로자의 소득 감소가 발생할 수 있습니다</li>
                    <li>• 업무 연속성과 서비스 품질을 고려해야 합니다</li>
                    <li>• 근로기준법 준수 범위 내에서 진행해야 합니다</li>
                    <li>• 근로자와의 충분한 협의가 필요합니다</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 실행 버튼 */}
      <div className="flex gap-4">
        <Button size="lg">
          <Target className="h-4 w-4 mr-2" />
          선택한 최적화 적용
        </Button>
        <Button variant="outline" size="lg">
          <Calendar className="h-4 w-4 mr-2" />
          스케줄 자동 조정
        </Button>
        <Button variant="outline" size="lg">
          <Users className="h-4 w-4 mr-2" />
          직원과 협의하기
        </Button>
      </div>
    </div>
  )
}

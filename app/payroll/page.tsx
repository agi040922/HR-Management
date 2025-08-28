'use client'

import React, { useState, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Component imports
import PayrollHeatmap from '@/components/(page)/payroll/PayrollHeatmap'
import PayrollStatementCreator from '@/components/(page)/payroll/PayrollStatementCreator'

// API imports
import {
  getUserStoresForPayroll,
  getActiveTemplatesForPayroll,
  calculateMonthlyPayroll,
  type MonthlyPayrollSummary
} from '@/lib/api/(page)/payroll/payroll-test-api'

import {
  type StoreData,
  type TemplateData
} from '@/lib/api/(page)/schedule/exceptions/exceptions-api'

export default function PayrollPage() {
  const { user, loading: authLoading } = useAuth()
  
  // 기본 상태
  const [stores, setStores] = useState<StoreData[]>([])
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  
  // 계산 설정
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  
  // 계산 결과
  const [payrollResult, setPayrollResult] = useState<MonthlyPayrollSummary | null>(null)
  
  // UI 상태
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  // 년/월 옵션 생성
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}월`
  }))

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores()
    }
  }, [user])

  // 스토어 변경 시 템플릿 로드
  useEffect(() => {
    if (selectedStore) {
      loadTemplates(selectedStore.id)
    }
  }, [selectedStore])

  // 스토어 목록 로드
  const loadStores = async () => {
    try {
      setLoading(true)
      setError(null)
      const storeList = await getUserStoresForPayroll(user!.id)
      setStores(storeList)
      
      if (storeList.length > 0 && !selectedStore) {
        setSelectedStore(storeList[0])
      }
    } catch (err) {
      console.error('스토어 목록 로드 오류:', err)
      setError('스토어 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 템플릿 목록 로드
  const loadTemplates = async (storeId: number) => {
    try {
      const templateList = await getActiveTemplatesForPayroll(storeId)
      setTemplates(templateList)
      
      if (templateList.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templateList[0])
      } else if (templateList.length === 0) {
        setSelectedTemplate(null)
      }
    } catch (err) {
      console.error('템플릿 목록 로드 오류:', err)
      setError('템플릿 목록을 불러오는데 실패했습니다')
    }
  }

  // 급여 계산 실행
  const handleCalculatePayroll = async () => {
    if (!selectedStore || !selectedTemplate) {
      setError('스토어와 템플릿을 선택해주세요')
      return
    }

    try {
      setCalculating(true)
      setError(null)
      
      const result = await calculateMonthlyPayroll(
        selectedStore.id,
        selectedTemplate.id,
        selectedYear,
        selectedMonth
      )
      
      setPayrollResult(result)
    } catch (err) {
      console.error('급여 계산 오류:', err)
      setError('급여 계산 중 오류가 발생했습니다')
    } finally {
      setCalculating(false)
    }
  }

  // 로딩 상태
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 relative">
                <h1 className="text-3xl font-bold text-gray-900">급여 계산 테스트</h1>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                {showHelp && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowHelp(false)}
                    />
                    <div className="absolute top-8 left-0 z-50 w-80 p-4 bg-white rounded-lg border shadow-lg">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">급여 계산 가이드:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• 스토어와 스케줄 템플릿을 선택하세요</li>
                          <li>• 계산할 년도와 월을 설정하세요</li>
                          <li>• 템플릿 기반으로 기본 급여를 계산합니다</li>
                          <li>• 예외사항을 반영하여 최종 급여를 산출합니다</li>
                          <li>• 히트맵으로 근무 현황을 확인할 수 있습니다</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 드롭다운 컨트롤들 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">스토어</label>
                  <Select
                    value={selectedStore?.id.toString() || ''}
                    onValueChange={(value) => {
                      const store = stores.find(s => s.id.toString() === value)
                      setSelectedStore(store || null)
                      setPayrollResult(null)
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.store_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">템플릿</label>
                  <Select
                    value={selectedTemplate?.id.toString() || ''}
                    onValueChange={(value) => {
                      const template = templates.find(t => t.id.toString() === value)
                      setSelectedTemplate(template || null)
                      setPayrollResult(null)
                    }}
                    disabled={templates.length === 0}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.template_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">기간</label>
                  <div className="flex gap-1">
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => {
                        setSelectedYear(parseInt(value))
                        setPayrollResult(null)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) => {
                        setSelectedMonth(parseInt(value))
                        setPayrollResult(null)
                      }}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.value}월
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCalculatePayroll}
                  disabled={!selectedStore || !selectedTemplate || calculating}
                  variant="default"
                  size="sm"
                >
                  {calculating ? '계산 중...' : '계산'}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            스케줄 템플릿과 예외사항을 종합하여 정확한 월별 급여를 계산합니다.
          </p>
        </div>

                {/* 오류 및 안내 메시지 */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {selectedStore && templates.length === 0 && (
          <Alert className="mb-6">
            <AlertDescription className="text-amber-600">
              선택된 스토어에 활성화된 스케줄 템플릿이 없습니다. 
              먼저 스케줄 템플릿을 생성해주세요.
            </AlertDescription>
          </Alert>
        )}

        {/* 계산 결과 */}
        {payrollResult && (
          <div className="space-y-6">
            {/* 요약 통계 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                급여 계산 결과 ({payrollResult.year}년 {payrollResult.month}월)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">총 직원 수</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {payrollResult.totalEmployees.toLocaleString()}명
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">기본 급여 총액</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {payrollResult.totalBasePay.toLocaleString()}원
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">예외사항 조정</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {payrollResult.totalExceptionAdjustments >= 0 ? '+' : ''}
                    {payrollResult.totalExceptionAdjustments.toLocaleString()}원
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">최종 급여 총액</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {payrollResult.totalFinalPay.toLocaleString()}원
                  </div>
                </div>
              </div>
            </div>

            {/* 직원별 상세 결과 - 탭으로 구성 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  직원별 상세
                </h2>
              </div>
              
              <div className="p-6">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">급여 요약</TabsTrigger>
                    <TabsTrigger value="heatmap">근무 히트맵</TabsTrigger>
                    <TabsTrigger value="statement">급여명세서</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="mt-6">
                    <div className="space-y-6">
                      {payrollResult.employees.map((employeeResult) => (
                        <div key={employeeResult.employee.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {employeeResult.employee.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {employeeResult.employee.position} • 시급: {employeeResult.employee.hourly_wage.toLocaleString()}원
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                {employeeResult.totalPay.toLocaleString()}원
                              </div>
                              <p className="text-sm text-gray-500">최종 급여</p>
                            </div>
                          </div>
                          
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* 근무 시간 정보 */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">근무 시간</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">기본 월 근무:</span>
                                    <span>{employeeResult.baseSchedule.monthlyHours.toLocaleString()}시간</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">최종 월 근무:</span>
                                    <span className={
                                      employeeResult.finalSchedule.monthlyHours !== employeeResult.baseSchedule.monthlyHours
                                        ? 'font-medium text-blue-600'
                                        : ''
                                    }>
                                      {employeeResult.finalSchedule.monthlyHours.toLocaleString()}시간
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 급여 정보 */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">급여 내역</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">기본급:</span>
                                    <span>{employeeResult.monthlySalary.grossSalary.toLocaleString()}원</span>
                                  </div>
                                                                <div className="flex justify-between">
                                <span className="text-gray-600">예외조정:</span>
                                <span className="text-gray-900">
                                  {employeeResult.exceptionAdjustments.reduce((sum, adj) => sum + adj.payDifference, 0) >= 0 ? '+' : ''}
                                  {employeeResult.exceptionAdjustments.reduce((sum, adj) => sum + adj.payDifference, 0).toLocaleString()}원
                                </span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-900">실수령액:</span>
                                <span className="text-gray-900">{employeeResult.netSalary.netSalary.toLocaleString()}원</span>
                              </div>
                                </div>
                              </div>

                              {/* 예외사항 */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  예외사항 ({employeeResult.exceptionAdjustments.length}건)
                                </h4>
                                <div className="space-y-1 text-sm max-h-20 overflow-y-auto">
                                  {employeeResult.exceptionAdjustments.length > 0 ? (
                                    employeeResult.exceptionAdjustments.map((adjustment, index) => (
                                      <div key={index} className="flex justify-between text-xs">
                                                                            <span className="text-gray-600">
                                      {adjustment.date} 
                                      <Badge variant="outline" className="ml-1 text-xs px-1 py-0">
                                        {adjustment.type === 'CANCEL' ? '휴무' : 
                                         adjustment.type === 'OVERRIDE' ? '변경' : '추가'}
                                      </Badge>
                                    </span>
                                    <span className="text-gray-900">
                                      {adjustment.payDifference >= 0 ? '+' : ''}
                                      {adjustment.payDifference.toLocaleString()}원
                                    </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-xs">예외사항 없음</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                                    <TabsContent value="heatmap" className="mt-6">
                    <div className="space-y-6">
                      {payrollResult.employees.map((employeeResult) => (
                        <PayrollHeatmap
                          key={employeeResult.employee.id}
                          employee={employeeResult}
                          year={payrollResult.year}
                          month={payrollResult.month}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                                    <TabsContent value="statement" className="mt-6">
                    <div className="space-y-8">
                      {payrollResult.employees.map((employeeResult) => (
                        <PayrollStatementCreator
                          key={employeeResult.employee.id}
                          employee={employeeResult}
                          year={payrollResult.year}
                          month={payrollResult.month}
                          storeName={payrollResult.store.store_name}
              />
            ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* 스토어 없음 안내 */}
        {stores.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 스토어가 없습니다</h3>
            <p className="text-gray-500 mb-4">급여를 계산하려면 먼저 스토어를 등록해주세요.</p>
            <Button
              onClick={() => window.open('/stores', '_blank')}
              variant="outline"
            >
              스토어 등록하기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
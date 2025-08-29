'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Target,
  Loader2,
  Sparkles,
  Zap,
  Shield,
  TrendingDown,
  Activity,
  FileText,
  Star,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

// API 및 유틸리티 임포트
import { analyzePayrollAndSchedule, getPayrollOptimizationSuggestions, PayrollAnalysisData, AnalysisResult } from '@/lib/api/(page)/analytics/gemini-api'
import { calculateMonthlySalary, calculateNetSalary, calculateEmployerCost } from '@/lib/payroll-calculator-2025'
import { getUserStores, getStoreEmployees, getStoreExceptions, getStoreTemplates, getThisWeekExceptions } from '@/lib/api/(page)/schedule/exceptions/exceptions-api'

export default function AnalyticsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [storeData, setStoreData] = useState<any[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)

  // 테스트용 사용자 ID (실제로는 인증에서 가져와야 함)
  const userId = '56bdf71b-67fd-496f-ae37-011ed3a6bb81'

  useEffect(() => {
    loadStoreData()
  }, [])

  const loadStoreData = async () => {
    try {
      const stores = await getUserStores(userId)
      setStoreData(stores)
      if (stores.length > 0) {
        setSelectedStoreId(stores[0].id)
      }
    } catch (error) {
      console.error('스토어 데이터 로드 오류:', error)
      setError('스토어 데이터를 불러오는 중 오류가 발생했습니다.')
    }
  }

  const runAnalysis = async () => {
    console.log('🚀 AI 분석 시작')
    
    if (!selectedStoreId) {
      console.log('❌ 매장 선택 오류')
      setError('매장을 선택해주세요.')
      return
    }

    console.log('✅ 선택된 매장 ID:', selectedStoreId)
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      // 1. 직원 데이터 가져오기
      const employees = await getStoreEmployees(selectedStoreId, userId)
      
      // 2. 예외사항 데이터 가져오기
      const allExceptions = await getStoreExceptions(selectedStoreId)
      const thisWeekExceptions = getThisWeekExceptions(allExceptions)
      
      // 3. 스케줄 템플릿 데이터 가져오기
      const templates = await getStoreTemplates(selectedStoreId)
      const activeTemplate = templates.find(t => t.is_active) || templates[0]

      // 4. 급여 계산 수행
      const payrollCalculations = employees.map(employee => {
        const weeklyHours = (employee as any).weekly_work_hours || 40
        const monthlySalary = calculateMonthlySalary(weeklyHours, employee.hourly_wage)
        const netSalary = calculateNetSalary(monthlySalary.grossSalary)
        const employerCost = calculateEmployerCost(monthlySalary.grossSalary)

        return {
          grossSalary: monthlySalary.grossSalary,
          netSalary: netSalary.netSalary,
          employerCost: employerCost.totalCost,
          totalWorkingHours: monthlySalary.totalWorkingHours,
          holidayHours: monthlySalary.holidayHours
        }
      })

      console.log('🤖 AI 분석 데이터 준비 중...')
      // 5. AI 분석용 데이터 구성
      const analysisData: PayrollAnalysisData = {
        employeeData: employees.map(emp => ({
          name: emp.name,
          hourlyWage: emp.hourly_wage,
          weeklyHours: (emp as any).weekly_work_hours || 40,
          position: emp.position
        })),
        payrollCalculations,
        exceptions: thisWeekExceptions,
        scheduleTemplate: activeTemplate?.schedule_data || {},
        currentDate: new Date().toISOString().split('T')[0]
      }

      console.log('📋 분석 데이터 구성:', {
        직원수: analysisData.employeeData.length,
        급여계산: analysisData.payrollCalculations.length,
        예외사항: analysisData.exceptions.length,
        날짜: analysisData.currentDate
      })
      
      console.log('🧠 Gemini AI 분석 시작...')
      const result = await analyzePayrollAndSchedule(analysisData)
      console.log('✅ AI 분석 완료:', result)
      
      setAnalysisResult(result)

      // 7. 최적화 제안 가져오기
      const totalWeeklyHours = employees.reduce((sum, emp) => sum + ((emp as any).weekly_work_hours || 40), 0)
      const avgHourlyWage = employees.reduce((sum, emp) => sum + emp.hourly_wage, 0) / employees.length
      const suggestions = await getPayrollOptimizationSuggestions(totalWeeklyHours, avgHourlyWage, employees.length)
      setOptimizationSuggestions(suggestions)

    } catch (error) {
      console.error('❌ 분석 오류 발생:', error)
      console.error('❌ 오류 상세 정보:', {
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : null,
        type: typeof error
      })
      setError(`분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      console.log('🏁 분석 종료')
      setIsAnalyzing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cost': return <DollarSign className="w-4 h-4" />
      case 'schedule': return <Calendar className="w-4 h-4" />
      case 'compliance': return <AlertTriangle className="w-4 h-4" />
      case 'efficiency': return <TrendingUp className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              AI 급여 & 스케줄 분석
            </h1>
            <div className="group relative">
              <button className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="absolute left-0 top-8 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <p className="text-sm text-gray-600">
                  Gemini AI를 활용하여 현재 급여 구조와 스케줄을 분석하고 최적화 방안을 제안합니다. 2025년 한국 노동법 기준으로 법적 준수사항을 검토합니다.
                </p>
              </div>
            </div>
            
            {storeData.length > 0 && (
              <div className="relative">
                <select 
                  value={selectedStoreId || ''} 
                  onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  {storeData.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.store_name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing || !selectedStoreId}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                분석 중...
              </>
            ) : (
              '분석 시작'
            )}
          </Button>
        </div>
        
        <p className="text-gray-600">
          급여 최적화, 스케줄 효율성, 법적 준수사항을 종합 분석합니다.
        </p>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 분석 진행 상태 */}
      {isAnalyzing && (
        <div className="border border-gray-200 rounded-lg p-8">
          <div className="text-center space-y-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI 분석 진행 중</h3>
              <p className="text-gray-600">
                급여 계산, 스케줄 효율성, 법적 준수사항을 분석하고 있습니다.
              </p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
              <div className="bg-gray-600 h-2 rounded-full transition-all duration-500" style={{width: '65%'}}></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm text-gray-500">
              <div>급여 분석</div>
              <div>스케줄 검토</div>
              <div>법적 준수</div>
            </div>
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {analysisResult && (
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">분석 요약</TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">권장사항</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">상세 분석</TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">실행 계획</TabsTrigger>
          </TabsList>

          {/* 분석 요약 */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">총 급여 비용</h3>
                    <p className="text-2xl font-bold text-gray-900">{analysisResult.summary.totalPayrollCost.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">직원 수</h3>
                    <p className="text-2xl font-bold text-gray-900">{analysisResult.summary.employeeCount}명</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">효율성 점수</h3>
                    <p className="text-2xl font-bold text-gray-900">{analysisResult.summary.efficiencyScore}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">준수율</h3>
                    <p className="text-2xl font-bold text-gray-900">{analysisResult.summary.complianceRate}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 인사이트</h3>
              <div className="space-y-3">
                {analysisResult.summary.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-600 text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 권장사항 */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-4">
              {analysisResult.recommendations.map((rec, index) => {
                const priorityLabels = {
                  high: '높음',
                  medium: '보통',
                  low: '낮음'
                }
                
                return (
                  <div key={index} className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {rec.title}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">{rec.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-600 border-gray-300">
                        {priorityLabels[rec.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </div>
                    <p className="text-sm mb-4 text-gray-700">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>예상 절약: {rec.expectedSavings?.toLocaleString() || 'N/A'}원</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>구현 기간: {rec.implementationTime}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* 상세 분석 */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {analysisResult.insights.map((insight, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-600 mb-4">{insight.description}</p>
                      
                      {insight.metrics && insight.metrics.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {insight.metrics.map((metric, metricIndex) => (
                            <div key={metricIndex} className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                              <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                              {metric.change && (
                                <div className="text-sm flex items-center gap-1 mt-1 text-gray-600">
                                  {metric.change.startsWith('+') && <TrendingUp className="w-3 h-3" />}
                                  {metric.change.startsWith('-') && <TrendingDown className="w-3 h-3" />}
                                  <span>{metric.change}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 권장사항 */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-4">
              {analysisResult.recommendations.map((rec, index) => {
                const priorityLabels = {
                  high: '높음',
                  medium: '보통',
                  low: '낮음'
                }
                
                return (
                  <div key={index} className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {rec.title}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">{rec.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-600 border-gray-300">
                        {priorityLabels[rec.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </div>
                    <p className="text-sm mb-4 text-gray-700">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>예상 절약: {rec.expectedSavings?.toLocaleString() || 'N/A'}원</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>구현 기간: {rec.implementationTime || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* 상세 분석 */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {analysisResult.insights.map((insight, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                <p className="text-gray-600 mb-4">{insight.description}</p>
                
                {insight.metrics && insight.metrics.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insight.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                        <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                        {metric.change && (
                          <div className="text-sm flex items-center gap-1 mt-1 text-gray-600">
                            {metric.change.startsWith('+') && <TrendingUp className="w-3 h-3" />}
                            {metric.change.startsWith('-') && <TrendingDown className="w-3 h-3" />}
                            <span>{metric.change}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TabsContent>

    {/* 실행 계획 */}
    <TabsContent value="actions" className="space-y-6">
      <div className="grid gap-4">
        {analysisResult.actionPlan.map((action, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-bold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 mb-4">{action.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>기간: {action.timeline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>담당: {action.responsible}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>예산: {action.estimatedCost?.toLocaleString() || 'N/A'}원</span>
                  </div>
                </div>
                
                {action.steps && action.steps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">세부 단계:</h4>
                    <ul className="space-y-1">
                      {action.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TabsContent>
  </Tabs>
)}

{/* 시작 안내 */}
{!analysisResult && !isAnalyzing && (
  <div className="text-center py-16">
    <div className="max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <BarChart3 className="w-8 h-8 text-gray-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        AI 급여 분석을 시작해보세요
      </h2>
      <p className="text-gray-600 mb-8">
        급여 계산, 스케줄 효율성, 법적 준수사항을 종합적으로 분석하여<br />
        비용 절약과 효율성 향상 방안을 제시합니다.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">직원 데이터 분석</h3>
          <p className="text-gray-600 text-sm">
            급여 계산, 근무 시간, 예외사항 등을 종합적으로 분석하여 최적화 방안을 도출합니다.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">급여 최적화</h3>
          <p className="text-gray-600 text-sm">
            비용 절약 방안과 법적 준수사항을 고려한 급여 구조 개선안을 제시합니다.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">스케줄 효율성</h3>
          <p className="text-gray-600 text-sm">
            근무 스케줄의 효율성을 평가하고 인력 배치 최적화 방안을 제안합니다.
          </p>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        2025년 노동법 기준 • AI 기반 인사이트 • 실시간 분석
      </div>
    </div>
  </div>
)}
    </div>
  )
}

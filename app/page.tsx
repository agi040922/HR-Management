"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  Calculator, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  FileSpreadsheet, 
  Database, 
  ClipboardList,
  Clock,
  DollarSign,
  Plus,
  ArrowRight,
  Activity,
  Briefcase,
  Target,
  Settings,
  HelpCircle,
  Copy,
  ExternalLink,
  Star,
  Zap,
  Brain,
  CheckCircle,
  Circle,
  Play,
  ChevronRight,
  Store,
  UserPlus,
  CalendarPlus,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

// API imports
import { getStoresWithDetails } from "@/lib/api/(page)/stores/stores-api"
import { fetchEmployees } from "@/lib/api/(page)/employees/employees-api"
import { loadTemplates } from "@/lib/api/(page)/schedule/view/scheduleApi"
import { getStoreExceptions } from "@/lib/api/(page)/schedule/exceptions/exceptions-api"

// 단계별 프로세스 타입 정의
type ProcessStep = {
  id: number
  title: string
  description: string
  icon: any
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  path: string
  data?: any
}

export default function Home() {
  const { user, loading } = useAuth()
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    {
      id: 1,
      title: "스토어 설정",
      description: "매장 정보 및 기본 설정을 등록합니다",
      icon: Store,
      status: 'pending',
      path: '/stores'
    },
    {
      id: 2,
      title: "직원 등록",
      description: "직원 정보를 등록하고 스케줄 템플릿에 연결합니다",
      icon: UserPlus,
      status: 'pending',
      path: '/employees'
    },
    {
      id: 3,
      title: "스케줄 관리",
      description: "주간 근무 스케줄을 설정하고 관리합니다",
      icon: CalendarPlus,
      status: 'pending',
      path: '/schedule/view'
    },
    {
      id: 4,
      title: "예외사항 처리",
      description: "근무 예외사항을 등록하고 관리합니다",
      icon: AlertCircle,
      status: 'pending',
      path: '/schedule/exceptions'
    }
  ])

  const [currentStep, setCurrentStep] = useState(1)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [showStepGuide, setShowStepGuide] = useState(false)

  // 프로세스 상태 확인
  useEffect(() => {
    if (user) {
      checkProcessStatus()
    }
  }, [user])

  const checkProcessStatus = async () => {
    if (!user) return
    
    try {
      setLoadingStatus(true)
      
      // 1단계: 스토어 확인
      const stores = await getStoresWithDetails(user.id)
      const storeStatus = stores.length > 0 ? 'completed' : 'pending'
      
      // 2단계: 직원 확인
      const employees = await fetchEmployees(user.id)
      const employeeStatus = employees.length > 0 ? 'completed' : 'pending'
      
      // 3단계: 스케줄 템플릿 확인
      let templateStatus = 'pending'
      if (stores.length > 0) {
        try {
          const templates = await loadTemplates(stores[0].id)
          templateStatus = templates.length > 0 ? 'completed' : 'pending'
        } catch (error) {
          templateStatus = 'pending'
        }
      }
      
      // 4단계: 예외사항 확인
      let exceptionStatus = 'pending'
      if (stores.length > 0) {
        try {
          const exceptions = await getStoreExceptions(stores[0].id)
          exceptionStatus = exceptions.length > 0 ? 'completed' : 'pending'
        } catch (error) {
          exceptionStatus = 'pending'
        }
      }
      
      // 상태 업데이트
      setProcessSteps(prev => prev.map(step => {
        switch (step.id) {
          case 1:
            return { ...step, status: storeStatus as ProcessStep['status'], data: { count: stores.length } }
          case 2:
            return { ...step, status: employeeStatus as ProcessStep['status'], data: { count: employees.length } }
          case 3:
            return { ...step, status: templateStatus as ProcessStep['status'] }
          case 4:
            return { ...step, status: exceptionStatus as ProcessStep['status'] }
          default:
            return step
        }
      }))
      
      // 현재 단계 설정
      if (storeStatus === 'pending') {
        setCurrentStep(1)
      } else if (employeeStatus === 'pending') {
        setCurrentStep(2)
      } else if (templateStatus === 'pending') {
        setCurrentStep(3)
      } else if (exceptionStatus === 'pending') {
        setCurrentStep(4)
      } else {
        setCurrentStep(5) // 모든 단계 완료
      }
      
    } catch (error) {
      console.error('프로세스 상태 확인 오류:', error)
      toast.error('프로세스 상태를 확인하는데 실패했습니다')
    } finally {
      setLoadingStatus(false)
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) return 'border-blue-500 bg-blue-50'
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  if (loading || loadingStatus) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">시스템 상태를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">HR 관리 시스템</h1>
              <div className="relative group">
                <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" />
                <div className="absolute left-0 top-6 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <p className="text-sm text-gray-600">
                    1-4단계 프로세스를 통해 HR 업무를 체계적으로 설정하고 관리할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStepGuide(!showStepGuide)}
              >
                단계별 가이드
              </Button>
              <Button variant="outline" size="sm">
                설정
              </Button>
            </div>
          </div>
        </div>

        {/* 컴팩트 프로세스 배너 */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm font-semibold text-gray-900">HR 관리 프로세스를 위한 첫단계😀</h2>
                <Badge variant="outline" className="text-xs">
                  {processSteps.filter(s => s.status === 'completed').length}/{processSteps.length} 완료
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={checkProcessStatus}
                disabled={loadingStatus}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-6 px-2 text-xs"
              >
                새로고침
              </Button>
            </div>
            
            {/* 컴팩트 단계 표시 */}
            <div className="flex items-center justify-between">
              {processSteps.map((step, index) => {
                const isCurrent = step.id === currentStep
                const Icon = step.icon
                
                // 단계별 안내 메시지
                const getStepGuideMessage = (stepId: number, status: string) => {
                  switch (stepId) {
                    case 1:
                      return status === 'completed' ? '스토어가 설정되었습니다' : '스토어를 만들어보세요'
                    case 2:
                      return status === 'completed' ? '직원이 등록되었습니다' : '직원을 등록해보세요'
                    case 3:
                      return status === 'completed' ? '스케줄이 설정되었습니다' : '스케줄을 설정해보세요'
                    case 4:
                      return status === 'completed' ? '예외사항이 등록되었습니다' : '예외사항을 관리해보세요'
                    default:
                      return ''
                  }
                }
                
                return (
                  <Link key={step.id} href={step.path} className="flex-1">
                    <div className={`flex items-center space-x-2 p-3 rounded-md transition-all hover:bg-gray-50 cursor-pointer ${
                      isCurrent ? 'bg-gray-50 border border-gray-300' : ''
                    }`}>
                      <div className="flex items-center space-x-1">
                        {getStepStatusIcon(step.status)}
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{step.title}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {getStepGuideMessage(step.id, step.status)}
                        </p>
                        {step.data?.count !== undefined && (
                          <p className="text-xs text-blue-600">{step.data.count}개</p>
                        )}
                      </div>
                      {isCurrent && (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* 단계별 가이드 (토글) */}
        {showStepGuide && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">단계별 진행 가이드</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <h4 className="font-medium text-blue-900">스토어 설정</h4>
                  <p className="text-sm text-blue-700">매장명, 영업시간, 시간 슬롯 등 기본 정보를 설정합니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <h4 className="font-medium text-blue-900">직원 등록</h4>
                  <p className="text-sm text-blue-700">직원 정보를 등록하고 스케줄 템플릿에 연결합니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <h4 className="font-medium text-blue-900">스케줄 관리</h4>
                  <p className="text-sm text-blue-700">주간 근무 스케줄을 설정하고 직원을 배치합니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <div>
                  <h4 className="font-medium text-blue-900">예외사항 처리</h4>
                  <p className="text-sm text-blue-700">휴가, 지각, 조기퇴근 등 예외사항을 등록합니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 주요 기능 카드 그리드 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">추가 기능</h2>
            <div className="relative group">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-5 w-48 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <p className="text-xs text-gray-600">
                  각 카드를 클릭하여 해당 기능으로 이동할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/payroll">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">급여 계산</h3>
                      <p className="text-sm text-gray-500 mt-1">급여 및 수당 계산</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">급여 분석</h3>
                      <p className="text-sm text-gray-500 mt-1">급여 데이터 분석 및 리포트</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/test/labor-contract">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">근로계약서</h3>
                      <p className="text-sm text-gray-500 mt-1">계약서 작성 및 관리</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/components/dashboard">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">대시보드</h3>
                      <p className="text-sm text-gray-500 mt-1">전체 현황 및 통계</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* 빠른 시작 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">빠른 시작</h2>
            <div className="relative group">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-5 w-48 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <p className="text-xs text-gray-600">
                  자주 사용하는 기능들에 빠르게 접근할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/test/comprehensive">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">종합 테스트</h3>
                      <p className="text-xs text-gray-500">모든 기능 테스트</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/data-library">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">데이터 라이브러리</h3>
                      <p className="text-xs text-gray-500">데이터 관리</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">보고서</h3>
                      <p className="text-xs text-gray-500">리포트 생성</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

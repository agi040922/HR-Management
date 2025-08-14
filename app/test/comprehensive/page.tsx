'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Store, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Calculator,
  TrendingUp,
  Clock,
  Plus,
  FileText
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Settings, { SettingsButton } from '@/components/Settings'

// 타입 정의
interface DashboardStats {
  totalStores: number
  totalEmployees: number
  totalTemplates: number
  thisWeekExceptions: number
}

interface StoreData {
  id: number
  owner_id: string
  open_time: string
  close_time: string
  time_slot_minutes: number
  created_at: string
  updated_at: string
}

interface EmployeeData {
  id: number
  store_id?: number
  name: string
  hourly_wage: number
  position?: string
  phone?: string
  is_active: boolean
}

interface ExceptionData {
  id: number
  store_id?: number
  employee_id?: number
  date: string
  exception_type: string
  notes?: string
}



export default function ComprehensiveDashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalStores: 0,
    totalEmployees: 0,
    totalTemplates: 0,
    thisWeekExceptions: 0
  })
  const [stores, setStores] = useState<StoreData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [exceptions, setExceptions] = useState<ExceptionData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // 설정 관련 상태
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoadingData(true)

      // 스토어 데이터 로드
      const { data: storesData, error: storesError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', user?.id)

      if (storesError) {
        console.error('스토어 데이터 로드 오류:', storesError)
      } else {
        setStores(storesData || [])
      }

      // 직원 데이터 로드
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)

      if (employeesError) {
        console.error('직원 데이터 로드 오류:', employeesError)
      } else {
        setEmployees(employeesData || [])
      }

      // 이번주 예외사항 로드
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const { data: exceptionsData, error: exceptionsError } = await supabase
        .from('schedule_exceptions')
        .select('*')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])

      if (exceptionsError) {
        console.error('예외사항 데이터 로드 오류:', exceptionsError)
      } else {
        setExceptions(exceptionsData || [])
      }

      // 주간 템플릿 수 조회
      const { count: templatesCount, error: templatesError } = await supabase
        .from('weekly_schedule_templates')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (templatesError) {
        console.error('템플릿 수 조회 오류:', templatesError)
      }

      // 통계 업데이트
      setStats({
        totalStores: storesData?.length || 0,
        totalEmployees: employeesData?.length || 0,
        totalTemplates: templatesCount || 0,
        thisWeekExceptions: exceptionsData?.length || 0
      })

    } catch (error) {
      console.error('대시보드 데이터 로드 중 오류:', error)
    } finally {
      setLoadingData(false)
    }
  }



  const quickActions = [
    {
      title: '새 스토어 생성',
      description: '새로운 스토어를 추가하고 설정합니다',
      icon: Store,
      href: '/test/comprehensive/stores',
      color: 'bg-blue-500'
    },
    {
      title: '직원 등록',
      description: '새로운 직원을 등록합니다',
      icon: Users,
      href: '/test/comprehensive/employees',
      color: 'bg-green-500'
    },
    {
      title: '근로계약서 작성',
      description: '표준 근로계약서를 작성하고 PDF로 생성합니다',
      icon: FileText,
      href: '/test/labor-contract',
      color: 'bg-indigo-500'
    },
    {
      title: '주간 템플릿 생성',
      description: '반복되는 주간 스케줄을 만듭니다',
      icon: Calendar,
      href: '/test/comprehensive/templates',
      color: 'bg-purple-500'
    },
    {
      title: '예외사항 등록',
      description: '특별한 스케줄 변경사항을 등록합니다',
      icon: AlertTriangle,
      href: '/test/comprehensive/exceptions',
      color: 'bg-orange-500'
    }
  ]

  const recentActivities = [
    {
      type: 'store',
      message: '강남점 스토어가 생성되었습니다',
      time: '2시간 전',
      icon: Store
    },
    {
      type: 'employee',
      message: '김철수님이 직원으로 등록되었습니다',
      time: '3시간 전',
      icon: Users
    },
    {
      type: 'exception',
      message: '8월 15일 광복절 휴무가 등록되었습니다',
      time: '1일 전',
      icon: AlertTriangle
    }
  ]

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">HR 관리 시스템 전체 현황을 확인하세요</p>
        </div>
        <SettingsButton onClick={() => setShowSettingsModal(true)} />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 스토어</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 직원</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">주간 템플릿</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">이번주 예외사항</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeekExceptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 작업 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 ${action.color} rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 최근 활동 및 현재 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>최근 활동</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 이번주 예외사항 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>이번주 예외사항</span>
              </div>
              <Link href="/test/comprehensive/exceptions">
                <Button variant="outline" size="sm">
                  전체 보기
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exceptions.length > 0 ? (
                exceptions.slice(0, 3).map((exception) => (
                  <div key={exception.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{exception.date}</p>
                      <p className="text-xs text-gray-600">{exception.notes}</p>
                    </div>
                    <Badge variant={exception.exception_type === 'CANCEL' ? 'destructive' : 'default'}>
                      {exception.exception_type === 'CANCEL' ? '휴무' : 
                       exception.exception_type === 'OVERRIDE' ? '변경' : '추가'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  이번주 예외사항이 없습니다
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 급여 계산 바로가기 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">급여 계산</h3>
                <p className="text-sm text-gray-600">
                  직원들의 근무시간을 바탕으로 급여를 계산하고 분석합니다
                </p>
              </div>
            </div>
            <Link href="/test/comprehensive/payroll">
              <Button>
                급여 계산하기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 설정 모달 */}
      <Settings 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        onSettingsChange={(settings, preferences) => {
          console.log('설정이 변경되었습니다:', { settings, preferences })
        }}
      />
    </div>
  )
}

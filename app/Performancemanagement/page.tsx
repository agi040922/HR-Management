'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Star,
  Calendar,
  HelpCircle,
  Filter,
  Search,
  BarChart3,
  Award,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  ExternalLink,
  Settings,
  Activity,
  Database,
  FileText,
  Zap,
  Brain,
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

// 예제 데이터 타입
interface PerformanceGoal {
  id: number
  employee_id: number
  employee_name: string
  title: string
  description: string
  target_value: number
  current_value: number
  unit: string
  category: 'sales' | 'productivity' | 'quality' | 'attendance' | 'customer'
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'completed' | 'overdue' | 'paused'
  start_date: string
  end_date: string
  created_at: string
}

interface PerformanceReview {
  id: number
  employee_id: number
  employee_name: string
  reviewer_name: string
  period: string
  overall_score: number
  categories: {
    productivity: number
    quality: number
    teamwork: number
    communication: number
    leadership: number
  }
  comments: string
  status: 'draft' | 'completed' | 'pending_approval'
  created_at: string
}

// 예제 데이터
const mockGoals: PerformanceGoal[] = [
  {
    id: 1,
    employee_id: 1,
    employee_name: '김민수',
    title: '월 매출 목표 달성',
    description: '이번 달 개인 매출 500만원 달성',
    target_value: 5000000,
    current_value: 3200000,
    unit: '원',
    category: 'sales',
    priority: 'high',
    status: 'active',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    created_at: '2025-01-01'
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: '이영희',
    title: '고객 만족도 향상',
    description: '고객 만족도 평점 4.5점 이상 유지',
    target_value: 4.5,
    current_value: 4.2,
    unit: '점',
    category: 'customer',
    priority: 'medium',
    status: 'active',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    created_at: '2025-01-01'
  },
  {
    id: 3,
    employee_id: 3,
    employee_name: '박철수',
    title: '출근율 개선',
    description: '월 출근율 95% 이상 달성',
    target_value: 95,
    current_value: 88,
    unit: '%',
    category: 'attendance',
    priority: 'high',
    status: 'overdue',
    start_date: '2024-12-01',
    end_date: '2025-01-31',
    created_at: '2024-12-01'
  }
]

const mockReviews: PerformanceReview[] = [
  {
    id: 1,
    employee_id: 1,
    employee_name: '김민수',
    reviewer_name: '관리자',
    period: '2024년 4분기',
    overall_score: 4.2,
    categories: {
      productivity: 4.5,
      quality: 4.0,
      teamwork: 4.3,
      communication: 4.1,
      leadership: 3.8
    },
    comments: '전반적으로 우수한 성과를 보였으며, 특히 생산성 부분에서 뛰어난 결과를 달성했습니다.',
    status: 'completed',
    created_at: '2025-01-15'
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: '이영희',
    reviewer_name: '관리자',
    period: '2024년 4분기',
    overall_score: 3.8,
    categories: {
      productivity: 3.7,
      quality: 4.2,
      teamwork: 4.0,
      communication: 3.9,
      leadership: 3.2
    },
    comments: '품질 관리에서 우수한 성과를 보였으나, 리더십 역량 개발이 필요합니다.',
    status: 'pending_approval',
    created_at: '2025-01-10'
  }
]

export default function PerformanceManagementPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'goals' | 'reviews' | 'analytics'>('goals')
  const [goals, setGoals] = useState<PerformanceGoal[]>(mockGoals)
  const [reviews, setReviews] = useState<PerformanceReview[]>(mockReviews)
  const [showHelp, setShowHelp] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 필터링된 목표
  const filteredGoals = goals.filter(goal => {
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesStatus && matchesSearch
  })

  // 진행률 계산
  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'paused': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">성과관리 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Google Cloud Console 스타일 헤더 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-medium text-gray-900">Performance Management System</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                설정
              </Button>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                도움말
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* 프로젝트 정보 섹션 */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-500">작업 중인 프로젝트:</span>
            <span className="font-medium text-gray-900">Performance Management System</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>프로젝트 번호:</span>
              <span className="font-mono">pm-system-468305</span>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span>프로젝트 ID:</span>
              <span className="font-mono">performance-management-system</span>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-3 mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Target className="w-4 h-4 mr-2" />
              목표 관리
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              BigQuery에서 쿼리 실행
            </Button>
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              예외사항 보기
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              스트리밍 파이프라인 만들기
            </Button>
          </div>
        </div>

        {/* 내 할 일에 따른 추천 섹션 */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">내 할 일에 따른 추천</h2>
          </div>
          
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Performance Management 시스템에 완전 관리형 플랫폼에서 앱 실행
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Google의 완전관리형 서버리스 인프라를 기반으로 고도 성능 애플리케이션을 배포합니다.
                  </p>
                  <div className="flex items-center space-x-3">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      앱 배포
                    </Button>
                    <Button variant="outline" size="sm">
                      가격 자세히 알아보기
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액세스 서비스 그리드 */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 액세스</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* API 및 서비스 카드들 */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">API 및 서비스</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">IAM 및 관리자</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">결제</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Compute Engine</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Cloud Storage</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">BigQuery</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">VPC 네트워크</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Kubernetes Engine</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              모든 제품 보기
            </Button>
          </div>
        </div>

        {/* Gemini Cloud Assist 스타일 사이드 패널 */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
          <Card className="w-80 border border-blue-200 bg-blue-50/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Gemini Cloud Assist 제한 시간에 보기</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    (예: AI로 모든 기능 사용해보기 제한 시간 내에 무료로 사용해보기)
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2"
                  >
                    <ArrowRight className="w-3 h-3 mr-2" />
                    지금 체험하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

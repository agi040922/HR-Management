"use client"

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
  Brain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
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
                    직원 관리, 급여 계산, 스케줄 관리 등 HR 업무를 통합적으로 관리할 수 있는 시스템입니다.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                설정
              </Button>
              <Button variant="outline" size="sm">
                도움말
              </Button>
            </div>
          </div>
        </div>

        {/* 주요 기능 카드 그리드 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">주요 기능</h2>
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
            <Link href="/employees">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">직원 관리</h3>
                      <p className="text-sm text-gray-500 mt-1">직원 정보 등록 및 관리</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/stores">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">매장 관리</h3>
                      <p className="text-sm text-gray-500 mt-1">매장 정보 및 설정 관리</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

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

            <Link href="/schedule/view">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">스케줄 관리</h3>
                      <p className="text-sm text-gray-500 mt-1">근무 일정 및 시간 관리</p>
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

            <Link href="/schedule/exceptions">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">예외사항 관리</h3>
                      <p className="text-sm text-gray-500 mt-1">근무 예외사항 처리</p>
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

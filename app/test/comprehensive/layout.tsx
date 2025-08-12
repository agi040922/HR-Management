'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Store, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Calculator,
  LogOut
} from 'lucide-react'

export default function ComprehensiveTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/test/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 리다이렉트 중
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/test/login')
  }

  const navigationItems = [
    {
      href: '/test/comprehensive',
      icon: Store,
      label: '대시보드',
      description: '전체 현황 및 스토어 관리'
    },
    {
      href: '/test/comprehensive/stores',
      icon: Store,
      label: '스토어 관리',
      description: '스토어 생성 및 설정'
    },
    {
      href: '/test/comprehensive/employees',
      icon: Users,
      label: '직원 관리',
      description: '직원 등록 및 관리'
    },
    {
      href: '/test/comprehensive/templates',
      icon: Calendar,
      label: '주간 템플릿',
      description: '주간 스케줄 템플릿 관리'
    },
    {
      href: '/test/comprehensive/exceptions',
      icon: AlertTriangle,
      label: '예외사항',
      description: '스케줄 예외사항 관리'
    },
    {
      href: '/test/comprehensive/payroll',
      icon: Calculator,
      label: '급여 계산',
      description: '급여 계산 및 분석'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                HR 관리 시스템 테스트
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 사이드바 네비게이션 */}
          <aside className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

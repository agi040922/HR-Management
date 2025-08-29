'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

/**
 * 인증 가드 컴포넌트
 * 
 * 이 컴포넌트는 다음과 같은 기능을 제공합니다:
 * 1. 사용자 인증 상태 확인
 * 2. 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 * 3. 로딩 상태 처리
 * 4. 인증된 사용자에게만 자식 컴포넌트 렌더링
 * 
 * @param children - 보호할 컴포넌트들
 * @param redirectTo - 현재 페이지 경로 (리다이렉트 후 돌아올 위치)
 * @param loadingComponent - 로딩 중 표시할 컴포넌트 (선택사항)
 */
export default function AuthGuard({ 
  children, 
  redirectTo, 
  loadingComponent 
}: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    console.log('🔐 [AuthGuard] 인증 상태 체크:', { 
      isAuthenticated, 
      loading, 
      redirectTo 
    })
    
    if (!loading && !isAuthenticated) {
      console.log('🚫 [AuthGuard] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트')
      const loginUrl = redirectTo 
        ? `/login?from=${encodeURIComponent(redirectTo)}`
        : '/login'
      router.push(loginUrl)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  // 로딩 중일 때 표시할 컴포넌트
  const LoadingScreen = loadingComponent || (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">인증 상태 확인 중...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  )

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return <>{LoadingScreen}</>
  }

  // 인증되지 않았으면 리다이렉트 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  // 인증됐으면 자식 컴포넌트 렌더링
  return <>{children}</>
}

/**
 * 페이지 레벨에서 사용할 수 있는 HOC (Higher-Order Component)
 * 
 * 사용 예시:
 * ```tsx
 * export default withAuthGuard(MyProtectedPage, '/my-page')
 * ```
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>, 
  redirectTo?: string
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard redirectTo={redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

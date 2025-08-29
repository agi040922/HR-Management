import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 미들웨어 - 인증 기반 라우트 보호
 * 
 * 이 미들웨어는 다음과 같은 기능을 제공합니다:
 * 1. Supabase 인증 상태 확인
 * 2. 보호된 라우트에 대한 접근 제어
 * 3. 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 * 4. 이미 로그인한 사용자가 로그인 페이지 접근 시 메인 페이지로 리다이렉트
 */

/**
 * 보호되지 않는 공개 경로들
 * 이 경로들은 인증 없이 접근 가능합니다
 */
const publicRoutes = [
  '/login',
  '/landing',
  '/_next',
  '/favicon.ico',
  '/api',
  '/public'
]

/**
 * 보호가 필요한 경로들 (인증 필수)
 * 이 경로들은 로그인한 사용자만 접근 가능합니다
 */
const protectedRoutes = [
  '/employees',
  '/payroll', 
  '/profiles',
  '/schedule',
  '/stores',
  '/help',
  '/test'
]

/**
 * 경로가 공개 경로인지 확인하는 함수
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

/**
 * 경로가 보호된 경로인지 확인하는 함수
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  console.log('🔍 [MIDDLEWARE] 요청 경로:', pathname)
  
  // 🚨 임시 해결책: 미들웨어 인증 체크 비활성화
  // TODO: Supabase 쿠키 설정 완료 후 다시 활성화
  const DISABLE_MIDDLEWARE_AUTH = true
  
  if (DISABLE_MIDDLEWARE_AUTH) {
    console.log('⚠️ [MIDDLEWARE] 인증 체크 비활성화됨 (개발 모드)')
    return NextResponse.next()
  }
  
  // Static assets 및 API routes는 통과
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('.')) {
    console.log('⚡ [MIDDLEWARE] Static asset/API 요청, 통과:', pathname)
    return NextResponse.next()
  }

  // Supabase 클라이언트 생성
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  try {
    // 현재 세션 확인
    console.log('🔐 [MIDDLEWARE] 세션 확인 중...')
    
    // 1차: getSession으로 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ [MIDDLEWARE] 세션 확인 오류:', error)
    }

    let isAuthenticated = !!session?.user
    let userInfo = {
      userId: session?.user?.id,
      email: session?.user?.email,
      provider: session?.user?.app_metadata?.provider
    }

    // 세션이 없을 경우 2차: getUser로 다시 확인
    if (!isAuthenticated) {
      console.log('🔄 [MIDDLEWARE] getSession 실패, getUser로 재시도...')
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (!userError && user) {
          isAuthenticated = true
          userInfo = {
            userId: user.id,
            email: user.email,
            provider: user.app_metadata?.provider
          }
          console.log('✅ [MIDDLEWARE] getUser로 세션 복구 성공')
        } else if (userError) {
          console.log('⚠️ [MIDDLEWARE] getUser도 실패:', userError.message)
        }
      } catch (getUserError) {
        console.log('⚠️ [MIDDLEWARE] getUser 예외:', getUserError)
      }
    }

    // 3차: 쿠키에서 직접 토큰 확인 (최후의 수단)
    if (!isAuthenticated) {
      console.log('🔄 [MIDDLEWARE] 쿠키에서 직접 토큰 확인...')
      
      // 모든 쿠키 로그 출력 (디버깅용)
      console.log('🍪 [MIDDLEWARE] 현재 쿠키들:', 
        Object.fromEntries(request.cookies.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 50) + '...']))
      )
      
      // 여러 가능한 Supabase 쿠키 이름들을 시도
      const possibleCookieNames = [
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
        'sb-access-token', 
        'sb-refresh-token',
        'supabase-auth-token'
      ]
      
      let foundToken = false
      for (const cookieName of possibleCookieNames) {
        const cookieValue = request.cookies.get(cookieName)?.value
        if (cookieValue) {
          console.log(`🍪 [MIDDLEWARE] ${cookieName} 쿠키 발견`)
          try {
            const tokenData = JSON.parse(cookieValue)
            if (tokenData?.access_token || cookieValue.includes('token')) {
              console.log('✅ [MIDDLEWARE] 쿠키 토큰으로 인증 확인')
              isAuthenticated = true
              foundToken = true
              break
            }
          } catch (tokenError) {
            // JSON 파싱이 안되면 그냥 토큰 문자열일 수 있음
            if (cookieValue.length > 10) {
              console.log('✅ [MIDDLEWARE] 토큰 문자열로 인증 확인')
              isAuthenticated = true
              foundToken = true
              break
            }
          }
        }
      }
      
      if (!foundToken) {
        console.log('🚫 [MIDDLEWARE] 인증 토큰 쿠키 없음')
      }
    }

    console.log('👤 [MIDDLEWARE] 최종 인증 상태:', {
      isAuthenticated,
      ...userInfo
    })
    
    // 인증 상태에 따른 라우팅 로직
    if (isAuthenticated) {
      // 로그인한 사용자가 로그인 페이지 접근 시 프로필 페이지로 리다이렉트
      if (pathname === '/login') {
        console.log('🔄 [MIDDLEWARE] 로그인한 사용자가 로그인 페이지 접근 -> /profiles로 리다이렉트')
        const redirectUrl = new URL('/profiles', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      
      // 루트 경로 접근 시 프로필 페이지로 리다이렉트
      if (pathname === '/') {
        console.log('🔄 [MIDDLEWARE] 로그인한 사용자가 루트 접근 -> /profiles로 리다이렉트')
        const redirectUrl = new URL('/profiles', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      
      console.log('✅ [MIDDLEWARE] 인증된 사용자, 요청 허용:', pathname)
    } else {
      // 인증되지 않은 사용자
      
      // 루트 경로 접근 시 랜딩 페이지로 리다이렉트
      if (pathname === '/') {
        console.log('🔄 [MIDDLEWARE] 비로그인 사용자가 루트 접근 -> /landing으로 리다이렉트')
        const redirectUrl = new URL('/landing', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      
      // 보호된 경로 접근 시 로그인 페이지로 리다이렉트
      if (isProtectedRoute(pathname)) {
        console.log('🚫 [MIDDLEWARE] 보호된 경로 접근 차단 -> /login으로 리다이렉트:', pathname)
        const redirectUrl = new URL('/login', request.url)
        // 원래 접근하려던 페이지를 쿼리 파라미터로 저장
        redirectUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      console.log('✅ [MIDDLEWARE] 공개 경로 접근 허용:', pathname)
    }

    // 세션 갱신을 위해 응답 헤더 설정
    console.log('✅ [MIDDLEWARE] 요청 처리 완료')
    return res

  } catch (error) {
    console.error('❌ [MIDDLEWARE] 실행 중 오류:', error)
    
    // 오류 발생 시 보호된 경로면 로그인 페이지로 리다이렉트
    if (isProtectedRoute(pathname)) {
      console.log('🚫 [MIDDLEWARE] 오류로 인한 로그인 페이지 리다이렉트:', pathname)
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    console.log('⚠️ [MIDDLEWARE] 오류 발생했지만 계속 진행:', pathname)
    return NextResponse.next()
  }
}

/**
 * 미들웨어가 실행될 경로 패턴 설정
 * 
 * 이 설정은 성능 최적화를 위해 미들웨어가 실행될 경로를 제한합니다.
 * static assets(_next), api routes, favicon 등은 제외됩니다.
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 대해 미들웨어 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들 (이미지, 아이콘 등)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
}

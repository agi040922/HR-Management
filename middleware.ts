import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

/**
 * Next.js 미들웨어 - 인증 기반 라우트 보호 (Supabase SSR)
 * 
 * 이 미들웨어는 다음과 같은 기능을 제공합니다:
 * 1. Supabase SSR을 통한 안정적인 인증 상태 확인
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
  
  // Static assets 및 API routes는 통과
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('.')) {
    console.log('⚡ [MIDDLEWARE] Static asset/API 요청, 통과:', pathname)
    return NextResponse.next()
  }

  // Supabase SSR 클라이언트 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Supabase SSR을 통한 사용자 인증 확인
    console.log('🔐 [MIDDLEWARE] SSR 인증 확인 중...')
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('⚠️ [MIDDLEWARE] 인증 확인 중 오류:', error.message)
    }

    const isAuthenticated = !!user
    
    console.log('👤 [MIDDLEWARE] 인증 상태:', {
      isAuthenticated,
      userId: user?.id,
      email: user?.email,
      provider: user?.app_metadata?.provider
    })
    
    // 인증 상태에 따른 라우팅 로직
    if (isAuthenticated) {
      // 로그인한 사용자가 로그인 페이지 접근 시 프로필 페이지로 리다이렉트
      if (pathname === '/login') {
        console.log('🔄 [MIDDLEWARE] 로그인한 사용자가 로그인 페이지 접근 -> /profiles로 리다이렉트')
        return NextResponse.redirect(new URL('/profiles', request.url))
      }
      
      // 루트 경로 접근 시 프로필 페이지로 리다이렉트
      if (pathname === '/') {
        console.log('🔄 [MIDDLEWARE] 로그인한 사용자가 루트 접근 -> /profiles로 리다이렉트')
        return NextResponse.redirect(new URL('/profiles', request.url))
      }
      
      console.log('✅ [MIDDLEWARE] 인증된 사용자, 요청 허용:', pathname)
    } else {
      // 인증되지 않은 사용자
      
      // 루트 경로 접근 시 랜딩 페이지로 리다이렉트
      if (pathname === '/') {
        console.log('🔄 [MIDDLEWARE] 비로그인 사용자가 루트 접근 -> /landing으로 리다이렉트')
        return NextResponse.redirect(new URL('/landing', request.url))
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

    // 쿠키가 업데이트된 응답 반환
    console.log('✅ [MIDDLEWARE] 요청 처리 완료')
    return response

  } catch (error) {
    console.error('❌ [MIDDLEWARE] 실행 중 오류:', error)
    
    // 오류 발생 시 보호된 경로면 로그인 페이지로 리다이렉트
    if (isProtectedRoute(pathname)) {
      console.log('🚫 [MIDDLEWARE] 오류로 인한 로그인 페이지 리다이렉트:', pathname)
      return NextResponse.redirect(new URL('/login', request.url))
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

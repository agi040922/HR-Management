'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * SearchParams를 사용하는 내부 컴포넌트
 */
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const hasRedirected = useRef(false)
  
  // 상태 관리: 각 폼의 입력값과 로딩/에러 상태
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [redirectTo, setRedirectTo] = useState<string>('/profiles')

  // 컴포넌트 마운트 시 리다이렉트 URL 확인
  useEffect(() => {
    const fromParam = searchParams.get('from')
    if (fromParam) {
      setRedirectTo(fromParam)
      setMessage(`로그인 후 ${fromParam} 페이지로 이동됩니다.`)
    }
  }, [searchParams])

  // 이미 로그인된 사용자 자동 리다이렉트 (한 번만 실행)
  useEffect(() => {
    console.log('🔍 [LOGIN PAGE] useEffect 실행:', {
      authLoading,
      hasUser: !!user,
      userId: user?.id,
      hasRedirected: hasRedirected.current,
      redirectTo,
      currentPath: window.location.pathname
    })
    
    if (!authLoading && user && !hasRedirected.current) {
      console.log('🔄 [LOGIN PAGE] 이미 로그인된 사용자 감지, 리다이렉트 시작:', redirectTo)
      hasRedirected.current = true
      
      // router.replace 사용하여 히스토리 스택에 추가하지 않음
      console.log('🚀 [LOGIN PAGE] router.replace 실행 중...')
      router.replace(redirectTo)
      
      // 추가 확인용 타이머
      setTimeout(() => {
        console.log('⏰ [LOGIN PAGE] 3초 후 현재 경로:', window.location.pathname)
      }, 3000)
    }
  }, [user, authLoading, redirectTo, router])

  /**
   * 이메일/비밀번호로 로그인하는 함수
   * 성공 시 원래 접근하려던 페이지 또는 /profiles로 리다이렉트
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(`로그인 실패: ${error.message}`)
      } else {
        setMessage(`로그인 성공! ${redirectTo === '/profiles' ? '프로필' : redirectTo} 페이지로 이동합니다.`)
        console.log('로그인 성공:', data)
        // 원래 접근하려던 페이지 또는 프로필 페이지로 리다이렉트
        router.push(redirectTo)
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('로그인 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 회원가입 함수
   * 성공 시 이메일 확인 안내 메시지 표시
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 회원가입 확인 후 리다이렉트될 URL
          emailRedirectTo: `${window.location.origin}${redirectTo}`
        }
      })

      if (error) {
        setError(`회원가입 실패: ${error.message}`)
      } else {
        setMessage('회원가입 성공! 이메일 확인 후 로그인하세요.')
        console.log('회원가입 성공:', data)
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('회원가입 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Google OAuth 로그인 함수
   * 성공 시 원래 접근하려던 페이지 또는 /profiles로 리다이렉트
   */
  const handleGoogleLogin = async () => {
    console.log('🔵 [GOOGLE LOGIN] 구글 로그인 시작')
    console.log('🔵 [GOOGLE LOGIN] 리다이렉트 URL:', `${window.location.origin}${redirectTo}`)
    
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`
        }
      })

      console.log('🔵 [GOOGLE LOGIN] OAuth 응답:', { data, error })

      if (error) {
        console.error('❌ [GOOGLE LOGIN] 로그인 실패:', error)
        setError(`Google 로그인 실패: ${error.message}`)
      } else {
        console.log('✅ [GOOGLE LOGIN] OAuth 요청 성공, 리다이렉트 진행 중...')
        setMessage('Google로 로그인 중입니다...')
      }
    } catch (err) {
      console.error('❌ [GOOGLE LOGIN] 예상치 못한 오류:', err)
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * GitHub OAuth 로그인 함수
   * 성공 시 원래 접근하려던 페이지 또는 /profiles로 리다이렉트
   */
  const handleGitHubLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`
        }
      })

      if (error) {
        setError(`GitHub 로그인 실패: ${error.message}`)
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('GitHub 로그인 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">HR 관리 시스템</h1>
          <p className="text-gray-600 mt-2">로그인하여 시스템을 이용하세요</p>
        </div>

        {/* 메시지 및 에러 표시 */}
        {message && (
          <Alert>
            <AlertDescription className="text-green-600">{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert>
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 탭으로 구분된 로그인 방법들 */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
            <TabsTrigger value="social">소셜 로그인</TabsTrigger>
          </TabsList>

          {/* 이메일/비밀번호 로그인 탭 */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>이메일 로그인</CardTitle>
                <CardDescription>
                  등록된 이메일과 비밀번호로 로그인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>회원가입</CardTitle>
                <CardDescription>
                  새 계정을 만들어 HR 관리 시스템을 이용하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">이메일</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호 (최소 6자)"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '가입 중...' : '회원가입'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 소셜 로그인 탭 */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>소셜 로그인</CardTitle>
                <CardDescription>
                  소셜 계정으로 간편하게 로그인하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? '로그인 중...' : 'Google로 로그인'}
                </Button>
                <Button
                  onClick={handleGitHubLogin}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? '로그인 중...' : 'GitHub로 로그인'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/**
 * HR 관리 시스템 로그인 페이지
 * 
 * 기능:
 * 1. 이메일/비밀번호 로그인
 * 2. 회원가입
 * 3. 소셜 로그인 (Google, GitHub)
 * 4. 로그인 성공 시 원래 접근하려던 페이지 또는 /profiles로 리다이렉트
 * 5. 미들웨어에서 전달된 리다이렉트 URL 처리
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

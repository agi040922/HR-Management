'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

/**
 * Supabase Auth 로그인 테스트 페이지
 * 
 * 이 컴포넌트는 다음 기능들을 테스트할 수 있습니다:
 * 1. 이메일/비밀번호 로그인
 * 2. 매직링크 로그인 (비밀번호 없이 이메일로만 로그인)
 * 3. 회원가입
 * 4. 소셜 로그인 (Google, GitHub 등)
 */
export default function LoginTestPage() {
  // 상태 관리: 각 폼의 입력값과 로딩/에러 상태
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  /**
   * 이메일/비밀번호로 로그인하는 함수
   * Supabase의 signInWithPassword 메서드를 사용
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(`로그인 실패: ${error.message}`)
      } else {
        setMessage('로그인 성공! 프로필 페이지로 이동하세요.')
        console.log('로그인 성공:', data)
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('로그인 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 매직링크로 로그인하는 함수
   * 비밀번호 없이 이메일로만 로그인 링크를 발송
   */
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // 매직링크 클릭 후 리다이렉트될 URL
          emailRedirectTo: `${window.location.origin}/test/profile`
        }
      })

      if (error) {
        setError(`매직링크 발송 실패: ${error.message}`)
      } else {
        setMessage('매직링크가 이메일로 발송되었습니다. 이메일을 확인하세요!')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('매직링크 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 회원가입 함수
   * 새로운 사용자 계정을 생성
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
          emailRedirectTo: `${window.location.origin}/test/profile`
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
   * 소셜 로그인 예시
   */
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/test/profile`
        }
      })

      if (error) {
        setError(`Google 로그인 실패: ${error.message}`)
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('Google 로그인 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * GitHub OAuth 로그인 함수
   * 소셜 로그인 예시
   */
  const handleGitHubLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/test/profile`
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Supabase Auth 테스트</h1>
          <p className="text-gray-600 mt-2">다양한 인증 방법을 테스트해보세요</p>
        </div>

        {/* 네비게이션 링크 */}
        <div className="flex justify-center space-x-4 text-sm">
          <Link href="/test" className="text-blue-600 hover:underline">
            테스트 홈
          </Link>
          <Link href="/test/profile" className="text-blue-600 hover:underline">
            프로필
          </Link>
          <Link href="/test/debug" className="text-blue-600 hover:underline">
            디버그
          </Link>
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
                  이메일과 비밀번호로 로그인하거나 매직링크를 사용하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="text-center">
                  <span className="text-gray-500">또는</span>
                </div>

                <Button
                  onClick={handleMagicLinkLogin}
                  variant="outline"
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? '발송 중...' : '매직링크로 로그인'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>회원가입</CardTitle>
                <CardDescription>
                  새 계정을 만들어보세요
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
                <div className="text-sm text-gray-500 mt-4">
                  <p>* 소셜 로그인을 사용하려면 Supabase 대시보드에서 OAuth 제공자를 설정해야 합니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

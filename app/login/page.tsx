'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'

/**
 * HR 관리 시스템 로그인 페이지
 * 
 * 기능:
 * 1. 이메일/비밀번호 로그인
 * 2. 회원가입
 * 3. 소셜 로그인 (Google, GitHub)
 * 4. 로그인 성공 시 /profiles로 리다이렉트
 */
export default function LoginPage() {
  const router = useRouter()
  
  // 상태 관리: 각 폼의 입력값과 로딩/에러 상태
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  /**
   * 이메일/비밀번호로 로그인하는 함수
   * 성공 시 /profiles로 리다이렉트
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
        setMessage('로그인 성공! 프로필 페이지로 이동합니다.')
        console.log('로그인 성공:', data)
        // 프로필 페이지로 리다이렉트
        router.push('/profiles')
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
          emailRedirectTo: `${window.location.origin}/profiles`
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
   * 성공 시 /profiles로 리다이렉트
   */
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profiles`
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
   * 성공 시 /profiles로 리다이렉트
   */
  const handleGitHubLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/profiles`
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

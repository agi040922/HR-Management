'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

/**
 * HR 관리 시스템 프로필 페이지
 * 
 * 기능:
 * 1. 현재 로그인된 사용자 정보 표시
 * 2. 사용자 메타데이터 확인
 * 3. 이메일 변경
 * 4. 비밀번호 변경
 * 5. 로그아웃
 * 6. 로그인하지 않은 경우 로그인 페이지로 리다이렉트
 */
export default function ProfilePage() {
  const router = useRouter()
  
  // 상태 관리
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  // 폼 상태
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /**
   * 컴포넌트 마운트 시 현재 사용자 정보 가져오기
   * useEffect를 사용하여 인증 상태 변화를 감지
   */
  useEffect(() => {
    // 현재 세션 확인
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('사용자 정보 가져오기 오류:', error)
          setError('사용자 정보를 가져올 수 없습니다.')
        } else {
          setUser(user)
          setNewEmail(user?.email || '')
        }
      } catch (err) {
        console.error('예상치 못한 오류:', err)
        setError('예상치 못한 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // 인증 상태 변화 리스너 등록
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('인증 상태 변화:', event, session)
        setUser(session?.user || null)
        
        if (event === 'SIGNED_OUT') {
          setMessage('로그아웃되었습니다.')
          // 로그아웃 시 로그인 페이지로 리다이렉트
          router.push('/login')
        }
      }
    )

    // 컴포넌트 언마운트 시 리스너 정리
    return () => subscription.unsubscribe()
  }, [router])

  /**
   * 로그아웃 함수
   */
  const handleLogout = async () => {
    setUpdating(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(`로그아웃 실패: ${error.message}`)
      } else {
        setMessage('성공적으로 로그아웃되었습니다.')
        // 로그인 페이지로 리다이렉트 (onAuthStateChange에서 처리됨)
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('로그아웃 오류:', err)
    } finally {
      setUpdating(false)
    }
  }

  /**
   * 이메일 변경 함수
   */
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) {
        setError(`이메일 변경 실패: ${error.message}`)
      } else {
        setMessage('이메일 변경 요청이 발송되었습니다. 새 이메일을 확인하세요.')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('이메일 변경 오류:', err)
    } finally {
      setUpdating(false)
    }
  }

  /**
   * 비밀번호 변경 함수
   */
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError('')
    setMessage('')

    // 비밀번호 확인 검증
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      setUpdating(false)
      return
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setUpdating(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setError(`비밀번호 변경 실패: ${error.message}`)
      } else {
        setMessage('비밀번호가 성공적으로 변경되었습니다.')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('비밀번호 변경 오류:', err)
    } finally {
      setUpdating(false)
    }
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  const handlePasswordReset = async () => {
    setUpdating(true)
    setError('')
    setMessage('')

    if (!user?.email) {
      setError('이메일 정보가 없습니다.')
      setUpdating(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/profiles`
      })

      if (error) {
        setError(`비밀번호 재설정 실패: ${error.message}`)
      } else {
        setMessage('비밀번호 재설정 링크가 이메일로 발송되었습니다.')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('비밀번호 재설정 오류:', err)
    } finally {
      setUpdating(false)
    }
  }

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              프로필을 확인하려면 먼저 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              로그인 페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">사용자 프로필</h1>
          <p className="text-gray-600 mt-2">HR 관리 시스템 사용자 정보 및 계정 관리</p>
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* 사용자 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 정보</CardTitle>
              <CardDescription>현재 로그인된 사용자의 기본 정보</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">사용자 ID</Label>
                <p className="text-sm text-gray-600 break-all font-mono">{user.id}</p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">이메일</Label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.email_confirmed_at ? (
                    <Badge variant="default" className="text-xs">확인됨</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">미확인</Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">전화번호</Label>
                <p className="text-sm text-gray-600">{user.phone || '등록되지 않음'}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">가입일</Label>
                <p className="text-sm text-gray-600">
                  {user.created_at ? new Date(user.created_at).toLocaleString('ko-KR') : '정보 없음'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">마지막 로그인</Label>
                <p className="text-sm text-gray-600">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ko-KR') : '정보 없음'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">인증 제공자</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.app_metadata?.providers?.map((provider: string) => (
                    <Badge key={provider} variant="outline" className="text-xs">
                      {provider}
                    </Badge>
                  )) || <span className="text-sm text-gray-600">정보 없음</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 관리 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>계정 관리</CardTitle>
              <CardDescription>계정 정보 수정 및 보안 설정</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 이메일 변경 */}
              <div>
                <h4 className="font-medium mb-2">이메일 변경</h4>
                <form onSubmit={handleEmailUpdate} className="space-y-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="새 이메일 주소"
                    required
                  />
                  <Button type="submit" size="sm" disabled={updating || newEmail === user.email}>
                    {updating ? '변경 중...' : '이메일 변경'}
                  </Button>
                </form>
              </div>

              <Separator />

              {/* 비밀번호 변경 */}
              <div>
                <h4 className="font-medium mb-2">비밀번호 변경</h4>
                <form onSubmit={handlePasswordUpdate} className="space-y-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (최소 6자)"
                    minLength={6}
                    required
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    minLength={6}
                    required
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm" disabled={updating}>
                      {updating ? '변경 중...' : '비밀번호 변경'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePasswordReset}
                      disabled={updating}
                    >
                      재설정 이메일 발송
                    </Button>
                  </div>
                </form>
              </div>

              <Separator />

              {/* 로그아웃 */}
              <div>
                <h4 className="font-medium mb-2">세션 관리</h4>
                <Button 
                  onClick={handleLogout} 
                  variant="destructive" 
                  size="sm"
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? '로그아웃 중...' : '로그아웃'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사용자 메타데이터 표시 */}
        <Card>
          <CardHeader>
            <CardTitle>메타데이터 정보</CardTitle>
            <CardDescription>시스템에서 관리하는 사용자 메타데이터</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">App Metadata</Label>
                <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify(user.app_metadata, null, 2)}
                </pre>
              </div>
              <div>
                <Label className="text-sm font-medium">User Metadata</Label>
                <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

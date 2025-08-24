'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

/**
 * HR 관리 시스템 프로필 디버그 페이지
 * 
 * 기능:
 * 1. 사용자 메타데이터 상세 정보 표시
 * 2. 시스템 정보 및 디버그 데이터
 * 3. 개발자용 정보 확인
 */
export default function ProfileDebugPage() {
  const router = useRouter()
  
  // 상태 관리
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * 컴포넌트 마운트 시 현재 사용자 정보 가져오기
   */
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('사용자 정보 가져오기 오류:', error)
        } else {
          setUser(user)
        }
      } catch (err) {
        console.error('예상치 못한 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">디버그 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              디버그 정보를 확인하려면 먼저 로그인하세요
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">프로필 디버그 정보</h1>
          <p className="text-gray-600 mt-2">시스템 메타데이터 및 개발자 정보</p>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/profiles')}
            variant="outline"
          >
            ← 프로필로 돌아가기
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 기본 시스템 정보 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>시스템 정보</CardTitle>
              <CardDescription>기본 사용자 시스템 데이터</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">사용자 ID</Label>
                <p className="text-sm text-gray-600 break-all font-mono bg-gray-100 p-2 rounded">{user.id}</p>
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
                <Label className="text-sm font-medium">이메일 확인일</Label>
                <p className="text-sm text-gray-600">
                  {user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleString('ko-KR') : '미확인'}
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

          {/* 추가 시스템 정보 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>추가 시스템 정보</CardTitle>
              <CardDescription>확장된 사용자 시스템 데이터</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">사용자 역할</Label>
                <p className="text-sm text-gray-600">{user.role || '설정되지 않음'}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">마지막 업데이트</Label>
                <p className="text-sm text-gray-600">
                  {user.updated_at ? new Date(user.updated_at).toLocaleString('ko-KR') : '정보 없음'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">전화번호 확인일</Label>
                <p className="text-sm text-gray-600">
                  {user.phone_confirmed_at ? new Date(user.phone_confirmed_at).toLocaleString('ko-KR') : '미확인'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">복구 이메일 발송일</Label>
                <p className="text-sm text-gray-600">
                  {user.recovery_sent_at ? new Date(user.recovery_sent_at).toLocaleString('ko-KR') : '없음'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">이메일 변경 발송일</Label>
                <p className="text-sm text-gray-600">
                  {user.email_change_sent_at ? new Date(user.email_change_sent_at).toLocaleString('ko-KR') : '없음'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">새 이메일</Label>
                <p className="text-sm text-gray-600">{user.new_email || '변경 요청 없음'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메타데이터 정보 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>메타데이터 정보</CardTitle>
            <CardDescription>시스템에서 관리하는 사용자 메타데이터</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">App Metadata</Label>
                <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-60 border">
                  {JSON.stringify(user.app_metadata, null, 2)}
                </pre>
              </div>
              <div>
                <Label className="text-sm font-medium">User Metadata</Label>
                <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-60 border">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전체 사용자 객체 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>전체 사용자 객체 (개발자용)</CardTitle>
            <CardDescription>완전한 사용자 데이터 구조</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96 border">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

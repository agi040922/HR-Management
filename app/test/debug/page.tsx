'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Session, User } from '@supabase/supabase-js'

/**
 * Supabase Auth 디버그 페이지
 * 
 * 이 컴포넌트는 다음 정보들을 확인할 수 있습니다:
 * 1. 현재 세션 정보 (JWT 토큰 포함)
 * 2. 사용자 정보 상세
 * 3. 브라우저 쿠키 정보
 * 4. 로컬 스토리지 정보
 * 5. 인증 상태 변화 로그
 * 6. Supabase 클라이언트 설정 정보
 */
export default function DebugTestPage() {
  // 상태 관리
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLogs, setAuthLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<Record<string, string>>({})
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({})
  const [refreshing, setRefreshing] = useState(false)

  /**
   * 쿠키 정보를 파싱하는 함수
   */
  const parseCookies = () => {
    const cookieObj: Record<string, string> = {}
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
          cookieObj[name] = decodeURIComponent(value)
        }
      })
    }
    return cookieObj
  }

  /**
   * 로컬 스토리지 정보를 가져오는 함수
   */
  const getLocalStorageData = () => {
    const storageObj: Record<string, string> = {}
    if (typeof window !== 'undefined') {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          const value = window.localStorage.getItem(key)
          if (value) {
            storageObj[key] = value
          }
        }
      }
    }
    return storageObj
  }

  /**
   * 로그 추가 함수
   */
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR')
    setAuthLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]) // 최대 50개 로그 유지
  }

  /**
   * 세션 새로고침 함수
   */
  const refreshSession = async () => {
    setRefreshing(true)
    addLog('세션 새로고침 시도 중...')
    
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        addLog(`세션 새로고침 실패: ${error.message}`)
      } else {
        addLog('세션 새로고침 성공')
        setSession(data.session)
        setUser(data.user)
      }
    } catch (err) {
      addLog(`세션 새로고침 오류: ${err}`)
    } finally {
      setRefreshing(false)
    }
  }

  /**
   * JWT 토큰 디코딩 함수 (간단한 파싱)
   */
  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))
      
      return { header, payload }
    } catch (err) {
      return null
    }
  }

  /**
   * 컴포넌트 초기화
   */
  useEffect(() => {
    const initializeDebugPage = async () => {
      addLog('디버그 페이지 초기화 시작')
      
      try {
        // 현재 세션 가져오기
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          addLog(`세션 가져오기 오류: ${error.message}`)
        } else {
          setSession(session)
          setUser(session?.user || null)
          addLog(session ? '활성 세션 발견' : '세션 없음')
        }

        // 쿠키 및 로컬 스토리지 정보 가져오기
        setCookies(parseCookies())
        setLocalStorage(getLocalStorageData())
        
      } catch (err) {
        addLog(`초기화 오류: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    initializeDebugPage()

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        addLog(`인증 상태 변화: ${event}`)
        setSession(session)
        setUser(session?.user || null)
        
        // 쿠키 및 로컬 스토리지 업데이트
        setCookies(parseCookies())
        setLocalStorage(getLocalStorageData())
      }
    )

    return () => {
      subscription.unsubscribe()
      addLog('디버그 페이지 정리')
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Supabase Auth 디버그</h1>
          <p className="text-gray-600 mt-2">인증 상태, 토큰, 쿠키 등 상세 정보 확인</p>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-center space-x-4 text-sm">
          <Link href="/test" className="text-blue-600 hover:underline">
            테스트 홈
          </Link>
          <Link href="/test/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
          <Link href="/test/profile" className="text-blue-600 hover:underline">
            프로필
          </Link>
        </div>

        {/* 상태 표시 */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            <Badge variant={session ? "default" : "secondary"}>
              {session ? "인증됨" : "미인증"}
            </Badge>
            <Button 
              onClick={refreshSession} 
              size="sm" 
              variant="outline"
              disabled={refreshing}
            >
              {refreshing ? "새로고침 중..." : "세션 새로고침"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="session">세션</TabsTrigger>
            <TabsTrigger value="tokens">토큰</TabsTrigger>
            <TabsTrigger value="storage">저장소</TabsTrigger>
            <TabsTrigger value="logs">로그</TabsTrigger>
            <TabsTrigger value="config">설정</TabsTrigger>
          </TabsList>

          {/* 세션 정보 탭 */}
          <TabsContent value="session">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>현재 세션</CardTitle>
                  <CardDescription>활성 세션의 기본 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  {session ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">세션 ID</label>
                        <p className="text-xs text-gray-600 break-all">{session.access_token.substring(0, 50)}...</p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">만료 시간</label>
                        <p className="text-sm text-gray-600">
                          {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString('ko-KR') : '정보 없음'}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">토큰 타입</label>
                        <p className="text-sm text-gray-600">{session.token_type}</p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">새로고침 토큰</label>
                        <p className="text-xs text-gray-600 break-all">
                          {session.refresh_token ? `${session.refresh_token.substring(0, 30)}...` : '없음'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>활성 세션이 없습니다.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>사용자 정보</CardTitle>
                  <CardDescription>현재 사용자의 상세 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">사용자 ID</label>
                        <p className="text-xs text-gray-600 break-all">{user.id}</p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">이메일</label>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">역할</label>
                        <p className="text-sm text-gray-600">{user.role || '없음'}</p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">확인 상태</label>
                        <div className="flex space-x-2">
                          <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                            이메일: {user.email_confirmed_at ? "확인됨" : "미확인"}
                          </Badge>
                          <Badge variant={user.phone_confirmed_at ? "default" : "secondary"}>
                            전화: {user.phone_confirmed_at ? "확인됨" : "미확인"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>사용자 정보가 없습니다.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 토큰 정보 탭 */}
          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>JWT 토큰 분석</CardTitle>
                <CardDescription>액세스 토큰의 헤더와 페이로드 정보</CardDescription>
              </CardHeader>
              <CardContent>
                {session?.access_token ? (
                  <div className="space-y-6">
                    {(() => {
                      const decoded = decodeJWT(session.access_token)
                      return decoded ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">토큰 헤더</label>
                            <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-64">
                              {JSON.stringify(decoded.header, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <label className="text-sm font-medium">토큰 페이로드</label>
                            <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-64">
                              {JSON.stringify(decoded.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <Alert>
                          <AlertDescription>토큰을 디코딩할 수 없습니다.</AlertDescription>
                        </Alert>
                      )
                    })()}
                    
                    <Separator />
                    
                    <div>
                      <label className="text-sm font-medium">원본 액세스 토큰</label>
                      <textarea 
                        className="w-full mt-2 p-2 text-xs bg-gray-100 rounded border resize-none"
                        rows={4}
                        value={session.access_token}
                        readOnly
                      />
                    </div>
                    
                    {session.refresh_token && (
                      <div>
                        <label className="text-sm font-medium">새로고침 토큰</label>
                        <textarea 
                          className="w-full mt-2 p-2 text-xs bg-gray-100 rounded border resize-none"
                          rows={3}
                          value={session.refresh_token}
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>분석할 토큰이 없습니다.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 저장소 정보 탭 */}
          <TabsContent value="storage">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>브라우저 쿠키</CardTitle>
                  <CardDescription>현재 도메인의 쿠키 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(cookies).length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {Object.entries(cookies).map(([key, value]) => (
                        <div key={key} className="border-b pb-2">
                          <p className="text-sm font-medium">{key}</p>
                          <p className="text-xs text-gray-600 break-all">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>쿠키가 없습니다.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>로컬 스토리지</CardTitle>
                  <CardDescription>브라우저 로컬 스토리지 데이터</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(localStorage).length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {Object.entries(localStorage)
                        .filter(([key]) => key.includes('supabase') || key.includes('auth'))
                        .map(([key, value]) => (
                        <div key={key} className="border-b pb-2">
                          <p className="text-sm font-medium">{key}</p>
                          <p className="text-xs text-gray-600 break-all">
                            {value.length > 100 ? `${value.substring(0, 100)}...` : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>관련 로컬 스토리지 데이터가 없습니다.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 로그 탭 */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>인증 로그</CardTitle>
                <CardDescription>실시간 인증 상태 변화 로그</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
                  {authLogs.length > 0 ? (
                    authLogs.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  ) : (
                    <div>로그가 없습니다.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 설정 탭 */}
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Supabase 설정</CardTitle>
                <CardDescription>현재 Supabase 클라이언트 설정 정보</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Supabase URL</label>
                    <p className="text-sm text-gray-600">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium">Anon Key</label>
                    <p className="text-xs text-gray-600 break-all">
                      {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50)}...` : 
                        '설정되지 않음'
                      }
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium">환경</label>
                    <p className="text-sm text-gray-600">{process.env.NODE_ENV}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium">현재 URL</label>
                    <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

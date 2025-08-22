'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, X, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// 타입 정의
interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'ko' | 'en'
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    exceptions: boolean
    payroll: boolean
  }
  display: {
    currency: 'KRW' | 'USD'
    dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'
    timeFormat: '24h' | '12h'
  }
}

interface UserPreferences {
  dashboard: {
    showQuickActions: boolean
    defaultView: 'grid' | 'list'
  }
  payroll: {
    defaultWorkHours: 40 | 20
    showDetailedCalculation: boolean
  }
}

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange?: (settings: UserSettings, preferences: UserPreferences) => void
}

export default function Settings({ isOpen, onClose, onSettingsChange }: SettingsProps) {
  const { user } = useAuth()
  
  // 설정 관련 상태
  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: 'light',
    language: 'ko',
    timezone: 'Asia/Seoul',
    notifications: {
      email: true,
      push: true,
      exceptions: true,
      payroll: true
    },
    display: {
      currency: 'KRW',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    }
  })
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    dashboard: {
      showQuickActions: true,
      defaultView: 'grid'
    },
    payroll: {
      defaultWorkHours: 40,
      showDetailedCalculation: true
    }
  })
  
  const [savingSettings, setSavingSettings] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(false)

  // 설정 로드
  useEffect(() => {
    if (user && isOpen) {
      loadUserSettings()
    }
  }, [user, isOpen])

  // 사용자 설정 로드
  const loadUserSettings = async () => {
    try {
      setLoadingSettings(true)
      
      // auth.users 테이블에서 사용자 정보 조회
      const { data: userData, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('사용자 인증 정보 조회 오류:', error)
        return
      }

      if (!userData.user) {
        console.error('사용자 정보가 없습니다.')
        return
      }

      // public.users 테이블에서 설정 정보 조회
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('settings, preferences')
        .eq('user_id', userData.user.id)
        .single()

      if (profileError) {
        console.error('사용자 프로필 조회 오류:', profileError)
        // 사용자 프로필이 없는 경우 기본값으로 생성
        if (profileError.code === 'PGRST116') {
          console.log('사용자 프로필이 없어서 새로 생성합니다.')
          await createUserProfile(userData.user.id)
        }
        return
      }

      console.log('조회된 사용자 프로필:', userProfile)

      // 설정 정보 업데이트 (빈 객체도 허용)
      if (userProfile?.settings) {
        // 빈 객체인 경우 기본값 유지, 데이터가 있는 경우에만 병합
        const hasSettingsData = Object.keys(userProfile.settings).length > 0
        if (hasSettingsData) {
          console.log('기존 설정 데이터를 적용합니다:', userProfile.settings)
          setUserSettings(prev => ({ ...prev, ...userProfile.settings }))
        } else {
          console.log('설정 데이터가 비어있어서 기본값을 유지합니다.')
        }
      }

      if (userProfile?.preferences) {
        // 빈 객체인 경우 기본값 유지, 데이터가 있는 경우에만 병합
        const hasPreferencesData = Object.keys(userProfile.preferences).length > 0
        if (hasPreferencesData) {
          console.log('기존 선호도 데이터를 적용합니다:', userProfile.preferences)
          setUserPreferences(prev => ({ ...prev, ...userProfile.preferences }))
        } else {
          console.log('선호도 데이터가 비어있어서 기본값을 유지합니다.')
        }
      }

    } catch (error) {
      console.error('사용자 설정 로드 중 오류:', error)
    } finally {
      setLoadingSettings(false)
    }
  }

  // 사용자 프로필 생성
  const createUserProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          settings: userSettings,
          preferences: userPreferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('사용자 프로필 생성 오류:', error)
      } else {
        console.log('사용자 프로필이 생성되었습니다.')
      }
    } catch (error) {
      console.error('사용자 프로필 생성 중 오류:', error)
    }
  }

  // 사용자 설정 저장
  const saveUserSettings = async () => {
    try {
      setSavingSettings(true)
      
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        console.error('사용자 인증 오류:', authError)
        alert('사용자 인증에 실패했습니다.')
        return
      }

      console.log('저장할 설정 데이터:', { userSettings, userPreferences })

      // 먼저 기존 레코드가 있는지 확인
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', userData.user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('사용자 확인 오류:', checkError)
        alert('사용자 정보 확인 중 오류가 발생했습니다.')
        return
      }

      let error
      if (existingUser) {
        // 기존 레코드 업데이트
        console.log('기존 사용자 레코드 업데이트')
        const result = await supabase
          .from('users')
          .update({
            settings: userSettings,
            preferences: userPreferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.user.id)
        error = result.error
      } else {
        // 새 레코드 생성
        console.log('새 사용자 레코드 생성')
        const result = await supabase
          .from('users')
          .insert({
            user_id: userData.user.id,
            settings: userSettings,
            preferences: userPreferences,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        error = result.error
      }

      if (error) {
        console.error('설정 저장 오류:', error)
        console.error('오류 세부사항:', JSON.stringify(error, null, 2))
        alert(`설정 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`)
        return
      }

      alert('설정이 성공적으로 저장되었습니다.')
      
      // 부모 컴포넌트에 설정 변경 알림
      if (onSettingsChange) {
        onSettingsChange(userSettings, userPreferences)
      }
      
      onClose()
    } catch (error) {
      console.error('설정 저장 중 오류:', error)
      alert('설정 저장 중 오류가 발생했습니다.')
    } finally {
      setSavingSettings(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">설정</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 로딩 상태 */}
        {loadingSettings ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">설정을 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
            {/* 모달 내용 */}
            <div className="p-6 space-y-6">
              {/* 일반 설정 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">일반 설정</h3>
                <div className="space-y-4">
                  {/* 테마 설정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테마
                    </label>
                    <select
                      value={userSettings.theme}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        theme: e.target.value as 'light' | 'dark' | 'system'
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">라이트</option>
                      <option value="dark">다크</option>
                      <option value="system">시스템 설정</option>
                    </select>
                  </div>

                  {/* 언어 설정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      언어
                    </label>
                    <select
                      value={userSettings.language}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        language: e.target.value as 'ko' | 'en'
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* 시간대 설정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시간대
                    </label>
                    <select
                      value={userSettings.timezone}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        timezone: e.target.value
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Asia/Seoul">서울 (UTC+9)</option>
                      <option value="America/New_York">뉴욕 (UTC-5)</option>
                      <option value="Europe/London">런던 (UTC+0)</option>
                      <option value="Asia/Tokyo">도쿄 (UTC+9)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 알림 설정 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">알림 설정</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">이메일 알림</span>
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.email}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">푸시 알림</span>
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.push}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          push: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">예외사항 알림</span>
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.exceptions}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          exceptions: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">급여 관련 알림</span>
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.payroll}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          payroll: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* 표시 설정 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">표시 설정</h3>
                <div className="space-y-4">
                  {/* 통화 설정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      통화
                    </label>
                    <select
                      value={userSettings.display.currency}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        display: {
                          ...prev.display,
                          currency: e.target.value as 'KRW' | 'USD'
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="KRW">원 (KRW)</option>
                      <option value="USD">달러 (USD)</option>
                    </select>
                  </div>

                  {/* 날짜 형식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      날짜 형식
                    </label>
                    <select
                      value={userSettings.display.dateFormat}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        display: {
                          ...prev.display,
                          dateFormat: e.target.value as 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>

                  {/* 시간 형식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시간 형식
                    </label>
                    <select
                      value={userSettings.display.timeFormat}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        display: {
                          ...prev.display,
                          timeFormat: e.target.value as '24h' | '12h'
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="24h">24시간 형식</option>
                      <option value="12h">12시간 형식</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 대시보드 설정 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">대시보드 설정</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">빠른 작업 표시</span>
                    <input
                      type="checkbox"
                      checked={userPreferences.dashboard.showQuickActions}
                      onChange={(e) => setUserPreferences(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          showQuickActions: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기본 보기 형식
                    </label>
                    <select
                      value={userPreferences.dashboard.defaultView}
                      onChange={(e) => setUserPreferences(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          defaultView: e.target.value as 'grid' | 'list'
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="grid">그리드</option>
                      <option value="list">리스트</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 급여 설정 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">급여 설정</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기본 근무시간 (주당)
                    </label>
                    <select
                      value={userPreferences.payroll.defaultWorkHours}
                      onChange={(e) => setUserPreferences(prev => ({
                        ...prev,
                        payroll: {
                          ...prev.payroll,
                          defaultWorkHours: parseInt(e.target.value) as 40 | 20
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={40}>40시간 (정규직)</option>
                      <option value={20}>20시간 (파트타임)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">상세 계산 내역 표시</span>
                    <input
                      type="checkbox"
                      checked={userPreferences.payroll.showDetailedCalculation}
                      onChange={(e) => setUserPreferences(prev => ({
                        ...prev,
                        payroll: {
                          ...prev.payroll,
                          showDetailedCalculation: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={onClose}
              >
                취소
              </Button>
              <Button
                onClick={saveUserSettings}
                disabled={savingSettings}
                className="flex items-center gap-2"
              >
                {savingSettings ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Settings 버튼 컴포넌트 (재사용 가능)
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <SettingsIcon className="h-4 w-4" />
      설정
    </Button>
  )
}

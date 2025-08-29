'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { UserUpdate } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'

/**
 * HR 관리 시스템 프로필 페이지 (통합 버전)
 * 
 * 기능:
 * 1. 사용자 기본 정보 표시 및 편집
 * 2. 아바타 이미지 업로드/변경/삭제
 * 3. 직원 정보 편집 (부서, 직책 등)
 * 4. 주소 정보 편집
 * 5. 계정 관리 (이메일/비밀번호 변경)
 * 6. 로그아웃
 */
function ProfilePageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile, loading, uploading, updateProfile, uploadAvatar, deleteAvatar } = useUser()
  
  // 상태 관리
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile')
  
  // 프로필 편집 폼 상태
  const [formData, setFormData] = useState<UserUpdate>({})
  
  // 계정 관리 폼 상태
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // 파일 업로드 관련
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 프로필 데이터가 로드되면 폼 초기화
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        department: profile.department || '',
        position: profile.position || '',
        employee_id: profile.employee_id || '',
        hire_date: profile.hire_date || '',
        birth_date: profile.birth_date || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'South Korea',
      })
    }
    if (user) {
      setNewEmail(user.email || '')
    }
  }, [profile, user])

  /**
   * 입력 필드 값 변경 핸들러
   */
  const handleInputChange = (field: keyof UserUpdate, value: string) => {
    const dateFields = ['birth_date', 'hire_date']
    const processedValue = dateFields.includes(field as string) 
      ? (value.trim() === '' ? null : value)
      : (value || null)
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))
  }

  /**
   * 프로필 정보 저장
   */
  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const cleanedFormData = {
        ...formData,
        birth_date: formData.birth_date && formData.birth_date.toString().trim() !== '' ? formData.birth_date : null,
        hire_date: formData.hire_date && formData.hire_date.toString().trim() !== '' ? formData.hire_date : null,
      }
      
      const { data, error } = await updateProfile(cleanedFormData)
      
      if (error) {
        setError(`프로필 업데이트 실패: ${typeof error === 'string' ? error : (error as Error)?.message || '알 수 없는 오류'}`)
      } else {
        setMessage('프로필이 성공적으로 업데이트되었습니다!')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('프로필 저장 오류:', err)
    } finally {
      setSaving(false)
    }
  }

  /**
   * 파일 선택 핸들러
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    handleAvatarUpload(file)
  }

  /**
   * 아바타 업로드 핸들러
   */
  const handleAvatarUpload = async (file: File) => {
    setError('')
    setMessage('')

    try {
      const { data, error } = await uploadAvatar(file)
      
      if (error) {
        setError(`아바타 업로드 실패: ${typeof error === 'string' ? error : (error as Error)?.message || '알 수 없는 오류'}`)
        setPreviewUrl(null)
      } else {
        setMessage('아바타가 성공적으로 업로드되었습니다!')
        setPreviewUrl(null)
      }
    } catch (err) {
      setError('아바타 업로드 중 오류가 발생했습니다.')
      console.error('아바타 업로드 오류:', err)
      setPreviewUrl(null)
    }
  }

  /**
   * 아바타 삭제 핸들러
   */
  const handleAvatarDelete = async () => {
    if (!confirm('아바타를 삭제하시겠습니까?')) return

    setError('')
    setMessage('')

    try {
      const { error } = await deleteAvatar()
      
      if (error) {
        setError(`아바타 삭제 실패: ${typeof error === 'string' ? error : (error as any)?.message || '알 수 없는 오류'}`)
      } else {
        setMessage('아바타가 삭제되었습니다.')
        setPreviewUrl(null)
      }
    } catch (err) {
      setError('아바타 삭제 중 오류가 발생했습니다.')
      console.error('아바타 삭제 오류:', err)
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
        router.push('/login')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('로그아웃 오류:', err)
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
          <p className="mt-2 text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">사용자 프로필</h1>
          <p className="text-gray-600 mt-2">HR 관리 시스템 사용자 정보 및 계정 관리</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center space-x-1 bg-gray-200 p-1 rounded-lg max-w-md mx-auto">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profile')}
            className="flex-1"
          >
            프로필 편집
          </Button>
          <Button
            variant={activeTab === 'account' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('account')}
            className="flex-1"
          >
            계정 관리
          </Button>
        </div>

        {/* 디버그 페이지 링크 */}
        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/profiles/debug')}
            variant="outline"
            size="sm"
          >
            🔧 디버그 정보 보기
          </Button>
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

        {/* 프로필 편집 탭 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* 아바타 업로드 섹션 */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>프로필 사진</CardTitle>
                  <CardDescription>아바타 이미지를 업로드하거나 변경하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                      {previewUrl || profile?.avatar_url ? (
                        <img 
                          src={previewUrl || profile?.avatar_url || ''} 
                          alt="프로필 사진"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-500 font-semibold">
                          {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>

                    {uploading && (
                      <Badge variant="secondary">업로드 중...</Badge>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        size="sm"
                      >
                        {profile?.avatar_url ? '변경' : '업로드'}
                      </Button>
                      
                      {profile?.avatar_url && (
                        <Button
                          onClick={handleAvatarDelete}
                          variant="outline"
                          size="sm"
                          disabled={uploading}
                        >
                          삭제
                        </Button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <p className="text-xs text-gray-500 text-center">
                      JPG, PNG, GIF 파일 지원<br />
                      최대 5MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 기본 정보 편집 */}
              <Card className="md:col-span-2 bg-white">
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>개인 정보를 입력하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_name">표시 이름 *</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name || ''}
                        onChange={(e) => handleInputChange('display_name', e.target.value)}
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">전화번호</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">이름</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="길동"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">성</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="홍"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">자기소개</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="간단한 자기소개를 작성해주세요..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birth_date">생년월일</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={formData.birth_date || ''}
                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">국가</Label>
                      <Input
                        id="country"
                        value={formData.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="South Korea"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 직원 정보 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>직원 정보</CardTitle>
                <CardDescription>회사 관련 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="employee_id">직원 ID</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id || ''}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                      placeholder="EMP001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">부서</Label>
                    <Input
                      id="department"
                      value={formData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="개발팀"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">직책</Label>
                    <Input
                      id="position"
                      value={formData.position || ''}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="시니어 개발자"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="hire_date">입사일</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date || ''}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 주소 정보 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>주소 정보</CardTitle>
                <CardDescription>거주지 주소를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address_line1">주소 1</Label>
                  <Input
                    id="address_line1"
                    value={formData.address_line1 || ''}
                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    placeholder="서울특별시 강남구 테헤란로 123"
                  />
                </div>
                <div>
                  <Label htmlFor="address_line2">주소 2 (선택)</Label>
                  <Input
                    id="address_line2"
                    value={formData.address_line2 || ''}
                    onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    placeholder="456호"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">도시</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="서울"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">시/도</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="서울특별시"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">우편번호</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code || ''}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 저장 버튼 */}
            <div className="flex justify-center">
              <Button
                onClick={handleSave}
                disabled={saving || !profile}
                className="min-w-32"
              >
                {saving ? '저장 중...' : '프로필 저장'}
              </Button>
            </div>
          </div>
        )}

        {/* 계정 관리 탭 */}
        {activeTab === 'account' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>사용자 정보</CardTitle>
                <CardDescription>현재 로그인된 사용자의 기본 정보</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">이메일</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    {user?.email_confirmed_at ? (
                      <Badge variant="default" className="text-xs">확인됨</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">미확인</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">가입일</Label>
                  <p className="text-sm text-gray-600">
                    {user?.created_at ? new Date(user.created_at).toLocaleString('ko-KR') : '정보 없음'}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">마지막 로그인</Label>
                  <p className="text-sm text-gray-600">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ko-KR') : '정보 없음'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
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
                    <Button type="submit" size="sm" disabled={updating || newEmail === user?.email}>
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
        )}
      </div>
    </div>
  )
}

// AuthGuard로 보호된 프로필 페이지 export
export default function ProfilePage() {
  return (
    <AuthGuard redirectTo="/profiles">
      <ProfilePageContent />
    </AuthGuard>
  )
}

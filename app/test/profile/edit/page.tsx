'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
// Avatar 컴포넌트는 현재 프로젝트에 없으므로 직접 구현
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { UserUpdate } from '@/lib/supabase'

/**
 * 프로필 편집 페이지
 * 
 * 이 컴포넌트는 다음 기능들을 제공합니다:
 * 1. 사용자 기본 정보 편집
 * 2. 아바타 이미지 업로드/변경/삭제
 * 3. 직원 정보 편집 (부서, 직책 등)
 * 4. 주소 정보 편집
 * 5. 개인 설정 관리 (JSONB)
 */
export default function ProfileEditPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { profile, loading, uploading, updateProfile, uploadAvatar, deleteAvatar } = useUser()
  
  // 폼 상태 관리
  const [formData, setFormData] = useState<UserUpdate>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  
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
        // 날짜 필드는 null을 빈 문자열로 변환
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
  }, [profile])

  /**
   * 입력 필드 값 변경 핸들러
   */
  const handleInputChange = (field: keyof UserUpdate, value: string) => {
    // 날짜 필드들은 빈 문자열을 null로 처리
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
      // 날짜 필드의 빈 문자열을 null로 변환
      const cleanedFormData = {
        ...formData,
        birth_date: formData.birth_date && formData.birth_date.trim() !== '' ? formData.birth_date : null,
        hire_date: formData.hire_date && formData.hire_date.trim() !== '' ? formData.hire_date : null,
      }
      
      console.log('정리된 폼 데이터:', cleanedFormData)
      
      const { data, error } = await updateProfile(cleanedFormData)
      
      if (error) {
        setError(`프로필 업데이트 실패: ${typeof error === 'string' ? error : (error as any)?.message || '알 수 없는 오류'}`)
      } else {
        setMessage('프로필이 성공적으로 업데이트되었습니다!')
        // 3초 후 프로필 페이지로 이동
        setTimeout(() => {
          router.push('/test/profile')
        }, 2000)
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

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 자동 업로드
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
        setError(`아바타 업로드 실패: ${typeof error === 'string' ? error : (error as any)?.message || '알 수 없는 오류'}`)
        setPreviewUrl(null)
      } else {
        setMessage('아바타가 성공적으로 업로드되었습니다!')
        setPreviewUrl(null) // 실제 이미지로 교체되므로 미리보기 제거
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

  // 로딩 상태
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              프로필을 편집하려면 먼저 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Link href="/test/login">
              <Button className="w-full">로그인 페이지로 이동</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">프로필 편집</h1>
          <p className="text-gray-600 mt-2">개인 정보를 수정하고 관리하세요</p>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-center space-x-4 text-sm">
          <Link href="/test" className="text-blue-600 hover:underline">
            테스트 홈
          </Link>
          <Link href="/test/profile" className="text-blue-600 hover:underline">
            프로필 보기
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

        <div className="grid md:grid-cols-3 gap-6">
          {/* 아바타 업로드 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>프로필 사진</CardTitle>
              <CardDescription>아바타 이미지를 업로드하거나 변경하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {/* 아바타 표시 */}
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

                {/* 업로드 상태 표시 */}
                {uploading && (
                  <Badge variant="secondary">업로드 중...</Badge>
                )}

                {/* 파일 선택 버튼 */}
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

                {/* 숨겨진 파일 입력 */}
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
          <Card className="md:col-span-2">
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
        <Card>
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
        <Card>
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
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => router.push('/test/profile')}
            variant="outline"
            disabled={saving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !profile}
            className="min-w-24"
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}

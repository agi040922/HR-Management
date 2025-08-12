import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserRow, UserInsert, UserUpdate } from '@/lib/supabase'
import { useAuth } from './useAuth'

/**
 * 사용자 프로필 정보를 관리하는 커스텀 훅
 * 
 * 이 훅은 다음 기능들을 제공합니다:
 * 1. 현재 사용자의 프로필 정보 조회
 * 2. 프로필 정보 업데이트
 * 3. 아바타 이미지 업로드
 * 4. 프로필 생성 (자동 생성되지 않은 경우)
 */
export const useUser = () => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  /**
   * 사용자 프로필 정보 가져오기
   */
  const fetchProfile = async () => {
    console.log('=== 프로필 가져오기 시작 ===')
    console.log('User ID:', user?.id)
    
    if (!user) {
      console.log('사용자가 로그인되지 않음')
      return
    }

    setLoading(true)
    try {
      console.log('users 테이블에서 프로필 조회 중...')
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('프로필 조회 결과:')
      console.log('Data:', data)
      console.log('Error:', error)
      console.log('Error code:', error?.code)
      console.log('Error message:', error?.message)

      if (error) {
        if (error.code === 'PGRST116') {
          // 프로필이 없는 경우 자동 생성
          console.log('프로필이 없어서 자동 생성합니다.')
          await createProfile()
        } else {
          console.error('프로필 가져오기 오류:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
      } else {
        console.log('프로필 로드 성공:', data)
        setProfile(data)
      }
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      console.error('Error type:', typeof err)
      console.error('Error details:', err)
    } finally {
      setLoading(false)
      console.log('=== 프로필 가져오기 종료 ===')
    }
  }

  /**
   * 새 프로필 생성 (자동 생성이 실패한 경우)
   */
  const createProfile = async (additionalData?: Partial<UserInsert>) => {
    if (!user) return

    try {
      const newProfile: UserInsert = {
        user_id: user.id,
        display_name: user.user_metadata?.display_name || user.email || '사용자',
        ...additionalData
      }

      const { data, error } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        console.error('프로필 생성 오류:', error)
        return { data: null, error }
      }

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      console.error('프로필 생성 중 예상치 못한 오류:', err)
      return { data: null, error: err }
    }
  }

  /**
   * 프로필 정보 업데이트
   */
  const updateProfile = async (updates: UserUpdate) => {
    console.log('=== 프로필 업데이트 시작 ===')
    console.log('User:', user?.id)
    console.log('Profile exists:', !!profile)
    console.log('Updates:', updates)
    
    if (!user || !profile) {
      const errorMsg = `User or profile not found - User: ${!!user}, Profile: ${!!profile}`
      console.error(errorMsg)
      return { data: null, error: errorMsg }
    }

    setLoading(true)
    try {
      console.log('Supabase 쿼리 실행 중...')
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      console.log('Supabase 응답:')
      console.log('Data:', data)
      console.log('Error:', error)
      console.log('Error type:', typeof error)
      console.log('Error details:', JSON.stringify(error, null, 2))

      if (error) {
        console.error('프로필 업데이트 오류:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        return { data: null, error }
      }

      setProfile(data)
      console.log('프로필 업데이트 성공!')
      return { data, error: null }
    } catch (err) {
      console.error('프로필 업데이트 중 예상치 못한 오류:', err)
      console.error('Error type:', typeof err)
      console.error('Error name:', (err as Error)?.name)
      console.error('Error message:', (err as Error)?.message)
      console.error('Error stack:', (err as Error)?.stack)
      return { data: null, error: err }
    } finally {
      setLoading(false)
      console.log('=== 프로필 업데이트 종료 ===')
    }
  }

  /**
   * 아바타 이미지 업로드
   */
  const uploadAvatar = async (file: File) => {
    if (!user) return { data: null, error: 'User not authenticated' }

    setUploading(true)
    try {
      // 파일 확장자 추출
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Supabase Storage에 파일 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('파일 업로드 오류:', uploadError)
        return { data: null, error: uploadError }
      }

      // 업로드된 파일의 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const avatarUrl = urlData.publicUrl

      // 프로필에 아바타 URL 업데이트
      const { data: profileData, error: profileError } = await updateProfile({
        avatar_url: avatarUrl
      })

      if (profileError) {
        return { data: null, error: profileError }
      }

      return { data: { url: avatarUrl, profile: profileData }, error: null }
    } catch (err) {
      console.error('아바타 업로드 중 예상치 못한 오류:', err)
      return { data: null, error: err }
    } finally {
      setUploading(false)
    }
  }

  /**
   * 아바타 이미지 삭제
   */
  const deleteAvatar = async () => {
    if (!user || !profile?.avatar_url) return { error: 'No avatar to delete' }

    try {
      // URL에서 파일 경로 추출
      const url = new URL(profile.avatar_url)
      const filePath = url.pathname.split('/').slice(-2).join('/')

      // Storage에서 파일 삭제
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) {
        console.error('파일 삭제 오류:', deleteError)
      }

      // 프로필에서 아바타 URL 제거
      const { data, error } = await updateProfile({
        avatar_url: null
      })

      return { data, error }
    } catch (err) {
      console.error('아바타 삭제 중 예상치 못한 오류:', err)
      return { data: null, error: err }
    }
  }

  /**
   * 설정 업데이트 (JSONB 필드)
   */
  const updatePreferences = async (preferences: Record<string, any>) => {
    return await updateProfile({ preferences })
  }

  /**
   * 시스템 설정 업데이트 (JSONB 필드)
   */
  const updateSettings = async (settings: Record<string, any>) => {
    return await updateProfile({ settings })
  }

  // 사용자가 로그인하면 프로필 정보 자동 로드
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile()
    } else {
      setProfile(null)
    }
  }, [isAuthenticated, user])

  return {
    // 상태
    profile,
    loading,
    uploading,
    
    // 메서드
    fetchProfile,
    createProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    updatePreferences,
    updateSettings,
  }
}

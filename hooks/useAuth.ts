import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * Supabase Auth 상태를 관리하는 커스텀 훅
 * 
 * 이 훅은 다음 기능들을 제공합니다:
 * 1. 현재 로그인된 사용자 정보
 * 2. 세션 정보
 * 3. 로딩 상태
 * 4. 인증 상태 변화 감지
 * 5. 기본적인 Auth 메서드들
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 가져오기
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('세션 가져오기 오류:', error)
        } else {
          setSession(session)
          setUser(session?.user || null)
        }
      } catch (err) {
        console.error('예상치 못한 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth 상태 변화:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /**
   * 이메일/비밀번호로 로그인
   */
  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  /**
   * 매직링크로 로그인
   */
  const signInWithMagicLink = async (email: string, redirectTo?: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/test/profile`
      }
    })
    return { data, error }
  }

  /**
   * 회원가입
   */
  const signUp = async (email: string, password: string, options?: {
    data?: Record<string, any>
    redirectTo?: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: options?.redirectTo || `${window.location.origin}/test/profile`,
        data: options?.data
      }
    })
    return { data, error }
  }

  /**
   * 소셜 로그인
   */
  const signInWithProvider = async (provider: 'google' | 'github' | 'facebook', redirectTo?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/test/profile`
      }
    })
    return { data, error }
  }

  /**
   * 로그아웃
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  /**
   * 비밀번호 재설정
   */
  const resetPassword = async (email: string, redirectTo?: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/test/profile`
    })
    return { data, error }
  }

  /**
   * 사용자 정보 업데이트
   */
  const updateUser = async (updates: {
    email?: string
    password?: string
    data?: Record<string, any>
  }) => {
    const { data, error } = await supabase.auth.updateUser(updates)
    return { data, error }
  }

  return {
    // 상태
    user,
    session,
    loading,
    isAuthenticated: !!user,
    
    // 메서드
    signInWithEmail,
    signInWithMagicLink,
    signUp,
    signInWithProvider,
    signOut,
    resetPassword,
    updateUser,
  }
}

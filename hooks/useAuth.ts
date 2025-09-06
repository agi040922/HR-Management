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
      console.log('🔄 [useAuth] 초기 세션 확인 중...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ [useAuth] 세션 가져오기 오류:', error)
        } else {
          console.log('✅ [useAuth] 초기 세션 확인 완료:', {
            hasSession: !!session,
            userId: session?.user?.id,
            email: session?.user?.email,
            provider: session?.user?.app_metadata?.provider
          })
          setSession(session)
          setUser(session?.user || null)
        }
      } catch (err) {
        console.error('❌ [useAuth] 예상치 못한 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔔 [useAuth] Auth 상태 변화:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          provider: session?.user?.app_metadata?.provider
        })
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      console.log('🧹 [useAuth] 구독 해제')
      subscription.unsubscribe()
    }
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
        emailRedirectTo: redirectTo || `${window.location.origin}/profiles`
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
        emailRedirectTo: options?.redirectTo || `${window.location.origin}/profiles`,
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
        redirectTo: redirectTo || `${window.location.origin}/profiles`
      }
    })
    return { data, error }
  }

  /**
   * 로그아웃 - 배포 환경 호환성 개선
   */
  const signOut = async () => {
    try {
      console.log('🔄 [useAuth] 로그아웃 시도 중...')
      
      // 1차: 일반 로그아웃 시도
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.warn('⚠️ [useAuth] 일반 로그아웃 실패, 강제 로그아웃 시도:', error.message)
        
        // 2차: 강제 로그아웃 (로컬 상태만 클리어)
        setUser(null)
        setSession(null)
        
        // 3차: 로컬 스토리지 및 쿠키 수동 클리어
        if (typeof window !== 'undefined') {
          // 로컬 스토리지 클리어
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key)
            }
          })
          
          // 쿠키 클리어
          document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=")
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
            if (name.startsWith('sb-') || name.includes('supabase')) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            }
          })
        }
        
        console.log('✅ [useAuth] 강제 로그아웃 완료')
        return { error: null } // 강제 로그아웃 성공으로 처리
      }
      
      console.log('✅ [useAuth] 정상 로그아웃 완료')
      return { error }
      
    } catch (err) {
      console.error('❌ [useAuth] 로그아웃 예외:', err)
      
      // 예외 발생 시에도 강제 로그아웃
      setUser(null)
      setSession(null)
      
      if (typeof window !== 'undefined') {
        localStorage.clear()
        // 모든 쿠키 클리어
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        })
      }
      
      return { error: null } // 강제 로그아웃으로 처리
    }
  }

  /**
   * 비밀번호 재설정
   */
  const resetPassword = async (email: string, redirectTo?: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/profiles`
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

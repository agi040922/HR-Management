"use client"

import Link from "next/link"
import { Building2, Bell, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"

// 디자인 시스템 색상 상수
const DESIGN_COLORS = {
  primary: {
    main: '#1A73E8',
    text: '#FFFFFF'
  },
  text: {
    primary: '#202124',
    secondary: '#5F6368',
    muted: '#9AA0A6'
  },
  background: {
    border: '#E0E0E0',
    hover: '#F8F9FA'
  }
}

interface UserProfile {
  display_name?: string
  first_name?: string
  last_name?: string
  employee_id?: string
}

export function Header() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('display_name, first_name, last_name, employee_id')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('사용자 프로필 조회 오류:', error)
        } else {
          setUserProfile(data)
        }
      } catch (err) {
        console.error('프로필 조회 중 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  // 표시할 사용자 이름 결정
  const getDisplayName = () => {
    if (loading) return "로딩중..."
    if (!userProfile) return "사용자"
    
    if (userProfile.display_name) {
      return userProfile.display_name
    }
    
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.last_name}${userProfile.first_name}`
    }
    
    if (userProfile.first_name) {
      return userProfile.first_name
    }
    
    return userProfile.employee_id || "사용자"
  }

  // 아바타에 표시할 첫 글자
  const getAvatarInitial = () => {
    const displayName = getDisplayName()
    if (displayName === "로딩중..." || displayName === "사용자") return "관"
    return displayName.charAt(0)
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-3 bg-white shadow-sm z-50"
      style={{
        borderBottom: `1px solid ${DESIGN_COLORS.background.border}`,
        height: '64px'
      }}
    >
      {/* 로고 및 제목 */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Building2 
            className="h-7 w-7" 
            style={{ color: DESIGN_COLORS.primary.main }}
          />
          <span 
            className="text-xl font-semibold"
            style={{ 
              color: DESIGN_COLORS.text.primary,
              fontSize: '20px',
              fontWeight: '600'
            }}
          >
            HR 관리 시스템
          </span>
        </Link>
      </div>

      {/* 중앙 검색바 */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
            style={{ color: DESIGN_COLORS.text.muted }}
          />
          <Input
            placeholder="직원, 부서, 문서 검색..."
            className="pl-10 pr-4 py-2 w-full"
            style={{
              backgroundColor: DESIGN_COLORS.background.hover,
              border: `1px solid ${DESIGN_COLORS.background.border}`,
              borderRadius: '24px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* 우측 액션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 알림 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 rounded-full hover:bg-gray-100"
          style={{
            color: DESIGN_COLORS.text.secondary
          }}
        >
          <Bell className="h-5 w-5" />
          {/* 알림 배지 */}
          <span 
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center"
            style={{
              backgroundColor: '#EA4335',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            3
          </span>
        </Button>

        {/* 사용자 프로필 */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
          asChild
        >
          <Link href="/profiles">
            <div 
              className="flex items-center justify-center rounded-full"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: DESIGN_COLORS.primary.main,
                color: DESIGN_COLORS.primary.text,
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {getAvatarInitial()}
            </div>
            <div className="text-left">
              <div 
                className="text-sm font-medium"
                style={{
                  color: DESIGN_COLORS.text.primary,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {getDisplayName()}
              </div>
            </div>
          </Link>
        </Button>
      </div>
    </header>
  )
}

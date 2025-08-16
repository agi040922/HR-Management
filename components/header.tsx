"use client"

import Link from "next/link"
import { Building2, Bell, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

export function Header() {
  return (
    <header 
      className="flex items-center justify-between px-6 py-3 bg-white"
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
        >
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
            관
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
              관리자
            </div>
          </div>
        </Button>
      </div>
    </header>
  )
}

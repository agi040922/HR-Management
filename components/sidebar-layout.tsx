"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Settings from "@/components/Settings"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="relative h-screen overflow-hidden">
      {/* 고정 헤더 */}
      <Header />
      
      {/* 모바일 햄버거 메뉴 버튼 */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* 모바일 오버레이 */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 고정 사이드바 */}
      <div
        className={`
          fixed top-16 left-0 z-50 transition-transform duration-300 ease-in-out
          ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          md:translate-x-0
        `}
      >
        <Sidebar 
          isMobile={isMobile}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          onCollapse={setIsCollapsed}
          onSettingsOpen={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main 
        className="pt-16 overflow-auto h-screen transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0' : (isCollapsed ? '72px' : '220px'),
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <div className="h-full p-3">
          {children}
        </div>
      </main>
      
      {/* Settings 모달 - 전체 화면에서 독립적으로 표시 */}
      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

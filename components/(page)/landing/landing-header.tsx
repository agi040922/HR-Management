'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, Menu, X, Bell, Search } from 'lucide-react'

const categories = [
  { name: '근무관리', href: '#work-management', color: 'from-blue-500 to-blue-600' },
  { name: '급여관리', href: '#payroll', color: 'from-green-500 to-green-600' },
  { name: '인사관리', href: '#hr', color: 'from-purple-500 to-purple-600' },
  { name: '전자계약', href: '#contract', color: 'from-orange-500 to-orange-600' },
  { name: '출퇴근', href: '#attendance', color: 'from-red-500 to-red-600' },
  { name: '휴가관리', href: '#vacation', color: 'from-teal-500 to-teal-600' },
  { name: '근태정산', href: '#settlement', color: 'from-indigo-500 to-indigo-600' },
  { name: '시설관리', href: '#facility', color: 'from-pink-500 to-pink-600' }
]

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 w-full z-50 bg-white transition-all duration-300 ${
      isScrolled ? 'shadow-lg backdrop-blur-md bg-white/95' : 'shadow-sm'
    }`}>
      {/* 상단 프로모션 배너 */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center space-x-2">
              <span className="animate-pulse">🎊</span>
              <span className="text-sm font-medium">
                새로운 HR 솔루션 런칭! 14일 무료 체험 기회를 놓치지 마세요
              </span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">NEW</span>
            </div>
            <button className="text-white/80 hover:text-white text-sm transition-colors">
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 섹션 */}
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
                    <span className="text-white font-bold text-lg">F</span>
                          </div>
                          <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      FAIR 인사노무
                          </div>
                    <div className="text-xs text-gray-500 font-medium">Smart HR Solution</div>
                  </div>
                </div>
              </div>

              {/* 데스크톱 네비게이션 */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="/landing" className="group relative text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  홈
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/solutions" className="group relative text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  솔루션
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/hr-management" className="group relative text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  인사노무
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </nav>
            </div>

            {/* 우측 버튼 그룹 */}
            <div className="flex items-center space-x-4">
                            {/* 검색 버튼 */}
              <button className="hidden sm:flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Search className="w-5 h-5" />
              </button>
              
              {/* 알림 버튼 */}
              <button className="hidden sm:flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* 로그인 버튼 */}
              <button className="hidden sm:block text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200 border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50">
                로그인
              </button>
              
              {/* 내 예약 버튼 */}
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                내 예약
              </button>

          {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
            </button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <a href="/landing" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                홈
              </a>
              <a href="/solutions" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                솔루션
              </a>
              <a href="/hr-management" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                인사노무
              </a>
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  로그인
                </button>
                <button className="w-full text-left px-3 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  내 예약
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 카테고리 탭 섹션 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-3 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {categories.map((category, index) => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(index)}
                  className={`group relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
                    activeCategory === index
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <span className="relative z-10">{category.name}</span>
                  {activeCategory === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            <button className="ml-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              더보기 →
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
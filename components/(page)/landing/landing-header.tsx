'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, User, Calendar } from 'lucide-react'

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <span className="relative z-10 animate-bounce">🎉 HR 관리 시스템 런칭 기념 특가! 지금 가입하고 3개월 무료 이용하세요</span>
        <button className="ml-4 text-blue-200 hover:text-white transition-colors duration-200 relative z-10">×</button>
      </div>

      {/* 메인 헤더 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="group">
              <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-105">
                FAIR인사노무
              </span>
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav 
            className="hidden md:flex items-center space-x-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="group relative">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium">
                홈
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
            
            <div className="group relative">
              <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium">
                솔루션
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              
              {/* 드롭다운 메뉴 */}
              <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
                isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}>
                <div className="p-4 space-y-3">
                  <Link href="/attendance" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    📅 근태관리
                  </Link>
                  <Link href="/payroll" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    💰 급여관리
                  </Link>
                  <Link href="/hr" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    👥 인사관리
                  </Link>
                  <Link href="/contract" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    📋 전자계약
                  </Link>
                  <Link href="/analytics" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    📊 HR분석
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium">
                요금제
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </nav>

          {/* 우측 버튼들 */}
          <div className="flex items-center space-x-4">
            <button className="group px-3 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium">
              로그인
              <span className="block w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="text-sm font-medium">무료 체험</span>
            </button>
            <button className="md:hidden group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className="block w-5 h-0.5 bg-gray-600 mb-1 transition-all duration-300 group-hover:bg-blue-600"></span>
                <span className="block w-5 h-0.5 bg-gray-600 mb-1 transition-all duration-300 group-hover:bg-blue-600"></span>
                <span className="block w-5 h-0.5 bg-gray-600 transition-all duration-300 group-hover:bg-blue-600"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 카테고리 네비게이션 */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-8 py-3 overflow-x-auto">
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-900 hover:text-blue-600">근태관리</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">급여관리</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">인사관리</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">전자계약</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">성과관리</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">채용관리</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">교육관리</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">분석리포트</Link>
            <Link href="#" className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-600">고객지원</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
'use client'

import React, { useState } from 'react'
import { Menu, X, Calendar, Users, BarChart3, Clock, MessageSquare, FileText, Calculator, Building2, Smartphone, Monitor } from 'lucide-react'

const productMenuItems = [
  { name: '근무일정', description: '근로/휴게시간을 계획하고 각종 근로제도 및 근무유형에 대응합니다', icon: Calendar },
  { name: '출퇴근기록', description: '신뢰가는 출퇴근기록과 자동화된 근태관리를 제공합니다', icon: Clock },
  { name: '휴가관리', description: '휴가 발생부터 잔여일수, 연차촉진까지 간편하게 관리합니다', icon: Users },
  { name: '전자결재', description: '고도화된 근태 결재와 맞춤형 결재를 지원합니다', icon: FileText },
  { name: '메시지', description: '사내 공지와 맞춤화된 사내 알림을 시프티 데이터와 연계하여 발송합니다', icon: MessageSquare },
  { name: '전자계약', description: '사내 모든 계약서를 템플릿으로 관리하고 복잡한 계약과정을 간소화합니다', icon: FileText },
  { name: '근태정산', description: '연장, 야간, 휴일근로 등 근태 및 급여에 대한 실시간 정산 데이터를 제공합니다', icon: BarChart3 },
  { name: '연동', description: '출입 기록 연동부터 인사정보, 채용 관리까지 뛰어난 확장성을 제공합니다', icon: Building2 },
  { name: '모바일 앱', description: '시프티가 제공하는 모든 기능을 모바일 앱에서 동일하게 경험하세요', icon: Smartphone },
  { name: '시프티 데스크탑', description: 'PC-OFF 및 이석관리 기능이 탑재된 사무직 근태관리에 탁월한 제품입니다', icon: Monitor }
]

const solutionMenuItems = [
  { name: '엔터프라이즈', description: '대기업을 위한 맞춤형 솔루션' },
  { name: '스타트업', description: '빠르게 성장하는 스타트업을 위한 솔루션' },
  { name: '주 52시간제', description: '주 52시간제 대응을 위한 완벽한 솔루션' },
  { name: '유연근무제', description: '다양한 유연근무제 관리' },
  { name: '원격근무 / 재택근무', description: '원격근무 환경을 위한 솔루션' },
  { name: 'PC오프제', description: 'PC 사용 시간 관리 솔루션' }
]

const resourceMenuItems = [
  { name: '고객센터', description: '궁금한 점을 해결해드립니다' },
  { name: '비디오 가이드', description: '시프티 사용법을 영상으로 확인하세요' },
  { name: '용어사전', description: '근태관리 용어를 쉽게 이해하세요' },
  { name: '보안', description: '시프티의 보안 정책을 확인하세요' }
]

const calculatorMenuItems = [
  { name: '주휴수당 계산기', description: '주휴수당을 간편하게 계산하세요' },
  { name: '연차 계산기', description: '연차 발생일수를 계산하세요' },
  { name: '연차수당 계산기', description: '연차수당을 계산하세요' },
  { name: '퇴직금 계산기', description: '퇴직금을 미리 계산해보세요' },
  { name: '4대보험료 계산기', description: '4대보험료를 계산하세요' }
]

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              SHIFTEE
            </div>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium relative transition-colors duration-200">
                제품소개
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              {/* 제품소개 드롭다운 */}
              {activeDropdown === 'products' && (
                <div className="absolute top-full left-0 w-96 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="grid gap-4">
                    {productMenuItems.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('solutions')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium relative transition-colors duration-200">
                솔루션
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              {/* 솔루션 드롭다운 */}
              {activeDropdown === 'solutions' && (
                <div className="absolute top-full left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="grid gap-3">
                    {solutionMenuItems.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium relative transition-colors duration-200">
                요금제
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>

            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium relative transition-colors duration-200">
                리소스
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              {/* 리소스 드롭다운 */}
              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="grid gap-3">
                    {resourceMenuItems.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('calculator')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium relative transition-colors duration-200">
                자동계산기
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              {/* 자동계산기 드롭다운 */}
              {activeDropdown === 'calculator' && (
                <div className="absolute top-full left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="grid gap-3">
                    {calculatorMenuItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <Calculator size={16} className="text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* CTA 버튼들 */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200 relative group">
              로그인
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105">
              무료 체험
            </button>
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105">
              도입 문의하기
            </button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-5 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  제품소개
                </button>
                <button className="w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  솔루션
                </button>
                <button className="w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  요금제
                </button>
                <button className="w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  리소스
                </button>
                <button className="w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  자동계산기
                </button>
              </div>
              <div className="pt-4 space-y-3 border-t border-gray-100">
                <button className="w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  로그인
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-lg text-base font-medium transition-colors">
                  무료 체험
                </button>
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white px-3 py-3 rounded-lg text-base font-medium transition-colors">
                  도입 문의하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

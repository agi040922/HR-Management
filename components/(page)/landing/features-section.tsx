'use client'

import React, { useState } from 'react'
import { ChevronRight, Flame, Sparkles, Clock } from 'lucide-react'

const categories = [
  { id: 'hr-ranking', name: 'HR 솔루션 랭킹', color: 'bg-blue-500' },
  { id: 'payroll', name: '급여관리', color: 'bg-green-500' },
  { id: 'attendance', name: '근태관리', color: 'bg-purple-500' },
  { id: 'contract', name: '전자계약', color: 'bg-orange-500' },
  { id: 'performance', name: '성과관리', color: 'bg-red-500' },
  { id: 'recruitment', name: '채용관리', color: 'bg-teal-500' },
  { id: 'training', name: '교육관리', color: 'bg-indigo-500' },
  { id: 'analytics', name: 'HR 분석', color: 'bg-pink-500' }
]

const rankingData = {
  'hr-ranking': [
    { 
      rank: 1, 
      title: "FAIR 통합 인사관리 시스템", 
      company: "전사 통합 솔루션", 
      period: "2025.1.1 ~ 12.31", 
      badge: "좌석우위",
      badgeColor: "bg-red-500"
    },
    { 
      rank: 2, 
      title: "스마트 근무시간 관리", 
      company: "유연근무 전용", 
      period: "2025.3.1 ~ 11.30", 
      badge: "단독판매",
      badgeColor: "bg-blue-500"
    },
    { 
      rank: 3, 
      title: "AI 기반 인사평가 시스템", 
      company: "성과관리 특화", 
      period: "2025.2.15 ~ 12.15", 
      badge: "단독판매",
      badgeColor: "bg-blue-500"
    },
    { 
      rank: 4, 
      title: "모바일 출퇴근 관리", 
      company: "모바일 전용", 
      period: "2025.1.15 ~ 12.31", 
      badge: "좌석우위",
      badgeColor: "bg-red-500"
    },
    { 
      rank: 5, 
      title: "전자계약 & 전자서명", 
      company: "계약관리 솔루션", 
      period: "2025.4.1 ~ 10.31", 
      badge: "좌석우위",
      badgeColor: "bg-red-500"
    },
    { 
      rank: 6, 
      title: "급여 자동계산 시스템", 
      company: "급여관리 특화", 
      period: "2025.2.1 ~ 11.30", 
      badge: "단독판매",
      badgeColor: "bg-blue-500"
    },
    { 
      rank: 7, 
      title: "클라우드 인사정보 시스템", 
      company: "클라우드 솔루션", 
      period: "2025.3.15 ~ 12.15", 
      badge: "좌석우위",
      badgeColor: "bg-red-500"
    },
    { 
      rank: 8, 
      title: "휴가 및 연차 관리", 
      company: "휴가관리 전용", 
      period: "2025.1.10 ~ 12.20", 
      badge: "단독판매",
      badgeColor: "bg-blue-500"
    },
    { 
      rank: 9, 
      title: "인재채용 관리 시스템", 
      company: "채용관리 특화", 
      period: "2025.5.1 ~ 12.31", 
      badge: "단독판매",
      badgeColor: "bg-blue-500"
    },
    { 
      rank: 10, 
      title: "HR 대시보드 & 분석", 
      company: "데이터 분석", 
      period: "2025.2.1 ~ 12.31", 
      badge: "좌석우위",
      badgeColor: "bg-red-500"
    }
  ]
}

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState('hr-ranking')
  const [showDiscount, setShowDiscount] = useState(false)

  const currentData = rankingData[activeTab] || rankingData['hr-ranking']

  const discountItems = [
    {
      type: "얼리버드 할인",
      title: "FAIR 통합 HR 솔루션",
      discount: "40%",
      price: "120,000원",
      period: "2025.1.1 ~ 3.31"
    },
    {
      type: "신규고객 할인",
      title: "스마트 근무관리",
      discount: "50%",
      price: "80,000원",
      period: "2025.1.15 ~ 2.28"
    },
    {
      type: "패키지 할인",
      title: "전사 통합 솔루션",
      discount: "60%",
      price: "200,000원",
      period: "2025.2.1 ~ 4.30"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            HR 솔루션 랭킹
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            가장 인기 있는 HR 솔루션들을 확인하고 우리 회사에 맞는 최적의 선택을 해보세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === category.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activeTab === category.id ? category.color : 'bg-gray-300'
                    }`}></div>
                    <span>{category.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 할인 혜택 / 랭킹 토글 */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setShowDiscount(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showDiscount 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              인기 랭킹
            </button>
            <button
              onClick={() => setShowDiscount(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showDiscount 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              할인 혜택
            </button>
          </div>
        </div>

        {/* 랭킹 목록 */}
        {!showDiscount ? (
          <div className="space-y-3">
            {currentData.map((item, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* 순위 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      item.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-400'
                    }`}>
                      {item.rank}
                    </div>

                    {/* 솔루션 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>{item.company}</div>
                        <div>{item.period}</div>
                      </div>
                    </div>
                  </div>

                  {/* 화살표 */}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}

            {/* 더보기 버튼 */}
            <div className="text-center pt-6">
                            <button className="inline-flex items-center px-6 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                HR 솔루션 랭킹 전체보기
                <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
        ) : (
          /* 할인 혜택 섹션 */
          <div className="grid md:grid-cols-3 gap-6">
            {discountItems.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <FireIcon className="w-5 h-5 text-red-500" />
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {item.type}
                  </span>
        </div>

                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.period}</p>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-red-500">{item.discount}</span>
                  <span className="text-lg font-semibold text-gray-900">{item.price}</span>
          </div>

                <button className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium">
                  지금 신청하기
                </button>
            </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
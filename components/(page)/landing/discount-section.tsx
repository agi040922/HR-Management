'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Flame, ChevronRight, Tag } from 'lucide-react'

interface DiscountItem {
  id: string
  type: 'time-deal' | 'final-call' | 'early-bird' | 'preview'
  title: string
  subtitle: string
  originalPrice: number
  discountPrice: number
  discountRate: number
  period: string
  dDay?: number
  timeLeft?: string
  category: string
  isHot?: boolean
}

const discountItems: DiscountItem[] = [
  {
    id: '1',
    type: 'time-deal',
    title: 'FAIR 통합 HR 솔루션',
    subtitle: '전사 인사관리 시스템',
    originalPrice: 500000,
    discountPrice: 300000,
    discountRate: 40,
    period: '2025.1.1 ~ 3.31',
    dDay: 1,
    timeLeft: '00:23:45',
    category: '통합솔루션',
    isHot: true
  },
  {
    id: '2',
    type: 'time-deal',
    title: '스마트 근태관리',
    subtitle: '출퇴근 및 근무시간 관리',
    originalPrice: 200000,
    discountPrice: 130000,
    discountRate: 35,
    period: '2025.1.15 ~ 2.28',
    dDay: 3,
    timeLeft: '00:23:45',
    category: '근태관리'
  },
  {
    id: '3',
    type: 'time-deal',
    title: 'AI 급여계산 시스템',
    subtitle: '자동 급여정산 솔루션',
    originalPrice: 300000,
    discountPrice: 210000,
    discountRate: 30,
    period: '2025.2.1 ~ 4.30',
    dDay: 3,
    timeLeft: '00:23:45',
    category: '급여관리'
  },
  {
    id: '4',
    type: 'final-call',
    title: '전자계약 시스템',
    subtitle: '디지털 계약 및 전자서명',
    originalPrice: 250000,
    discountPrice: 125000,
    discountRate: 50,
    period: '2025.1.1 ~ 1.31',
    dDay: 3,
    category: '전자계약'
  },
  {
    id: '5',
    type: 'final-call',
    title: '모바일 HR 앱',
    subtitle: '스마트폰 인사관리',
    originalPrice: 180000,
    discountPrice: 81000,
    discountRate: 55,
    period: '2025.1.10 ~ 2.10',
    dDay: 3,
    category: '모바일앱'
  },
  {
    id: '6',
    type: 'early-bird',
    title: '성과관리 시스템',
    subtitle: '인사평가 및 KPI 관리',
    originalPrice: 400000,
    discountPrice: 240000,
    discountRate: 40,
    period: '2025.3.1 ~ 12.31',
    category: '성과관리'
  }
]

const TypeBadge = ({ type, dDay, isHot }: { type: string, dDay?: number, isHot?: boolean }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'time-deal':
        return { text: '타임딜', bgColor: 'bg-red-500', icon: Clock }
      case 'final-call':
        return { text: '파이널콜', bgColor: 'bg-purple-500', icon: Flame }
      case 'early-bird':
        return { text: '얼리버드 할인', bgColor: 'bg-green-500', icon: Tag }
      case 'preview':
        return { text: '프리뷰 할인', bgColor: 'bg-blue-500', icon: Tag }
      default:
        return { text: '할인', bgColor: 'bg-gray-500', icon: Tag }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-white text-xs font-medium ${config.bgColor}`}>
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
      </div>
      {dDay && (
        <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
          D-{dDay}
        </div>
      )}
      {isHot && (
        <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium animate-pulse">
          HOT
        </div>
      )}
    </div>
  )
}

const CountdownTimer = ({ timeLeft }: { timeLeft: string }) => {
  const [time, setTime] = useState(timeLeft)

  useEffect(() => {
    const interval = setInterval(() => {
      // 실제로는 서버에서 남은 시간을 받아와야 함
      // 여기서는 시연용으로 고정값 사용
      setTime(timeLeft)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  return (
    <div className="text-red-600 font-mono text-sm font-bold">
      {time}
    </div>
  )
}

export default function DiscountSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  const nextSlide = () => {
    const maxIndex = Math.ceil(discountItems.length / itemsPerPage) - 1
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1)
  }

  const prevSlide = () => {
    const maxIndex = Math.ceil(discountItems.length / itemsPerPage) - 1
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1)
  }

  const currentItems = discountItems.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  )

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🔥 지금 할인중!
            </h2>
            <p className="text-gray-600">
              한정 기간 특가 혜택을 놓치지 마세요
            </p>
          </div>
          
          {/* 네비게이션 버튼 */}
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* 할인 아이템 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
              <div className="p-6">
                {/* 타입 배지 */}
                <TypeBadge type={item.type} dDay={item.dDay} isHot={item.isHot} />

                {/* 타이머 (타임딜인 경우) */}
                {item.type === 'time-deal' && item.timeLeft && (
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-red-500" />
                    <CountdownTimer timeLeft={item.timeLeft} />
                  </div>
                )}

                {/* 제품 정보 */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600">{item.subtitle}</p>
                  <p className="text-xs text-gray-500">{item.period}</p>
                  <p className="text-xs text-blue-600 font-medium">{item.category}</p>
                </div>

                {/* 가격 정보 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-500">
                      {item.discountRate}%
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {item.discountPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    {item.originalPrice.toLocaleString()}원
                  </div>
                </div>

                {/* 신청 버튼 */}
                <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm">
                  지금 신청하기
                </button>
              </div>

              {/* 할인률 라벨 */}
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold transform rotate-12 translate-x-2 -translate-y-1">
                -{item.discountRate}%
              </div>
            </div>
          ))}
        </div>

        {/* 페이지 인디케이터 */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(discountItems.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* 더 많은 혜택 버튼 */}
        <div className="text-center mt-8">
          <button className="inline-flex items-center px-6 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            더 많은 할인 혜택 보기
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  )
}

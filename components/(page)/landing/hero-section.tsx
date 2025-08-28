'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const bannerData = [
  {
    id: 1,
    title: "AI 기반 스마트 HR 솔루션",
    subtitle: "인공지능이 제안하는 최적의 인사관리",
    description: "데이터 분석을 통한 효율적인 인력관리로 생산성을 200% 향상시키세요",
    bgColor: "bg-slate-900",
    buttonText: "AI 솔루션 체험하기",
    icon: "🤖"
  },
  {
    id: 2,
    title: "근무시간 완벽 관리",
    subtitle: "유연근무제부터 교대근무까지",
    description: "52시간 근무제 대응은 물론, 모든 근무형태를 지원하는 올인원 솔루션",
    bgColor: "bg-gray-800",
    buttonText: "근무관리 시작하기",
    icon: "⏰"
  },
  {
    id: 3,
    title: "전자계약 & 급여정산",
    subtitle: "디지털 트랜스포메이션",
    description: "종이계약서는 이제 그만! 디지털 계약부터 자동 급여계산까지 한번에",
    bgColor: "bg-zinc-800",
    buttonText: "전자계약 체험하기",
    icon: "📝"
  },
  {
    id: 4,
    title: "실시간 HR 대시보드",
    subtitle: "데이터 기반 의사결정",
    description: "실시간 인사현황부터 예측 분석까지, 경영진을 위한 인사이트 제공",
    bgColor: "bg-slate-800",
    buttonText: "대시보드 둘러보기",
    icon: "📊"
  }
]

const quickAccessItems = [
  { icon: "💼", name: "근태관리", desc: "출퇴근 기록" },
  { icon: "💰", name: "급여계산", desc: "자동 정산" },
  { icon: "📋", name: "인사평가", desc: "성과관리" },
  { icon: "🏖️", name: "휴가신청", desc: "연차관리" },
  { icon: "📄", name: "전자결재", desc: "승인처리" },
  { icon: "👥", name: "조직관리", desc: "인사발령" }
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerData.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerData.length) % bannerData.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="relative pt-16 pb-8 bg-gray-50">
      {/* 메인 캐러셀 배너 - 전체 화면 너비로 변경 */}
      <div className="w-full mb-12">
        <div 
          className="relative h-[500px] w-full overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* 배너 콘텐츠 */}
          {bannerData.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <div className={`w-full h-full ${banner.bgColor} flex items-center`}>
                <div className="absolute inset-0 bg-black/20"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto px-8 text-center text-white">
                  <div className="text-6xl mb-6">{banner.icon}</div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {banner.title}
                  </h1>
                  <p className="text-xl lg:text-2xl mb-2 font-medium text-white/90">
                    {banner.subtitle}
                  </p>
                  <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {banner.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-gray-900 px-8 py-4 font-semibold hover:bg-gray-100 transition-all duration-200">
                      {banner.buttonText}
                    </button>
                    <button className="border-2 border-white text-white px-8 py-4 font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200">
                      더 알아보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 이전/다음 버튼 */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
            {bannerData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* 진행률 바 */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-200"
              style={{ 
                width: `${((currentSlide + 1) / bannerData.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* 빠른 접근 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">빠른 접근</h2>
          <p className="text-gray-600">자주 사용하는 기능들을 바로 이용해보세요</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickAccessItems.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-slate-800 p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">1,000+</div>
              <div className="text-white/80">도입 기업</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-white/80">사용자</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-white/80">서비스 안정성</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-white/80">고객 지원</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
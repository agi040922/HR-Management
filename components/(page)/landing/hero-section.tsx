'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const bannerImages = [
  {
    id: 1,
    image: "/api/placeholder/1200/400",
    alt: "HR 관리 시스템 메인 배너",
    link: "/features"
  },
  {
    id: 2,
    image: "/api/placeholder/1200/400",
    alt: "급여 관리 솔루션",
    link: "/payroll"
  },
  {
    id: 3,
    image: "/api/placeholder/1200/400", 
    alt: "근태 관리 시스템",
    link: "/attendance"
  },
  {
    id: 4,
    image: "/api/placeholder/1200/400",
    alt: "전자 계약 서비스",
    link: "/contract"
  },
  {
    id: 5,
    image: "/api/placeholder/1200/400",
    alt: "인사 평가 시스템",
    link: "/evaluation"
  }
]

const popularItems = [
  {
    id: 1,
    title: "FAIR 통합 HR 시스템",
    image: "/api/placeholder/200/150",
    category: "통합솔루션"
  },
  {
    id: 2,
    title: "스마트 근무관리",
    image: "/api/placeholder/200/150", 
    category: "근태관리"
  },
  {
    id: 3,
    title: "급여 자동계산",
    image: "/api/placeholder/200/150",
    category: "급여관리"
  },
  {
    id: 4,
    title: "전자계약 시스템",
    image: "/api/placeholder/200/150",
    category: "계약관리"
  },
  {
    id: 5,
    title: "AI 인사평가",
    image: "/api/placeholder/200/150",
    category: "성과관리"
  }
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="bg-white">
      {/* 메인 이미지 캐러셀 */}
      <div className="relative w-full">
        <div 
          className="relative h-[400px] w-full overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {bannerImages.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <a href={banner.link} className="block w-full h-full">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                />
              </a>
            </div>
          ))}

          {/* 이전/다음 버튼 */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 rounded-full shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 rounded-full shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white w-6' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 인기 상품 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">인기 HR 솔루션</h2>
          <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            전체보기 →
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {popularItems.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {item.title}
                </p>
                <p className="text-gray-500 text-xs mt-1">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
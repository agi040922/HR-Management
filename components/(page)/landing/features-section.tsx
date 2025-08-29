'use client'

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'

const categories = [
  { id: 'attendance', name: '근태관리', items: 12 },
  { id: 'payroll', name: '급여관리', items: 8 },
  { id: 'hr', name: '인사관리', items: 15 },
  { id: 'contract', name: '전자계약', items: 6 },
  { id: 'performance', name: '성과관리', items: 9 },
  { id: 'recruitment', name: '채용관리', items: 7 },
  { id: 'training', name: '교육관리', items: 5 },
  { id: 'analytics', name: 'HR분석', items: 11 }
]

const featuredSolutions = [
  {
    id: 1,
    title: "FAIR 통합 HR 시스템",
    image: "/api/placeholder/300/200",
    category: "통합솔루션",
    price: "월 50,000원",
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    title: "스마트 근태관리",
    image: "/api/placeholder/300/200",
    category: "근태관리",
    price: "월 30,000원",
    rating: 4.9,
    reviews: 89
  },
  {
    id: 3,
    title: "급여 자동계산 시스템",
    image: "/api/placeholder/300/200",
    category: "급여관리",
    price: "월 40,000원",
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    title: "전자계약 플랫폼",
    image: "/api/placeholder/300/200",
    category: "계약관리",
    price: "월 25,000원",
    rating: 4.6,
    reviews: 73
  }
]

const discountItems = [
  {
    type: "얼리버드",
    title: "FAIR 통합 솔루션",
    originalPrice: "100,000원",
    discountPrice: "60,000원",
    discount: "40%",
    period: "2025.1.1 ~ 3.31",
    image: "/api/placeholder/200/150"
  },
  {
    type: "신규고객",
    title: "스마트 근무관리",
    originalPrice: "60,000원",
    discountPrice: "30,000원",
    discount: "50%",
    period: "2025.1.15 ~ 2.28",
    image: "/api/placeholder/200/150"
  },
  {
    type: "패키지할인",
    title: "전사 통합 패키지",
    originalPrice: "200,000원",
    discountPrice: "80,000원",
    discount: "60%",
    period: "2025.2.1 ~ 4.30",
    image: "/api/placeholder/200/150"
  }
]

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState('featured')

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 카테고리 그리드 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">카테고리별 솔루션</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">💼</div>
                <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">{category.items}개</p>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('featured')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'featured'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              추천 솔루션
            </button>
            <button
              onClick={() => setActiveTab('discount')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'discount'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              할인 혜택
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        {activeTab === 'featured' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSolutions.map((solution) => (
              <div
                key={solution.id}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
              >
                <div className="aspect-[3/2] bg-gray-100">
                  <img
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{solution.category}</div>
                  <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {solution.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600">{solution.price}</span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>⭐ {solution.rating}</span>
                      <span>({solution.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {discountItems.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-red-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-[4/3] bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {item.type}
                    </span>
                    <span className="text-red-500 font-bold text-lg">{item.discount}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-400 line-through text-sm">{item.originalPrice}</span>
                    <span className="font-bold text-red-500">{item.discountPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{item.period}</p>
                  <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors text-sm font-medium">
                    지금 신청하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        <div className="text-center mt-8">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            더 많은 솔루션 보기
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  )
}
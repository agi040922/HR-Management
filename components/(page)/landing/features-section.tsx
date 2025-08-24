'use client'

import React from 'react'
import { Clock, Users, BarChart3, Shield, Smartphone, Zap } from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: '근무일정',
    description: '유연근무제, 교대근무, 시차출퇴근 등 모든 근무제도를 지원합니다.',
    color: 'bg-blue-500'
  },
  {
    icon: Users,
    title: '출퇴근기록',
    description: '모바일, PC, 키오스크 등 다양한 방식으로 간편하게 출퇴근을 기록하세요.',
    color: 'bg-green-500'
  },
  {
    icon: BarChart3,
    title: '휴가관리',
    description: '연차, 반차, 병가 등 모든 휴가를 체계적으로 관리할 수 있습니다.',
    color: 'bg-purple-500'
  },
  {
    icon: Shield,
    title: '전자결재',
    description: '휴가신청, 초과근무 승인 등 모든 결재를 디지털로 처리하세요.',
    color: 'bg-orange-500'
  },
  {
    icon: Smartphone,
    title: '모바일 앱',
    description: '언제 어디서나 스마트폰으로 근태관리가 가능합니다.',
    color: 'bg-pink-500'
  },
  {
    icon: Zap,
    title: '근태정산',
    description: '복잡한 급여계산을 자동으로 처리하여 인사업무 효율성을 높입니다.',
    color: 'bg-indigo-500'
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            모든 비즈니스, 하나의 인력관리
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            시프티는 기업의 모든 인력관리 업무를 하나의 플랫폼에서 해결할 수 있도록 
            통합 솔루션을 제공합니다.
          </p>
        </div>

        {/* 기능 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mr-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-6">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    자세히 보기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 통계 섹션 */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              대한민국 1위 근태관리 솔루션
            </h3>
            <p className="text-blue-100 text-lg">
              수많은 기업이 시프티와 함께 성장하고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">도입 기업</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">500,000+</div>
              <div className="text-blue-100">사용자</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">서비스 안정성</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">고객 지원</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

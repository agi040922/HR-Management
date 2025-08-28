'use client'

import React from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    company: '토스',
    logo: '/로고/toss.png',
    content: '주 52시간제 대비를 위해 다양한 근무제도를 설계하는 데에 시프티가 큰 도움이 되었습니다. 대다수 임직원이 출퇴근 관리 솔루션을 접해본 적이 없기에 쉽고 편리하게 출퇴근을 기록할 수 있는 점이 가장 큰 장점이었으며, 사무실이 아닌 현장 출-퇴근도 유연하게 어뷰징 없이 관리할 수 있었습니다.',
    industry: '핀테크'
  },
  {
    company: '카카오',
    logo: '/로고/kakao.png',
    content: '토스 고객행복실은 고객의 문의가 많은 시간이나 기간에 따라 상담사의 스케쥴을 조율하고, 24시간 근무형태를 실시간으로 관리할 수 있는 시프티를 선정하게 되었습니다. 시프티를 통해 상담사가 언제든지 편리하게 스케쥴을 확인할 수 있습니다.',
    industry: 'IT'
  },
  {
    company: '네이버',
    logo: '/로고/naver.png',
    content: '기존의 엑셀화된 출퇴근데이터는 데이터 편집에 오랜 시간이 걸리고 특히 승인 관리가 어려웠습니다. 시프티는 인사업무 실무선에서 필요로 하는 데이터 추출을 쉽게 할 수 있으며, 사용자 편의를 위해 계속 진화하고 있는 점이 특히 강점이라고 생각합니다.',
    industry: 'IT'
  },
  {
    company: '삼성전자',
    logo: '/로고/samsung.png',
    content: '선택적 근로시간제 도입을 위해 시프티를 사용하기 시작했고, 직관적인 솔루션 덕분에 모든 직원들이 보다 편리하게 근로시간 및 휴가를 관리하게 되었습니다. 여러 부분에서 회사 상황에 맞게 커스터마이징이 가능한 점이 가장 큰 장점입니다.',
    industry: '제조'
  },
  {
    company: 'LG전자',
    logo: '/로고/lg.png',
    content: "'9 to 6'라는 획일적이고 딱딱한 근무시간을 타파하고 직원들의 워라벨을 존중하고자 유연근무제를 도입했고, 이를 효과적으로 운영하기 위해 시프티를 선택했습니다. 시프티를 통해 직관적인 관리를 할 수 있어 유연근무제를 활용하는 직원 및 관리자들의 만족도가 높습니다.",
    industry: '제조'
  },
  {
    company: '현대자동차',
    logo: '/로고/hyundai.png',
    content: '복잡한 교대근무 스케줄 관리와 다양한 근무형태를 효율적으로 운영하기 위해 시프티를 도입했습니다. 실시간 근태 현황 파악과 자동화된 급여 계산 기능으로 인사업무 효율성이 크게 향상되었습니다.',
    industry: '자동차'
  }
]

const companyLogos = [
  { name: 'Samsung', logo: '/로고/samsung.png' },
  { name: 'LG', logo: '/로고/lg.png' },
  { name: 'Hyundai', logo: '/로고/hyundai.png' },
  { name: 'SK', logo: '/로고/sk.png' },
  { name: 'Kakao', logo: '/로고/kakao.png' },
  { name: 'Naver', logo: '/로고/naver.png' },
  { name: 'Toss', logo: '/로고/toss.png' },
  { name: 'Coupang', logo: '/로고/coupang.png' }
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            대한민국 대표 기업들이 선택한 FAIR
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            다양한 업종의 기업들이 FAIR와 함께 인사업무 혁신을 이루고 있습니다
          </p>
        </div>

        {/* 고객사 로고 */}
        <div className="mb-16">
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-8 items-center opacity-60">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 고객 후기 그리드 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-6">
                <Quote size={24} className="text-blue-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-500">
                        {testimonial.company.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.company}</div>
                      <div className="text-sm text-gray-500">{testimonial.industry}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{testimonial.content}</p>
            </div>
          ))}
        </div>

        {/* CTA 섹션 */}
        <div className="mt-16 text-center">
          <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              당신의 기업도 FAIR와 함께 성장하세요
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              14일 무료 체험으로 FAIR의 모든 기능을 경험해보세요. 
              설치나 설정 없이 바로 시작할 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                무료 체험 시작하기
              </button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                도입 사례 더 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

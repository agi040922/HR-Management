'use client'

import React from 'react'
import { ArrowRight, Play } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 좌측 콘텐츠 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block">시간과 비용을</span>
                <span className="block text-blue-600">절감하세요.</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
                지금. 인사업무 변화가 시작됩니다.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                복잡한 근태관리부터 급여계산까지, 시프티 하나로 모든 인사업무를 간편하게 관리하세요. 
                주 52시간제, 유연근무제 등 다양한 근무제도에 완벽 대응합니다.
              </p>
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                무료 체험 시작하기
                <ArrowRight size={20} />
              </button>
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                도입 문의하기
                <ArrowRight size={20} />
              </button>
            </div>

            {/* 데모 영상 버튼 */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                  <Play size={16} className="ml-1" />
                </div>
                <span className="font-medium">제품 소개 영상 보기</span>
              </button>
            </div>

            {/* 신뢰 지표 */}
            <div className="pt-8 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10,000+</div>
                  <div className="text-sm text-gray-600">도입 기업</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500,000+</div>
                  <div className="text-sm text-gray-600">사용자</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">서비스 안정성</div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 이미지/영상 영역 */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* 대시보드 모킹 */}
              <div className="space-y-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                    <div className="text-lg font-semibold">시프티 대시보드</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* 통계 카드들 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">이번 달 근무시간</div>
                    <div className="text-2xl font-bold text-blue-900">168시간</div>
                    <div className="text-xs text-blue-600">+5% 전월 대비</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">출근율</div>
                    <div className="text-2xl font-bold text-green-900">98.5%</div>
                    <div className="text-xs text-green-600">+2% 전월 대비</div>
                  </div>
                </div>

                {/* 차트 영역 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-3">주간 근무 현황</div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 55, 80, 70, 45, 30].map((height, index) => (
                      <div
                        key={index}
                        className="bg-blue-400 rounded-t flex-1"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>월</span>
                    <span>화</span>
                    <span>수</span>
                    <span>목</span>
                    <span>금</span>
                    <span>토</span>
                    <span>일</span>
                  </div>
                </div>

                {/* 최근 활동 */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">최근 활동</div>
                  {[
                    { name: '김철수', action: '출근', time: '09:00' },
                    { name: '이영희', action: '휴가 신청', time: '08:45' },
                    { name: '박민수', action: '퇴근', time: '18:30' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">{activity.name}</div>
                          <div className="text-xs text-gray-500">{activity.action}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 플로팅 요소들 */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              실시간 동기화
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              자동 계산
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

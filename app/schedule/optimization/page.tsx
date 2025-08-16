"use client"

import React from 'react'
import { OptimizationSuggestionComponent } from '@/components/optimization-suggestion-2025'
import { exampleEmployees, exampleSchedules } from '@/data/example-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, Lightbulb, AlertTriangle } from 'lucide-react'

export default function OptimizationPage() {
  return (
    <div className="p-8 space-y-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <TrendingUp className="h-8 w-8" />
          임금 최적화
        </h1>
        <p className="text-muted-foreground text-lg">
          합법적인 방법으로 인건비를 절약하고 효율적인 스케줄을 제안받으세요
        </p>
      </div>

      {/* 최적화 전략 안내 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-blue-900">15시간 미만 전략</h3>
            </div>
            <p className="text-sm text-blue-700">
              주 15시간 미만으로 스케줄을 조정하여 주휴수당을 절약하는 가장 효과적인 방법입니다.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="h-8 w-8 text-green-600" />
              <h3 className="font-semibold text-green-900">스마트 배치</h3>
            </div>
            <p className="text-sm text-green-700">
              업무량과 숙련도를 고려한 효율적인 인력 배치로 생산성을 극대화합니다.
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <h3 className="font-semibold text-orange-900">법적 준수</h3>
            </div>
            <p className="text-sm text-orange-700">
              모든 최적화 제안은 근로기준법을 완전히 준수하는 범위 내에서 제공됩니다.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 최적화 제안 컴포넌트 */}
      <OptimizationSuggestionComponent />

      {/* 성공 사례 및 팁 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 최적화 성공 사례</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">✅ 카페 A사 사례</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 직원 5명 → 주 14시간 스케줄 적용</li>
                <li>• 월 주휴수당 160만원 → 0원 절약</li>
                <li>• 연간 1,920만원 인건비 절감</li>
                <li>• 서비스 품질 유지하며 효율성 증대</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">📈 편의점 B사 사례</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 24시간 운영 → 3교대 시스템</li>
                <li>• 각 직원 주 12시간 근무</li>
                <li>• 야간수당 최소화 스케줄링</li>
                <li>• 월 200만원 인건비 절약 달성</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 최적화 핵심 포인트</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>시간 관리:</strong> 주 15시간 미만 유지가 가장 중요한 절약 포인트
              </div>
              <div>
                <strong>효율적 배치:</strong> 바쁜 시간대와 한가한 시간대 구분하여 인력 배치
              </div>
              <div>
                <strong>지속 관리:</strong> 매주 스케줄 점검으로 최적화 상태 유지
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

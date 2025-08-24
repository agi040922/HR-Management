'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Settings, Book, Clock, CheckCircle } from 'lucide-react'

export default function HelpFeatures() {
  const features = [
    {
      title: '드릴다운 뷰',
      description: '스토어와 직원 정보를 상세하게 확인할 수 있는 확장 가능한 테이블 뷰',
      icon: Target
    },
    {
      title: '실시간 필터링',
      description: '다양한 조건으로 데이터를 실시간으로 필터링하고 정렬',
      icon: Settings
    },
    {
      title: '근로계약서 연동',
      description: '법정 서류를 완비할 수 있는 근로계약서 작성 및 관리',
      icon: Book
    },
    {
      title: '스케줄 템플릿',
      description: '주간 스케줄을 템플릿으로 저장하고 재사용 가능',
      icon: Clock
    }
  ]

  const systemFeatures = [
    {
      title: '사용자 친화적 인터페이스',
      description: '직관적인 UI/UX로 누구나 쉽게 사용할 수 있습니다'
    },
    {
      title: '실시간 데이터 동기화',
      description: '모든 데이터는 실시간으로 저장되고 동기화됩니다'
    },
    {
      title: '반응형 디자인',
      description: '데스크톱, 태블릿, 모바일 모든 기기에서 최적화된 경험'
    },
    {
      title: '안전한 데이터 보호',
      description: '강력한 보안 시스템으로 개인정보를 안전하게 보호'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <feature.icon className="h-5 w-5 text-gray-600" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>시스템 특징</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemFeatures.map((feature, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 ml-6">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

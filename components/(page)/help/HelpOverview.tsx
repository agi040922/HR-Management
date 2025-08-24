'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Users, Calendar, Lightbulb } from 'lucide-react'

export default function HelpOverview() {
  return (
    <div className="space-y-8">
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">시작하기 전에</CardTitle>
          <CardDescription>
            HR 관리 시스템의 기본 워크플로우를 이해하고 시작해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Store className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">1. 스토어 생성</h3>
                <p className="text-gray-600 text-sm">
                  먼저 매장 정보를 등록하고 운영시간을 설정하세요
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">2. 직원 등록</h3>
                <p className="text-gray-600 text-sm">
                  스토어에 소속될 직원들을 등록하고 정보를 관리하세요
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">3. 스케줄 관리</h3>
                <p className="text-gray-600 text-sm">
                  등록된 직원들의 주간 근무 스케줄을 배치하세요
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-sm">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">💡 팁</h4>
                <p className="text-gray-700 text-sm mt-1">
                  각 단계별로 제공되는 튜토리얼을 따라하시면 더 쉽게 익힐 수 있습니다. 
                  오른쪽 상단의 도움말 아이콘(?)을 클릭하면 해당 페이지의 도움말을 확인할 수 있어요.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

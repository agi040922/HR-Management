'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, AlertTriangle, Plus } from 'lucide-react'

interface EmptyStatesProps {
  type: 'no-stores' | 'no-setup' | 'no-exceptions'
  templatesCount?: number
  employeesCount?: number
  onStartWizard?: () => void
}

export default function EmptyStates({ type, templatesCount = 0, employeesCount = 0, onStartWizard }: EmptyStatesProps) {
  if (type === 'no-stores') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          먼저 스토어를 생성해주세요
        </h3>
        <p className="text-gray-600 mb-4">
          예외사항을 등록하려면 먼저 스토어가 필요합니다
        </p>
        <Button asChild>
          <a href="/stores">스토어 관리로 이동</a>
        </Button>
      </div>
    )
  }

  if (type === 'no-setup') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">설정이 필요합니다</h3>
            <div className="mt-2 text-sm text-yellow-700">
              {templatesCount === 0 && <p>• 먼저 스케줄 템플릿을 생성해주세요</p>}
              {employeesCount === 0 && <p>• 직원을 등록해주세요</p>}
            </div>
            <div className="mt-4 flex gap-2">
              {templatesCount === 0 && (
                <Button size="sm" asChild>
                  <a href="/schedule/view">스케줄 템플릿 관리</a>
                </Button>
              )}
              {employeesCount === 0 && (
                <Button size="sm" variant="outline" asChild>
                  <a href="/employees">직원 관리</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'no-exceptions') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          등록된 예외사항이 없습니다
        </h3>
        <p className="text-gray-600 mb-4">
          첫 번째 예외사항을 등록해보세요
        </p>
        <Button onClick={onStartWizard}>
          <Plus className="h-4 w-4 mr-2" />
          예외사항 등록하기
        </Button>
      </div>
    )
  }

  return null
}

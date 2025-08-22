'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ExceptionFiltersProps {
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
  activeTab: string
  onTabChange: (tab: string) => void
  exceptionsCount: number
  onStartWizard: () => void
  canCreateException: boolean
}

export default function ExceptionFilters({
  viewMode,
  onViewModeChange,
  activeTab,
  onTabChange,
  exceptionsCount,
  onStartWizard,
  canCreateException
}: ExceptionFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">등록된 예외사항</h2>
        <Badge variant="secondary">{exceptionsCount}건</Badge>
      </div>
      
      <div className="flex items-center gap-2">
        {/* 뷰 모드 선택 */}
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
          >
            테이블
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('cards')}
          >
            카드
          </Button>
        </div>
        
        {/* 새 예외사항 등록 버튼 */}
        <Button 
          onClick={onStartWizard}
          className="flex items-center gap-2"
          disabled={!canCreateException}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 예외사항 등록
        </Button>
      </div>
    </div>
  )
}

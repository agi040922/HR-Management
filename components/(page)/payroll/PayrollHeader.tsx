import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HelpCircle, Download } from 'lucide-react'
import { PayrollFilters } from '@/types/payroll'

interface PayrollHeaderProps {
  filters: PayrollFilters
  showHelp: boolean
  onToggleHelp: () => void
  onPeriodChange: (period: PayrollFilters['selectedPeriod']) => void
  onExcelDownload: () => void
}

export function PayrollHeader({
  filters,
  showHelp,
  onToggleHelp,
  onPeriodChange,
  onExcelDownload
}: PayrollHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">급여 대시보드</h1>
          <div className="relative">
            <button
              onClick={onToggleHelp}
              className={`p-1 transition-colors rounded-full ${
                showHelp 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title="도움말"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            {showHelp && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={onToggleHelp}
                />
                <div className="absolute top-8 left-0 z-50 w-80 p-4 bg-white rounded-sm border shadow-lg">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">급여 대시보드 사용법:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 스토어를 선택하여 해당 직원들의 급여를 확인하세요</li>
                      <li>• 검색창에서 직원명이나 직책으로 필터링할 수 있습니다</li>
                      <li>• 주휴수당은 주 15시간 이상 근무 시 자동 적용됩니다</li>
                      <li>• 월급은 주휴수당이 포함된 예상 월급입니다</li>
                      <li>• 실수령액은 4대보험과 소득세가 제외된 금액입니다</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* 컨트롤 영역 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              기간:
            </label>
            <Select value={filters.selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-week">이번 주</SelectItem>
                <SelectItem value="last-week">지난 주</SelectItem>
                <SelectItem value="current-month">이번 달</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={onExcelDownload}>
            <Download className="h-4 w-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        스토어별 급여를 정확하게 계산하고 주휴수당을 관리하세요 (2025년 노동법 기준)
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { usePayrollData } from '@/hooks/usePayrollData'
import { PayrollHeader } from '@/components/(page)/payroll/PayrollHeader'
import { PayrollFiltersComponent } from '@/components/(page)/payroll/PayrollFilters'
import { StoreSelector } from '@/components/(page)/payroll/StoreSelector'
import { PayrollStatistics } from '@/components/(page)/payroll/PayrollStatistics'
import { PayrollTable } from '@/components/(page)/payroll/PayrollTable'
import { AlertTriangle } from 'lucide-react'

export default function PayrollPage() {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [showHelp, setShowHelp] = useState(false)

  const {
    stores,
    selectedStores,
    storePayrollData,
    filters,
    grandTotals,
    loading,
    error,
    filteredStoreData,
    toggleStore,
    toggleAllStores,
    updateFilters,
    changePeriod,
    refreshData
  } = usePayrollData()

  const toggleRowExpansion = (rowId: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId)
    } else {
      newExpandedRows.add(rowId)
    }
    setExpandedRows(newExpandedRows)
  }

  const downloadExcel = () => {
    // Excel 다운로드 기능 구현 예정
    console.log('Excel 다운로드')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">급여 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">데이터 로드 오류</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <PayrollHeader
          filters={filters}
          showHelp={showHelp}
          onToggleHelp={() => setShowHelp(!showHelp)}
          onPeriodChange={changePeriod}
          onExcelDownload={downloadExcel}
        />

        {/* 필터 */}
        <PayrollFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
        />

        {/* 스토어 선택 */}
        <StoreSelector
          stores={stores}
          selectedStores={selectedStores}
          onToggleStore={toggleStore}
          onToggleAll={toggleAllStores}
        />

        {/* 통계 */}
        {selectedStores.size > 0 && (
          <PayrollStatistics totals={grandTotals} />
        )}

        {/* 급여 테이블 */}
        {selectedStores.size > 0 ? (
          <div className="space-y-6">
            {storePayrollData.map((storeData) => (
              <PayrollTable
                key={storeData.store.id}
                storeData={storeData}
                expandedRows={expandedRows}
                onToggleRow={toggleRowExpansion}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">스토어를 선택해주세요</h3>
            <p className="text-gray-500">급여를 계산할 스토어를 선택하면 직원별 급여 정보를 확인할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
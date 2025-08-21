import React from 'react'
import { Users, Clock, TrendingUp } from 'lucide-react'
import { PayrollTotals } from '@/types/payroll'

interface PayrollStatisticsProps {
  totals: PayrollTotals
}

export function PayrollStatistics({ totals }: PayrollStatisticsProps) {
  if (totals.totalEmployees === 0) return null

  return (
    <div className="bg-white rounded border shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">전체 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">직원 수</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{totals.totalEmployees}명</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">총 근무시간</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{totals.totalHours.toFixed(1)}h</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">기본급</div>
          <div className="text-xl font-bold text-gray-900">{totals.totalRegularPay.toLocaleString()}원</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">주휴수당</div>
          <div className="text-xl font-bold text-red-600">{totals.totalHolidayPay.toLocaleString()}원</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600">총 급여</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{totals.totalPay.toLocaleString()}원</div>
        </div>
      </div>
    </div>
  )
}

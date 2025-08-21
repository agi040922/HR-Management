import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Calculator } from 'lucide-react'
import { PayrollData } from '@/types/payroll'

interface PayrollDetailRowProps {
  data: PayrollData
}

export function PayrollDetailRow({ data }: PayrollDetailRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={10} className="bg-gray-50 p-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {data.employee.name}님의 상세 계산 공식
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 주급 계산 */}
            <div className="bg-white p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 mb-3">주급 계산</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>기본급 ({data.regularHours.toFixed(1)}h × {data.employee.hourlyWage.toLocaleString()}원)</span>
                  <span className="font-medium">{data.regularPay.toLocaleString()}원</span>
                </div>
                {data.overtimeHours > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>연장수당 ({data.overtimeHours.toFixed(1)}h × {data.employee.hourlyWage.toLocaleString()}원 × 1.5)</span>
                    <span className="font-medium">{data.overtimePay.toLocaleString()}원</span>
                  </div>
                )}
                {data.nightHours > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>야간수당 ({data.nightHours.toFixed(1)}h × {data.employee.hourlyWage.toLocaleString()}원 × 0.5)</span>
                    <span className="font-medium">{(data.nightHours * data.employee.hourlyWage * 0.5).toLocaleString()}원</span>
                  </div>
                )}
                {data.isEligibleForHolidayPay && (
                  <div className="flex justify-between text-red-600">
                    <span>주휴수당 ((기본급 + 연장수당) ÷ 5)</span>
                    <span className="font-medium">{data.holidayPay.toLocaleString()}원</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                  <span>주급 합계</span>
                  <span>{data.totalPay.toLocaleString()}원</span>
                </div>
              </div>
            </div>
            
            {/* 월급 및 실수령액 계산 */}
            <div className="bg-white p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 mb-3">월급 및 실수령액</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>주간 근무시간</span>
                  <span className="font-medium">{data.weeklyHours.toFixed(1)}시간</span>
                </div>
                <div className="flex justify-between">
                  <span>주휴수당 대상</span>
                  <span className="font-medium">{data.isEligibleForHolidayPay ? 'O (15시간 이상)' : 'X (15시간 미만)'}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>예상 월급 (주휴수당 포함)</span>
                  <span className="font-medium">{data.monthlySalary ? data.monthlySalary.toLocaleString() : '-'}원</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  월급 = (주간근무시간 + 주휴시간) × 월평균주수(4.345) × 시급
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>4대보험료 (근로자 부담)</span>
                    <span>약 {data.monthlySalary ? Math.round(data.monthlySalary * 0.089).toLocaleString() : '-'}원</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>소득세 (간이세액)</span>
                    <span>약 {data.monthlySalary ? Math.round(data.monthlySalary * 0.03).toLocaleString() : '-'}원</span>
                  </div>
                  <div className="flex justify-between font-semibold text-indigo-600 mt-2">
                    <span>실수령액</span>
                    <span>{data.netSalary ? data.netSalary.toLocaleString() : '-'}원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            * 계산은 2025년 노동법 기준이며, 실제 급여는 회사 정책에 따라 달라질 수 있습니다.
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

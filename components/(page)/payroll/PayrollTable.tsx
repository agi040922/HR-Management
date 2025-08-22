import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calculator, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { StorePayrollData } from '@/types/payroll'
import { PayrollDetailRow } from './PayrollDetailRow'

interface PayrollTableProps {
  storeData: StorePayrollData
  expandedRows: Set<number>
  onToggleRow: (employeeId: number) => void
}

export function PayrollTable({ storeData, expandedRows, onToggleRow }: PayrollTableProps) {
  return (
    <div className="bg-white rounded border shadow-sm mb-6">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            {storeData.store.store_name}
          </h3>
          <div className="text-sm text-gray-500">
            {storeData.payrollData.length}명 • {storeData.totals.totalPay.toLocaleString()}원
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">직원명</TableHead>
              <TableHead className="font-semibold">직책</TableHead>
              <TableHead className="font-semibold text-center">시급</TableHead>
              <TableHead className="font-semibold text-center">근무시간</TableHead>
              <TableHead className="font-semibold text-center">기본급</TableHead>
              <TableHead className="font-semibold text-center">연장수당</TableHead>
              <TableHead className="font-semibold text-center">주휴수당</TableHead>
              <TableHead className="font-semibold text-center">주급</TableHead>
              <TableHead className="font-semibold text-center">월급(예상)</TableHead>
              <TableHead className="font-semibold text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storeData.payrollData.map((data) => (
              <React.Fragment key={data.employee.id}>
                <TableRow 
                  className="hover:bg-gray-50 cursor-pointer" 
                  onClick={() => onToggleRow(data.employee.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {expandedRows.has(data.employee.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      {data.employee.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {data.employee.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{data.employee.hourly_wage.toLocaleString()}원</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      {data.weeklyHours.toFixed(1)}h
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{data.regularPay.toLocaleString()}원</TableCell>
                  <TableCell className="text-center">
                    {data.overtimePay > 0 ? (
                      <span className="text-orange-600 font-medium">{data.overtimePay.toLocaleString()}원</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {data.holidayPay > 0 ? (
                      <span className="text-red-600 font-medium">{data.holidayPay.toLocaleString()}원</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-green-600">{data.totalPay.toLocaleString()}원</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-blue-600">
                      {data.monthlySalary ? data.monthlySalary.toLocaleString() : '-'}원
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {data.isEligibleForHolidayPay ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">주휴수당</Badge>
                    ) : (
                      <Badge variant="secondary">미적용</Badge>
                    )}
                  </TableCell>
                </TableRow>
                
                {/* 상세 정보 행 */}
                {expandedRows.has(data.employee.id) && (
                  <PayrollDetailRow data={data} />
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

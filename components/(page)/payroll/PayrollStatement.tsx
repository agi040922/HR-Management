'use client'

import React from 'react'
import { FileText, Download, Printer, Calculator, Clock, User, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PayrollCalculationResult } from '@/lib/api/(page)/payroll/payroll-test-api'

interface PayrollStatementProps {
  employee: PayrollCalculationResult
  year: number
  month: number
  storeName: string
}

export default function PayrollStatement({ 
  employee, 
  year, 
  month, 
  storeName 
}: PayrollStatementProps) {
  
  // 4대보험 세부 내역
  const insuranceDetails = [
    {
      name: '국민연금',
      amount: employee.insurance.employee.nationalPension,
      rate: '4.5%'
    },
    {
      name: '건강보험',
      amount: employee.insurance.employee.healthInsurance,
      rate: '3.545%'
    },
    {
      name: '장기요양보험',
      amount: employee.insurance.employee.longTermCare,
      rate: '건강보험료의 12.95%'
    },
    {
      name: '고용보험',
      amount: employee.insurance.employee.employment,
      rate: '0.9%'
    }
  ]

  // 급여명세서 인쇄 함수
  const handlePrint = () => {
    const printContent = document.getElementById('payroll-statement')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>급여명세서 - ${employee.employee.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .statement { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { margin: 0; font-size: 24px; }
                .header p { margin: 5px 0; color: #666; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .info-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .info-title { font-weight: bold; margin-bottom: 10px; }
                .info-item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total-box { border: 2px solid #333; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .total-amount { font-size: 24px; font-weight: bold; text-align: center; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                @media print {
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  // PDF 다운로드 함수 (실제로는 서버에서 PDF 생성 API 호출)
  const handleDownloadPDF = () => {
    // 실제 구현시에는 서버 API 호출하여 PDF 생성
    console.log('PDF 다운로드 요청:', {
      employeeId: employee.employee.id,
      year,
      month
    })
    alert('PDF 다운로드 기능은 서버 API 구현 후 제공됩니다.')
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2 mb-4 no-print">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          인쇄
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          PDF 다운로드
        </Button>
      </div>

      {/* 급여명세서 본문 */}
      <Card id="payroll-statement" className="w-full">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl font-bold text-gray-900">급여명세서</CardTitle>
          <p className="text-gray-600 mt-2">
            {year}년 {month}월분
          </p>
        </CardHeader>

        <CardContent className="p-8">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 직원 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                직원 정보
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">성명:</span>
                  <span className="font-medium">{employee.employee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">직책:</span>
                  <span>{employee.employee.position || '근로자'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">소속:</span>
                  <span>{storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">시급:</span>
                  <span>{employee.employee.hourly_wage.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {/* 근무 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                근무 정보
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">기본 근무시간:</span>
                  <span>{employee.baseSchedule.monthlyHours.toFixed(1)}시간</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">최종 근무시간:</span>
                  <span className={
                    employee.finalSchedule.monthlyHours !== employee.baseSchedule.monthlyHours
                      ? 'font-medium text-blue-600'
                      : ''
                  }>
                    {employee.finalSchedule.monthlyHours.toFixed(1)}시간
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">근무일수:</span>
                  <span>
                    {employee.finalSchedule.weeklySchedule.filter(d => d.workHours > 0).length}일
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예외사항:</span>
                  <span>
                    {employee.exceptionAdjustments.length}건
                    {employee.exceptionAdjustments.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        조정있음
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* 급여 계산 내역 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              급여 계산 내역
            </h3>

            {/* 지급 내역 */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-medium text-green-800 mb-4">지급 내역</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>기본급여</span>
                  <span className="font-medium">
                    {employee.monthlySalary.grossSalary.toLocaleString()}원
                  </span>
                </div>
                
                {employee.exceptionAdjustments.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 font-medium">예외사항 조정:</div>
                    {employee.exceptionAdjustments.map((adjustment, index) => (
                      <div key={index} className="flex justify-between text-xs pl-4">
                        <span className="text-gray-600">
                          {adjustment.date} ({
                            adjustment.type === 'CANCEL' ? '휴무' :
                            adjustment.type === 'OVERRIDE' ? '변경' : '추가'
                          })
                        </span>
                        <span className={
                          adjustment.payDifference >= 0 ? 'text-green-600' : 'text-red-600'
                        }>
                          {adjustment.payDifference >= 0 ? '+' : ''}
                          {adjustment.payDifference.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>총 지급액</span>
                  <span className="text-green-600">
                    {employee.totalPay.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 공제 내역 */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h4 className="font-medium text-red-800 mb-4">공제 내역</h4>
              <div className="space-y-3">
                {/* 4대보험 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">4대보험 (근로자 부담분)</div>
                  {insuranceDetails.map((insurance, index) => (
                    <div key={index} className="flex justify-between text-xs pl-4">
                      <span className="text-gray-600">
                        {insurance.name} ({insurance.rate})
                      </span>
                      <span>{insurance.amount.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* 소득세 */}
                <div className="flex justify-between text-sm">
                  <span>근로소득세</span>
                  <span>{employee.netSalary.incomeTax.toLocaleString()}원</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>지방소득세</span>
                  <span>{employee.netSalary.localTax.toLocaleString()}원</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>총 공제액</span>
                  <span className="text-red-600">
                    {employee.netSalary.totalDeductions.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 실수령액 */}
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">실수령액</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {employee.netSalary.netSalary.toLocaleString()}원
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  총 지급액 {employee.totalPay.toLocaleString()}원 - 
                  총 공제액 {employee.netSalary.totalDeductions.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* 사업주 부담 정보 (참고용) */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-4">사업주 부담 정보 (참고)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">국민연금 (사업주 부담):</span>
                  <span>{employee.insurance.employer.nationalPension.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">건강보험 (사업주 부담):</span>
                  <span>{employee.insurance.employer.healthInsurance.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">고용보험 (사업주 부담):</span>
                  <span>{employee.insurance.employer.employment.toLocaleString()}원</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">산재보험:</span>
                  <span>{employee.insurance.employer.workersCompensation.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">고용안정사업:</span>
                  <span>{employee.insurance.employer.employmentStability.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span className="text-gray-700">사업주 총 부담액:</span>
                  <span className="text-purple-600">
                    {(employee.totalPay + employee.insurance.employer.total).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>본 급여명세서는 {new Date().toLocaleDateString('ko-KR')}에 생성되었습니다.</p>
            <p className="mt-1">
              계산 기준: 2025년 최저시급 10,030원, 4대보험 요율 적용
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Download, Printer, Edit, FileText } from 'lucide-react'
import { PayrollCalculationResult } from '@/lib/api/(page)/payroll/payroll-test-api'
import {
  PayrollStatement,
  PaymentItem,
  DeductionItem,
  DEFAULT_PAYMENT_ITEMS,
  DEFAULT_DEDUCTION_ITEMS
} from '@/types/payroll-statement'
import { generatePayrollPDF } from '@/lib/(payroll-contract)/payroll-pdf-generator'
import { convertToPayrollStatement } from '@/lib/api/(page)/payroll/payroll-convert-utils'

interface PayrollStatementCreatorProps {
  employee: PayrollCalculationResult
  year: number
  month: number
  storeName: string
}

export default function PayrollStatementCreator({ 
  employee, 
  year, 
  month, 
  storeName 
}: PayrollStatementCreatorProps) {
  
  const [statement, setStatement] = useState<PayrollStatement>(() => 
    convertToPayrollStatement(employee, year, month, storeName)
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // employee 데이터가 변경될 때 statement 업데이트
  useEffect(() => {
    setStatement(convertToPayrollStatement(employee, year, month, storeName))
  }, [employee, year, month, storeName])

  const handlePaymentItemChange = (index: number, amount: number) => {
    const updatedItems = [...statement.paymentItems]
    updatedItems[index] = { ...updatedItems[index], amount }
    
    const totalPayment = updatedItems.reduce((sum, item) => sum + item.amount, 0)
    
    setStatement(prev => ({
      ...prev,
      paymentItems: updatedItems,
      totalPayment,
      netPayment: totalPayment - prev.totalDeduction
    }))
  }

  const handleDeductionItemChange = (index: number, amount: number) => {
    const updatedItems = [...statement.deductionItems]
    updatedItems[index] = { ...updatedItems[index], amount }
    
    const totalDeduction = updatedItems.reduce((sum, item) => sum + item.amount, 0)
    
    setStatement(prev => ({
      ...prev,
      deductionItems: updatedItems,
      totalDeduction,
      netPayment: prev.totalPayment - totalDeduction
    }))
  }

  const handleCompanyInfoChange = (field: string, value: string) => {
    setStatement(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        [field]: value
      }
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true)
      await generatePayrollPDF(statement)
    } catch (error) {
      console.error('PDF 생성 오류:', error)
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 액션 버튼 */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? '편집 완료' : '편집'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handlePrint} 
            variant="outline" 
            size="sm"
          >
            <Printer className="h-4 w-4 mr-2" />
            인쇄
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 다운로드'}
          </Button>
        </div>
      </div>

      {/* 급여명세서 */}
      <div className="bg-white border border-gray-300 rounded-lg p-8 print:border-none print:shadow-none">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">급여명세서</h1>
          <p className="text-gray-600">
            {year}년 {month}월분 ({statement.payrollPeriod.startDate} ~ {statement.payrollPeriod.endDate})
          </p>
        </div>

        {/* 회사 및 직원 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">회사 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="w-20 text-gray-600">회사명:</span>
                {isEditing ? (
                  <Input
                    value={statement.companyInfo.name}
                    onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                    className="flex-1 h-6 text-sm"
                  />
                ) : (
                  <span className="font-medium">{statement.companyInfo.name}</span>
                )}
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">사업자:</span>
                {isEditing ? (
                  <Input
                    value={statement.companyInfo.businessNumber}
                    onChange={(e) => handleCompanyInfoChange('businessNumber', e.target.value)}
                    placeholder="123-45-67890"
                    className="flex-1 h-6 text-sm"
                  />
                ) : (
                  <span>{statement.companyInfo.businessNumber || '-'}</span>
                )}
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">대표자:</span>
                {isEditing ? (
                  <Input
                    value={statement.companyInfo.representative}
                    onChange={(e) => handleCompanyInfoChange('representative', e.target.value)}
                    className="flex-1 h-6 text-sm"
                  />
                ) : (
                  <span>{statement.companyInfo.representative || '-'}</span>
                )}
              </div>
            </div>
          </div>

          {/* 직원 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">직원 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="w-20 text-gray-600">성명:</span>
                <span className="font-medium">{statement.employeeInfo.name}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">부서:</span>
                <span>{statement.employeeInfo.department}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">직책:</span>
                <span>{statement.employeeInfo.position}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">사번:</span>
                <span>{statement.employeeInfo.employeeId}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* 급여 내역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 지급 항목 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지급 내역</h3>
            <div className="space-y-3">
              {statement.paymentItems.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{item.name}</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handlePaymentItemChange(index, parseInt(e.target.value) || 0)}
                      className="w-24 h-6 text-right text-sm"
                    />
                  ) : (
                    <span className="font-medium">{item.amount.toLocaleString()}원</span>
                  )}
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>지급 총액</span>
                <span className="text-lg">{statement.totalPayment.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 공제 항목 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">공제 내역</h3>
            <div className="space-y-3">
              {statement.deductionItems.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{item.name}</span>
                  {isEditing && !item.isAutoCalculated ? (
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleDeductionItemChange(index, parseInt(e.target.value) || 0)}
                      className="w-24 h-6 text-right text-sm"
                    />
                  ) : (
                    <span className="font-medium">{item.amount.toLocaleString()}원</span>
                  )}
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>공제 총액</span>
                <span className="text-lg">{statement.totalDeduction.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* 실지급액 */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">실지급액</h3>
          <div className="text-3xl font-bold text-gray-900">
            {statement.netPayment.toLocaleString()}원
          </div>
          <p className="text-sm text-gray-600 mt-2">
            지급총액 {statement.totalPayment.toLocaleString()}원 - 공제총액 {statement.totalDeduction.toLocaleString()}원
          </p>
        </div>

        {/* 예외사항 표시 */}
        {employee.exceptionAdjustments.length > 0 && (
          <>
            <Separator className="my-8" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">스케줄 예외사항</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  {employee.exceptionAdjustments.map((adjustment, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {adjustment.date} ({
                          adjustment.type === 'CANCEL' ? '휴무' :
                          adjustment.type === 'OVERRIDE' ? '시간변경' : '추가근무'
                        })
                      </span>
                      <span className="font-medium text-gray-900">
                        {adjustment.hoursDifference >= 0 ? '+' : ''}
                        {adjustment.hoursDifference.toFixed(1)}시간
                        ({adjustment.payDifference >= 0 ? '+' : ''}{adjustment.payDifference.toLocaleString()}원)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 하단 정보 */}
        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
          <p>본 급여명세서는 {new Date().toLocaleDateString('ko-KR')}에 생성되었습니다.</p>
          <p className="mt-1">계산 기준: 2025년 최저시급 10,030원, 4대보험 요율 적용</p>
        </div>
      </div>
    </div>
  )
}

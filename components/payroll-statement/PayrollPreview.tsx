'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { PayrollStatement } from '@/types/payroll-statement';
import { formatCurrency, formatDate, getPayrollTitle } from '@/lib/(payroll-contract)/payroll-utils';

interface PayrollPreviewProps {
  statement: PayrollStatement;
}

export default function PayrollPreview({ statement }: PayrollPreviewProps) {
  const totalPayment = statement.paymentItems.reduce((sum, item) => sum + item.amount, 0);
  const totalDeduction = statement.deductionItems.reduce((sum, item) => sum + item.amount, 0);
  const netPayment = totalPayment - totalDeduction;

  const paymentsByCategory = {
    basic: statement.paymentItems.filter(item => item.category === 'basic'),
    allowance: statement.paymentItems.filter(item => item.category === 'allowance'),
    bonus: statement.paymentItems.filter(item => item.category === 'bonus'),
  };

  const deductionsByCategory = {
    insurance: statement.deductionItems.filter(item => item.category === 'insurance'),
    tax: statement.deductionItems.filter(item => item.category === 'tax'),
    other: statement.deductionItems.filter(item => item.category === 'other'),
  };

  return (
    <Card className="max-w-4xl mx-auto bg-white shadow-lg">
      <CardContent className="p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {statement.companyInfo.name || '회사명'}
            </h1>
            <p className="text-sm text-gray-600">
              사업자등록번호: {statement.companyInfo.businessNumber || '000-00-00000'}
            </p>
            <p className="text-sm text-gray-600">
              대표자: {statement.companyInfo.representative || '대표자명'}
            </p>
            <p className="text-sm text-gray-600">
              주소: {statement.companyInfo.address || '회사 주소'}
            </p>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            급여명세서
          </h2>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>지급 대상 기간: {getPayrollTitle(statement.payrollPeriod)}</p>
            <p>
              ({formatDate(statement.payrollPeriod.startDate)} ~ {formatDate(statement.payrollPeriod.endDate)})
            </p>
            <p>지급일: {formatDate(statement.payrollPeriod.paymentDate)}</p>
          </div>
        </div>

        {/* 직원 정보 */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-600">직원명</span>
              <p className="font-semibold">{statement.employeeInfo.name || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">사원번호</span>
              <p className="font-semibold">{statement.employeeInfo.employeeId || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">소속 부서</span>
              <p className="font-semibold">{statement.employeeInfo.department || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">직위</span>
              <p className="font-semibold">{statement.employeeInfo.position || '-'}</p>
            </div>
          </div>
        </div>

        {/* 지급 내역 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">지급 내역</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">지급 항목</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* 기본급 */}
                {paymentsByCategory.basic.map(item => (
                  item.amount > 0 && (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="text-xs">기본</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  )
                ))}
                
                {/* 수당 */}
                {paymentsByCategory.allowance.map(item => (
                  item.amount > 0 && (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="text-xs">수당</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  )
                ))}
                
                {/* 상여금 */}
                {paymentsByCategory.bonus.map(item => (
                  item.amount > 0 && (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="text-xs">상여</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  )
                ))}
                
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-3 text-sm">지급 총액 (세전)</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600">
                    {formatCurrency(totalPayment)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 공제 내역 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">공제 내역</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">공제 항목</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* 4대보험 */}
                {deductionsByCategory.insurance.map(item => (
                  item.amount > 0 && (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="text-xs">보험</Badge>
                          {item.rate && (
                            <span className="text-xs text-gray-500">({item.rate}%)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  )
                ))}
                
                {/* 세금 */}
                {deductionsByCategory.tax.map(item => (
                  item.amount > 0 && (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="text-xs">세금</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  )
                ))}
                
                {/* 기타 공제 */}
                {deductionsByCategory.other.map(item => (
                  item.amount > 0 && (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="text-xs">기타</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  )
                ))}
                
                <tr className="bg-red-50 font-semibold">
                  <td className="px-4 py-3 text-sm">공제 총액</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">
                    {formatCurrency(totalDeduction)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 최종 지급액 */}
        <div className="mb-8">
          <Separator className="mb-4" />
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">최종 계산</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>지급 총액 (세전)</span>
                  <span>{formatCurrency(totalPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>공제 총액</span>
                  <span>- {formatCurrency(totalDeduction)}</span>
                </div>
                <Separator />
              </div>
              <div className="text-2xl font-bold text-green-600">
                실 지급액: {formatCurrency(netPayment)}
              </div>
            </div>
          </div>
        </div>

        {/* 서명란 */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t">
          <div className="text-center">
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">회사 담당자</p>
              <div className="border-b border-gray-300 h-12 mb-2"></div>
              <p className="text-xs text-gray-500">(서명)</p>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">직원</p>
              <div className="border-b border-gray-300 h-12 mb-2"></div>
              <p className="text-xs text-gray-500">(서명)</p>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
          <p>본 급여명세서는 근로기준법에 따라 작성되었습니다.</p>
          <p>문의사항이 있으시면 인사팀으로 연락주시기 바랍니다.</p>
        </div>
      </CardContent>
    </Card>
  );
}

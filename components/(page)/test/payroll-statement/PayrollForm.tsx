'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Plus, Trash2, Calculator } from 'lucide-react';

import {
  PayrollStatement,
  PayrollValidationError,
  PaymentItem,
  DeductionItem,
} from '@/types/payroll-statement';
import { formatCurrency } from '@/lib/(payroll-contract)/payroll-utils';

interface PayrollFormProps {
  statement: PayrollStatement;
  onChange: (updatedStatement: Partial<PayrollStatement>) => void;
  validationErrors: PayrollValidationError[];
  onAutoCalculate: () => void;
}

export default function PayrollForm({
  statement,
  onChange,
  validationErrors,
  onAutoCalculate,
}: PayrollFormProps) {
  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName);
  };

  const handleCompanyInfoChange = (field: keyof typeof statement.companyInfo, value: string) => {
    onChange({
      companyInfo: {
        ...statement.companyInfo,
        [field]: value,
      },
    });
  };

  const handleEmployeeInfoChange = (field: keyof typeof statement.employeeInfo, value: string) => {
    onChange({
      employeeInfo: {
        ...statement.employeeInfo,
        [field]: value,
      },
    });
  };

  const handlePayrollPeriodChange = (field: keyof typeof statement.payrollPeriod, value: string) => {
    onChange({
      payrollPeriod: {
        ...statement.payrollPeriod,
        [field]: value,
      },
    });
  };

  const handlePaymentItemChange = (index: number, field: keyof PaymentItem, value: string | number) => {
    const updatedItems = [...statement.paymentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'amount' ? Number(value) || 0 : value,
    };
    onChange({ paymentItems: updatedItems });
  };

  const handleDeductionItemChange = (index: number, field: keyof DeductionItem, value: string | number) => {
    const updatedItems = [...statement.deductionItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'amount' ? Number(value) || 0 : value,
    };
    onChange({ deductionItems: updatedItems });
  };

  const addPaymentItem = () => {
    const newItem: PaymentItem = {
      id: `custom-payment-${Date.now()}`,
      name: '',
      amount: 0,
      category: 'allowance',
    };
    onChange({
      paymentItems: [...statement.paymentItems, newItem],
    });
  };

  const removePaymentItem = (index: number) => {
    const item = statement.paymentItems[index];
    if (item.isRequired) return;
    
    const updatedItems = statement.paymentItems.filter((_, i) => i !== index);
    onChange({ paymentItems: updatedItems });
  };

  const addDeductionItem = () => {
    const newItem: DeductionItem = {
      id: `custom-deduction-${Date.now()}`,
      name: '',
      amount: 0,
      category: 'other',
    };
    onChange({
      deductionItems: [...statement.deductionItems, newItem],
    });
  };

  const removeDeductionItem = (index: number) => {
    const item = statement.deductionItems[index];
    if (item.isAutoCalculated) return;
    
    const updatedItems = statement.deductionItems.filter((_, i) => i !== index);
    onChange({ deductionItems: updatedItems });
  };

  return (
    <div className="space-y-6">
      {/* 회사 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">회사 정보</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">회사명 *</Label>
              <Input
                id="company-name"
                value={statement.companyInfo.name}
                onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                placeholder="회사명을 입력하세요"
                className={getFieldError('companyInfo.name') ? 'border-red-500' : ''}
              />
              {getFieldError('companyInfo.name') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('companyInfo.name')?.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="business-number">사업자등록번호 *</Label>
              <Input
                id="business-number"
                value={statement.companyInfo.businessNumber}
                onChange={(e) => handleCompanyInfoChange('businessNumber', e.target.value)}
                placeholder="123-45-67890"
                className={getFieldError('companyInfo.businessNumber') ? 'border-red-500' : ''}
              />
              {getFieldError('companyInfo.businessNumber') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('companyInfo.businessNumber')?.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="representative">대표자명 *</Label>
              <Input
                id="representative"
                value={statement.companyInfo.representative}
                onChange={(e) => handleCompanyInfoChange('representative', e.target.value)}
                placeholder="대표자명을 입력하세요"
                className={getFieldError('companyInfo.representative') ? 'border-red-500' : ''}
              />
              {getFieldError('companyInfo.representative') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('companyInfo.representative')?.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="company-address">회사 주소 *</Label>
            <Textarea
              id="company-address"
              value={statement.companyInfo.address}
              onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
              placeholder="회사 주소를 입력하세요"
              rows={2}
              className={getFieldError('companyInfo.address') ? 'border-red-500' : ''}
            />
            {getFieldError('companyInfo.address') && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('companyInfo.address')?.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 직원 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">직원 정보</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee-name">직원명 *</Label>
              <Input
                id="employee-name"
                value={statement.employeeInfo.name}
                onChange={(e) => handleEmployeeInfoChange('name', e.target.value)}
                placeholder="직원명을 입력하세요"
                className={getFieldError('employeeInfo.name') ? 'border-red-500' : ''}
              />
              {getFieldError('employeeInfo.name') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('employeeInfo.name')?.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="employee-id">사원번호</Label>
              <Input
                id="employee-id"
                value={statement.employeeInfo.employeeId}
                onChange={(e) => handleEmployeeInfoChange('employeeId', e.target.value)}
                placeholder="사원번호를 입력하세요"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">소속 부서 *</Label>
              <Input
                id="department"
                value={statement.employeeInfo.department}
                onChange={(e) => handleEmployeeInfoChange('department', e.target.value)}
                placeholder="소속 부서를 입력하세요"
                className={getFieldError('employeeInfo.department') ? 'border-red-500' : ''}
              />
              {getFieldError('employeeInfo.department') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('employeeInfo.department')?.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="position">직위 *</Label>
              <Input
                id="position"
                value={statement.employeeInfo.position}
                onChange={(e) => handleEmployeeInfoChange('position', e.target.value)}
                placeholder="직위를 입력하세요"
                className={getFieldError('employeeInfo.position') ? 'border-red-500' : ''}
              />
              {getFieldError('employeeInfo.position') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('employeeInfo.position')?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 급여 기간 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">급여 기간</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">시작일 *</Label>
              <Input
                id="start-date"
                type="date"
                value={statement.payrollPeriod.startDate}
                onChange={(e) => handlePayrollPeriodChange('startDate', e.target.value)}
                className={getFieldError('payrollPeriod.startDate') ? 'border-red-500' : ''}
              />
              {getFieldError('payrollPeriod.startDate') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('payrollPeriod.startDate')?.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="end-date">종료일 *</Label>
              <Input
                id="end-date"
                type="date"
                value={statement.payrollPeriod.endDate}
                onChange={(e) => handlePayrollPeriodChange('endDate', e.target.value)}
                className={getFieldError('payrollPeriod.endDate') ? 'border-red-500' : ''}
              />
              {getFieldError('payrollPeriod.endDate') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('payrollPeriod.endDate')?.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="payment-date">지급일 *</Label>
              <Input
                id="payment-date"
                type="date"
                value={statement.payrollPeriod.paymentDate}
                onChange={(e) => handlePayrollPeriodChange('paymentDate', e.target.value)}
                className={getFieldError('payrollPeriod.paymentDate') ? 'border-red-500' : ''}
              />
              {getFieldError('payrollPeriod.paymentDate') && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('payrollPeriod.paymentDate')?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 지급 내역 */}
      <div className="space-y-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">지급 내역</h2>
          <Button onClick={addPaymentItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            항목 추가
          </Button>
        </div>
        <div className="space-y-4">
          {statement.paymentItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Input
                  value={item.name}
                  onChange={(e) => handlePaymentItemChange(index, 'name', e.target.value)}
                  placeholder="항목명"
                  disabled={item.isRequired}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handlePaymentItemChange(index, 'amount', e.target.value)}
                  placeholder="금액"
                  min="0"
                />
              </div>
              <div className="w-20 text-sm text-gray-500">
                {formatCurrency(item.amount)}
              </div>
              {item.isRequired ? (
                <Badge variant="secondary" className="text-xs">필수</Badge>
              ) : (
                <Button
                  onClick={() => removePaymentItem(index)}
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Separator />
          <div className="flex justify-between items-center font-semibold">
            <span>지급 총액 (세전)</span>
            <span className="text-lg text-blue-600">
              {formatCurrency(statement.paymentItems.reduce((sum, item) => sum + item.amount, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* 공제 내역 */}
      <div className="space-y-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">공제 내역</h2>
          <div className="flex gap-2">
            <Button onClick={onAutoCalculate} size="sm" variant="outline">
              <Calculator className="h-4 w-4 mr-1" />
              자동 계산
            </Button>
            <Button onClick={addDeductionItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              항목 추가
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {statement.deductionItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Input
                  value={item.name}
                  onChange={(e) => handleDeductionItemChange(index, 'name', e.target.value)}
                  placeholder="항목명"
                  disabled={item.isAutoCalculated}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleDeductionItemChange(index, 'amount', e.target.value)}
                  placeholder="금액"
                  min="0"
                  disabled={item.isAutoCalculated}
                />
              </div>
              <div className="w-20 text-sm text-gray-500">
                {formatCurrency(item.amount)}
              </div>
              {item.isAutoCalculated ? (
                <Badge variant="secondary" className="text-xs">자동</Badge>
              ) : (
                <Button
                  onClick={() => removeDeductionItem(index)}
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Separator />
          <div className="flex justify-between items-center font-semibold">
            <span>공제 총액</span>
            <span className="text-lg text-red-600">
              {formatCurrency(statement.deductionItems.reduce((sum, item) => sum + item.amount, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

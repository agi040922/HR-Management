'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

import { LaborContract, ValidationError, SalaryType, PaymentMethod } from '@/types/labor-contract';
import { formatCurrency } from '@/lib/labor-contract-utils';

interface ContractFormProps {
  contract: LaborContract;
  onChange: (contract: Partial<LaborContract>) => void;
  validationErrors: ValidationError[];
}

export default function ContractForm({ contract, onChange, validationErrors }: ContractFormProps) {
  const getFieldError = (fieldPath: string) => {
    return validationErrors.find(error => error.field === fieldPath)?.message;
  };

  const updateEmployer = (field: string, value: string) => {
    onChange({
      employer: { ...contract.employer, [field]: value }
    });
  };

  const updateEmployee = (field: string, value: string) => {
    onChange({
      employee: { ...contract.employee, [field]: value }
    });
  };

  const updateWorkingHours = (field: string, value: string | number) => {
    onChange({
      workingHours: { ...contract.workingHours, [field]: value }
    });
  };

  const updateSalary = (field: string, value: any) => {
    onChange({
      salary: { ...contract.salary, [field]: value }
    });
  };

  const updateSocialInsurance = (field: string, value: boolean) => {
    onChange({
      socialInsurance: { ...contract.socialInsurance, [field]: value }
    });
  };

  const addAllowance = () => {
    const newAllowances = [...contract.salary.otherAllowances, { name: '', amount: 0 }];
    updateSalary('otherAllowances', newAllowances);
  };

  const removeAllowance = (index: number) => {
    const newAllowances = contract.salary.otherAllowances.filter((_, i) => i !== index);
    updateSalary('otherAllowances', newAllowances);
  };

  const updateAllowance = (index: number, field: 'name' | 'amount', value: string | number) => {
    const newAllowances = [...contract.salary.otherAllowances];
    newAllowances[index] = { ...newAllowances[index], [field]: value };
    updateSalary('otherAllowances', newAllowances);
  };

  return (
    <div className="space-y-8">
      {/* 사업주 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">사업주 정보</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">사업체명 *</Label>
              <Input
                id="companyName"
                value={contract.employer.companyName}
                onChange={(e) => updateEmployer('companyName', e.target.value)}
                placeholder="회사명을 입력하세요"
                className={getFieldError('employer.companyName') ? 'border-red-500' : ''}
              />
              {getFieldError('employer.companyName') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('employer.companyName')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="representative">대표자 *</Label>
              <Input
                id="representative"
                value={contract.employer.representative}
                onChange={(e) => updateEmployer('representative', e.target.value)}
                placeholder="대표자명을 입력하세요"
                className={getFieldError('employer.representative') ? 'border-red-500' : ''}
              />
              {getFieldError('employer.representative') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('employer.representative')}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="employerAddress">사업장 주소 *</Label>
            <Textarea
              id="employerAddress"
              value={contract.employer.address}
              onChange={(e) => updateEmployer('address', e.target.value)}
              placeholder="사업장 주소를 입력하세요"
              className={getFieldError('employer.address') ? 'border-red-500' : ''}
            />
            {getFieldError('employer.address') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('employer.address')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employerPhone">전화번호 *</Label>
              <Input
                id="employerPhone"
                value={contract.employer.phone}
                onChange={(e) => updateEmployer('phone', e.target.value)}
                placeholder="02-1234-5678"
                className={getFieldError('employer.phone') ? 'border-red-500' : ''}
              />
              {getFieldError('employer.phone') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('employer.phone')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="businessNumber">사업자등록번호</Label>
              <Input
                id="businessNumber"
                value={contract.employer.businessNumber || ''}
                onChange={(e) => updateEmployer('businessNumber', e.target.value)}
                placeholder="123-45-67890"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 근로자 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">근로자 정보</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeName">성명 *</Label>
              <Input
                id="employeeName"
                value={contract.employee.name}
                onChange={(e) => updateEmployee('name', e.target.value)}
                placeholder="근로자명을 입력하세요"
                className={getFieldError('employee.name') ? 'border-red-500' : ''}
              />
              {getFieldError('employee.name') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('employee.name')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="employeePhone">연락처 *</Label>
              <Input
                id="employeePhone"
                value={contract.employee.phone}
                onChange={(e) => updateEmployee('phone', e.target.value)}
                placeholder="010-1234-5678"
                className={getFieldError('employee.phone') ? 'border-red-500' : ''}
              />
              {getFieldError('employee.phone') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('employee.phone')}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="employeeAddress">주소 *</Label>
            <Textarea
              id="employeeAddress"
              value={contract.employee.address}
              onChange={(e) => updateEmployee('address', e.target.value)}
              placeholder="근로자 주소를 입력하세요"
              className={getFieldError('employee.address') ? 'border-red-500' : ''}
            />
            {getFieldError('employee.address') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('employee.address')}</p>
            )}
          </div>

          {(contract.contractType === 'minor' || contract.contractType === 'foreign-worker' || contract.contractType === 'foreign-agriculture') && (
            <div>
              <Label htmlFor="birthdate">생년월일 {contract.contractType === 'minor' ? '*' : ''}</Label>
              <Input
                id="birthdate"
                type="date"
                value={contract.employee.birthdate || ''}
                onChange={(e) => updateEmployee('birthdate', e.target.value)}
                className={getFieldError('employee.birthdate') ? 'border-red-500' : ''}
              />
              {getFieldError('employee.birthdate') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('employee.birthdate')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 근로 조건 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">근로 조건</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workStartDate">근로개시일 *</Label>
              <Input
                id="workStartDate"
                type="date"
                value={contract.workStartDate}
                onChange={(e) => onChange({ workStartDate: e.target.value })}
                className={getFieldError('workStartDate') ? 'border-red-500' : ''}
              />
              {getFieldError('workStartDate') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('workStartDate')}</p>
              )}
            </div>

            {contract.contractType === 'fixed-term' && (
              <div>
                <Label htmlFor="workEndDate">근로종료일 *</Label>
                <Input
                  id="workEndDate"
                  type="date"
                  value={contract.workEndDate || ''}
                  onChange={(e) => onChange({ workEndDate: e.target.value })}
                  className={getFieldError('workEndDate') ? 'border-red-500' : ''}
                />
                {getFieldError('workEndDate') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('workEndDate')}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="workplace">근무장소 *</Label>
            <Input
              id="workplace"
              value={contract.workplace}
              onChange={(e) => onChange({ workplace: e.target.value })}
              placeholder="구체적인 근무지를 입력하세요"
              className={getFieldError('workplace') ? 'border-red-500' : ''}
            />
            {getFieldError('workplace') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('workplace')}</p>
            )}
          </div>

          <div>
            <Label htmlFor="jobDescription">업무내용 *</Label>
            <Textarea
              id="jobDescription"
              value={contract.jobDescription}
              onChange={(e) => onChange({ jobDescription: e.target.value })}
              placeholder="담당할 업무를 구체적으로 입력하세요"
              className={getFieldError('jobDescription') ? 'border-red-500' : ''}
            />
            {getFieldError('jobDescription') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('jobDescription')}</p>
            )}
          </div>

          {/* 근로시간 */}
          <div className="space-y-4">
            <h4 className="font-semibold">근로시간</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startTime">시업시각 *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={contract.workingHours.startTime}
                  onChange={(e) => updateWorkingHours('startTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">종업시각 *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={contract.workingHours.endTime}
                  onChange={(e) => updateWorkingHours('endTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="breakStart">휴게시작</Label>
                <Input
                  id="breakStart"
                  type="time"
                  value={contract.workingHours.breakStartTime || ''}
                  onChange={(e) => updateWorkingHours('breakStartTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="breakEnd">휴게종료</Label>
                <Input
                  id="breakEnd"
                  type="time"
                  value={contract.workingHours.breakEndTime || ''}
                  onChange={(e) => updateWorkingHours('breakEndTime', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workDays">주 근무일수</Label>
                <Select 
                  value={contract.workingHours.workDaysPerWeek.toString()} 
                  onValueChange={(value) => updateWorkingHours('workDaysPerWeek', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map(days => (
                      <SelectItem key={days} value={days.toString()}>
                        주 {days}일
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weeklyHoliday">주휴일</Label>
                <Select 
                  value={contract.workingHours.weeklyHoliday} 
                  onValueChange={(value) => updateWorkingHours('weeklyHoliday', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                      <SelectItem key={day} value={day}>
                        {day}요일
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 임금 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">임금 정보</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryType">급여 형태 *</Label>
              <Select 
                value={contract.salary.salaryType} 
                onValueChange={(value: SalaryType) => updateSalary('salaryType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">월급</SelectItem>
                  <SelectItem value="daily">일급</SelectItem>
                  <SelectItem value="hourly">시간급</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="basicSalary">기본급 *</Label>
              <Input
                id="basicSalary"
                type="number"
                value={contract.salary.basicSalary}
                onChange={(e) => updateSalary('basicSalary', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={getFieldError('salary.basicSalary') ? 'border-red-500' : ''}
              />
              {getFieldError('salary.basicSalary') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('salary.basicSalary')}</p>
              )}
              {contract.salary.basicSalary > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(contract.salary.basicSalary)}
                </p>
              )}
            </div>
          </div>

          {/* 상여금 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasBonus"
                checked={contract.salary.hasBonus}
                onCheckedChange={(checked) => updateSalary('hasBonus', checked)}
              />
              <Label htmlFor="hasBonus">상여금 지급</Label>
            </div>
            {contract.salary.hasBonus && (
              <Input
                type="number"
                value={contract.salary.bonusAmount || 0}
                onChange={(e) => updateSalary('bonusAmount', parseInt(e.target.value) || 0)}
                placeholder="상여금 액수"
              />
            )}
          </div>

          {/* 기타 수당 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>기타 수당</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAllowance}>
                <Plus className="h-4 w-4 mr-1" />
                수당 추가
              </Button>
            </div>
            {contract.salary.otherAllowances.map((allowance, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="수당명"
                  value={allowance.name}
                  onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="금액"
                  value={allowance.amount}
                  onChange={(e) => updateAllowance(index, 'amount', parseInt(e.target.value) || 0)}
                  className="w-32"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeAllowance(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* 지급 조건 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payDate">임금지급일 *</Label>
              <Select 
                value={contract.salary.payDate.toString()} 
                onValueChange={(value) => updateSalary('payDate', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      매월 {day}일
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMethod">지급방법 *</Label>
              <Select 
                value={contract.salary.paymentMethod} 
                onValueChange={(value: PaymentMethod) => updateSalary('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">직접 지급</SelectItem>
                  <SelectItem value="bank-transfer">통장 입금</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 사회보험 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">사회보험 적용여부</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'employmentInsurance', label: '고용보험' },
            { key: 'workersCompensation', label: '산재보험' },
            { key: 'nationalPension', label: '국민연금' },
            { key: 'healthInsurance', label: '건강보험' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={contract.socialInsurance[key as keyof typeof contract.socialInsurance]}
                onCheckedChange={(checked) => updateSocialInsurance(key, checked as boolean)}
              />
              <Label htmlFor={key}>{label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* 유형별 추가 정보 */}
      {contract.contractType === 'minor' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">연소근로자 추가 정보</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guardianName">친권자/후견인 성명 *</Label>
                <Input
                  id="guardianName"
                  value={contract.minorWorkerInfo?.guardianName || ''}
                  onChange={(e) => onChange({
                    minorWorkerInfo: { 
                      ...contract.minorWorkerInfo!, 
                      guardianName: e.target.value 
                    }
                  })}
                  className={getFieldError('minorWorkerInfo.guardianName') ? 'border-red-500' : ''}
                />
                {getFieldError('minorWorkerInfo.guardianName') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('minorWorkerInfo.guardianName')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="guardianRelationship">관계</Label>
                <Select 
                  value={contract.minorWorkerInfo?.guardianRelationship || '부'} 
                  onValueChange={(value) => onChange({
                    minorWorkerInfo: { 
                      ...contract.minorWorkerInfo!, 
                      guardianRelationship: value 
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="부">부</SelectItem>
                    <SelectItem value="모">모</SelectItem>
                    <SelectItem value="후견인">후견인</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consentProvided"
                  checked={contract.minorWorkerInfo?.consentProvided || false}
                  onCheckedChange={(checked) => onChange({
                    minorWorkerInfo: { 
                      ...contract.minorWorkerInfo!, 
                      consentProvided: checked as boolean 
                    }
                  })}
                />
                <Label htmlFor="consentProvided">친권자/후견인 동의서 구비 *</Label>
              </div>
              {getFieldError('minorWorkerInfo.consentProvided') && (
                <p className="text-sm text-red-500">{getFieldError('minorWorkerInfo.consentProvided')}</p>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="familyCertificateProvided"
                  checked={contract.minorWorkerInfo?.familyCertificateProvided || false}
                  onCheckedChange={(checked) => onChange({
                    minorWorkerInfo: { 
                      ...contract.minorWorkerInfo!, 
                      familyCertificateProvided: checked as boolean 
                    }
                  })}
                />
                <Label htmlFor="familyCertificateProvided">가족관계증명서 제출</Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

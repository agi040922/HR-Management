'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ContractModalProps {
  isOpen: boolean
  contract: any
  onClose: () => void
  getContractTypeLabel: (contractType: string) => string
}

export function ContractModal({
  isOpen,
  contract,
  onClose,
  getContractTypeLabel
}: ContractModalProps) {
  if (!isOpen || !contract) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              근로계약서 상세정보
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">계약 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">계약 유형:</span>
                    <span className="font-medium">{getContractTypeLabel(contract.contractType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">계약 시작일:</span>
                    <span>{contract.workStartDate}</span>
                  </div>
                  {contract.workEndDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">계약 종료일:</span>
                      <span>{contract.workEndDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">근무지:</span>
                    <span>{contract.workplace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">업무 내용:</span>
                    <span>{contract.jobDescription}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">근로자 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">성명:</span>
                    <span className="font-medium">{contract.employee?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">주소:</span>
                    <span>{contract.employee?.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처:</span>
                    <span>{contract.employee?.phone}</span>
                  </div>
                  {contract.employee?.birthdate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">생년월일:</span>
                      <span>{contract.employee.birthdate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 근로시간 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">근로시간</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">시업시각:</span>
                  <span>{contract.workingHours?.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">종업시각:</span>
                  <span>{contract.workingHours?.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주 근무일수:</span>
                  <span>{contract.workingHours?.workDaysPerWeek}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주휴일:</span>
                  <span>{contract.workingHours?.weeklyHoliday}</span>
                </div>
              </div>
            </div>

            {/* 임금 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">임금</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">기본급:</span>
                  <span className="font-medium">{contract.salary?.basicSalary?.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">임금 형태:</span>
                  <span>
                    {contract.salary?.salaryType === 'monthly' ? '월급' : 
                     contract.salary?.salaryType === 'daily' ? '일급' : '시급'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">임금지급일:</span>
                  <span>매월 {contract.salary?.payDate}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">지급방법:</span>
                  <span>
                    {contract.salary?.paymentMethod === 'direct' ? '직접지급' : '통장입금'}
                  </span>
                </div>
              </div>
            </div>

            {/* 사업주 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">사업주 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">사업체명:</span>
                  <span className="font-medium">{contract.employer?.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">대표자:</span>
                  <span>{contract.employer?.representative}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">사업장 주소:</span>
                  <span>{contract.employer?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">전화번호:</span>
                  <span>{contract.employer?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={onClose}
              variant="outline"
            >
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

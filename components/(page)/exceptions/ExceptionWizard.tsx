'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Clock 
} from 'lucide-react'
import { 
  ExceptionWizardData, 
  TemplateData, 
  EmployeeData, 
  WorkingSlot,
  getEmployeeWorkingSlots,
  getExceptionTypeLabel 
} from '@/lib/api/(page)/schedule/exceptions/exceptions-api'

interface ExceptionWizardProps {
  isOpen: boolean
  wizardData: ExceptionWizardData
  templates: TemplateData[]
  employees: EmployeeData[]
  submitting: boolean
  onClose: () => void
  onUpdateData: (updates: Partial<ExceptionWizardData>) => void
  onNextStep: () => void
  onPrevStep: () => void
  onSubmit: () => void
  getWorkingSlots: (templateId: number, employeeId: number, targetDate: string) => WorkingSlot[]
}

export default function ExceptionWizard({
  isOpen,
  wizardData,
  templates,
  employees,
  submitting,
  onClose,
  onUpdateData,
  onNextStep,
  onPrevStep,
  onSubmit,
  getWorkingSlots
}: ExceptionWizardProps) {
  if (!isOpen) return null

  const renderStepContent = () => {
    switch (wizardData.step) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">1. 스케줄 템플릿 선택</h4>
            <p className="text-sm text-gray-600">기준이 될 스케줄 템플릿을 선택하세요.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onUpdateData({ template_id: template.id })}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    wizardData.template_id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{template.template_name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    ID: #{template.id} • {template.is_active ? '활성' : '비활성'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">2. 직원 및 날짜 선택</h4>
            <p className="text-sm text-gray-600">예외사항을 적용할 직원과 날짜를 선택하세요.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 직원 선택 */}
              <div>
                <Label htmlFor="employee_select">직원 선택 *</Label>
                <Select 
                  value={wizardData.employee_id?.toString() || ''} 
                  onValueChange={(value) => onUpdateData({ employee_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="직원을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-gray-500">
                              {employee.position} • {employee.hourly_wage.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 날짜 선택 */}
              <div>
                <Label htmlFor="exception_date">날짜 선택 *</Label>
                <Input
                  type="date"
                  id="exception_date"
                  value={wizardData.date}
                  onChange={(e) => onUpdateData({ date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 예외사항 유형 */}
            <div>
              <Label htmlFor="exception_type">예외사항 유형 *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {[
                  { type: 'CANCEL', label: '휴무', desc: '근무하지 않음', color: 'red' },
                  { type: 'OVERRIDE', label: '시간 변경', desc: '다른 시간에 근무', color: 'blue' },
                  { type: 'ADDITIONAL', label: '추가 근무', desc: '추가로 근무', color: 'green' }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => onUpdateData({ exception_type: option.type as 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL' })}
                    className={`p-4 text-left border-2 rounded-lg transition-all ${
                      wizardData.exception_type === option.type
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        if (!wizardData.template_id || !wizardData.employee_id) return null
        
        const workingSlots = getWorkingSlots(wizardData.template_id, wizardData.employee_id, wizardData.date)
        
        // 위저드 데이터에 근무 슬롯 저장
        if (JSON.stringify(wizardData.working_slots) !== JSON.stringify(workingSlots)) {
          onUpdateData({ working_slots: workingSlots })
        }

        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">3. 근무 중인 시간대 확인</h4>
            <p className="text-sm text-gray-600">
              선택한 날짜({new Date(wizardData.date).toLocaleDateString('ko-KR')})에 근무 예정인 시간대입니다.
            </p>
            
            {workingSlots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">해당 날짜에 근무 예정이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-medium text-gray-900 mb-3">
                  {workingSlots[0].dayName} 근무 시간대 ({workingSlots.length}개)
                </div>
                {workingSlots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">{slot.timeSlot}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      함께 근무: {slot.employees.map(emp => emp.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">4. 시간 선택</h4>
            <p className="text-sm text-gray-600">
              {wizardData.exception_type === 'CANCEL' ? '영향받을 시간대를 선택하세요.' : '새로운 시간을 설정하세요.'}
            </p>
            
            {wizardData.exception_type === 'CANCEL' ? (
              <div className="space-y-2">
                <Label>취소할 시간대 선택</Label>
                {wizardData.working_slots.map((slot, index) => (
                  <label key={index} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={wizardData.selected_slots.includes(slot.timeSlot)}
                      onChange={(e) => {
                        const newSlots = e.target.checked
                          ? [...wizardData.selected_slots, slot.timeSlot]
                          : wizardData.selected_slots.filter(s => s !== slot.timeSlot)
                        onUpdateData({ selected_slots: newSlots })
                      }}
                      className="mr-3"
                    />
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{slot.timeSlot}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new_start_time">시작 시간 *</Label>
                  <Input
                    type="time"
                    id="new_start_time"
                    value={wizardData.start_time}
                    onChange={(e) => onUpdateData({ start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new_end_time">종료 시간 *</Label>
                  <Input
                    type="time"
                    id="new_end_time"
                    value={wizardData.end_time}
                    onChange={(e) => onUpdateData({ end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">5. 메모 입력 및 등록</h4>
            <p className="text-sm text-gray-600">추가 설명이나 메모를 입력하고 등록하세요.</p>
            
            <div>
              <Label htmlFor="exception_notes">메모 (선택사항)</Label>
              <Textarea
                id="exception_notes"
                value={wizardData.notes}
                onChange={(e) => onUpdateData({ notes: e.target.value })}
                placeholder="예외사항에 대한 추가 설명을 입력하세요"
                rows={3}
              />
            </div>
            
            {/* 입력 정보 요약 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">입력 정보 확인</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">템플릿:</span>
                  <span className="ml-2 font-medium">{templates.find(t => t.id === wizardData.template_id)?.template_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">직원:</span>
                  <span className="ml-2 font-medium">{employees.find(e => e.id === wizardData.employee_id)?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">날짜:</span>
                  <span className="ml-2 font-medium">{new Date(wizardData.date).toLocaleDateString('ko-KR')}</span>
                </div>
                <div>
                  <span className="text-gray-600">유형:</span>
                  <span className="ml-2 font-medium">{getExceptionTypeLabel(wizardData.exception_type || '')}</span>
                </div>

                {wizardData.exception_type !== 'CANCEL' && (
                  <div className="col-span-2">
                    <span className="text-gray-600">시간:</span>
                    <span className="ml-2 font-medium">{wizardData.start_time} - {wizardData.end_time}</span>
                  </div>
                )}

                {wizardData.exception_type === 'CANCEL' && wizardData.selected_slots.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">취소할 시간:</span>
                    <span className="ml-2 font-medium">{wizardData.selected_slots.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isNextDisabled = () => {
    switch (wizardData.step) {
      case 1: return !wizardData.template_id
      case 2: return !wizardData.employee_id || !wizardData.date || !wizardData.exception_type
      case 3: return wizardData.working_slots.length === 0
      case 4: 
        if (wizardData.exception_type === 'CANCEL') {
          return wizardData.selected_slots.length === 0
        }
        return !wizardData.start_time || !wizardData.end_time
      default: return false
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-2xl border max-w-2xl w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                예외사항 등록
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {/* 단계 표시 */}
            <div className="mt-2">
              <span className="text-sm text-gray-500">{wizardData.step}/5</span>
            </div>
          </div>
          
          <div className="px-6 py-6">
            {renderStepContent()}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <Button
              variant="outline"
              onClick={wizardData.step === 1 ? onClose : onPrevStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {wizardData.step === 1 ? '취소' : '이전'}
            </Button>
            
            {wizardData.step < 5 ? (
              <Button
                onClick={onNextStep}
                disabled={isNextDisabled()}
              >
                다음
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? '등록 중...' : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    등록 완료
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

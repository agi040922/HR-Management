'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Calendar,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import {
  getUserStores,
  getStoreTemplates,
  getStoreEmployees,
  getStoreExceptions,
  getEmployeeWorkingSlots,
  createException,
  deleteException,
  buildExceptionDataFromWizard,
  getExceptionTypeLabel,
  getExceptionTypeBadgeVariant,
  getThisWeekExceptions,
  type StoreData,
  type EmployeeData,
  type TemplateData,
  type ExceptionData,
  type WorkingSlot,
  type ExceptionWizardData
} from '@/lib/api/schedule-exceptions-api'



export default function ExceptionsPage() {
  const { user, loading } = useAuth()
  
  // 기본 데이터 상태
  const [stores, setStores] = useState<StoreData[]>([])
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [exceptions, setExceptions] = useState<ExceptionData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // 위저드 상태
  const [showWizard, setShowWizard] = useState(false)
  const [wizardData, setWizardData] = useState<ExceptionWizardData>({
    step: 1,
    template_id: null,
    employee_id: null,
    date: new Date().toISOString().split('T')[0],
    exception_type: null,
    working_slots: [],
    selected_slots: [],
    start_time: '09:00',
    end_time: '18:00',
    notes: '',
    exception_data: {},
    affected_slots: []
  })
  
  // 기타 상태
  const [showHelp, setShowHelp] = useState(false)
  const [activeTab, setActiveTab] = useState('this-week')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  // 요일 매핑
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores()
    }
  }, [user])

  // 선택된 스토어가 변경될 때 템플릿, 직원, 예외사항 로드
  useEffect(() => {
    if (selectedStore) {
      loadTemplates(selectedStore.id)
      loadEmployees(selectedStore.id)
      loadExceptions(selectedStore.id)
    }
  }, [selectedStore])

  // 스토어 목록 로드
  const loadStores = async () => {
    if (!user) return;
    
    try {
      setLoadingData(true);
      const data = await getUserStores(user.id);
      setStores(data);
      
      if (data.length > 0 && !selectedStore) {
        setSelectedStore(data[0]);
      }
    } catch (err) {
      console.error('스토어 목록 로드 오류:', err);
      toast.error('스토어 목록을 불러오는데 실패했습니다');
    } finally {
      setLoadingData(false);
    }
  };

  // 템플릿 목록 로드
  const loadTemplates = async (storeId: number) => {
    try {
      const data = await getStoreTemplates(storeId);
      setTemplates(data);
    } catch (err) {
      console.error('템플릿 목록 로드 오류:', err);
      toast.error('템플릿 목록을 불러오는데 실패했습니다');
    }
  };

  // 직원 목록 로드
  const loadEmployees = async (storeId: number) => {
    if (!user) return;
    
    try {
      const data = await getStoreEmployees(storeId, user.id);
      setEmployees(data);
    } catch (err) {
      console.error('직원 목록 로드 오류:', err);
      toast.error('직원 목록을 불러오는데 실패했습니다');
    }
  };

  // 예외사항 목록 로드
  const loadExceptions = async (storeId: number) => {
    try {
      const data = await getStoreExceptions(storeId);
      setExceptions(data);
    } catch (err) {
      console.error('예외사항 로드 오류:', err);
      toast.error('예외사항을 불러오는데 실패했습니다');
    }
  };

  // 위저드 시작
  const startWizard = () => {
    setWizardData({
      step: 1,
      template_id: null,
      employee_id: null,
      date: new Date().toISOString().split('T')[0],
      exception_type: null,
      working_slots: [],
      selected_slots: [],
      start_time: '09:00',
      end_time: '18:00',
      notes: '',
      exception_data: {},
      affected_slots: []
    })
    setShowWizard(true)
  }

  // 위저드 닫기
  const closeWizard = () => {
    setShowWizard(false)
  }

  // 다음 단계로
  const nextStep = () => {
    setWizardData(prev => ({ ...prev, step: prev.step + 1 }))
  }

  // 이전 단계로
  const prevStep = () => {
    setWizardData(prev => ({ ...prev, step: prev.step - 1 }))
  }

  // 특정 직원의 근무 스케줄 가져오기
  const getWorkingSlots = (templateId: number, employeeId: number, targetDate: string): WorkingSlot[] => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return []

    return getEmployeeWorkingSlots(template, employeeId, targetDate, employees)
  }

  // 위저드 데이터 업데이트
  const updateWizardData = (updates: Partial<ExceptionWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }))
  }

    // 예외사항 생성 (위저드 완료)
  const handleCreateException = async () => {
    if (!user || !selectedStore || !wizardData.template_id || !wizardData.employee_id || !wizardData.exception_type) {
      toast.error('필수 정보가 누락되었습니다')
      return
    }

    // 시간 검증
    if (wizardData.exception_type !== 'CANCEL') {
      if (!wizardData.start_time || !wizardData.end_time) {
        toast.error('시작 시간과 종료 시간을 입력해주세요')
        return
      }
      
      if (wizardData.start_time >= wizardData.end_time) {
        toast.error('종료 시간은 시작 시간보다 늦어야 합니다')
        return
      }
    }

    try {
      setSubmitting(true)
      
      const exceptionData = buildExceptionDataFromWizard(wizardData, selectedStore.id)
      await createException(exceptionData)
      
        toast.success('예외사항이 성공적으로 등록되었습니다')
      closeWizard()
      loadExceptions(selectedStore.id)
    } catch (error) {
      console.error('예외사항 생성 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  // 예외사항 삭제
  const handleDeleteException = async (exceptionId: number) => {
    if (!confirm('정말로 이 예외사항을 삭제하시겠습니까?')) return
    
    try {
      await deleteException(exceptionId)
        toast.success('예외사항이 성공적으로 삭제되었습니다')
        if (selectedStore) loadExceptions(selectedStore.id)
    } catch (error) {
      console.error('예외사항 삭제 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    }
  }

  // 행 확장/축소 토글
  const toggleRowExpansion = (exceptionId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(exceptionId)) {
      newExpanded.delete(exceptionId)
    } else {
      newExpanded.add(exceptionId)
    }
    setExpandedRows(newExpanded)
  }



  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const thisWeekExceptions = getThisWeekExceptions(exceptions)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  스케줄 예외사항 관리
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
              </h1>
                {showHelp && (
                  <div className="absolute top-8 left-0 z-50 w-80 p-4 bg-white rounded-lg border shadow-lg">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">7단계 예외사항 등록:</p>
                      <ul className="space-y-1 text-xs">
                        <li>1. 스케줄 템플릿 선택</li>
                        <li>2. 직원 선택</li>
                        <li>3. 예외사항 유형 선택</li>
                        <li>4. 근무 중인 시간대 확인</li>
                        <li>5. 시간 선택</li>
                        <li>6. 메모 입력</li>
                        <li>7. 등록 완료</li>
                      </ul>
            </div>
                  </div>
                )}
              </div>
              
              {/* 스토어 선택 */}
              {stores.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    스토어:
                  </label>
                  <Select
                    value={selectedStore?.id.toString() || ''}
                    onValueChange={(value) => {
                      const store = stores.find(s => s.id.toString() === value)
                      setSelectedStore(store || null)
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="스토어를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.store_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  테이블
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  카드
                </Button>
              </div>
              <Button 
                onClick={startWizard}
                className="flex items-center gap-2"
                disabled={!selectedStore || templates.length === 0 || employees.length === 0}
              >
                <Plus className="h-4 w-4" />
                새 예외사항 등록
              </Button>
            </div>
        </div>

          <p className="text-gray-600 mt-2 text-sm">
            스케줄 템플릿을 기반으로 직원별 예외사항을 체계적으로 관리하세요.
          </p>
          </div>

        {/* 스토어가 없는 경우 안내 */}
        {stores.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                먼저 스토어를 생성해주세요
              </h3>
              <p className="text-gray-600 mb-4">
                예외사항을 등록하려면 먼저 스토어가 필요합니다
              </p>
              <Button asChild>
                <a href="/stores">스토어 관리로 이동</a>
              </Button>
            </div>
        )}

        {/* 템플릿/직원이 없는 경우 안내 */}
        {selectedStore && (templates.length === 0 || employees.length === 0) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">설정이 필요합니다</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {templates.length === 0 && <p>• 먼저 스케줄 템플릿을 생성해주세요</p>}
                  {employees.length === 0 && <p>• 직원을 등록해주세요</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  {templates.length === 0 && (
                    <Button size="sm" asChild>
                      <a href="/schedule/view">스케줄 템플릿 관리</a>
                    </Button>
                  )}
                  {employees.length === 0 && (
                    <Button size="sm" variant="outline" asChild>
                      <a href="/employees">직원 관리</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 위저드 모달 */}
        {showWizard && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4">
              <div className="fixed inset-0" onClick={closeWizard}></div>
              <div className="relative bg-white rounded-lg shadow-2xl border max-w-2xl w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      예외사항 등록
                    </h3>
                <button
                      onClick={closeWizard}
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
                  {/* 단계 1: 템플릿 선택 */}
                  {wizardData.step === 1 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">1. 스케줄 템플릿 선택</h4>
                      <p className="text-sm text-gray-600">기준이 될 스케줄 템플릿을 선택하세요.</p>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => updateWizardData({ template_id: template.id })}
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
                  )}
                  
                                    {/* 단계 2: 직원 및 날짜 선택 */}
                  {wizardData.step === 2 && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-medium text-gray-900">2. 직원 및 날짜 선택</h4>
                      <p className="text-sm text-gray-600">예외사항을 적용할 직원과 날짜를 선택하세요.</p>
                      
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 직원 선택 */}
                    <div>
                          <Label htmlFor="employee_select">직원 선택 *</Label>
                      <Select 
                            value={wizardData.employee_id?.toString() || ''} 
                            onValueChange={(value) => updateWizardData({ employee_id: parseInt(value) })}
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
                            onChange={(e) => updateWizardData({ date: e.target.value })}
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
                              onClick={() => updateWizardData({ exception_type: option.type as 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL' })}
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
                  )}
                  
                                    {/* 단계 3: 근무 시간대 확인 및 선택 */}
                  {wizardData.step === 3 && wizardData.template_id && wizardData.employee_id && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">3. 근무 중인 시간대 확인</h4>
                      <p className="text-sm text-gray-600">
                        선택한 날짜({new Date(wizardData.date).toLocaleDateString('ko-KR')})에 근무 예정인 시간대입니다.
                      </p>
                      
                      {(() => {
                        const workingSlots = getWorkingSlots(wizardData.template_id, wizardData.employee_id, wizardData.date)
                        
                        if (workingSlots.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">해당 날짜에 근무 예정이 없습니다.</p>
                            </div>
                          )
                        }
                        
                        // 위저드 데이터에 근무 슬롯 저장
                        if (JSON.stringify(wizardData.working_slots) !== JSON.stringify(workingSlots)) {
                          updateWizardData({ working_slots: workingSlots })
                        }
                        
                        return (
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
                        )
                      })()}
                    </div>
                  )}
                  
                  {/* 단계 4: 시간 선택 */}
                  {wizardData.step === 4 && (
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
                                  updateWizardData({ selected_slots: newSlots })
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
                              onChange={(e) => updateWizardData({ start_time: e.target.value })}
                              required
                          />
                        </div>
                        <div>
                            <Label htmlFor="new_end_time">종료 시간 *</Label>
                          <Input
                            type="time"
                              id="new_end_time"
                              value={wizardData.end_time}
                              onChange={(e) => updateWizardData({ end_time: e.target.value })}
                              required
                          />
                        </div>
                        </div>
                    )}
              </div>
            )}

                  {/* 단계 5: 메모 입력 및 등록 */}
                  {wizardData.step === 5 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">5. 메모 입력 및 등록</h4>
                      <p className="text-sm text-gray-600">추가 설명이나 메모를 입력하고 등록하세요.</p>
                      
                      <div>
                        <Label htmlFor="exception_notes">메모 (선택사항)</Label>
                        <Textarea
                          id="exception_notes"
                          value={wizardData.notes}
                          onChange={(e) => updateWizardData({ notes: e.target.value })}
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
                  )}
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={wizardData.step === 1 ? closeWizard : prevStep}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {wizardData.step === 1 ? '취소' : '이전'}
                  </Button>
                  
                  {wizardData.step < 5 ? (
                    <Button
                      onClick={nextStep}
                      disabled={
                        (wizardData.step === 1 && !wizardData.template_id) ||
                        (wizardData.step === 2 && (!wizardData.employee_id || !wizardData.date || !wizardData.exception_type)) ||
                        (wizardData.step === 3 && wizardData.working_slots.length === 0) ||
                        (wizardData.step === 4 && wizardData.exception_type === 'CANCEL' && wizardData.selected_slots.length === 0) ||
                        (wizardData.step === 4 && wizardData.exception_type !== 'CANCEL' && (!wizardData.start_time || !wizardData.end_time))
                      }
                    >
                      다음
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateException}
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
                  )}

        {/* 예외사항 목록 */}
        {selectedStore && exceptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">등록된 예외사항</h2>
              <Badge variant="secondary">{exceptions.length}건</Badge>
            </div>
            
            {viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>직원</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>템플릿</TableHead>
                    <TableHead className="w-[100px]">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.map((exception) => {
                    const employee = employees.find(emp => emp.id === exception.employee_id)
                    const template = templates.find(t => t.id === exception.template_id)
                    const isExpanded = expandedRows.has(exception.id)
                    
                    return (
                      <React.Fragment key={exception.id}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(exception.id)}
                              className="p-1"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{new Date(exception.date).toLocaleDateString('ko-KR')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{employee?.name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getExceptionTypeBadgeVariant(exception.exception_type) as any}>
                              {getExceptionTypeLabel(exception.exception_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {exception.exception_type !== 'CANCEL' && exception.start_time && exception.end_time ? (
                              <span>{exception.start_time} - {exception.end_time}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {template?.template_name || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteException(exception.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* 확장된 행 - 드릴 다운 정보 */}
                        {isExpanded && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={7}>
                              <div className="py-4 px-2 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">상세 정보</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">직원 시급:</span>
                                        <span>{employee?.hourly_wage?.toLocaleString()}원</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">직원 직책:</span>
                                        <span>{employee?.position || '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">등록일:</span>
                                        <span>{new Date(exception.created_at).toLocaleDateString('ko-KR')}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">템플릿 정보</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">템플릿 ID:</span>
                                        <span>#{template?.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">상태:</span>
                                        <span>{template?.is_active ? '활성' : '비활성'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {exception.notes && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">메모</h4>
                                    <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                                      {exception.notes}
                                    </div>
                                  </div>
                                )}
                                
                                {exception.exception_data && Object.keys(exception.exception_data).length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">예외사항 데이터</h4>
                                    <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                                      <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(exception.exception_data, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              // 기존 카드 뷰
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exceptions.slice(0, 6).map((exception) => {
                  const employee = employees.find(emp => emp.id === exception.employee_id)
                  const template = templates.find(t => t.id === exception.template_id)
                  
                  return (
                    <Card key={exception.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{new Date(exception.date).toLocaleDateString('ko-KR')}</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteException(exception.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={getExceptionTypeBadgeVariant(exception.exception_type) as any}>
                            {getExceptionTypeLabel(exception.exception_type)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span>{employee?.name || 'Unknown'}</span>
                          </div>
                          
                          {template && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>템플릿: {template.template_name}</span>
                            </div>
                          )}

                          {exception.exception_type !== 'CANCEL' && exception.start_time && exception.end_time && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{exception.start_time} - {exception.end_time}</span>
                            </div>
                          )}
                        </div>

                        {exception.notes && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {exception.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            
            {viewMode === 'cards' && exceptions.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline">
                  더 보기 ({exceptions.length - 6}건)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 예외사항이 없는 경우 */}
        {selectedStore && exceptions.length === 0 && templates.length > 0 && employees.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 예외사항이 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              첫 번째 예외사항을 등록해보세요
            </p>
            <Button onClick={startWizard}>
              <Plus className="h-4 w-4 mr-2" />
              예외사항 등록하기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
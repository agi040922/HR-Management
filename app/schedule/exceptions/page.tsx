'use client'

import React, { useState, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

// 컴포넌트 imports
import StoreSelector from '@/components/(page)/exceptions/StoreSelector'
import EmptyStates from '@/components/(page)/exceptions/EmptyStates'
import ExceptionFilters from '@/components/(page)/exceptions/ExceptionFilters'
import ExceptionWizard from '@/components/(page)/exceptions/ExceptionWizard'
import ExceptionList from '@/components/(page)/exceptions/ExceptionList'

// API imports
import {
  getUserStores,
  getStoreTemplates,
  getStoreEmployees,
  getStoreExceptions,
  getEmployeeWorkingSlots,
  createException,
  deleteException,
  buildExceptionDataFromWizard,
  getThisWeekExceptions,
  type StoreData,
  type EmployeeData,
  type TemplateData,
  type ExceptionData,
  type WorkingSlot,
  type ExceptionWizardData
} from '@/lib/api/(page)/schedule/exceptions/exceptions-api'

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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

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

  // 데이터 로드 함수들
  const loadStores = async () => {
    if (!user) return
    
    try {
      setLoadingData(true)
      const data = await getUserStores(user.id)
      setStores(data)
      
      if (data.length > 0 && !selectedStore) {
        setSelectedStore(data[0])
      }
    } catch (err) {
      console.error('스토어 목록 로드 오류:', err)
      toast.error('스토어 목록을 불러오는데 실패했습니다')
    } finally {
      setLoadingData(false)
    }
  }

  const loadTemplates = async (storeId: number) => {
    try {
      const data = await getStoreTemplates(storeId)
      setTemplates(data)
    } catch (err) {
      console.error('템플릿 목록 로드 오류:', err)
      toast.error('템플릿 목록을 불러오는데 실패했습니다')
    }
  }

  const loadEmployees = async (storeId: number) => {
    if (!user) return
    
    try {
      const data = await getStoreEmployees(storeId, user.id)
      setEmployees(data)
    } catch (err) {
      console.error('직원 목록 로드 오류:', err)
      toast.error('직원 목록을 불러오는데 실패했습니다')
    }
  }

  const loadExceptions = async (storeId: number) => {
    try {
      const data = await getStoreExceptions(storeId)
      setExceptions(data)
    } catch (err) {
      console.error('예외사항 로드 오류:', err)
      toast.error('예외사항을 불러오는데 실패했습니다')
    }
  }

  // 위저드 관련 함수들
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

  const closeWizard = () => {
    setShowWizard(false)
  }

  const nextStep = () => {
    setWizardData(prev => ({ ...prev, step: prev.step + 1 }))
  }

  const prevStep = () => {
    setWizardData(prev => ({ ...prev, step: prev.step - 1 }))
  }

  const getWorkingSlots = (templateId: number, employeeId: number, targetDate: string): WorkingSlot[] => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return []
    return getEmployeeWorkingSlots(template, employeeId, targetDate, employees)
  }

  const updateWizardData = (updates: Partial<ExceptionWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }))
  }

  // 예외사항 생성
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

  // 로딩 상태
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
  const canCreateException = selectedStore && templates.length > 0 && employees.length > 0

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
                      <p className="font-medium mb-2">5단계 예외사항 등록:</p>
                      <ul className="space-y-1 text-xs">
                        <li>1. 스케줄 템플릿 선택</li>
                        <li>2. 직원 및 날짜 선택</li>
                        <li>3. 근무 중인 시간대 확인</li>
                        <li>4. 시간 선택</li>
                        <li>5. 메모 입력 및 등록</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 스토어 선택 */}
              <StoreSelector 
                stores={stores}
                selectedStore={selectedStore}
                onStoreChange={setSelectedStore}
              />
            </div>
          </div>

          <p className="text-gray-600 mt-2 text-sm">
            스케줄 템플릿을 기반으로 직원별 예외사항을 체계적으로 관리하세요.
          </p>
        </div>

        {/* 빈 상태 컴포넌트들 */}
        {stores.length === 0 && (
          <EmptyStates type="no-stores" />
        )}

        {selectedStore && (templates.length === 0 || employees.length === 0) && (
          <EmptyStates 
            type="no-setup" 
            templatesCount={templates.length}
            employeesCount={employees.length}
          />
        )}

        {/* 위저드 컴포넌트 */}
        <ExceptionWizard
          isOpen={showWizard}
          wizardData={wizardData}
          templates={templates}
          employees={employees}
          submitting={submitting}
          onClose={closeWizard}
          onUpdateData={updateWizardData}
          onNextStep={nextStep}
          onPrevStep={prevStep}
          onSubmit={handleCreateException}
          getWorkingSlots={getWorkingSlots}
        />

        {/* 예외사항 목록 */}
        {selectedStore && exceptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ExceptionFilters
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              activeTab="all"
              onTabChange={() => {}}
              exceptionsCount={exceptions.length}
              onStartWizard={startWizard}
              canCreateException={canCreateException}
            />
            
            <ExceptionList
              exceptions={exceptions}
              employees={employees}
              templates={templates}
              viewMode={viewMode}
              onDeleteException={handleDeleteException}
            />
          </div>
        )}

        {/* 예외사항이 없는 경우 */}
        {selectedStore && exceptions.length === 0 && templates.length > 0 && employees.length > 0 && (
          <EmptyStates type="no-exceptions" onStartWizard={startWizard} />
        )}
      </div>
    </div>
  )
}

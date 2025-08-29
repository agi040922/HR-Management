'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone,
  DollarSign,
  Store,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronRight,
  Eye,
  HelpCircle,
  Scroll,
  FileText,
  PlayCircle,
  Calendar,
  Clock
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { useTutorial } from '@/components/TutorialProvider'
import { employeesTutorialSteps } from '@/lib/tutorial/tutorial-steps'
import { getTutorialTheme, TutorialStorage } from '@/lib/tutorial/tutorial-utils'
import {
  StoreData,
  EmployeeData,
  EmployeeFormData,
  ScheduleTemplate,
  fetchStores,
  fetchEmployees,
  fetchScheduleTemplates,
  createEmployee,
  addEmployeeToScheduleTemplate,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus
} from '@/lib/api/(page)/employees/employees-api'
import { EmployeeForm } from '@/components/(page)/employees/employee-form'
import { EmployeeTable } from '@/components/(page)/employees/employee-table'
import { EmployeeCards } from '@/components/(page)/employees/employee-cards'
import { ContractModal } from '@/components/(page)/employees/contract-modal'

interface ExtendedEmployeeFormData extends EmployeeFormData {
  work_start_time: string
  work_end_time: string
  break_start_time: string
  break_end_time: string
  work_days_per_week: number
  weekly_work_hours: number
  selected_template_id?: number
}

export default function EmployeesPage() {
  const { user, loading } = useAuth()
  const { startTutorial } = useTutorial()
  const [stores, setStores] = useState<StoreData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null)
  const [formData, setFormData] = useState<ExtendedEmployeeFormData>({
    store_id: null,
    owner_id: '',
    name: '',
    hourly_wage: 10030, // 2025년 최저시급
    position: '',
    phone: '',
    start_date: new Date().toISOString().split('T')[0],
    is_active: true,
    labor_contract: null,
    work_start_time: '',
    work_end_time: '',
    break_start_time: '',
    break_end_time: '',
    work_days_per_week: 5,
    weekly_work_hours: 0,
    selected_template_id: undefined
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedStore, setSelectedStore] = useState<number | 'all'>('all')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showHelp, setShowHelp] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any | null>(null)

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // 스토어 변경 시 템플릿 로드
  useEffect(() => {
    if (formData.store_id) {
      loadTemplates(formData.store_id)
    } else {
      setTemplates([])
    }
  }, [formData.store_id])

  const loadData = async () => {
    if (!user) return
    
    try {
      setLoadingData(true)
      
      // API 함수 사용
      const [storesData, employeesData] = await Promise.all([
        fetchStores(user.id),
        fetchEmployees(user.id)
      ])
      
      setStores(storesData)
      setEmployees(employeesData)
      
    } catch (error) {
      console.error('데이터 로드 중 예외:', error)
      toast.error(error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다')
    } finally {
      setLoadingData(false)
    }
  }

  const loadTemplates = async (storeId: number) => {
    try {
      const templatesData = await fetchScheduleTemplates(storeId)
      setTemplates(templatesData)
    } catch (error) {
      console.error('템플릿 로드 오류:', error)
      toast.error('스케줄 템플릿을 불러오는데 실패했습니다')
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.store_id) return

    try {
      setSubmitting(true)
      
      // API 함수 사용
      const employeeData: EmployeeFormData = {
        store_id: formData.store_id,
        owner_id: user.id,
        name: formData.name,
        hourly_wage: formData.hourly_wage,
        position: formData.position,
        phone: formData.phone,
        start_date: formData.start_date,
        is_active: formData.is_active,
        labor_contract: formData.labor_contract
      }
      
      const newEmployee = await createEmployee(employeeData)
      
      // 선택된 템플릿이 있다면 스케줄에 추가
      if (formData.selected_template_id && formData.work_start_time && formData.work_end_time) {
        const selectedTemplate = templates.find(t => t.id === formData.selected_template_id)
        if (selectedTemplate) {
          try {
            await addEmployeeToScheduleTemplate(newEmployee, selectedTemplate, {
              startTime: formData.work_start_time,
              endTime: formData.work_end_time,
              breakStartTime: formData.break_start_time || undefined,
              breakEndTime: formData.break_end_time || undefined,
              workDaysPerWeek: formData.work_days_per_week || 5
            })
            toast.success('직원이 등록되고 스케줄 템플릿에 추가되었습니다!')
          } catch (templateError) {
            console.error('템플릿 추가 오류:', templateError)
            toast.success('직원은 등록되었지만 스케줄 템플릿 추가에 실패했습니다')
          }
        }
      } else {
        toast.success('직원이 성공적으로 등록되었습니다')
      }
      
      setShowCreateForm(false)
      resetForm()
      loadData() // 목록 새로고침
      
    } catch (error) {
      console.error('직원 생성 중 예외:', error)
      toast.error(error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee || !user) return

    try {
      setSubmitting(true)
      
      // API 함수 사용
      const updateData: Partial<EmployeeFormData> = {
        store_id: formData.store_id,
        name: formData.name,
        hourly_wage: formData.hourly_wage,
        position: formData.position,
        phone: formData.phone,
        start_date: formData.start_date,
        is_active: formData.is_active
      }
      
      await updateEmployee(editingEmployee.id, updateData)
      
      toast.success('직원 정보가 성공적으로 수정되었습니다')
      setEditingEmployee(null)
      resetForm()
      loadData() // 목록 새로고침
      
    } catch (error) {
      console.error('직원 수정 중 예외:', error)
      toast.error(error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!confirm('정말로 이 직원을 삭제하시겠습니까?')) return

    try {
      await deleteEmployee(employeeId)
      toast.success('직원이 성공적으로 삭제되었습니다')
      loadData() // 목록 새로고침
    } catch (error) {
      console.error('직원 삭제 중 예외:', error)
      toast.error(error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다')
    }
  }

  const handleToggleEmployeeStatus = async (employee: EmployeeData) => {
    try {
      await toggleEmployeeStatus(employee.id, employee.is_active)
      toast.success(`직원이 ${!employee.is_active ? '활성화' : '비활성화'}되었습니다`)
      loadData() // 목록 새로고침
    } catch (error) {
      console.error('직원 상태 변경 중 예외:', error)
      toast.error(error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다')
    }
  }

  const startEdit = (employee: EmployeeData) => {
    setEditingEmployee(employee)
    setFormData({
      store_id: employee.store_id || null,
      owner_id: user?.id || '',
      name: employee.name,
      hourly_wage: employee.hourly_wage,
      position: employee.position || '',
      phone: employee.phone || '',
      start_date: employee.start_date || new Date().toISOString().split('T')[0],
      is_active: employee.is_active,
      labor_contract: employee.labor_contract || null,
      work_start_time: '',
      work_end_time: '',
      break_start_time: '',
      break_end_time: '',
      work_days_per_week: 0,
      weekly_work_hours: 0,
      selected_template_id: undefined
    })
    setShowCreateForm(false)
  }

  const resetForm = () => {
    setFormData({
      store_id: null,
      owner_id: user?.id || '',
      name: '',
      hourly_wage: 10030,
      position: '',
      phone: '',
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
      labor_contract: null,
      work_start_time: '',
      work_end_time: '',
      break_start_time: '',
      break_end_time: '',
      work_days_per_week: 0,
      weekly_work_hours: 0,
      selected_template_id: undefined
    })
    setTemplates([])
  }

  const cancelEdit = () => {
    setEditingEmployee(null)
    setShowCreateForm(false)
    resetForm()
  }

  const getStoreById = (storeId?: number) => {
    return stores.find(store => store.id === storeId)
  }

  const filteredEmployees = selectedStore === 'all' 
    ? employees 
    : employees.filter(emp => emp.store_id === selectedStore)

  // 행 확장/축소 토글
  const toggleRowExpansion = (employeeId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedRows(newExpanded)
  }

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract)
    setShowContractModal(true)
  }

  const getContractTypeLabel = (contractType: string) => {
    const types: { [key: string]: string } = {
      'permanent': '정규직 (기간의 정함이 없는 경우)',
      'fixed-term': '계약직 (기간의 정함이 있는 경우)',
      'minor': '연소근로자',
      'part-time': '단시간근로자',
      'construction-daily': '건설일용근로자',
      'foreign-worker': '외국인근로자',
      'foreign-agriculture': '외국인근로자(농업·축산업·어업)',
      'foreign-worker-en': '외국인근로자 (영문)',
      'foreign-agriculture-en': '외국인근로자(농업·축산업·어업) (영문)'
    }
    return types[contractType] || '기타'
  }

  // 튜토리얼 시작
  const handleStartTutorial = () => {
    const theme = getTutorialTheme()
    startTutorial(employeesTutorialSteps, theme)
    TutorialStorage.setTutorialCompleted('employees', false) // 다시 볼 수 있도록
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">직원 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-tutorial="employees-header">
                  직원 관리
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
                      <p className="font-medium mb-2">직원 관리 기능:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 스토어별 직원 등록 및 관리</li>
                        <li>• 시급, 직책, 연락처 정보 관리</li>
                        <li>• 직원 활성/비활성 상태 관리</li>
                        <li>• 테이블/카드 뷰 전환 가능</li>
                        <li>• 드릴다운으로 상세 정보 확인</li>
                        <li>• 스토어별 필터링 지원</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 튜토리얼 시작 버튼 */}
              <Button
                onClick={handleStartTutorial}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <PlayCircle className="h-4 w-4" />
                튜토리얼 시작
              </Button>
              
              {/* 스토어 선택 */}
              {stores.length > 0 && (
                <div className="flex items-center gap-2" data-tutorial="store-selector">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    스토어:
                  </label>
                  <Select
                    value={selectedStore.toString()}
                    onValueChange={(value) => setSelectedStore(value === 'all' ? 'all' : parseInt(value))}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 스토어</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.store_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    총 {filteredEmployees.length}명
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1" data-tutorial="view-mode-toggle">
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
                onClick={() => {
                  setShowCreateForm(true)
                  setEditingEmployee(null)
                }}
                className="flex items-center gap-2"
                disabled={stores.length === 0}
                data-tutorial="new-employee-button"
              >
                <Plus className="h-4 w-4" />
                새 직원 등록
              </Button>
            </div>
        </div>

          <p className="text-gray-600 mt-2 text-sm">
            스토어별 직원을 등록하고 관리하세요.
          </p>
          </div>

        {/* 스토어가 없는 경우 안내 */}
        {stores.length === 0 && (
          <div className="bg-white rounded border shadow-sm p-6">
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                먼저 스토어를 생성해주세요
              </h3>
              <p className="text-gray-600 mb-4">
                직원을 등록하려면 먼저 스토어가 필요합니다
              </p>
              <Button asChild>
                <a href="/stores">스토어 관리로 이동</a>
              </Button>
            </div>
          </div>
        )}

        {stores.length > 0 && (
          <>

            {/* 직원 생성/수정 폼 */}
            {(showCreateForm || editingEmployee) && (
              <EmployeeForm
                formData={formData}
                setFormData={setFormData}
                stores={stores}
                templates={templates}
                editingEmployee={editingEmployee}
                submitting={submitting}
                onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
                onCancel={cancelEdit}
              />
            )}

            {/* 직원 목록 */}
            <div className="bg-white rounded border shadow-sm p-6" data-tutorial="employee-list">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  직원 목록 ({filteredEmployees.length}명)
                </h2>
              </div>
              
              {filteredEmployees.length > 0 ? (
                viewMode === 'table' ? (
                  <EmployeeTable
                    employees={filteredEmployees}
                    stores={stores}
                    expandedRows={expandedRows}
                    onToggleExpansion={toggleRowExpansion}
                    onToggleStatus={handleToggleEmployeeStatus}
                    onEdit={startEdit}
                    onDelete={handleDeleteEmployee}
                    onViewContract={handleViewContract}
                    getContractTypeLabel={getContractTypeLabel}
                  />
                ) : (
                  <EmployeeCards
                    employees={filteredEmployees}
                    stores={stores}
                    onToggleStatus={handleToggleEmployeeStatus}
                    onEdit={startEdit}
                    onDelete={handleDeleteEmployee}
                  />
                )
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedStore === 'all' ? '등록된 직원이 없습니다' : '해당 스토어에 등록된 직원이 없습니다'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    첫 번째 직원을 등록하여 HR 관리를 시작하세요
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>첫 직원 등록하기</span>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* 근로계약서 상세보기 모달 */}
        <ContractModal
          isOpen={showContractModal}
          contract={selectedContract}
          onClose={() => setShowContractModal(false)}
          getContractTypeLabel={getContractTypeLabel}
        />

      </div>
    </div>
  )
}

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
  PlayCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useTutorial } from '@/components/TutorialProvider'
import { employeesTutorialSteps } from '@/lib/tutorial/tutorial-steps'
import { getTutorialTheme, TutorialStorage } from '@/lib/tutorial/tutorial-utils'

interface StoreData {
  id: number
  owner_id: string
  store_name: string
  open_time: string
  close_time: string
  time_slot_minutes: number
}

interface EmployeeData {
  id: number
  store_id?: number
  name: string
  hourly_wage: number
  position?: string
  phone?: string
  start_date: string
  is_active: boolean
  labor_contract?: any | null
  created_at: string
  updated_at: string
}

interface EmployeeFormData {
  store_id: number | null
  name: string
  hourly_wage: number
  position: string
  phone: string
  start_date: string
  is_active: boolean
  labor_contract?: any | null
  work_start_time: string
  work_end_time: string
  break_start_time: string
  break_end_time: string
  work_days_per_week: number
  weekly_work_hours: number
}

export default function EmployeesPage() {
  const { user, loading } = useAuth()
  const { startTutorial } = useTutorial()
  const [stores, setStores] = useState<StoreData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null)
  const [formData, setFormData] = useState<EmployeeFormData>({
    store_id: null,
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
    work_days_per_week: 0,
    weekly_work_hours: 0
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

  const loadData = async () => {
    try {
      setLoadingData(true)

      // 스토어 데이터 로드
      const { data: storesData, error: storesError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (storesError) {
        console.error('스토어 로드 오류:', storesError)
        toast.error('스토어 데이터를 불러오는데 실패했습니다')
      } else {
        setStores(storesData || [])
      }

      // 직원 데이터 로드 (현재 사용자의 직원만)
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (employeesError) {
        console.error('직원 로드 오류:', employeesError)
        toast.error('직원 데이터를 불러오는데 실패했습니다')
      } else {
        setEmployees(employeesData || [])
      }

    } catch (error) {
      console.error('데이터 로드 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setLoadingData(false)
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.store_id) return

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('employees')
        .insert([formData])
        .select()

      if (error) {
        console.error('직원 생성 오류:', error)
        toast.error('직원 등록에 실패했습니다')
      } else {
        toast.success('직원이 성공적으로 등록되었습니다')
        setShowCreateForm(false)
        resetForm()
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('직원 생성 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('id', editingEmployee.id)

      if (error) {
        console.error('직원 수정 오류:', error)
        toast.error('직원 정보 수정에 실패했습니다')
      } else {
        toast.success('직원 정보가 성공적으로 수정되었습니다')
        setEditingEmployee(null)
        resetForm()
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('직원 수정 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!confirm('정말로 이 직원을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)

      if (error) {
        console.error('직원 삭제 오류:', error)
        toast.error('직원 삭제에 실패했습니다')
      } else {
        toast.success('직원이 성공적으로 삭제되었습니다')
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('직원 삭제 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    }
  }

  const toggleEmployeeStatus = async (employee: EmployeeData) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: !employee.is_active })
        .eq('id', employee.id)

      if (error) {
        console.error('직원 상태 변경 오류:', error)
        toast.error('직원 상태 변경에 실패했습니다')
      } else {
        toast.success(`직원이 ${!employee.is_active ? '활성화' : '비활성화'}되었습니다`)
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('직원 상태 변경 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    }
  }

  const startEdit = (employee: EmployeeData) => {
    setEditingEmployee(employee)
    setFormData({
      store_id: employee.store_id || null,
      name: employee.name,
      hourly_wage: employee.hourly_wage,
      position: employee.position || '',
      phone: employee.phone || '',
      start_date: employee.start_date || new Date().toISOString().split('T')[0],
      is_active: employee.is_active,
      labor_contract: employee.labor_contract || null,
      work_start_time: employee.work_start_time || '',
      work_end_time: employee.work_end_time || '',
      break_start_time: employee.break_start_time || '',
      break_end_time: employee.break_end_time || '',
      work_days_per_week: employee.work_days_per_week || 0,
      weekly_work_hours: employee.weekly_work_hours || 0
    })
    setShowCreateForm(false)
  }

  const resetForm = () => {
    setFormData({
      store_id: null,
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
      weekly_work_hours: 0
    })
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
              <div className="bg-white rounded border shadow-sm p-6 mb-6" data-tutorial="employee-form">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingEmployee ? '직원 정보 수정' : '새 직원 등록'}
                  </h2>
                </div>
                <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="store_id">소속 스토어 *</Label>
                      <Select 
                        value={formData.store_id?.toString() || ''} 
                        onValueChange={(value) => setFormData({...formData, store_id: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="스토어를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.store_name} ({store.open_time}-{store.close_time})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="직원 이름을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly_wage">시급 (원) *</Label>
                      <Input
                        id="hourly_wage"
                        type="number"
                        min="9620"
                        value={formData.hourly_wage}
                        onChange={(e) => setFormData({...formData, hourly_wage: parseInt(e.target.value)})}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        2025년 최저시급: 10,030원
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="position">직책</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        placeholder="예: 매니저, 파트타이머"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="010-1234-5678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="start_date">근무 시작일 *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      />
                      <Label htmlFor="is_active">활성 상태</Label>
                    </div>
                    <div>
                      <Label htmlFor="work_start_time">근무 시작 시간</Label>
                      <Input
                        id="work_start_time"
                        type="time"
                        value={formData.work_start_time}
                        onChange={(e) => setFormData({...formData, work_start_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="work_end_time">근무 종료 시간</Label>
                      <Input
                        id="work_end_time"
                        type="time"
                        value={formData.work_end_time}
                        onChange={(e) => setFormData({...formData, work_end_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="break_start_time">휴게 시작 시간</Label>
                      <Input
                        id="break_start_time"
                        type="time"
                        value={formData.break_start_time}
                        onChange={(e) => setFormData({...formData, break_start_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="break_end_time">휴게 종료 시간</Label>
                      <Input
                        id="break_end_time"
                        type="time"
                        value={formData.break_end_time}
                        onChange={(e) => setFormData({...formData, break_end_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="work_days_per_week">주 근무 일수</Label>
                      <Input
                        id="work_days_per_week"
                        type="number"
                        value={formData.work_days_per_week}
                        onChange={(e) => setFormData({...formData, work_days_per_week: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weekly_work_hours">주 근무 시간</Label>
                      <Input
                        id="weekly_work_hours"
                        type="number"
                        value={formData.weekly_work_hours}
                        onChange={(e) => setFormData({...formData, weekly_work_hours: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg" data-tutorial="contract-info">
                      <p className="text-sm text-blue-800 mb-2">
                        💡 <strong>근로계약서와 함께 등록</strong>하고 싶으신가요?
                      </p>
                      <p className="text-xs text-blue-600 mb-3">
                        근로계약서를 작성하면서 직원을 등록하면 법정 서류를 완비할 수 있습니다.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/test/labor-contract', '_blank')}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        근로계약서 작성하기
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? '처리 중...' : (editingEmployee ? '수정하기' : '간단 등록')}
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelEdit}>
                        취소
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>스토어</TableHead>
                        <TableHead>시급</TableHead>
                        <TableHead>직책</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="w-[120px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => {
                        const store = getStoreById(employee.store_id)
                        const isExpanded = expandedRows.has(employee.id)
                        
                        return (
                          <React.Fragment key={employee.id}>
                            <TableRow className="hover:bg-gray-50">
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRowExpansion(employee.id)}
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
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{employee.name}</span>
                                  {employee.labor_contract && (
                                    <Badge variant="outline" className="text-xs">
                                      <Scroll className="h-3 w-3 mr-1" />
                                      계약서
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Store className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">
                                    {store ? store.store_name : '스토어 미지정'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  <span>{employee.hourly_wage.toLocaleString()}원</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">
                                  {employee.position || '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                                  {employee.is_active ? '활성' : '비활성'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {employee.labor_contract && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewContract(employee.labor_contract)}
                                      title="근로계약서 보기"
                                      className="p-1"
                                    >
                                      <FileText className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleEmployeeStatus(employee)}
                                    title={employee.is_active ? '비활성화' : '활성화'}
                                    className="p-1"
                                  >
                                    {employee.is_active ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-600" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(employee)}
                                    className="p-1"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteEmployee(employee.id)}
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
                                        <h4 className="font-medium text-gray-900 mb-2">연락처 정보</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span>{employee.phone || '연락처 없음'}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">근무 정보</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">시작일:</span>
                                            <span>{new Date(employee.start_date).toLocaleDateString('ko-KR')}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">등록일:</span>
                                            <span>{new Date(employee.created_at).toLocaleDateString('ko-KR')}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">수정일:</span>
                                            <span>{new Date(employee.updated_at).toLocaleDateString('ko-KR')}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {store && (
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">스토어 상세 정보</h4>
                                        <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <span className="text-gray-600">운영시간:</span>
                                              <span className="ml-2">{store.open_time} - {store.close_time}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">시간 단위:</span>
                                              <span className="ml-2">{store.time_slot_minutes}분</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* 근로계약서 정보 */}
                                    {employee.labor_contract && (
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">근로계약서 정보</h4>
                                        <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <span className="text-gray-600">계약 유형:</span>
                                              <span className="ml-2">{getContractTypeLabel(employee.labor_contract.contractType)}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">계약 기간:</span>
                                              <span className="ml-2">
                                                {employee.labor_contract.workStartDate} ~ {employee.labor_contract.workEndDate || '정함없음'}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="mt-2 flex justify-end">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleViewContract(employee.labor_contract)}
                                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                            >
                                              <FileText className="h-4 w-4 mr-1" />
                                              상세보기
                                            </Button>
                                          </div>
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
                    {filteredEmployees.map((employee) => {
                      const store = getStoreById(employee.store_id)
                      return (
                        <Card key={employee.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>{employee.name}</span>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEmployeeStatus(employee)}
                                  title={employee.is_active ? '비활성화' : '활성화'}
                                >
                                  {employee.is_active ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-600" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(employee)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Store className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {store ? store.store_name : '스토어 미지정'}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                시급 {employee.hourly_wage.toLocaleString()}원
                              </span>
                            </div>

                            {employee.position && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                  직책: {employee.position}
                                </span>
                              </div>
                            )}

                            {employee.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{employee.phone}</span>
                              </div>
                            )}

                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                                {employee.is_active ? '활성' : '비활성'}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                등록: {new Date(employee.created_at).toLocaleDateString('ko-KR')}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
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
        {showContractModal && selectedContract && (
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
                    onClick={() => setShowContractModal(false)}
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
                          <span className="font-medium">{getContractTypeLabel(selectedContract.contractType)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">계약 시작일:</span>
                          <span>{selectedContract.workStartDate}</span>
                        </div>
                        {selectedContract.workEndDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">계약 종료일:</span>
                            <span>{selectedContract.workEndDate}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">근무지:</span>
                          <span>{selectedContract.workplace}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">업무 내용:</span>
                          <span>{selectedContract.jobDescription}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">근로자 정보</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">성명:</span>
                          <span className="font-medium">{selectedContract.employee?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">주소:</span>
                          <span>{selectedContract.employee?.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">연락처:</span>
                          <span>{selectedContract.employee?.phone}</span>
                        </div>
                        {selectedContract.employee?.birthdate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">생년월일:</span>
                            <span>{selectedContract.employee.birthdate}</span>
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
                        <span>{selectedContract.workingHours?.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">종업시각:</span>
                        <span>{selectedContract.workingHours?.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">주 근무일수:</span>
                        <span>{selectedContract.workingHours?.workDaysPerWeek}일</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">주휴일:</span>
                        <span>{selectedContract.workingHours?.weeklyHoliday}</span>
                      </div>
                    </div>
                  </div>

                  {/* 임금 정보 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">임금</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">기본급:</span>
                        <span className="font-medium">{selectedContract.salary?.basicSalary?.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">임금 형태:</span>
                        <span>
                          {selectedContract.salary?.salaryType === 'monthly' ? '월급' : 
                           selectedContract.salary?.salaryType === 'daily' ? '일급' : '시급'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">임금지급일:</span>
                        <span>매월 {selectedContract.salary?.payDate}일</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">지급방법:</span>
                        <span>
                          {selectedContract.salary?.paymentMethod === 'direct' ? '직접지급' : '통장입금'}
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
                        <span className="font-medium">{selectedContract.employer?.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">대표자:</span>
                        <span>{selectedContract.employer?.representative}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">사업장 주소:</span>
                        <span>{selectedContract.employer?.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">전화번호:</span>
                        <span>{selectedContract.employer?.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setShowContractModal(false)}
                    variant="outline"
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

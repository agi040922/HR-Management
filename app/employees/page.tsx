'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone,
  DollarSign,
  Store,
  UserCheck,
  UserX
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface StoreData {
  id: number
  owner_id: string
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
  is_active: boolean
  created_at: string
  updated_at: string
}

interface EmployeeFormData {
  store_id: number | null
  name: string
  hourly_wage: number
  position: string
  phone: string
  is_active: boolean
}

export default function EmployeesPage() {
  const { user, loading } = useAuth()
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
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedStore, setSelectedStore] = useState<number | 'all'>('all')

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
      is_active: employee.is_active
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
      is_active: true
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">직원 관리</h1>
          <p className="text-gray-600">스토어별 직원을 등록하고 관리하세요</p>
        </div>
        <Button 
          onClick={() => {
            setShowCreateForm(true)
            setEditingEmployee(null)
          }}
          className="flex items-center space-x-2"
          disabled={stores.length === 0}
        >
          <Plus className="h-4 w-4" />
          <span>새 직원 등록</span>
        </Button>
      </div>

      {/* 스토어가 없는 경우 안내 */}
      {stores.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
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
          </CardContent>
        </Card>
      )}

      {stores.length > 0 && (
        <>
          {/* 스토어 필터 */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="store-filter">스토어 필터:</Label>
            <Select value={selectedStore.toString()} onValueChange={(value) => setSelectedStore(value === 'all' ? 'all' : parseInt(value))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 스토어</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    스토어 #{store.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 직원 생성/수정 폼 */}
          {(showCreateForm || editingEmployee) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{editingEmployee ? '직원 정보 수정' : '새 직원 등록'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              스토어 #{store.id} ({store.open_time}-{store.close_time})
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <Label htmlFor="is_active">활성 상태</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? '처리 중...' : (editingEmployee ? '수정하기' : '등록하기')}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 직원 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
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
                          {store ? `스토어 #${store.id}` : '스토어 미지정'}
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
              })
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
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
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </>
      )}

      {/* 도움말 */}
      <Card>
        <CardHeader>
          <CardTitle>직원 관리 도움말</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            • <strong>소속 스토어:</strong> 직원이 근무할 스토어를 지정합니다
          </p>
          <p className="text-sm text-gray-600">
            • <strong>시급 설정:</strong> 2025년 최저시급(10,030원) 이상으로 설정하세요
          </p>
          <p className="text-sm text-gray-600">
            • <strong>활성/비활성:</strong> 퇴사한 직원은 비활성화하여 관리할 수 있습니다
          </p>
          <p className="text-sm text-gray-600">
            • <strong>급여 계산:</strong> 등록된 직원 정보를 바탕으로 자동 급여 계산이 가능합니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

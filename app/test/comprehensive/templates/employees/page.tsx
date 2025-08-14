'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  AlertCircle,
  X,
  Save,
  RotateCcw,
  Phone,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useScheduleTemplates } from '@/lib/hooks/useScheduleTemplates'
import { Employee } from '@/lib/types/schedule'

// 직원 폼 데이터 인터페이스
interface EmployeeFormData {
  name: string
  position: string
  hourly_wage: number
  phone: string
  start_date: string
}

export default function EmployeesPage() {
  const { user } = useAuth()
  const {
    stores,
    employees,
    currentStore,
    loading,
    error,
    loadStores,
    loadEmployees,
    setCurrentStore,
    addEmployee,
    editEmployee,
    toggleEmployee,
    clearError
  } = useScheduleTemplates()

  // 로컬 상태
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    position: '',
    hourly_wage: 10030, // 2025년 최저시급
    phone: '',
    start_date: new Date().toISOString().split('T')[0]
  })

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores(user.id)
    }
  }, [user, loadStores])

  // 현재 스토어가 변경되면 직원 목록 로드
  useEffect(() => {
    if (currentStore) {
      loadEmployees(currentStore.id)
    }
  }, [currentStore, loadEmployees])

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      hourly_wage: 10030,
      phone: '',
      start_date: new Date().toISOString().split('T')[0]
    })
    setEditingEmployee(null)
    setShowCreateForm(false)
  }

  // 직원 생성/수정 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStore) return

    try {
      if (editingEmployee) {
        // 수정 로직
        await editEmployee(editingEmployee.id, formData)
      } else {
        // 생성 로직
        const employeeData = {
          ...formData,
          store_id: currentStore.id,
          is_active: true
        }
        await addEmployee(employeeData)
      }
      
      resetForm()
    } catch (err) {
      console.error('직원 저장 오류:', err)
    }
  }

  // 직원 편집 시작
  const startEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      position: employee.position || '',
      hourly_wage: employee.hourly_wage,
      phone: employee.phone || '',
      start_date: employee.start_date || new Date().toISOString().split('T')[0]
    })
    setShowCreateForm(true)
  }

  // 직원 활성/비활성 토글
  const toggleEmployeeStatus = async (employeeId: number, isActive: boolean) => {
    try {
      await toggleEmployee(employeeId, isActive)
    } catch (err) {
      console.error('직원 상태 변경 오류:', err)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600">직원을 관리하려면 먼저 로그인해주세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">직원 관리</h1>
          <p className="text-gray-600">스토어의 직원을 추가하고 관리하세요</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/test/comprehensive/templates'}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>템플릿 관리</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/test/comprehensive/templates/breaks'}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>브레이크 시간</span>
          </Button>
          {currentStore && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>직원 추가</span>
            </Button>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 스토어 선택 */}
      {stores.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="store-select">스토어 선택:</Label>
              <Select 
                value={currentStore?.id.toString() || ''} 
                onValueChange={(value) => {
                  const store = stores.find(s => s.id === parseInt(value))
                  setCurrentStore(store || null)
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
          </CardContent>
        </Card>
      )}

      {/* 직원 생성/편집 폼 */}
      {showCreateForm && currentStore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingEmployee ? '직원 정보 수정' : '새 직원 추가'}</span>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 이름 */}
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="직원 이름"
                    required
                    maxLength={50}
                  />
                </div>

                {/* 직책 */}
                <div>
                  <Label htmlFor="position">직책</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="예: 매니저, 아르바이트생"
                    maxLength={50}
                  />
                </div>

                {/* 시급 */}
                <div>
                  <Label htmlFor="hourly_wage">시급 (원) *</Label>
                  <Input
                    id="hourly_wage"
                    type="number"
                    value={formData.hourly_wage}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_wage: parseInt(e.target.value) || 0 }))}
                    placeholder="10030"
                    required
                    min={0}
                  />
                  <p className="text-sm text-gray-500 mt-1">2025년 최저시급: 10,030원</p>
                </div>

                {/* 전화번호 */}
                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-1234-5678"
                    maxLength={20}
                  />
                </div>

                {/* 입사일 */}
                <div className="md:col-span-2">
                  <Label htmlFor="start_date">입사일</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingEmployee ? '수정' : '추가'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 직원 목록 */}
      {currentStore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>직원 목록</span>
              <Badge variant="secondary">{employees.length}명</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8 text-gray-500">
                로딩 중...
              </div>
            )}

            {!loading && employees.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  직원이 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  첫 번째 직원을 추가해보세요
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  직원 추가
                </Button>
              </div>
            )}

            {!loading && employees.length > 0 && (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="border-gray-200">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="font-medium text-lg">{employee.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                {employee.position && (
                                  <span className="flex items-center">
                                    <Badge variant="outline" className="mr-1">
                                      {employee.position}
                                    </Badge>
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  시급 {employee.hourly_wage.toLocaleString()}원
                                </span>
                                {employee.phone && (
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {employee.phone}
                                  </span>
                                )}
                                {employee.start_date && (
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    입사일: {new Date(employee.start_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={employee.is_active ? "default" : "secondary"}>
                            {employee.is_active ? '활성' : '비활성'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEmployeeStatus(employee.id, !employee.is_active)}
                          >
                            {employee.is_active ? '비활성화' : '활성화'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

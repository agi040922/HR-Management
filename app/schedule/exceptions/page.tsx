'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Store,
  Users,
  Clock
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface StoreData {
  id: number
  owner_id: string
  open_time: string
  close_time: string
}

interface EmployeeData {
  id: number
  store_id?: number
  name: string
  is_active: boolean
}

interface ExceptionData {
  id: number
  store_id?: number
  employee_id?: number
  date: string
  exception_type: 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL'
  start_time?: string
  end_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface ExceptionFormData {
  store_id: number | null
  employee_id: number | null
  date: string
  exception_type: 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL'
  start_time: string
  end_time: string
  notes: string
}

export default function ExceptionsPage() {
  const { user, loading } = useAuth()
  const [stores, setStores] = useState<StoreData[]>([])
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [exceptions, setExceptions] = useState<ExceptionData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingException, setEditingException] = useState<ExceptionData | null>(null)
  const [activeTab, setActiveTab] = useState('this-week')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<ExceptionFormData>({
    store_id: null,
    employee_id: null,
    date: new Date().toISOString().split('T')[0],
    exception_type: 'CANCEL',
    start_time: '09:00',
    end_time: '18:00',
    notes: ''
  })

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores()
    }
  }, [user])

  // 선택된 스토어가 변경될 때 직원과 예외사항 로드
  useEffect(() => {
    if (selectedStore) {
      loadEmployees(selectedStore.id)
      loadExceptions(selectedStore.id)
      setFormData(prev => ({ ...prev, store_id: selectedStore.id }))
    }
  }, [selectedStore])

  // 스토어 목록 로드
  const loadStores = async () => {
    if (!user) return;
    
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', user.id);
      
      if (error) throw error;
      setStores(data || []);
      
      if (data && data.length > 0 && !selectedStore) {
        setSelectedStore(data[0]);
      }
    } catch (err) {
      console.error('스토어 목록 로드 오류:', err);
      toast.error('스토어 목록을 불러오는데 실패했습니다');
    } finally {
      setLoadingData(false);
    }
  };

  // 직원 목록 로드 (선택된 스토어 기준)
  const loadEmployees = async (storeId: number) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true);
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('직원 목록 로드 오류:', err);
      toast.error('직원 목록을 불러오는데 실패했습니다');
    }
  };

  // 예외사항 목록 로드 (선택된 스토어 기준)
  const loadExceptions = async (storeId: number) => {
    try {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .select('*')
        .eq('store_id', storeId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setExceptions(data || []);
    } catch (err) {
      console.error('예외사항 로드 오류:', err);
      toast.error('예외사항을 불러오는데 실패했습니다');
    }
  };

  // 예외사항 생성
  const handleCreateException = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.store_id) return

    try {
      setSubmitting(true)
      
      const insertData = {
        ...formData,
        start_time: formData.exception_type !== 'CANCEL' ? formData.start_time : null,
        end_time: formData.exception_type !== 'CANCEL' ? formData.end_time : null
      }

      const { data, error } = await supabase
        .from('schedule_exceptions')
        .insert([insertData])
        .select()

      if (error) {
        console.error('예외사항 생성 오류:', error)
        toast.error('예외사항 등록에 실패했습니다')
      } else {
        toast.success('예외사항이 성공적으로 등록되었습니다')
        setShowCreateForm(false)
        resetForm()
        if (selectedStore) loadExceptions(selectedStore.id)
      }
    } catch (error) {
      console.error('예외사항 생성 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  // 예외사항 수정
  const handleUpdateException = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingException) return

    try {
      setSubmitting(true)
      
      const updateData = {
        ...formData,
        start_time: formData.exception_type !== 'CANCEL' ? formData.start_time : null,
        end_time: formData.exception_type !== 'CANCEL' ? formData.end_time : null
      }

      const { error } = await supabase
        .from('schedule_exceptions')
        .update(updateData)
        .eq('id', editingException.id)

      if (error) {
        console.error('예외사항 수정 오류:', error)
        toast.error('예외사항 수정에 실패했습니다')
      } else {
        toast.success('예외사항이 성공적으로 수정되었습니다')
        setEditingException(null)
        resetForm()
        if (selectedStore) loadExceptions(selectedStore.id)
      }
    } catch (error) {
      console.error('예외사항 수정 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  // 예외사항 삭제
  const handleDeleteException = async (exceptionId: number) => {
    try {
      const { error } = await supabase
        .from('schedule_exceptions')
        .delete()
        .eq('id', exceptionId)

      if (error) {
        console.error('예외사항 삭제 오류:', error)
        toast.error('예외사항 삭제에 실패했습니다')
      } else {
        toast.success('예외사항이 성공적으로 삭제되었습니다')
        if (selectedStore) loadExceptions(selectedStore.id)
      }
    } catch (error) {
      console.error('예외사항 삭제 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    }
  }

  // 수정 시작
  const startEdit = (exception: ExceptionData) => {
    setEditingException(exception)
    setFormData({
      store_id: exception.store_id || null,
      employee_id: exception.employee_id || null,
      date: exception.date,
      exception_type: exception.exception_type,
      start_time: exception.start_time || '09:00',
      end_time: exception.end_time || '18:00',
      notes: exception.notes || ''
    })
    setShowCreateForm(false)
  }

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      store_id: selectedStore?.id || null,
      employee_id: null,
      date: new Date().toISOString().split('T')[0],
      exception_type: 'CANCEL',
      start_time: '09:00',
      end_time: '18:00',
      notes: ''
    })
  }

  // 편집 취소
  const cancelEdit = () => {
    setEditingException(null)
    setShowCreateForm(false)
    resetForm()
  }

  // 이번주 예외사항 필터링
  const getThisWeekExceptions = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return exceptions.filter(exception => {
      const exceptionDate = new Date(exception.date)
      return exceptionDate >= startOfWeek && exceptionDate <= endOfWeek
    })
  }

  // 예외사항 타입 라벨
  const getExceptionTypeLabel = (type: string) => {
    switch (type) {
      case 'CANCEL': return '휴무'
      case 'OVERRIDE': return '변경'
      case 'ADDITIONAL': return '추가'
      default: return type
    }
  }

  // 예외사항 타입 배지 변형
  const getExceptionTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'CANCEL': return 'destructive'
      case 'OVERRIDE': return 'default'
      case 'ADDITIONAL': return 'secondary'
      default: return 'default'
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">예외사항 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const thisWeekExceptions = getThisWeekExceptions()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="h-8 w-8 mr-3 text-orange-500" />
                예외사항 관리
              </h1>
              <p className="text-gray-600 mt-2">
                스토어별 근무 예외사항을 등록하고 관리하세요.
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
              disabled={!selectedStore}
            >
              <Plus className="h-4 w-4" />
              예외사항 추가
            </Button>
          </div>
        </div>

        {/* 스토어 선택 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Store className="h-5 w-5 mr-2" />
              스토어 선택
            </h2>
          </div>
          {stores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedStore?.id === store.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">스토어 #{store.id}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    운영시간: {store.open_time} - {store.close_time}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStore && (
          <>
            {/* 예외사항 생성/수정 폼 */}
            {(showCreateForm || editingException) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {editingException ? '예외사항 수정' : '새 예외사항 등록'}
                  </h2>
                </div>
                <form onSubmit={editingException ? handleUpdateException : handleCreateException} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="date">날짜 *</Label>
                      <Input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="exception_type">예외사항 유형 *</Label>
                      <Select 
                        value={formData.exception_type} 
                        onValueChange={(value) => setFormData({...formData, exception_type: value as 'CANCEL' | 'OVERRIDE' | 'ADDITIONAL'})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="예외사항 유형을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CANCEL">휴무 (CANCEL)</SelectItem>
                          <SelectItem value="OVERRIDE">시간 변경 (OVERRIDE)</SelectItem>
                          <SelectItem value="ADDITIONAL">추가 근무 (ADDITIONAL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employee_id">직원 (선택사항)</Label>
                      <Select 
                        value={formData.employee_id?.toString() || 'all'} 
                        onValueChange={(value) => setFormData({...formData, employee_id: value === 'all' ? null : parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="직원을 선택하세요 (전체 적용시 선택 안함)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체 직원</SelectItem>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.exception_type !== 'CANCEL' && (
                      <>
                        <div>
                          <Label htmlFor="start_time">시작 시간</Label>
                          <Input
                            type="time"
                            id="start_time"
                            value={formData.start_time}
                            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_time">종료 시간</Label>
                          <Input
                            type="time"
                            id="end_time"
                            value={formData.end_time}
                            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="notes">메모</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="추가 메모사항을 입력하세요"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? '처리 중...' : (editingException ? '수정하기' : '등록하기')}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      취소
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* 예외사항 목록 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  예외사항 목록
                </h2>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="this-week">이번주 예외사항</TabsTrigger>
                  <TabsTrigger value="all">전체 예외사항</TabsTrigger>
                </TabsList>

                <TabsContent value="this-week" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">이번주 예외사항 ({thisWeekExceptions.length}건)</h3>
                  </div>
                  
                  {thisWeekExceptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {thisWeekExceptions.map((exception) => {
                        const employee = employees.find(emp => emp.id === exception.employee_id)
                        return (
                          <Card key={exception.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-5 w-5" />
                                  <span>{new Date(exception.date).toLocaleDateString('ko-KR')}</span>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(exception)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
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
                            <CardContent className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant={getExceptionTypeBadgeVariant(exception.exception_type)}>
                                  {getExceptionTypeLabel(exception.exception_type)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {employee ? employee.name : '전체 직원'}
                                </span>
                              </div>

                              {exception.exception_type !== 'CANCEL' && exception.start_time && exception.end_time && (
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">
                                    {exception.start_time} - {exception.end_time}
                                  </span>
                                </div>
                              )}

                              {exception.notes && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {exception.notes}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">이번주 예외사항이 없습니다.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">전체 예외사항 ({exceptions.length}건)</h3>
                  </div>
                  
                  {exceptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {exceptions.map((exception) => {
                        const employee = employees.find(emp => emp.id === exception.employee_id)
                        return (
                          <Card key={exception.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-5 w-5" />
                                  <span>{new Date(exception.date).toLocaleDateString('ko-KR')}</span>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(exception)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
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
                            <CardContent className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant={getExceptionTypeBadgeVariant(exception.exception_type)}>
                                  {getExceptionTypeLabel(exception.exception_type)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {employee ? employee.name : '전체 직원'}
                                </span>
                              </div>

                              {exception.exception_type !== 'CANCEL' && exception.start_time && exception.end_time && (
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">
                                    {exception.start_time} - {exception.end_time}
                                  </span>
                                </div>
                              )}

                              {exception.notes && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {exception.notes}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 예외사항이 없습니다.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

        {/* 사용법 안내 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              사용법 안내
            </h2>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              • <strong>휴무 (CANCEL):</strong> 해당 날짜에 근무하지 않는 경우
            </p>
            <p className="text-sm text-gray-600">
              • <strong>시간 변경 (OVERRIDE):</strong> 기본 근무시간과 다르게 근무하는 경우
            </p>
            <p className="text-sm text-gray-600">
              • <strong>추가 근무 (ADDITIONAL):</strong> 평소보다 추가로 근무하는 경우
            </p>
            <p className="text-sm text-gray-600">
              • <strong>직원 선택:</strong> 특정 직원만 해당하는 경우 선택, 전체 적용시 선택하지 않음
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

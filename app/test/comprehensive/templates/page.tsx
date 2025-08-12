'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Store,
  Users,
  Copy,
  Play
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'


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

interface WeeklyTemplateData {
  id: number
  store_id?: number
  template_name: string
  monday_start?: string
  monday_end?: string
  tuesday_start?: string
  tuesday_end?: string
  wednesday_start?: string
  wednesday_end?: string
  thursday_start?: string
  thursday_end?: string
  friday_start?: string
  friday_end?: string
  saturday_start?: string
  saturday_end?: string
  sunday_start?: string
  sunday_end?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TemplateFormData {
  store_id: number | null
  template_name: string
  monday_start: string
  monday_end: string
  tuesday_start: string
  tuesday_end: string
  wednesday_start: string
  wednesday_end: string
  thursday_start: string
  thursday_end: string
  friday_start: string
  friday_end: string
  saturday_start: string
  saturday_end: string
  sunday_start: string
  sunday_end: string
  is_active: boolean
}

const DAYS = [
  { key: 'monday', label: '월요일' },
  { key: 'tuesday', label: '화요일' },
  { key: 'wednesday', label: '수요일' },
  { key: 'thursday', label: '목요일' },
  { key: 'friday', label: '금요일' },
  { key: 'saturday', label: '토요일' },
  { key: 'sunday', label: '일요일' }
]

export default function TemplatesPage() {
  const { user, loading } = useAuth()
  const [stores, setStores] = useState<StoreData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [templates, setTemplates] = useState<WeeklyTemplateData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WeeklyTemplateData | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>({
    store_id: null,
    template_name: '',
    monday_start: '09:00',
    monday_end: '18:00',
    tuesday_start: '09:00',
    tuesday_end: '18:00',
    wednesday_start: '09:00',
    wednesday_end: '18:00',
    thursday_start: '09:00',
    thursday_end: '18:00',
    friday_start: '09:00',
    friday_end: '18:00',
    saturday_start: '09:00',
    saturday_end: '18:00',
    sunday_start: '',
    sunday_end: '',
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
        alert('스토어 데이터를 불러오는데 실패했습니다')
      } else {
        setStores(storesData || [])
      }

      // 직원 데이터 로드
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (employeesError) {
        console.error('직원 로드 오류:', employeesError)
        alert('직원 데이터를 불러오는데 실패했습니다')
      } else {
        setEmployees(employeesData || [])
      }

      // 템플릿 데이터 로드
      const { data: templatesData, error: templatesError } = await supabase
        .from('weekly_schedule_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (templatesError) {
        console.error('템플릿 로드 오류:', templatesError)
        alert('템플릿 데이터를 불러오는데 실패했습니다')
      } else {
        setTemplates(templatesData || [])
      }

    } catch (error) {
      console.error('데이터 로드 중 예외:', error)
      alert('예상치 못한 오류가 발생했습니다')
    } finally {
      setLoadingData(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.store_id) return

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('weekly_schedule_templates')
        .insert([formData])
        .select()

      if (error) {
        console.error('템플릿 생성 오류:', error)
        alert('템플릿 생성에 실패했습니다')
      } else {
        alert('템플릿이 성공적으로 생성되었습니다')
        setShowCreateForm(false)
        resetForm()
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('템플릿 생성 중 예외:', error)
      alert('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('weekly_schedule_templates')
        .update(formData)
        .eq('id', editingTemplate.id)

      if (error) {
        console.error('템플릿 수정 오류:', error)
        alert('템플릿 수정에 실패했습니다')
      } else {
        alert('템플릿이 성공적으로 수정되었습니다')
        setEditingTemplate(null)
        resetForm()
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('템플릿 수정 중 예외:', error)
      alert('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('weekly_schedule_templates')
        .delete()
        .eq('id', templateId)

      if (error) {
        console.error('템플릿 삭제 오류:', error)
        alert('템플릿 삭제에 실패했습니다')
      } else {
        alert('템플릿이 성공적으로 삭제되었습니다')
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('템플릿 삭제 중 예외:', error)
      alert('예상치 못한 오류가 발생했습니다')
    }
  }

  const toggleTemplateStatus = async (template: WeeklyTemplateData) => {
    try {
      const { error } = await supabase
        .from('weekly_schedule_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id)

      if (error) {
        console.error('템플릿 상태 변경 오류:', error)
        alert('템플릿 상태 변경에 실패했습니다')
      } else {
        alert(`템플릿이 ${!template.is_active ? '활성화' : '비활성화'}되었습니다`)
        loadData() // 목록 새로고침
      }
    } catch (error) {
      console.error('템플릿 상태 변경 중 예외:', error)
      alert('예상치 못한 오류가 발생했습니다')
    }
  }

  const duplicateTemplate = (template: WeeklyTemplateData) => {
    setFormData({
      store_id: template.store_id || null,
      template_name: `${template.template_name} (복사본)`,
      monday_start: template.monday_start || '09:00',
      monday_end: template.monday_end || '18:00',
      tuesday_start: template.tuesday_start || '09:00',
      tuesday_end: template.tuesday_end || '18:00',
      wednesday_start: template.wednesday_start || '09:00',
      wednesday_end: template.wednesday_end || '18:00',
      thursday_start: template.thursday_start || '09:00',
      thursday_end: template.thursday_end || '18:00',
      friday_start: template.friday_start || '09:00',
      friday_end: template.friday_end || '18:00',
      saturday_start: template.saturday_start || '09:00',
      saturday_end: template.saturday_end || '18:00',
      sunday_start: template.sunday_start || '',
      sunday_end: template.sunday_end || '',
      is_active: true
    })
    setShowCreateForm(true)
    setEditingTemplate(null)
  }

  const startEdit = (template: WeeklyTemplateData) => {
    setEditingTemplate(template)
    setFormData({
      store_id: template.store_id || null,
      template_name: template.template_name,
      monday_start: template.monday_start || '09:00',
      monday_end: template.monday_end || '18:00',
      tuesday_start: template.tuesday_start || '09:00',
      tuesday_end: template.tuesday_end || '18:00',
      wednesday_start: template.wednesday_start || '09:00',
      wednesday_end: template.wednesday_end || '18:00',
      thursday_start: template.thursday_start || '09:00',
      thursday_end: template.thursday_end || '18:00',
      friday_start: template.friday_start || '09:00',
      friday_end: template.friday_end || '18:00',
      saturday_start: template.saturday_start || '09:00',
      saturday_end: template.saturday_end || '18:00',
      sunday_start: template.sunday_start || '',
      sunday_end: template.sunday_end || '',
      is_active: template.is_active
    })
    setShowCreateForm(false)
  }

  const resetForm = () => {
    setFormData({
      store_id: null,
      template_name: '',
      monday_start: '09:00',
      monday_end: '18:00',
      tuesday_start: '09:00',
      tuesday_end: '18:00',
      wednesday_start: '09:00',
      wednesday_end: '18:00',
      thursday_start: '09:00',
      thursday_end: '18:00',
      friday_start: '09:00',
      friday_end: '18:00',
      saturday_start: '09:00',
      saturday_end: '18:00',
      sunday_start: '',
      sunday_end: '',
      is_active: true
    })
  }

  const cancelEdit = () => {
    setEditingTemplate(null)
    setShowCreateForm(false)
    resetForm()
  }

  const getStoreById = (storeId?: number) => {
    return stores.find(store => store.id === storeId)
  }

  const setAllDaysTime = (startTime: string, endTime: string) => {
    setFormData({
      ...formData,
      monday_start: startTime,
      monday_end: endTime,
      tuesday_start: startTime,
      tuesday_end: endTime,
      wednesday_start: startTime,
      wednesday_end: endTime,
      thursday_start: startTime,
      thursday_end: endTime,
      friday_start: startTime,
      friday_end: endTime,
      saturday_start: startTime,
      saturday_end: endTime
    })
  }

  const filteredTemplates = selectedStore === 'all' 
    ? templates 
    : templates.filter(template => template.store_id === selectedStore)

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">템플릿 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주간 템플릿 관리</h1>
          <p className="text-gray-600">반복되는 주간 스케줄을 템플릿으로 관리하세요</p>
        </div>
        <Button 
          onClick={() => {
            setShowCreateForm(true)
            setEditingTemplate(null)
          }}
          className="flex items-center space-x-2"
          disabled={stores.length === 0}
        >
          <Plus className="h-4 w-4" />
          <span>새 템플릿 생성</span>
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
              주간 템플릿을 생성하려면 먼저 스토어가 필요합니다
            </p>
            <Button asChild>
              <a href="/test/comprehensive/stores">스토어 관리로 이동</a>
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

          {/* 템플릿 생성/수정 폼 */}
          {(showCreateForm || editingTemplate) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{editingTemplate ? '템플릿 수정' : '새 템플릿 생성'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="store_id">스토어 *</Label>
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
                      <Label htmlFor="template_name">템플릿 이름 *</Label>
                      <Input
                        id="template_name"
                        value={formData.template_name}
                        onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                        placeholder="예: 주중 기본 스케줄"
                        required
                      />
                    </div>
                  </div>

                  {/* 일괄 설정 */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">일괄 시간 설정</h4>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAllDaysTime('09:00', '18:00')}
                      >
                        09:00-18:00
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAllDaysTime('10:00', '19:00')}
                      >
                        10:00-19:00
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAllDaysTime('11:00', '20:00')}
                      >
                        11:00-20:00
                      </Button>
                    </div>
                  </div>

                  {/* 요일별 시간 설정 */}
                  <div className="space-y-4">
                    <h4 className="font-medium">요일별 근무시간</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {DAYS.map((day) => (
                        <div key={day.key} className="flex items-center space-x-4">
                          <div className="w-16 text-sm font-medium">{day.label}</div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={formData[`${day.key}_start` as keyof TemplateFormData] as string}
                              onChange={(e) => setFormData({
                                ...formData,
                                [`${day.key}_start`]: e.target.value
                              })}
                              className="w-32"
                            />
                            <span className="text-gray-500">-</span>
                            <Input
                              type="time"
                              value={formData[`${day.key}_end` as keyof TemplateFormData] as string}
                              onChange={(e) => setFormData({
                                ...formData,
                                [`${day.key}_end`]: e.target.value
                              })}
                              className="w-32"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData({
                                ...formData,
                                [`${day.key}_start`]: '',
                                [`${day.key}_end`]: ''
                              })}
                            >
                              휴무
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      {submitting ? '처리 중...' : (editingTemplate ? '수정하기' : '생성하기')}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 템플릿 목록 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => {
                const store = getStoreById(template.store_id)
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span>{template.template_name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateTemplate(template)}
                            title="복사"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(template)}
                            title="수정"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Store className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {store ? `스토어 #${store.id}` : '스토어 미지정'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {DAYS.map((day) => {
                          const startTime = template[`${day.key}_start` as keyof WeeklyTemplateData] as string
                          const endTime = template[`${day.key}_end` as keyof WeeklyTemplateData] as string
                          
                          return (
                            <div key={day.key} className="flex justify-between text-sm">
                              <span className="font-medium">{day.label}</span>
                              <span className={startTime && endTime ? 'text-gray-900' : 'text-gray-400'}>
                                {startTime && endTime ? `${startTime} - ${endTime}` : '휴무'}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? '활성' : '비활성'}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTemplateStatus(template)}
                          >
                            {template.is_active ? '비활성화' : '활성화'}
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        생성일: {new Date(template.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedStore === 'all' ? '등록된 템플릿이 없습니다' : '해당 스토어에 등록된 템플릿이 없습니다'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      첫 번째 주간 템플릿을 생성하여 스케줄 관리를 시작하세요
                    </p>
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>첫 템플릿 생성하기</span>
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
          <CardTitle>주간 템플릿 도움말</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            • <strong>템플릿 이름:</strong> 구분하기 쉬운 이름을 설정하세요 (예: 주중 기본, 주말 특별)
          </p>
          <p className="text-sm text-gray-600">
            • <strong>일괄 설정:</strong> 모든 요일에 동일한 시간을 적용할 때 사용하세요
          </p>
          <p className="text-sm text-gray-600">
            • <strong>휴무 설정:</strong> 특정 요일을 휴무로 설정하려면 '휴무' 버튼을 클릭하세요
          </p>
          <p className="text-sm text-gray-600">
            • <strong>템플릿 복사:</strong> 기존 템플릿을 복사하여 유사한 스케줄을 빠르게 생성할 수 있습니다
          </p>
          <p className="text-sm text-gray-600">
            • <strong>활성/비활성:</strong> 사용하지 않는 템플릿은 비활성화하여 관리하세요
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

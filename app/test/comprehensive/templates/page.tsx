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
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Store,
  Users,
  Copy,
  Play,
  Settings,
  X,
  AlertCircle,
  Save,
  RotateCcw,
  Coffee,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useScheduleTemplates } from '@/lib/hooks/useScheduleTemplates'
import { 
  WeeklyTemplateData, 
  DayOfWeek, 
  DAY_NAMES, 
  DAY_ORDER, 
  WeekScheduleData, 
  DaySchedule, 
  BreakPeriod 
} from '@/lib/types/schedule'
import { 
  createDefaultWeekSchedule,
  generateTimeSlots,
  updateDayOperatingHours,
  updateDayBreakPeriods,
  addEmployeeToTimeSlot,
  removeEmployeeFromTimeSlot
} from '@/lib/utils/schedule-utils'

// 폼 데이터 인터페이스
interface TemplateFormData {
  template_name: string
  schedule_data: WeekScheduleData
}

export default function ScheduleTemplatesPage() {
  const { user } = useAuth()
  const {
    templates,
    stores,
    employees,
    currentStore,
    loading,
    error,
    loadTemplates,
    loadStores,
    loadEmployees,
    setCurrentStore,
    createTemplate,
    updateTemplate,
    toggleTemplateStatus,
    removeTemplate,
    createDefaultTemplate,
    clearError
  } = useScheduleTemplates()

  // 로컬 상태
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WeeklyTemplateData | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>({
    template_name: '',
    schedule_data: createDefaultWeekSchedule()
  })
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday')

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores(user.id)
    }
  }, [user, loadStores])

  // 현재 스토어가 변경되면 템플릿과 직원 목록 로드
  useEffect(() => {
    if (currentStore) {
      loadTemplates(currentStore.id)
      loadEmployees(currentStore.id)
    }
  }, [currentStore, loadTemplates, loadEmployees])

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      template_name: '',
      schedule_data: createDefaultWeekSchedule()
    })
    setEditingTemplate(null)
    setShowCreateForm(false)
    setSelectedDay('monday')
  }

  // 템플릿 생성/수정 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStore) return

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData.template_name, formData.schedule_data)
      } else {
        await createTemplate(currentStore.id, formData.template_name, formData.schedule_data)
      }
      resetForm()
    } catch (err) {
      console.error('템플릿 저장 오류:', err)
    }
  }

  // 템플릿 편집 시작
  const startEdit = (template: WeeklyTemplateData) => {
    setEditingTemplate(template)
    setFormData({
      template_name: template.template_name,
      schedule_data: template.schedule_data
    })
    setShowCreateForm(true)
  }

  // 템플릿 복사
  const duplicateTemplate = (template: WeeklyTemplateData) => {
    setFormData({
      template_name: `${template.template_name} (복사본)`,
      schedule_data: template.schedule_data
    })
    setEditingTemplate(null)
    setShowCreateForm(true)
  }

  // 요일 스케줄 업데이트
  const updateDaySchedule = (day: DayOfWeek, updates: Partial<DaySchedule>) => {
    setFormData(prev => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        [day]: {
          ...prev.schedule_data[day],
          ...updates
        }
      }
    }))
  }

  // 영업시간 변경
  const handleOperatingHoursChange = (day: DayOfWeek, openTime: string | null, closeTime: string | null) => {
    const slotMinutes = currentStore?.time_slot_minutes || 30
    const newScheduleData = updateDayOperatingHours(
      formData.schedule_data,
      day,
      openTime,
      closeTime,
      slotMinutes
    )
    setFormData(prev => ({ ...prev, schedule_data: newScheduleData }))
  }

  // 브레이크 시간 변경
  const handleBreakPeriodsChange = (day: DayOfWeek, breakPeriods: BreakPeriod[]) => {
    const newScheduleData = updateDayBreakPeriods(formData.schedule_data, day, breakPeriods)
    setFormData(prev => ({ ...prev, schedule_data: newScheduleData }))
  }

  // 시간 슬롯에 직원 추가/제거
  const toggleEmployeeInSlot = (day: DayOfWeek, timeSlot: string, employeeId: number) => {
    const currentEmployees = formData.schedule_data[day].time_slots[timeSlot] || []
    let newScheduleData: WeekScheduleData

    if (currentEmployees.includes(employeeId)) {
      newScheduleData = removeEmployeeFromTimeSlot(formData.schedule_data, day, timeSlot, employeeId)
    } else {
      const slotMinutes = currentStore?.time_slot_minutes || 30
      newScheduleData = addEmployeeToTimeSlot(formData.schedule_data, day, timeSlot, employeeId, slotMinutes)
    }

    setFormData(prev => ({ ...prev, schedule_data: newScheduleData }))
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600">스케줄 템플릿을 관리하려면 먼저 로그인해주세요.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">주간 스케줄 템플릿 관리</h1>
          <p className="text-gray-600">반복되는 주간 스케줄을 템플릿으로 관리하세요</p>
        </div>
        <div className="flex space-x-2">
          {currentStore && (
            <>
              <Link
                href="/test/comprehensive/templates/employees"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Users size={20} />
                직원 관리
              </Link>
              <Link
                href="/test/comprehensive/templates/breaks"
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                <Coffee size={20} />
                브레이크 시간 설정
              </Link>
              <Link
                href="/test/comprehensive/templates/schedules"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Calendar size={20} />
                근무 스케줄 관리
              </Link>
              <Link
                href="/test/comprehensive/templates/schedule-view"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Eye size={20} />
                스케줄표 보기
              </Link>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>새 템플릿</span>
              </Button>
            </>
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

      {/* 스토어가 없는 경우 */}
      {stores.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              먼저 스토어를 생성해주세요
            </h3>
            <p className="text-gray-600 mb-4">
              스케줄 템플릿을 생성하려면 먼저 스토어가 필요합니다
            </p>
            <Button asChild>
              <a href="/test/comprehensive">메인 페이지로 이동</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 템플릿 생성/편집 폼 */}
      {showCreateForm && currentStore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingTemplate ? '템플릿 편집' : '새 템플릿 생성'}</span>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 템플릿 이름 */}
              <div>
                <Label htmlFor="template_name">템플릿 이름</Label>
                <Input
                  id="template_name"
                  value={formData.template_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
                  placeholder="예: 평일 기본 스케줄"
                  required
                />
              </div>

              {/* 요일 선택 탭 */}
              <div>
                <Label>요일별 설정</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DAY_ORDER.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDay === day ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(day)}
                    >
                      {DAY_NAMES[day]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 선택된 요일 설정 */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">{DAY_NAMES[selectedDay]} 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 영업 여부 */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${selectedDay}_is_open`}
                      checked={formData.schedule_data[selectedDay].is_open}
                      onChange={(e) => updateDaySchedule(selectedDay, { is_open: e.target.checked })}
                    />
                    <Label htmlFor={`${selectedDay}_is_open`}>영업일</Label>
                  </div>

                  {formData.schedule_data[selectedDay].is_open && (
                    <>
                      {/* 영업시간 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${selectedDay}_open`}>오픈 시간</Label>
                          <Input
                            id={`${selectedDay}_open`}
                            type="time"
                            value={formData.schedule_data[selectedDay].open_time || '09:00'}
                            onChange={(e) => handleOperatingHoursChange(
                              selectedDay, 
                              e.target.value, 
                              formData.schedule_data[selectedDay].close_time
                            )}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${selectedDay}_close`}>마감 시간</Label>
                          <Input
                            id={`${selectedDay}_close`}
                            type="time"
                            value={formData.schedule_data[selectedDay].close_time || '18:00'}
                            onChange={(e) => handleOperatingHoursChange(
                              selectedDay, 
                              formData.schedule_data[selectedDay].open_time, 
                              e.target.value
                            )}
                          />
                        </div>
                      </div>

                      {/* 브레이크 시간 (간단한 버전) */}
                      <div>
                        <Label>브레이크 시간</Label>
                        <div className="text-sm text-gray-600 mt-1">
                          {formData.schedule_data[selectedDay].break_periods.length > 0 
                            ? formData.schedule_data[selectedDay].break_periods.map(bp => 
                                `${bp.name}: ${bp.start}-${bp.end}`
                              ).join(', ')
                            : '브레이크 시간 없음'
                          }
                        </div>
                      </div>

                      {/* 시간 슬롯별 직원 배치 (간단한 버전) */}
                      {formData.schedule_data[selectedDay].open_time && 
                       formData.schedule_data[selectedDay].close_time && (
                        <div>
                          <Label>시간대별 근무자 배치</Label>
                          <div className="mt-2 text-sm text-gray-600">
                            {currentStore.time_slot_minutes}분 단위로 시간 슬롯이 생성됩니다.
                            <br />
                            직원 배치 기능은 향후 추가될 예정입니다.
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 저장 버튼 */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? '수정' : '생성'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 템플릿 목록 */}
      {currentStore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>템플릿 목록</span>
              <Badge variant="secondary">{templates.length}개</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8 text-gray-500">
                로딩 중...
              </div>
            )}

            {!loading && templates.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  템플릿이 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  첫 번째 스케줄 템플릿을 생성해보세요
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  템플릿 생성
                </Button>
              </div>
            )}

            {!loading && templates.length > 0 && (
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border-gray-200">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{template.template_name}</h3>
                            <Badge variant={template.is_active ? "default" : "secondary"}>
                              {template.is_active ? '활성' : '비활성'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            생성일: {new Date(template.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateTemplate(template)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTemplateStatus(template.id, !template.is_active)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('정말 삭제하시겠습니까?')) {
                                removeTemplate(template.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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

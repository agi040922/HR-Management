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
  Clock,
  AlertCircle,
  X,
  Save,
  RotateCcw,
  Coffee,
  Utensils,
  Calendar,
  Users
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useScheduleTemplates } from '@/lib/hooks/useScheduleTemplates'
import { BreakPeriod, DayOfWeek, DAY_NAMES, DAY_ORDER } from '@/lib/types/schedule'

// 브레이크 시간 폼 데이터 인터페이스
interface BreakFormData {
  name: string
  start: string
  end: string
}

// 미리 정의된 브레이크 시간 템플릿
const BREAK_TEMPLATES: BreakPeriod[] = [
  { name: '점심시간', start: '12:00', end: '13:00' },
  { name: '저녁시간', start: '18:00', end: '19:00' },
  { name: '오후 휴게시간', start: '15:00', end: '15:30' },
  { name: '야간 휴게시간', start: '22:00', end: '22:30' },
  { name: '새벽 휴게시간', start: '03:00', end: '03:30' }
]

export default function BreakTimePage() {
  const { user } = useAuth()
  const {
    templates,
    stores,
    currentStore,
    loading,
    error,
    loadTemplates,
    loadStores,
    setCurrentStore,
    updateTemplate,
    clearError
  } = useScheduleTemplates()

  // 로컬 상태
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday')
  const [showAddBreakForm, setShowAddBreakForm] = useState(false)
  const [editingBreakIndex, setEditingBreakIndex] = useState<number | null>(null)
  const [breakFormData, setBreakFormData] = useState<BreakFormData>({
    name: '',
    start: '',
    end: ''
  })

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores(user.id)
    }
  }, [user, loadStores])

  // 현재 스토어가 변경되면 템플릿 목록 로드
  useEffect(() => {
    if (currentStore) {
      loadTemplates(currentStore.id)
    }
  }, [currentStore, loadTemplates])

  // 첫 번째 템플릿을 자동 선택
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0])
    }
  }, [templates, selectedTemplate])

  // 폼 초기화
  const resetBreakForm = () => {
    setBreakFormData({
      name: '',
      start: '',
      end: ''
    })
    setEditingBreakIndex(null)
    setShowAddBreakForm(false)
  }

  // 브레이크 시간 추가/수정 처리
  const handleBreakSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    try {
      const currentBreaks = selectedTemplate.schedule_data[selectedDay].break_periods || []
      let newBreaks: BreakPeriod[]

      if (editingBreakIndex !== null) {
        // 수정
        newBreaks = currentBreaks.map((breakPeriod: BreakPeriod, index: number) => 
          index === editingBreakIndex ? { ...breakFormData } : breakPeriod
        )
      } else {
        // 추가
        newBreaks = [...currentBreaks, { ...breakFormData }]
      }

      // 시간순으로 정렬
      newBreaks.sort((a, b) => a.start.localeCompare(b.start))

      const updatedScheduleData = {
        ...selectedTemplate.schedule_data,
        [selectedDay]: {
          ...selectedTemplate.schedule_data[selectedDay],
          break_periods: newBreaks
        }
      }

      await updateTemplate(selectedTemplate.id, selectedTemplate.template_name, updatedScheduleData)
      
      // 로컬 상태 업데이트
      setSelectedTemplate({
        ...selectedTemplate,
        schedule_data: updatedScheduleData
      })

      resetBreakForm()
    } catch (err) {
      console.error('브레이크 시간 저장 오류:', err)
    }
  }

  // 브레이크 시간 삭제
  const handleDeleteBreak = async (breakIndex: number) => {
    if (!selectedTemplate) return

    try {
      const currentBreaks = selectedTemplate.schedule_data[selectedDay].break_periods || []
      const newBreaks = currentBreaks.filter((_: any, index: number) => index !== breakIndex)

      const updatedScheduleData = {
        ...selectedTemplate.schedule_data,
        [selectedDay]: {
          ...selectedTemplate.schedule_data[selectedDay],
          break_periods: newBreaks
        }
      }

      await updateTemplate(selectedTemplate.id, selectedTemplate.template_name, updatedScheduleData)
      
      // 로컬 상태 업데이트
      setSelectedTemplate({
        ...selectedTemplate,
        schedule_data: updatedScheduleData
      })
    } catch (err) {
      console.error('브레이크 시간 삭제 오류:', err)
    }
  }

  // 브레이크 시간 편집 시작
  const startEditBreak = (breakPeriod: BreakPeriod, index: number) => {
    setBreakFormData({
      name: breakPeriod.name,
      start: breakPeriod.start,
      end: breakPeriod.end
    })
    setEditingBreakIndex(index)
    setShowAddBreakForm(true)
  }

  // 템플릿 브레이크 시간 적용
  const applyBreakTemplate = (template: BreakPeriod) => {
    setBreakFormData({
      name: template.name,
      start: template.start,
      end: template.end
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600">브레이크 시간을 관리하려면 먼저 로그인해주세요.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">브레이크 시간 관리</h1>
          <p className="text-gray-600">템플릿의 요일별 브레이크 시간을 설정하세요</p>
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
            onClick={() => window.location.href = '/test/comprehensive/templates/employees'}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>직원 관리</span>
          </Button>
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

      {/* 스토어 및 템플릿 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 스토어 선택 */}
        {stores.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="space-y-2">
                <Label htmlFor="store-select">스토어 선택:</Label>
                <Select 
                  value={currentStore?.id.toString() || ''} 
                  onValueChange={(value) => {
                    const store = stores.find(s => s.id === parseInt(value))
                    setCurrentStore(store || null)
                    setSelectedTemplate(null)
                  }}
                >
                  <SelectTrigger>
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

        {/* 템플릿 선택 */}
        {templates.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="space-y-2">
                <Label htmlFor="template-select">템플릿 선택:</Label>
                <Select 
                  value={selectedTemplate?.id.toString() || ''} 
                  onValueChange={(value) => {
                    const template = templates.find(t => t.id === parseInt(value))
                    setSelectedTemplate(template || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="템플릿을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 요일 선택 및 브레이크 시간 관리 */}
      {selectedTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 요일 선택 */}
          <Card>
            <CardHeader>
              <CardTitle>요일 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DAY_ORDER.map((day) => {
                  const daySchedule = selectedTemplate.schedule_data[day]
                  const breakCount = daySchedule.break_periods?.length || 0
                  
                  return (
                    <Button
                      key={day}
                      variant={selectedDay === day ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => setSelectedDay(day)}
                    >
                      <span>{DAY_NAMES[day]}</span>
                      <div className="flex items-center space-x-2">
                        {!daySchedule.is_open && (
                          <Badge variant="secondary" className="text-xs">휴무</Badge>
                        )}
                        {daySchedule.is_open && (
                          <Badge variant="outline" className="text-xs">
                            {breakCount}개
                          </Badge>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 브레이크 시간 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{DAY_NAMES[selectedDay]} 브레이크 시간</span>
                {selectedTemplate.schedule_data[selectedDay].is_open && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddBreakForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedTemplate.schedule_data[selectedDay].is_open ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>휴무일입니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTemplate.schedule_data[selectedDay].break_periods?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Coffee className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>브레이크 시간이 없습니다</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowAddBreakForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        추가하기
                      </Button>
                    </div>
                  ) : (
                    selectedTemplate.schedule_data[selectedDay].break_periods?.map((breakPeriod: BreakPeriod, index: number) => (
                      <Card key={index} className="border-gray-200">
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{breakPeriod.name}</h4>
                              <p className="text-sm text-gray-600">
                                {breakPeriod.start} - {breakPeriod.end}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditBreak(breakPeriod, index)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('정말 삭제하시겠습니까?')) {
                                    handleDeleteBreak(index)
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 브레이크 시간 추가/편집 폼 */}
          {showAddBreakForm && selectedTemplate.schedule_data[selectedDay].is_open && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingBreakIndex !== null ? '브레이크 시간 수정' : '브레이크 시간 추가'}</span>
                  <Button variant="ghost" size="sm" onClick={resetBreakForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBreakSubmit} className="space-y-4">
                  {/* 템플릿 선택 */}
                  {editingBreakIndex === null && (
                    <div>
                      <Label>빠른 설정</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {BREAK_TEMPLATES.map((template, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => applyBreakTemplate(template)}
                          >
                            <div className="flex items-center space-x-2">
                              {template.name.includes('점심') ? <Utensils className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                              <span>{template.name}</span>
                              <span className="text-xs text-gray-500">
                                ({template.start}-{template.end})
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 브레이크 이름 */}
                  <div>
                    <Label htmlFor="break_name">브레이크 이름 *</Label>
                    <Input
                      id="break_name"
                      value={breakFormData.name}
                      onChange={(e) => setBreakFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="예: 점심시간, 휴게시간"
                      required
                    />
                  </div>

                  {/* 시작 시간 */}
                  <div>
                    <Label htmlFor="break_start">시작 시간 *</Label>
                    <Input
                      id="break_start"
                      type="time"
                      value={breakFormData.start}
                      onChange={(e) => setBreakFormData(prev => ({ ...prev, start: e.target.value }))}
                      required
                    />
                  </div>

                  {/* 종료 시간 */}
                  <div>
                    <Label htmlFor="break_end">종료 시간 *</Label>
                    <Input
                      id="break_end"
                      type="time"
                      value={breakFormData.end}
                      onChange={(e) => setBreakFormData(prev => ({ ...prev, end: e.target.value }))}
                      required
                    />
                  </div>

                  {/* 저장 버튼 */}
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetBreakForm}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      취소
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingBreakIndex !== null ? '수정' : '추가'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 템플릿이 없는 경우 */}
      {currentStore && templates.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              템플릿이 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              먼저 스케줄 템플릿을 생성해주세요
            </p>
            <Button asChild>
              <a href="/test/comprehensive/templates">템플릿 관리로 이동</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

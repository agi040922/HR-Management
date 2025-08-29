'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Scroll } from 'lucide-react'
import { StoreData, EmployeeData, ScheduleTemplate } from '@/lib/api/(page)/employees/employees-api'

interface ExtendedEmployeeFormData {
  store_id: number | null
  owner_id: string
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
  selected_template_id?: number
}

interface EmployeeFormProps {
  formData: ExtendedEmployeeFormData
  setFormData: (data: ExtendedEmployeeFormData) => void
  stores: StoreData[]
  templates: ScheduleTemplate[]
  editingEmployee: EmployeeData | null
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function EmployeeForm({
  formData,
  setFormData,
  stores,
  templates,
  editingEmployee,
  submitting,
  onSubmit,
  onCancel
}: EmployeeFormProps) {
  return (
    <div className="bg-white rounded border shadow-sm p-6 mb-6" data-tutorial="employee-form">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {editingEmployee ? '직원 정보 수정' : '새 직원 등록'}
        </h2>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6">
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
              onChange={(e) => {
                const startTime = e.target.value
                let endTime = formData.work_end_time
                
                // 시작시간이 입력되면 +3시간으로 종료시간 자동 설정
                if (startTime) {
                  const [hours, minutes] = startTime.split(':').map(Number)
                  const endHours = (hours + 3) % 24
                  endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                }
                
                setFormData({...formData, work_start_time: startTime, work_end_time: endTime})
              }}
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
              min="1"
              max="7"
              value={formData.work_days_per_week}
              onChange={(e) => setFormData({...formData, work_days_per_week: parseInt(e.target.value) || 5})}
            />
            <p className="text-xs text-gray-500 mt-1">
              월요일부터 순서대로 자동 배치됩니다 (기본값: 5일)
            </p>
          </div>
          
          <div>
            <Label htmlFor="selected_template_id">스케줄 템플릿 (선택사항)</Label>
            <Select 
              value={formData.selected_template_id?.toString() || 'none'} 
              onValueChange={(value) => setFormData({...formData, selected_template_id: value === 'none' ? undefined : parseInt(value)})}
              disabled={!formData.store_id}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !formData.store_id 
                    ? "먼저 스토어를 선택하세요" 
                    : templates.length === 0 
                      ? "해당 스토어에 템플릿이 없습니다"
                      : "템플릿을 선택하세요 (선택사항)"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안함</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!formData.store_id && (
              <p className="text-xs text-gray-500 mt-1">
                스토어를 먼저 선택하면 해당 스토어의 템플릿 목록이 표시됩니다
              </p>
            )}
            {formData.store_id && templates.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">
                선택된 스토어에 스케줄 템플릿이 없습니다
              </p>
            )}
            {formData.selected_template_id && (
              <p className="text-xs text-blue-600 mt-1">
                선택된 템플릿에 직원이 자동으로 추가됩니다
              </p>
            )}
          </div>
        </div>
        
        
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200" data-tutorial="contract-info">
            <p className="text-sm text-blue-800 mb-2">
              📜 <strong>근로계약서와 함께 등록</strong>하고 싶으신가요?
            </p>
            <p className="text-xs text-blue-600 mb-3">
              근로계약서를 작성하면서 직원을 등록하면 법정 서류를 완비하고 스케줄도 자동 연동됩니다.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open('/test/labor-contract', '_blank')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Scroll className="h-4 w-4 mr-1" />
              근로계약서 작성하기
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? '처리 중...' : (editingEmployee ? '수정하기' : '간단 등록')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

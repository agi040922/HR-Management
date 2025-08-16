'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  Plus,
  Minus,
  Save,
  Settings,
  User
} from 'lucide-react';
import Link from 'next/link';

// 타입 정의
interface StoreSettings {
  id: number;
  store_name: string;
  time_slot_minutes: number;
  owner_id: string;
}

interface Employee {
  id: number;
  name: string;
  position?: string;
  store_id: number;
}

interface WeeklyTemplate {
  id: number;
  store_id: number;
  template_name: string;
  schedule_data: any;
  is_active: boolean;
}

export default function ScheduleViewPage() {
  const { user } = useAuth();
  
  // 상태 관리
  const [stores, setStores] = useState<StoreSettings[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreSettings | null>(null);
  const [templates, setTemplates] = useState<WeeklyTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WeeklyTemplate | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 스케줄 데이터 상태
  const [scheduleData, setScheduleData] = useState<any>({});
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

  // 직원 선택 모달 상태
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{day: string, time: string} | null>(null);

  // 스토어 목록 로드
  const loadStores = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
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
      setError('스토어 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 템플릿 목록 로드
  const loadTemplates = async (storeId: number) => {
    try {
      const { data, error } = await supabase
        .from('weekly_schedule_templates')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
      
      if (data && data.length > 0) {
        setSelectedTemplate(data[0]);
        setScheduleData(data[0].schedule_data || {});
      } else {
        // 기본 템플릿 생성
        await createDefaultTemplate(storeId);
      }
    } catch (err) {
      setError('템플릿을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  // 직원 목록 로드
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
      setError('직원 목록을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  // 기본 템플릿 생성
  const createDefaultTemplate = async (storeId: number) => {
    const defaultSchedule = {
      monday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], time_slots: {} },
      tuesday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], time_slots: {} },
      wednesday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], time_slots: {} },
      thursday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], time_slots: {} },
      friday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], time_slots: {} },
      saturday: { is_open: false, open_time: null, close_time: null, break_periods: [], time_slots: {} },
      sunday: { is_open: false, open_time: null, close_time: null, break_periods: [], time_slots: {} }
    };

    try {
      const { data, error } = await supabase
        .from('weekly_schedule_templates')
        .insert({
          store_id: storeId,
          template_name: '기본 템플릿',
          schedule_data: defaultSchedule,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setTemplates([data]);
      setSelectedTemplate(data);
      setScheduleData(data.schedule_data);
    } catch (err) {
      console.error('기본 템플릿 생성 실패:', err);
    }
  };

  // Time slots 생성
  const generateTimeSlots = (openTime: string, closeTime: string, slotMinutes: number) => {
    const slots: string[] = [];
    const start = new Date(`1970-01-01T${openTime}:00`);
    const end = new Date(`1970-01-01T${closeTime}:00`);
    
    let current = new Date(start);
    while (current < end) {
      const timeStr = current.toTimeString().slice(0, 5);
      slots.push(timeStr);
      current.setMinutes(current.getMinutes() + slotMinutes);
    }
    
    return slots;
  };

  // 직원 추가/제거 함수
  const addEmployeeToSlot = (day: string, timeSlot: string, employeeId: number) => {
    setScheduleData((prev: any) => {
      const newData = { ...prev };
      if (!newData[day]) {
        newData[day] = { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [], time_slots: {} };
      }
      if (!newData[day].time_slots) {
        newData[day].time_slots = {};
      }
      if (!newData[day].time_slots[timeSlot]) {
        newData[day].time_slots[timeSlot] = [];
      }
      
      if (!newData[day].time_slots[timeSlot].includes(employeeId)) {
        newData[day].time_slots[timeSlot].push(employeeId);
      }
      
      return newData;
    });
  };

  const removeEmployeeFromSlot = (day: string, timeSlot: string, employeeId: number) => {
    setScheduleData((prev: any) => {
      const newData = { ...prev };
      if (newData[day]?.time_slots?.[timeSlot]) {
        newData[day].time_slots[timeSlot] = newData[day].time_slots[timeSlot].filter(
          (id: number) => id !== employeeId
        );
        
        if (newData[day].time_slots[timeSlot].length === 0) {
          delete newData[day].time_slots[timeSlot];
        }
      }
      return newData;
    });
  };

  // 직원 선택 모달 열기
  const openEmployeeModal = (day: string, time: string) => {
    setCurrentSlot({ day, time });
    setShowEmployeeModal(true);
  };

  // 직원 선택 모달 닫기
  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setCurrentSlot(null);
  };

  // 직원 선택 처리
  const handleEmployeeSelect = (employeeId: number) => {
    if (currentSlot) {
      addEmployeeToSlot(currentSlot.day, currentSlot.time, employeeId);
    }
    closeEmployeeModal();
  };

  // 해당 슬롯의 직원들 가져오기
  const getSlotEmployees = (day: string, timeSlot: string): Employee[] => {
    const employeeIds = scheduleData[day]?.time_slots?.[timeSlot] || [];
    return employees.filter(emp => employeeIds.includes(emp.id));
  };

  // 스케줄 저장
  const saveSchedule = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('weekly_schedule_templates')
        .update({ schedule_data: scheduleData })
        .eq('id', selectedTemplate.id);
      
      if (error) throw error;
      
      alert('스케줄이 저장되었습니다.');
    } catch (err) {
      setError('스케줄 저장에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStore) {
      loadTemplates(selectedStore.id);
      loadEmployees(selectedStore.id);
    }
  }, [selectedStore]);

  // Time slots 업데이트
  useEffect(() => {
    if (selectedStore && scheduleData) {
      const slots = new Set<string>();
      
      days.forEach(day => {
        const dayData = scheduleData[day];
        if (dayData?.is_open && dayData.open_time && dayData.close_time) {
          const daySlots = generateTimeSlots(
            dayData.open_time, 
            dayData.close_time, 
            selectedStore.time_slot_minutes
          );
          daySlots.forEach(slot => slots.add(slot));
        }
      });
      
      setTimeSlots(Array.from(slots).sort());
    }
  }, [selectedStore, scheduleData]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">스토어가 없습니다</h2>
          <p className="text-gray-600 mb-4">먼저 스토어를 생성해주세요.</p>
          <Link
            href="/stores"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            스토어 관리로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/schedule"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                스케줄 관리로 돌아가기
              </Link>
            </div>
            <button
              onClick={saveSchedule}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              저장
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-blue-600" />
                스케줄 템플릿 편집
              </h1>
              <p className="text-gray-600 mt-2">
                시간대별로 근무 인원을 배치하여 스케줄 템플릿을 만들어보세요.
              </p>
            </div>
          </div>
        </div>

        {/* 스토어 선택 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">스토어 선택</h2>
            <div className="text-sm text-gray-500">
              시간 슬롯: {selectedStore?.time_slot_minutes || 30}분 단위
            </div>
          </div>
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
                <div className="font-medium text-gray-900">{store.store_name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  ID: {store.id}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 템플릿 선택 */}
        {selectedStore && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">템플릿 선택</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setScheduleData(template.schedule_data);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{template.template_name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    ID: {template.id}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 스케줄 표 */}
        {selectedStore && selectedTemplate && timeSlots.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">주간 스케줄</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-50 text-left font-medium">시간</th>
                    {days.map((day, index) => {
                      const dayData = scheduleData[day];
                      const isOpen = dayData?.is_open;
                      return (
                        <th 
                          key={day} 
                          className={`border border-gray-300 p-2 text-center font-medium ${
                            isOpen ? 'bg-blue-50' : 'bg-gray-100'
                          }`}
                        >
                          <div>{dayNames[index]}</div>
                          {isOpen && dayData.open_time && dayData.close_time && (
                            <div className="text-xs text-gray-500 mt-1">
                              {dayData.open_time} - {dayData.close_time}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                        {timeSlot}
                      </td>
                      {days.map((day) => {
                        const dayData = scheduleData[day];
                        const isOpen = dayData?.is_open;
                        const slotEmployees = getSlotEmployees(day, timeSlot);
                        
                        // 시간대가 영업시간 내인지 확인
                        const isWithinHours = isOpen && dayData.open_time && dayData.close_time &&
                          timeSlot >= dayData.open_time && timeSlot < dayData.close_time;
                        
                        return (
                          <td 
                            key={`${day}-${timeSlot}`} 
                            className={`border border-gray-300 p-2 ${
                              isWithinHours ? 'bg-white' : 'bg-gray-100'
                            }`}
                          >
                            {isWithinHours ? (
                              <div className="space-y-1">
                                {/* 직원 목록 */}
                                {slotEmployees.map((employee) => (
                                  <div 
                                    key={employee.id}
                                    className="flex items-center justify-between bg-blue-100 px-2 py-1 rounded text-sm"
                                  >
                                    <span className="flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      {employee.name}
                                    </span>
                                    <button
                                      onClick={() => removeEmployeeFromSlot(day, timeSlot, employee.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                
                                {/* 직원 추가 버튼 */}
                                <button
                                  onClick={() => openEmployeeModal(day, timeSlot)}
                                  className="flex items-center justify-center w-full py-1 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center text-gray-400 text-sm">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 직원 선택 모달 */}
      {showEmployeeModal && currentSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">직원 선택</h3>
            <p className="text-sm text-gray-600 mb-4">
              {dayNames[days.indexOf(currentSlot.day)]} {currentSlot.time}에 배치할 직원을 선택하세요.
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((employee) => {
                const isAlreadyAssigned = getSlotEmployees(currentSlot.day, currentSlot.time)
                  .some(emp => emp.id === employee.id);
                
                return (
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee.id)}
                    disabled={isAlreadyAssigned}
                    className={`w-full p-3 text-left rounded-lg border ${
                      isAlreadyAssigned 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'hover:bg-blue-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        {employee.position && (
                          <div className="text-sm text-gray-500">{employee.position}</div>
                        )}
                      </div>
                      {isAlreadyAssigned && (
                        <div className="ml-auto text-xs text-gray-400">이미 배치됨</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeEmployeeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

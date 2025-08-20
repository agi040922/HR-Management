'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, 
  Save,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 모듈화된 컴포넌트 및 유틸리티 import
import ScheduleTable from '@/components/schedule/ScheduleTable';
import EmployeeModal from '@/components/schedule/EmployeeModal';
import EmployeeTooltip from '@/components/schedule/EmployeeTooltip';
import { 
  Employee, 
  StoreSettings, 
  WeeklyTemplate, 
  ScheduleSlot,
  generateTimeSlots,
  getSlotEmployees,
  calculateWeeklyWorkHours,
  createDefaultScheduleData
} from '@/lib/schedule/scheduleUtils';
import {
  loadStores,
  loadTemplates,
  loadEmployees,
  createDefaultTemplate,
  saveSchedule
} from '@/lib/schedule/scheduleApi';

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

  // 모달 상태
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{ day: string; time: string } | null>(null);
  const [showEmployeeTooltip, setShowEmployeeTooltip] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    employee: Employee;
    slotData: ScheduleSlot;
    day: string;
    timeSlot: string;
  } | null>(null);
  const [showStoreHoursModal, setShowStoreHoursModal] = useState(false);
  
  // 도움말 툴팁 상태
  const [showHelp, setShowHelp] = useState(false);

  // API 함수들
  const handleLoadStores = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await loadStores(user.id);
      setStores(data);
      
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

  const handleLoadTemplates = async (storeId: number) => {
    try {
      const data = await loadTemplates(storeId);
      setTemplates(data);
      
      if (data && data.length > 0) {
        setSelectedTemplate(data[0]);
        setScheduleData(data[0].schedule_data || {});
      } else {
        // 기본 템플릿 생성
        const newTemplate = await createDefaultTemplate(storeId);
        setTemplates([newTemplate]);
        setSelectedTemplate(newTemplate);
        setScheduleData(newTemplate.schedule_data);
      }
    } catch (err) {
      setError('템플릿을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  const handleLoadEmployees = async (storeId: number) => {
    try {
      const data = await loadEmployees(storeId);
      setEmployees(data);
    } catch (err) {
      setError('직원 목록을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  // 직원 추가 함수 - 새로운 스케줄 데이터와 함께
  const addEmployeeToSlot = (
    employeeId: number, 
    scheduleInfo: {
      start_time: string;
      end_time: string;
      break_periods: Array<{start: string; end: string; name: string}>;
    }, 
    day?: string, 
    timeSlot?: string
  ) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !day) return;

    setScheduleData((prev: any) => {
      const newData = { ...prev };
      if (!newData[day]) {
        newData[day] = { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [], employees: {} };
      }
      if (!newData[day].employees) {
        newData[day].employees = {};
      }
      
      // 직원별 스케줄 정보 저장
      newData[day].employees[employeeId] = {
        start_time: scheduleInfo.start_time,
        end_time: scheduleInfo.end_time,
        break_periods: scheduleInfo.break_periods
      };
      
      return newData;
    });
  };

  const removeEmployeeFromSlot = (day: string, timeSlot: string, employeeId: number) => {
    setScheduleData((prev: any) => {
      const newData = { ...prev };
      if (newData[day]?.employees?.[employeeId]) {
        delete newData[day].employees[employeeId];
      }
      return newData;
    });
  };

  // 모달 핸들러들
  const openEmployeeModal = (day: string, time: string) => {
    setCurrentSlot({ day, time });
    setShowEmployeeModal(true);
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setCurrentSlot(null);
  };

  const handleEmployeeSelect = (
    employeeId: number, 
    scheduleData: {
      start_time: string;
      end_time: string;
      break_periods: Array<{start: string; end: string; name: string}>;
    }, 
    day?: string, 
    timeSlot?: string
  ) => {
    addEmployeeToSlot(employeeId, scheduleData, day, timeSlot);
    closeEmployeeModal();
  };

  // 직원 클릭 핸들러 (툴팁 표시)
  const handleEmployeeClick = (day: string, timeSlot: string, employee: Employee, slotData: ScheduleSlot) => {
    setSelectedEmployee({ employee, slotData, day, timeSlot });
    setShowEmployeeTooltip(true);
  };

  const closeEmployeeTooltip = () => {
    setShowEmployeeTooltip(false);
    setSelectedEmployee(null);
  };

  // 영업시간 변경 함수
  const handleUpdateStoreHours = (day: string, isOpen: boolean, openTime?: string, closeTime?: string) => {
    setScheduleData((prev: any) => {
      const newData = { ...prev };
      if (!newData[day]) {
        newData[day] = { is_open: false, open_time: null, close_time: null, break_periods: [], employees: {} };
      }
      
      newData[day] = {
        ...newData[day],
        is_open: isOpen,
        open_time: isOpen ? openTime : null,
        close_time: isOpen ? closeTime : null
      };
      
      return newData;
    });
  };

  // 스케줄 저장
  const handleSaveSchedule = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      await saveSchedule(selectedTemplate.id, scheduleData);
      alert('스케줄이 저장되었습니다.');
    } catch (err) {
      setError('스케줄 저장에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 템플릿 초기화
  const handleResetTemplate = async () => {
    if (!selectedStore || !selectedTemplate) return;
    
    const confirmed = confirm('현재 스케줄을 모두 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmed) return;
    
    try {
      setLoading(true);
      // 기본 스케줄 데이터로 초기화 (새 템플릿 생성하지 않고)
      const defaultSchedule = createDefaultScheduleData();
      setScheduleData(defaultSchedule);
      await saveSchedule(selectedTemplate.id, defaultSchedule);
      alert('스케줄이 초기화되었습니다.');
    } catch (err) {
      setError('스케줄 초기화에 실패했습니다.');
      console.error('Reset template error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      handleLoadStores();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStore) {
      handleLoadTemplates(selectedStore.id);
      handleLoadEmployees(selectedStore.id);
    }
  }, [selectedStore]);

  // Time slots 업데이트 - 전체 영업시간 범위 기반
  useEffect(() => {
    if (selectedStore && scheduleData) {
      // 모든 영업일의 최소/최대 시간 찾기
      let earliestTime = '24:00';
      let latestTime = '00:00';
      
      days.forEach(day => {
        const dayData = scheduleData[day];
        if (dayData?.is_open && dayData.open_time && dayData.close_time) {
          if (dayData.open_time < earliestTime) {
            earliestTime = dayData.open_time;
          }
          if (dayData.close_time > latestTime) {
            latestTime = dayData.close_time;
          }
        }
      });
      
      // 전체 시간 범위로 슬롯 생성 (영업하지 않는 시간도 포함)
      if (earliestTime !== '24:00' && latestTime !== '00:00') {
        const allSlots = generateTimeSlots(
          earliestTime, 
          latestTime, 
          selectedStore.time_slot_minutes || 60
        );
        setTimeSlots(allSlots);
      } else {
        // 기본 시간 범위 (영업일이 없는 경우)
        const defaultSlots = generateTimeSlots('09:00', '18:00', 60);
        setTimeSlots(defaultSlots);
      }
    }
  }, [selectedStore, scheduleData]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">스케줄 관리</h1>
              <div className="relative">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className={`p-1 transition-colors rounded-full ${
                    showHelp 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                  title="도움말"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                {showHelp && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowHelp(false)}
                    />
                    <div className="absolute top-8 left-0 z-50 w-80 p-4 bg-white rounded-sm border shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">스케줄 관리 사용법:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• 스토어와 템플릿을 선택하세요</li>
                          <li>• 직원을 클릭하면 상세 정보를 볼 수 있습니다</li>
                          <li>• 직원 배치는 별도 모달에서 관리됩니다</li>
                          <li>• 변경사항은 저장 버튼을 눌러 저장하세요</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* 컨트롤 영역 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* 스토어 선택 */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  스토어:
                </label>
                <Select
                  value={selectedStore?.id.toString() || ""}
                  onValueChange={(value) => {
                    const store = stores.find(s => s.id.toString() === value);
                    if (store) setSelectedStore(store);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="선택하세요" />
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

              {/* 템플릿 선택 */}
              {selectedStore && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    템플릿:
                  </label>
                  <Select
                    value={selectedTemplate?.id.toString() || ""}
                    onValueChange={(value) => {
                      const template = templates.find(t => t.id.toString() === value);
                      if (template) {
                        setSelectedTemplate(template);
                        setScheduleData(template.schedule_data);
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="선택하세요" />
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
              )}

              {/* 저장 버튼 */}
              <button
                onClick={handleSaveSchedule}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                저장
              </button>
            </div>
          </div>
          
          {/* 정보 표시 */}
          {selectedStore && (
            <div className="text-sm text-gray-500">
              시간 슬롯: {selectedStore.time_slot_minutes}분 • 직원 수: {employees.length}명
            </div>
          )}
        </div>

        {/* 스케줄 표 */}
        {selectedStore && selectedTemplate && timeSlots.length > 0 && (
          <div className="bg-white rounded border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">주간 스케줄</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStoreHoursModal(true)}
                  className="px-3 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors text-sm"
                >
                  영업시간 설정
                </button>
                <button
                  onClick={handleResetTemplate}
                  className="px-3 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 transition-colors text-sm"
                >
                  초기화
                </button>
                <button
                  onClick={() => setShowEmployeeModal(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors text-sm"
                >
                  직원 추가
                </button>
              </div>
            </div>
              
            <ScheduleTable
              scheduleData={scheduleData}
              timeSlots={timeSlots}
              employees={employees}
              days={days}
              dayNames={dayNames}
              onEmployeeClick={handleEmployeeClick}
            />
          </div>
        )}
      </div>

      {/* 직원 선택 모달 */}
      <EmployeeModal
        isOpen={showEmployeeModal}
        currentSlot={currentSlot}
        employees={employees}
        dayNames={dayNames}
        days={days}
        onClose={closeEmployeeModal}
        onSelectEmployee={handleEmployeeSelect}
        getSlotEmployees={(day, timeSlot) => getSlotEmployees(scheduleData, employees, day, timeSlot)}
        scheduleData={scheduleData}
        timeSlots={timeSlots}
      />

      {/* 직원 정보 툴팁 */}
      {selectedEmployee && (
        <EmployeeTooltip
          isOpen={showEmployeeTooltip}
          employee={selectedEmployee.employee}
          slotData={selectedEmployee.slotData}
          day={selectedEmployee.day}
          timeSlot={selectedEmployee.timeSlot}
          dayNames={dayNames}
          days={days}
          onClose={closeEmployeeTooltip}
          onRemove={removeEmployeeFromSlot}
        />
      )}

      {/* 영업시간 설정 모달 */}
      {showStoreHoursModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">영업시간 설정</h3>
              
              <div className="space-y-4">
                {days.map((day, index) => {
                  const dayData = scheduleData[day] || { is_open: false, open_time: '09:00', close_time: '18:00' };
                  
                  return (
                    <div key={day} className="flex items-center space-x-4 p-3 border rounded-sm">
                      <div className="w-20 font-medium">
                        {dayNames[index]}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={dayData.is_open}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleUpdateStoreHours(day, true, '09:00', '18:00');
                            } else {
                              handleUpdateStoreHours(day, false);
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">영업</span>
                      </div>
                      
                      {dayData.is_open && (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">시작:</span>
                            <input
                              type="time"
                              value={dayData.open_time || '09:00'}
                              onChange={(e) => handleUpdateStoreHours(day, true, e.target.value, dayData.close_time)}
                              className="px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">종료:</span>
                            <input
                              type="time"
                              value={dayData.close_time || '18:00'}
                              onChange={(e) => handleUpdateStoreHours(day, true, dayData.open_time, e.target.value)}
                              className="px-2 py-1 border rounded text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowStoreHoursModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-sm transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowStoreHoursModal(false);
                    // 자동으로 스케줄 저장
                    handleSaveSchedule();
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}

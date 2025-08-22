'use client';

import React, { useState } from 'react';
import { User, Plus, Minus, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Employee {
  id: number;
  name: string;
  position?: string;
  store_id: number;
  hourly_wage?: number;
}

interface BreakPeriod {
  start: string;
  end: string;
  name: string;
}

interface EmployeeModalProps {
  isOpen: boolean;
  currentSlot: { day: string; time: string } | null;
  employees: Employee[];
  dayNames: string[];
  days: string[];
  onClose: () => void;
  onSelectEmployee: (employeeId: number, scheduleData: {
    start_time: string;
    end_time: string;
    break_periods: BreakPeriod[];
  }, day?: string, timeSlot?: string) => void;
  getSlotEmployees: (day: string, timeSlot: string) => Employee[];
  scheduleData?: any;
  timeSlots?: string[];
}

export default function EmployeeModal({
  isOpen,
  currentSlot,
  employees,
  dayNames,
  days,
  onClose,
  onSelectEmployee,
  getSlotEmployees,
  scheduleData,
  timeSlots
}: EmployeeModalProps) {
  const [selectedDay, setSelectedDay] = useState<string>(currentSlot?.day || days[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [breakPeriods, setBreakPeriods] = useState<BreakPeriod[]>([
    { start: '12:00', end: '13:00', name: '점심시간' }
  ]);
  
  if (!isOpen) return null;

  // 시간 옵션 생성 (30분 간격)
  const timeOptions: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  const addBreakPeriod = () => {
    setBreakPeriods([...breakPeriods, { start: '15:00', end: '15:15', name: '휴게시간' }]);
  };

  const removeBreakPeriod = (index: number) => {
    setBreakPeriods(breakPeriods.filter((_, i) => i !== index));
  };

  const updateBreakPeriod = (index: number, field: keyof BreakPeriod, value: string) => {
    const updated = [...breakPeriods];
    updated[index] = { ...updated[index], [field]: value };
    setBreakPeriods(updated);
  };

  const handleSubmit = () => {
    if (!selectedEmployee) return;
    
    const scheduleInfo = {
      start_time: startTime,
      end_time: endTime,
      break_periods: breakPeriods
    };
    
    onSelectEmployee(selectedEmployee, scheduleInfo, selectedDay);
    onClose();
  };

  return (
    <>
      {/* 투명한 배경 클릭 영역 */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* 모달 콘텐츠 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-sm shadow-xl border p-6 w-full max-w-lg mx-4 pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            직원 스케줄 등록
          </h3>
          
          <div className="space-y-6">
            {/* 요일 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">요일 선택</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="요일을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day, index) => {
                    const dayData = scheduleData?.[day];
                    const isOpen = dayData?.is_open;
                    return (
                      <SelectItem key={day} value={day} disabled={!isOpen}>
                        {dayNames[index]} {!isOpen && '(휴무)'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 직원 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직원 선택</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-sm p-2">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee.id)}
                    className={`w-full p-2 text-left rounded-sm border transition-colors ${
                      selectedEmployee === employee.id
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        {employee.position && (
                          <div className="text-sm text-gray-500">{employee.position}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 근무 시간 설정 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 휴게 시간 설정 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">휴게 시간</label>
                <button
                  onClick={addBreakPeriod}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </button>
              </div>
              
              <div className="space-y-2">
                {breakPeriods.map((breakPeriod, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    
                    <input
                      type="text"
                      value={breakPeriod.name}
                      onChange={(e) => updateBreakPeriod(index, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      placeholder="휴게시간 이름"
                    />
                    
                    <Select 
                      value={breakPeriod.start} 
                      onValueChange={(value) => updateBreakPeriod(index, 'start', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-sm text-gray-500">~</span>
                    
                    <Select 
                      value={breakPeriod.end} 
                      onValueChange={(value) => updateBreakPeriod(index, 'end', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <button
                      onClick={() => removeBreakPeriod(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-sm transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedEmployee}
              className={`px-4 py-2 rounded-sm transition-colors ${
                selectedEmployee
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

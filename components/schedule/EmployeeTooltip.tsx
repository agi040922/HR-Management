'use client';

import React from 'react';
import { User, Clock, Coffee, X } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position?: string;
  store_id: number;
  hourly_wage?: number;
}

interface ScheduleSlot {
  start_time: string;
  end_time: string;
  break_periods: Array<{
    start: string;
    end: string;
    name: string;
  }>;
}

interface EmployeeTooltipProps {
  isOpen: boolean;
  employee: Employee | null;
  slotData: ScheduleSlot | null;
  day: string;
  timeSlot: string;
  dayNames: string[];
  days: string[];
  onClose: () => void;
  onRemove: (day: string, timeSlot: string, employeeId: number) => void;
}

export default function EmployeeTooltip({
  isOpen,
  employee,
  slotData,
  day,
  timeSlot,
  dayNames,
  days,
  onClose,
  onRemove
}: EmployeeTooltipProps) {
  if (!isOpen || !employee || !slotData) return null;

  const workHours = (() => {
    const start = new Date(`1970-01-01T${slotData.start_time}:00`);
    const end = new Date(`1970-01-01T${slotData.end_time}:00`);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // 브레이크 타임 차감
    const breakMinutes = slotData.break_periods?.reduce((total: number, bp: any) => {
      const breakStart = new Date(`1970-01-01T${bp.start}:00`);
      const breakEnd = new Date(`1970-01-01T${bp.end}:00`);
      return total + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
    }, 0) || 0;
    
    return ((minutes - breakMinutes) / 60).toFixed(1);
  })();

  const totalBreakTime = slotData.break_periods?.reduce((total, bp) => {
    const start = new Date(`1970-01-01T${bp.start}:00`);
    const end = new Date(`1970-01-01T${bp.end}:00`);
    return total + (end.getTime() - start.getTime()) / (1000 * 60);
  }, 0) || 0;

  const handleRemoveEmployee = () => {
    if (onRemove && day && employee) {
      // 시간대 구분 없이 직원 제거 (빈 문자열 전달)
      onRemove(day, '', employee.id);
      onClose();
    }
  };

  return (
    <>
      {/* 투명한 배경 클릭 영역 */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* 툴팁 콘텐츠 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl border p-6 w-full max-w-md mx-4 pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="h-5 w-5 mr-2" />
              직원 정보
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* 기본 정보 */}
            <div>
              <div className="text-lg font-medium">{employee.name}</div>
              {employee.position && (
                <div className="text-sm text-gray-500">{employee.position}</div>
              )}
              <div className="text-sm text-gray-600 mt-1">
                시급: {employee.hourly_wage?.toLocaleString()}원
              </div>
            </div>

            {/* 스케줄 정보 */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {dayNames[days.indexOf(day)]} 스케줄
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <span>근무시간: {slotData.start_time} - {slotData.end_time}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className="w-4 h-4 mr-2 flex items-center justify-center">
                    ⏱️
                  </span>
                  <span>실제 근무: {workHours}시간</span>
                </div>

                {slotData.break_periods && slotData.break_periods.length > 0 && (
                  <div>
                    <div className="flex items-center text-sm mb-1">
                      <Coffee className="h-4 w-4 mr-2 text-orange-500" />
                      <span>휴게시간 ({Math.round(totalBreakTime)}분):</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {slotData.break_periods.map((bp, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {bp.name}: {bp.start} - {bp.end}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 급여 정보 */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">예상 급여</div>
              <div className="text-lg font-semibold text-green-600">
                {(parseFloat(workHours) * (employee.hourly_wage || 0)).toLocaleString()}원
              </div>
            </div>
          </div>
          
          <div className="flex justify-between space-x-2 mt-6">
            <button
              onClick={handleRemoveEmployee}
              className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors"
            >
              배치 해제
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-sm transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import React from 'react';
import { User } from 'lucide-react';

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

interface ScheduleTableProps {
  scheduleData: any;
  timeSlots: string[];
  employees: Employee[];
  days: string[];
  dayNames: string[];
  onEmployeeClick: (day: string, timeSlot: string, employee: Employee, slotData: ScheduleSlot) => void;
}

export default function ScheduleTable({
  scheduleData,
  timeSlots,
  employees,
  days,
  dayNames,
  onEmployeeClick
}: ScheduleTableProps) {
  
  // 해당 날짜의 직원들 가져오기 - 시간대 구분 없음
  const getSlotEmployees = (day: string, timeSlot: string): (Employee & {slot_data: ScheduleSlot; isBreakTime?: boolean})[] => {
    const dayData = scheduleData[day];
    if (!dayData?.employees) return [];
    
    const result: (Employee & {slot_data: ScheduleSlot; isBreakTime?: boolean})[] = [];
    
    // 해당 날짜의 모든 직원을 해당 시간대에 표시 (근무시간 내인 경우만)
    Object.keys(dayData.employees).forEach(employeeId => {
      const employee = employees.find(emp => emp.id === parseInt(employeeId));
      if (employee) {
        const slot = dayData.employees[employeeId];
        
        // 해당 시간대가 직원의 근무시간 내인지 확인
        if (timeSlot >= slot.start_time && timeSlot < slot.end_time) {
          // 해당 시간대가 휴게시간인지 확인
          const isBreakTime = slot.break_periods?.some((bp: any) => 
            timeSlot >= bp.start && timeSlot < bp.end
          ) || false;
          
          result.push({
            ...employee,
            slot_data: {
              start_time: slot.start_time,
              end_time: slot.end_time,
              break_periods: slot.break_periods || []
            },
            isBreakTime
          });
        }
      }
    });
    
    return result;
  };

  return (
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
                  timeSlot >= dayData.open_time && timeSlot <= dayData.close_time;
                
                return (
                  <td 
                    key={`${day}-${timeSlot}`} 
                    className={`border border-gray-300 p-2 ${
                      isWithinHours ? 'bg-white' : 'bg-gray-100'
                    }`}
                  >
                    {isWithinHours ? (
                      <div className="space-y-1 min-h-[2rem]">
                        {/* 직원 목록 표시 - 휴게시간 구분 */}
                        {slotEmployees.map((employee) => {
                          const slotData = employee.slot_data;
                          const isBreakTime = employee.isBreakTime;
                          
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

                          // 현재 시간대의 휴게시간 정보 찾기
                          const currentBreakPeriod = slotData.break_periods?.find((bp: any) => 
                            timeSlot >= bp.start && timeSlot < bp.end
                          );
                          
                          return (
                            <div 
                              key={employee.id}
                              className={`flex items-center justify-between px-2 py-1 rounded-sm text-sm cursor-pointer transition-colors ${
                                isBreakTime 
                                  ? 'bg-orange-100 hover:bg-orange-200 border border-orange-200' 
                                  : 'bg-blue-100 hover:bg-blue-200'
                              }`}
                              onClick={() => onEmployeeClick(day, timeSlot, employee, slotData)}
                              title={isBreakTime 
                                ? `휴게시간: ${currentBreakPeriod?.name || '휴게시간'} (${currentBreakPeriod?.start}-${currentBreakPeriod?.end})`
                                : "클릭하여 직원 정보 보기"
                              }
                            >
                              <span className="flex items-center flex-1 min-w-0">
                                <User className={`h-3 w-3 mr-1 flex-shrink-0 ${
                                  isBreakTime ? 'text-orange-600' : 'text-blue-600'
                                }`} />
                                <span className="truncate">{employee.name}</span>
                                {isBreakTime ? (
                                  <span className="text-xs text-orange-600 ml-1 flex-shrink-0 font-medium">
                                    휴게
                                  </span>
                                ) : (
                                  <span className="text-xs text-blue-600 ml-1 flex-shrink-0">
                                    {workHours}h
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                        
                        {/* 빈 슬롯 표시 */}
                        {slotEmployees.length === 0 && (
                          <div className="text-center text-gray-400 text-xs py-2">
                            배치된 직원 없음
                          </div>
                        )}
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
  );
}

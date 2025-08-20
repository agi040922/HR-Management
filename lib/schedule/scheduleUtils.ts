// 스케줄 관련 유틸리티 함수들

export interface Employee {
  id: number;
  name: string;
  position?: string;
  store_id: number;
  hourly_wage?: number;
}

export interface ScheduleSlot {
  start_time: string;
  end_time: string;
  break_periods: Array<{
    start: string;
    end: string;
    name: string;
  }>;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  time_slot_minutes: number;
  owner_id: string;
}

export interface WeeklyTemplate {
  id: number;
  store_id: number;
  template_name: string;
  schedule_data: any;
  is_active: boolean;
}

// Time slots 생성
export const generateTimeSlots = (openTime: string, closeTime: string, slotMinutes: number): string[] => {
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

// 해당 날짜의 직원들 가져오기 - 시간대 구분 없음
export const getSlotEmployees = (
  scheduleData: any, 
  employees: Employee[], 
  day: string, 
  timeSlot: string
): (Employee & {slot_data: ScheduleSlot})[] => {
  const dayData = scheduleData[day];
  if (!dayData?.employees || typeof dayData.employees !== 'object') return [];
  
  const result: (Employee & {slot_data: ScheduleSlot})[] = [];
  
  // 해당 날짜의 모든 직원 반환 (시간대 구분 없음)
  Object.keys(dayData.employees).forEach(employeeId => {
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    if (employee) {
      const slot = dayData.employees[employeeId];
      result.push({
        ...employee,
        slot_data: {
          start_time: slot.start_time,
          end_time: slot.end_time,
          break_periods: slot.break_periods || []
        }
      });
    }
  });
  
  return result;
};

// 직원별 주간 근무시간 계산 - 시간대 구분 없는 구조
export const calculateWeeklyWorkHours = (
  scheduleData: any, 
  employees: Employee[], 
  days: string[]
): {[employeeId: number]: {name: string, hours: number, shifts: number}} => {
  const workHours: {[employeeId: number]: {name: string, hours: number, shifts: number}} = {};
  
  employees.forEach(employee => {
    workHours[employee.id] = {
      name: employee.name,
      hours: 0,
      shifts: 0
    };
  });

  if (scheduleData) {
    days.forEach(day => {
      const dayData = scheduleData[day];
      if (dayData?.is_open && dayData.employees) {
        // 직원별로 스케줄 계산 (시간대 구분 없음)
        Object.keys(dayData.employees).forEach(employeeIdStr => {
          const employeeId = parseInt(employeeIdStr);
          const slot = dayData.employees[employeeIdStr];
          
          if (workHours[employeeId]) {
            // 개별 근무시간 계산 (start_time과 end_time 기반)
            const startTime = new Date(`1970-01-01T${slot.start_time}:00`);
            const endTime = new Date(`1970-01-01T${slot.end_time}:00`);
            const workMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            // 브레이크 타임 차감
            const breakMinutes = slot.break_periods?.reduce((total: number, bp: any) => {
              const breakStart = new Date(`1970-01-01T${bp.start}:00`);
              const breakEnd = new Date(`1970-01-01T${bp.end}:00`);
              return total + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
            }, 0) || 0;
            
            const actualWorkMinutes = Math.max(0, workMinutes - breakMinutes);
            workHours[employeeId].hours += actualWorkMinutes / 60;
            workHours[employeeId].shifts += 1;
          }
        });
      }
    });
  }

  return workHours;
};

// 기본 템플릿 생성 - 시간대 구분 없는 구조
export const createDefaultScheduleData = () => {
  return {
    monday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], employees: {} },
    tuesday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], employees: {} },
    wednesday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], employees: {} },
    thursday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], employees: {} },
    friday: { is_open: true, open_time: '09:00', close_time: '18:00', break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }], employees: {} },
    saturday: { is_open: false, open_time: null, close_time: null, break_periods: [], employees: {} },
    sunday: { is_open: false, open_time: null, close_time: null, break_periods: [], employees: {} }
  };
};

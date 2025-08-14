// 스케줄 관련 유틸리티 함수들

import { DaySchedule, WeekScheduleData, DayOfWeek, BreakPeriod } from '../types/schedule';

/**
 * 시간 문자열을 분으로 변환
 * @param timeStr "HH:MM" 형식의 시간 문자열
 * @returns 분 단위 숫자
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 분을 시간 문자열로 변환
 * @param minutes 분 단위 숫자
 * @returns "HH:MM" 형식의 시간 문자열
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 시작 시간과 종료 시간 사이의 시간 슬롯 배열 생성
 * @param startTime 시작 시간 ("HH:MM")
 * @param endTime 종료 시간 ("HH:MM")
 * @param slotMinutes 슬롯 간격 (분)
 * @returns 시간 슬롯 배열
 */
export function generateTimeSlots(startTime: string, endTime: string, slotMinutes: number = 30): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  for (let current = startMinutes; current < endMinutes; current += slotMinutes) {
    slots.push(minutesToTime(current));
  }
  
  return slots;
}

/**
 * 특정 시간이 브레이크 시간에 포함되는지 확인
 * @param timeSlot 확인할 시간 슬롯
 * @param breakPeriods 브레이크 시간 배열
 * @returns 브레이크 시간 여부
 */
export function isBreakTime(timeSlot: string, breakPeriods: BreakPeriod[]): boolean {
  const slotMinutes = timeToMinutes(timeSlot);
  
  return breakPeriods.some(period => {
    const startMinutes = timeToMinutes(period.start);
    const endMinutes = timeToMinutes(period.end);
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
}

/**
 * 기본 요일 스케줄 생성
 * @param isOpen 영업 여부
 * @param openTime 오픈 시간
 * @param closeTime 마감 시간
 * @returns 기본 요일 스케줄
 */
export function createDefaultDaySchedule(
  isOpen: boolean = true,
  openTime: string = '09:00',
  closeTime: string = '18:00'
): DaySchedule {
  return {
    is_open: isOpen,
    open_time: isOpen ? openTime : null,
    close_time: isOpen ? closeTime : null,
    break_periods: isOpen ? [{ start: '12:00', end: '13:00', name: '점심시간' }] : [],
    time_slots: {}
  };
}

/**
 * 기본 주간 스케줄 생성
 * @returns 기본 주간 스케줄 (월~금 09:00-18:00, 토일 휴무)
 */
export function createDefaultWeekSchedule(): WeekScheduleData {
  const workdaySchedule = createDefaultDaySchedule(true, '09:00', '18:00');
  const closedSchedule = createDefaultDaySchedule(false);
  
  return {
    monday: workdaySchedule,
    tuesday: workdaySchedule,
    wednesday: workdaySchedule,
    thursday: workdaySchedule,
    friday: workdaySchedule,
    saturday: closedSchedule,
    sunday: closedSchedule
  };
}

/**
 * 특정 요일의 시간 슬롯에 직원 추가
 * @param scheduleData 주간 스케줄 데이터
 * @param day 요일
 * @param timeSlot 시간 슬롯
 * @param employeeId 직원 ID
 * @param slotMinutes 슬롯 간격
 * @returns 업데이트된 스케줄 데이터
 */
export function addEmployeeToTimeSlot(
  scheduleData: WeekScheduleData,
  day: DayOfWeek,
  timeSlot: string,
  employeeId: number,
  slotMinutes: number = 30
): WeekScheduleData {
  const newSchedule = { ...scheduleData };
  const daySchedule = { ...newSchedule[day] };
  const timeSlots = { ...daySchedule.time_slots };
  
  // 해당 요일이 영업하지 않으면 추가하지 않음
  if (!daySchedule.is_open) {
    return scheduleData;
  }
  
  // 브레이크 시간에는 추가하지 않음
  if (isBreakTime(timeSlot, daySchedule.break_periods)) {
    return scheduleData;
  }
  
  // 영업시간 내에서만 추가
  if (daySchedule.open_time && daySchedule.close_time) {
    const slotMinutes = timeToMinutes(timeSlot);
    const openMinutes = timeToMinutes(daySchedule.open_time);
    const closeMinutes = timeToMinutes(daySchedule.close_time);
    
    if (slotMinutes < openMinutes || slotMinutes >= closeMinutes) {
      return scheduleData;
    }
  }
  
  // 시간 슬롯에 직원 추가
  if (!timeSlots[timeSlot]) {
    timeSlots[timeSlot] = [];
  }
  
  if (!timeSlots[timeSlot].includes(employeeId)) {
    timeSlots[timeSlot] = [...timeSlots[timeSlot], employeeId];
  }
  
  daySchedule.time_slots = timeSlots;
  newSchedule[day] = daySchedule;
  
  return newSchedule;
}

/**
 * 특정 요일의 시간 슬롯에서 직원 제거
 * @param scheduleData 주간 스케줄 데이터
 * @param day 요일
 * @param timeSlot 시간 슬롯
 * @param employeeId 직원 ID
 * @returns 업데이트된 스케줄 데이터
 */
export function removeEmployeeFromTimeSlot(
  scheduleData: WeekScheduleData,
  day: DayOfWeek,
  timeSlot: string,
  employeeId: number
): WeekScheduleData {
  const newSchedule = { ...scheduleData };
  const daySchedule = { ...newSchedule[day] };
  const timeSlots = { ...daySchedule.time_slots };
  
  if (timeSlots[timeSlot]) {
    timeSlots[timeSlot] = timeSlots[timeSlot].filter(id => id !== employeeId);
    
    // 빈 배열이면 해당 시간 슬롯 삭제
    if (timeSlots[timeSlot].length === 0) {
      delete timeSlots[timeSlot];
    }
  }
  
  daySchedule.time_slots = timeSlots;
  newSchedule[day] = daySchedule;
  
  return newSchedule;
}

/**
 * 요일 스케줄의 영업시간 업데이트
 * @param scheduleData 주간 스케줄 데이터
 * @param day 요일
 * @param openTime 오픈 시간
 * @param closeTime 마감 시간
 * @param slotMinutes 슬롯 간격
 * @returns 업데이트된 스케줄 데이터
 */
export function updateDayOperatingHours(
  scheduleData: WeekScheduleData,
  day: DayOfWeek,
  openTime: string | null,
  closeTime: string | null,
  slotMinutes: number = 30
): WeekScheduleData {
  const newSchedule = { ...scheduleData };
  const daySchedule = { ...newSchedule[day] };
  
  daySchedule.open_time = openTime;
  daySchedule.close_time = closeTime;
  daySchedule.is_open = !!(openTime && closeTime);
  
  // 영업시간이 변경되면 기존 시간 슬롯을 정리
  if (daySchedule.is_open && openTime && closeTime) {
    const validSlots = generateTimeSlots(openTime, closeTime, slotMinutes);
    const newTimeSlots: { [key: string]: number[] } = {};
    
    // 유효한 시간 슬롯만 유지
    Object.keys(daySchedule.time_slots).forEach(slot => {
      if (validSlots.includes(slot) && !isBreakTime(slot, daySchedule.break_periods)) {
        newTimeSlots[slot] = daySchedule.time_slots[slot];
      }
    });
    
    daySchedule.time_slots = newTimeSlots;
  } else {
    // 영업하지 않으면 모든 시간 슬롯 제거
    daySchedule.time_slots = {};
  }
  
  newSchedule[day] = daySchedule;
  return newSchedule;
}

/**
 * 브레이크 시간 업데이트
 * @param scheduleData 주간 스케줄 데이터
 * @param day 요일
 * @param breakPeriods 브레이크 시간 배열
 * @returns 업데이트된 스케줄 데이터
 */
export function updateDayBreakPeriods(
  scheduleData: WeekScheduleData,
  day: DayOfWeek,
  breakPeriods: BreakPeriod[]
): WeekScheduleData {
  const newSchedule = { ...scheduleData };
  const daySchedule = { ...newSchedule[day] };
  
  daySchedule.break_periods = breakPeriods;
  
  // 브레이크 시간에 해당하는 시간 슬롯의 직원들 제거
  const newTimeSlots: { [key: string]: number[] } = {};
  
  Object.keys(daySchedule.time_slots).forEach(slot => {
    if (!isBreakTime(slot, breakPeriods)) {
      newTimeSlots[slot] = daySchedule.time_slots[slot];
    }
  });
  
  daySchedule.time_slots = newTimeSlots;
  newSchedule[day] = daySchedule;
  
  return newSchedule;
}

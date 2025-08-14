// 스케줄 관련 타입 정의

export interface BreakPeriod {
  start: string; // "HH:MM" 형식
  end: string;   // "HH:MM" 형식
  name: string;  // 브레이크 이름 (예: "점심시간", "저녁시간")
}

export interface DaySchedule {
  is_open: boolean;
  open_time: string | null;  // "HH:MM" 형식
  close_time: string | null; // "HH:MM" 형식
  break_periods: BreakPeriod[];
  time_slots: { [timeSlot: string]: number[] }; // 시간슬롯별 employee_id 배열
}

export interface WeekScheduleData {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface WeeklyTemplateData {
  id: number;
  store_id: number;
  template_name: string;
  schedule_data: WeekScheduleData;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: number;
  owner_id: string;
  store_name: string;
  time_slot_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  store_id: number;
  name: string;
  position?: string;
  hourly_wage: number;
  is_active: boolean;
  phone?: string;
  start_date?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일'
};

export const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

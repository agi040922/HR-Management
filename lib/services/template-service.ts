// 템플릿 페이지 관련 비즈니스 로직 서비스

import { WeekScheduleData, DayOfWeek, DaySchedule, BreakPeriod } from '../types/schedule';
import { 
  updateDayOperatingHours,
  updateDayBreakPeriods,
  addEmployeeToTimeSlot,
  removeEmployeeFromTimeSlot
} from '../utils/schedule-utils';

/**
 * 템플릿 폼 데이터 인터페이스
 */
export interface TemplateFormData {
  template_name: string;
  schedule_data: WeekScheduleData;
}

/**
 * 템플릿 서비스 클래스
 */
export class TemplateService {
  /**
   * 폼 데이터 초기화
   */
  static createEmptyFormData(): TemplateFormData {
    return {
      template_name: '',
      schedule_data: this.createDefaultWeekSchedule()
    };
  }

  /**
   * 기본 주간 스케줄 생성
   */
  static createDefaultWeekSchedule(): WeekScheduleData {
    const workdaySchedule: DaySchedule = {
      is_open: true,
      open_time: '09:00',
      close_time: '18:00',
      break_periods: [{ start: '12:00', end: '13:00', name: '점심시간' }],
      time_slots: {}
    };

    const closedSchedule: DaySchedule = {
      is_open: false,
      open_time: null,
      close_time: null,
      break_periods: [],
      time_slots: {}
    };

    return {
      monday: { ...workdaySchedule },
      tuesday: { ...workdaySchedule },
      wednesday: { ...workdaySchedule },
      thursday: { ...workdaySchedule },
      friday: { ...workdaySchedule },
      saturday: { ...closedSchedule },
      sunday: { ...closedSchedule }
    };
  }

  /**
   * 요일 스케줄 업데이트
   */
  static updateDaySchedule(
    formData: TemplateFormData,
    day: DayOfWeek,
    updates: Partial<DaySchedule>
  ): TemplateFormData {
    return {
      ...formData,
      schedule_data: {
        ...formData.schedule_data,
        [day]: {
          ...formData.schedule_data[day],
          ...updates
        }
      }
    };
  }

  /**
   * 영업시간 변경 처리
   */
  static handleOperatingHoursChange(
    formData: TemplateFormData,
    day: DayOfWeek,
    openTime: string | null,
    closeTime: string | null,
    slotMinutes: number = 30
  ): TemplateFormData {
    const newScheduleData = updateDayOperatingHours(
      formData.schedule_data,
      day,
      openTime,
      closeTime,
      slotMinutes
    );

    return {
      ...formData,
      schedule_data: newScheduleData
    };
  }

  /**
   * 브레이크 시간 변경 처리
   */
  static handleBreakPeriodsChange(
    formData: TemplateFormData,
    day: DayOfWeek,
    breakPeriods: BreakPeriod[]
  ): TemplateFormData {
    const newScheduleData = updateDayBreakPeriods(formData.schedule_data, day, breakPeriods);

    return {
      ...formData,
      schedule_data: newScheduleData
    };
  }

  /**
   * 시간 슬롯에 직원 추가/제거 토글
   */
  static toggleEmployeeInSlot(
    formData: TemplateFormData,
    day: DayOfWeek,
    timeSlot: string,
    employeeId: number,
    slotMinutes: number = 30
  ): TemplateFormData {
    const currentEmployees = formData.schedule_data[day].time_slots[timeSlot] || [];
    let newScheduleData: WeekScheduleData;

    if (currentEmployees.includes(employeeId)) {
      newScheduleData = removeEmployeeFromTimeSlot(formData.schedule_data, day, timeSlot, employeeId);
    } else {
      newScheduleData = addEmployeeToTimeSlot(formData.schedule_data, day, timeSlot, employeeId, slotMinutes);
    }

    return {
      ...formData,
      schedule_data: newScheduleData
    };
  }

  /**
   * 템플릿 복사 데이터 생성
   */
  static createDuplicateFormData(
    originalTemplate: { template_name: string; schedule_data: WeekScheduleData }
  ): TemplateFormData {
    return {
      template_name: `${originalTemplate.template_name} (복사본)`,
      schedule_data: { ...originalTemplate.schedule_data }
    };
  }

  /**
   * 템플릿 편집 데이터 생성
   */
  static createEditFormData(
    template: { template_name: string; schedule_data: WeekScheduleData }
  ): TemplateFormData {
    return {
      template_name: template.template_name,
      schedule_data: { ...template.schedule_data }
    };
  }

  /**
   * 폼 데이터 유효성 검사
   */
  static validateFormData(formData: TemplateFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 템플릿 이름 검사
    if (!formData.template_name.trim()) {
      errors.push('템플릿 이름을 입력해주세요.');
    }

    if (formData.template_name.length > 100) {
      errors.push('템플릿 이름은 100자 이하로 입력해주세요.');
    }

    // 최소 하나의 영업일이 있는지 검사
    const hasOpenDay = Object.values(formData.schedule_data).some(day => day.is_open);
    if (!hasOpenDay) {
      errors.push('최소 하나의 영업일을 설정해주세요.');
    }

    // 영업일의 시간 설정 검사
    Object.entries(formData.schedule_data).forEach(([dayName, daySchedule]) => {
      if (daySchedule.is_open) {
        if (!daySchedule.open_time || !daySchedule.close_time) {
          errors.push(`${dayName}: 영업시간을 설정해주세요.`);
        } else if (daySchedule.open_time >= daySchedule.close_time) {
          errors.push(`${dayName}: 오픈 시간이 마감 시간보다 늦을 수 없습니다.`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 브레이크 시간 추가
   */
  static addBreakPeriod(
    formData: TemplateFormData,
    day: DayOfWeek,
    breakPeriod: BreakPeriod
  ): TemplateFormData {
    const currentBreaks = formData.schedule_data[day].break_periods;
    const newBreaks = [...currentBreaks, breakPeriod];

    return this.handleBreakPeriodsChange(formData, day, newBreaks);
  }

  /**
   * 브레이크 시간 제거
   */
  static removeBreakPeriod(
    formData: TemplateFormData,
    day: DayOfWeek,
    breakIndex: number
  ): TemplateFormData {
    const currentBreaks = formData.schedule_data[day].break_periods;
    const newBreaks = currentBreaks.filter((_, index) => index !== breakIndex);

    return this.handleBreakPeriodsChange(formData, day, newBreaks);
  }

  /**
   * 브레이크 시간 수정
   */
  static updateBreakPeriod(
    formData: TemplateFormData,
    day: DayOfWeek,
    breakIndex: number,
    updatedBreak: BreakPeriod
  ): TemplateFormData {
    const currentBreaks = formData.schedule_data[day].break_periods;
    const newBreaks = currentBreaks.map((breakPeriod, index) => 
      index === breakIndex ? updatedBreak : breakPeriod
    );

    return this.handleBreakPeriodsChange(formData, day, newBreaks);
  }

  /**
   * 시간 슬롯에서 모든 직원 제거
   */
  static clearTimeSlot(
    formData: TemplateFormData,
    day: DayOfWeek,
    timeSlot: string
  ): TemplateFormData {
    const newScheduleData = {
      ...formData.schedule_data,
      [day]: {
        ...formData.schedule_data[day],
        time_slots: {
          ...formData.schedule_data[day].time_slots,
          [timeSlot]: []
        }
      }
    };

    // 빈 배열인 경우 해당 시간 슬롯 삭제
    if (newScheduleData[day].time_slots[timeSlot].length === 0) {
      delete newScheduleData[day].time_slots[timeSlot];
    }

    return {
      ...formData,
      schedule_data: newScheduleData
    };
  }

  /**
   * 요일 전체 복사
   */
  static copyDaySchedule(
    formData: TemplateFormData,
    fromDay: DayOfWeek,
    toDay: DayOfWeek
  ): TemplateFormData {
    const sourceSchedule = formData.schedule_data[fromDay];

    return {
      ...formData,
      schedule_data: {
        ...formData.schedule_data,
        [toDay]: { ...sourceSchedule }
      }
    };
  }
}

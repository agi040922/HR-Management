// 근무 스케줄 관련 API 함수들

import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 근무 스케줄 인터페이스 (DB 스키마와 완전 일치)
export interface WorkSchedule {
  id?: number; // BIGSERIAL PRIMARY KEY
  employee_id: number; // BIGINT NOT NULL REFERENCES employees(id)
  store_id: number; // INTEGER REFERENCES store_settings(id)
  date: string; // DATE NOT NULL (YYYY-MM-DD 형식)
  start_time: string; // TIME NOT NULL (HH:MM 형식)
  end_time: string; // TIME NOT NULL (HH:MM 형식)
  break_time: number; // INTEGER DEFAULT 0 (분 단위)
  is_overtime: boolean; // BOOLEAN DEFAULT false
  is_night_shift: boolean; // BOOLEAN DEFAULT false
  created_at?: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at?: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  // 조인된 데이터 (employees 테이블)
  employee?: {
    id: number; // BIGSERIAL PRIMARY KEY
    name: string; // VARCHAR(50) NOT NULL
    position?: string; // VARCHAR(50)
    hourly_wage: number; // INTEGER NOT NULL DEFAULT 10030
    phone?: string; // VARCHAR(20)
    start_date?: string; // DATE NOT NULL DEFAULT CURRENT_DATE
    is_active?: boolean; // BOOLEAN NOT NULL DEFAULT true
  };
}

// 스케줄 요약 인터페이스
export interface ScheduleSummary {
  date: string;
  total_employees: number;
  total_hours: number;
  schedules: WorkSchedule[];
}

/**
 * 특정 날짜 범위의 근무 스케줄 조회
 * @param storeId 스토어 ID
 * @param startDate 시작 날짜 (YYYY-MM-DD)
 * @param endDate 종료 날짜 (YYYY-MM-DD)
 * @returns 근무 스케줄 배열
 */
export async function getWorkSchedules(
  storeId: number, 
  startDate: string, 
  endDate: string
): Promise<WorkSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('work_schedules')
      .select(`
        *,
        employee:employees(
          id,
          name,
          position,
          hourly_wage
        )
      `)
      .eq('store_id', storeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('근무 스케줄 조회 오류:', error);
      throw new Error(`근무 스케줄 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('근무 스케줄 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 특정 날짜의 근무 스케줄 조회
 * @param storeId 스토어 ID
 * @param date 날짜 (YYYY-MM-DD)
 * @returns 해당 날짜의 근무 스케줄 배열
 */
export async function getDayWorkSchedules(
  storeId: number, 
  date: string
): Promise<WorkSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('work_schedules')
      .select(`
        *,
        employee:employees(
          id,
          name,
          position,
          hourly_wage
        )
      `)
      .eq('store_id', storeId)
      .eq('date', date)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('일일 근무 스케줄 조회 오류:', error);
      throw new Error(`일일 근무 스케줄 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('일일 근무 스케줄 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 새로운 근무 스케줄 생성
 * @param scheduleData 근무 스케줄 데이터
 * @returns 생성된 근무 스케줄
 */
export async function createWorkSchedule(
  scheduleData: Omit<WorkSchedule, 'id' | 'created_at' | 'updated_at'>
): Promise<WorkSchedule> {
  try {
    // 현재 사용자 인증 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    // 해당 직원이 사용자 소유인지 확인
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, owner_id')
      .eq('id', scheduleData.employee_id)
      .eq('owner_id', user.id)
      .single();

    if (employeeError || !employee) {
      throw new Error('해당 직원에 대한 권한이 없습니다.');
    }

    const { data, error } = await supabase
      .from('work_schedules')
      .insert([scheduleData])
      .select(`
        *,
        employee:employees(
          id,
          name,
          position,
          hourly_wage
        )
      `)
      .single();

    if (error) {
      console.error('근무 스케줄 생성 오류:', error);
      throw new Error(`근무 스케줄 생성 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('근무 스케줄 생성 중 예외:', error);
    throw error;
  }
}

/**
 * 근무 스케줄 수정
 * @param scheduleId 스케줄 ID
 * @param scheduleData 수정할 스케줄 데이터
 * @returns 수정된 근무 스케줄
 */
export async function updateWorkSchedule(
  scheduleId: number,
  scheduleData: Partial<Omit<WorkSchedule, 'id' | 'created_at' | 'updated_at'>>
): Promise<WorkSchedule> {
  try {
    // 현재 사용자 인증 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('work_schedules')
      .update(scheduleData)
      .eq('id', scheduleId)
      .select(`
        *,
        employee:employees(
          id,
          name,
          position,
          hourly_wage
        )
      `)
      .single();

    if (error) {
      console.error('근무 스케줄 수정 오류:', error);
      throw new Error(`근무 스케줄 수정 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('근무 스케줄 수정 중 예외:', error);
    throw error;
  }
}

/**
 * 근무 스케줄 삭제
 * @param scheduleId 스케줄 ID
 * @returns 성공 여부
 */
export async function deleteWorkSchedule(scheduleId: number): Promise<boolean> {
  try {
    // 현재 사용자 인증 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const { error } = await supabase
      .from('work_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      console.error('근무 스케줄 삭제 오류:', error);
      throw new Error(`근무 스케줄 삭제 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('근무 스케줄 삭제 중 예외:', error);
    throw error;
  }
}

/**
 * 주간 스케줄 요약 조회
 * @param storeId 스토어 ID
 * @param startDate 주 시작 날짜 (YYYY-MM-DD)
 * @returns 주간 스케줄 요약
 */
export async function getWeeklyScheduleSummary(
  storeId: number, 
  startDate: string
): Promise<ScheduleSummary[]> {
  try {
    // 주 시작일부터 7일간의 데이터 조회
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const schedules = await getWorkSchedules(
      storeId, 
      startDate, 
      endDate.toISOString().split('T')[0]
    );

    // 날짜별로 그룹화
    const groupedByDate = schedules.reduce((acc, schedule) => {
      const date = schedule.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(schedule);
      return acc;
    }, {} as Record<string, WorkSchedule[]>);

    // 요약 데이터 생성
    const summary: ScheduleSummary[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const daySchedules = groupedByDate[dateStr] || [];
      const totalHours = daySchedules.reduce((sum, schedule) => {
        const startTime = new Date(`1970-01-01T${schedule.start_time}`);
        const endTime = new Date(`1970-01-01T${schedule.end_time}`);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return sum + hours - (schedule.break_time / 60);
      }, 0);

      summary.push({
        date: dateStr,
        total_employees: daySchedules.length,
        total_hours: Math.round(totalHours * 100) / 100,
        schedules: daySchedules
      });
    }

    return summary;
  } catch (error) {
    console.error('주간 스케줄 요약 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 직원별 근무 스케줄 조회
 * @param employeeId 직원 ID
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 해당 직원의 근무 스케줄
 */
export async function getEmployeeSchedules(
  employeeId: number,
  startDate: string,
  endDate: string
): Promise<WorkSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('work_schedules')
      .select(`
        *,
        employee:employees(
          id,
          name,
          position,
          hourly_wage
        )
      `)
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('직원 스케줄 조회 오류:', error);
      throw new Error(`직원 스케줄 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('직원 스케줄 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 스케줄 충돌 검사
 * @param employeeId 직원 ID
 * @param date 날짜
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @param excludeScheduleId 제외할 스케줄 ID (수정 시)
 * @returns 충돌 여부
 */
export async function checkScheduleConflict(
  employeeId: number,
  date: string,
  startTime: string,
  endTime: string,
  excludeScheduleId?: number
): Promise<boolean> {
  try {
    let query = supabase
      .from('work_schedules')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

    if (excludeScheduleId) {
      query = query.neq('id', excludeScheduleId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('스케줄 충돌 검사 오류:', error);
      throw new Error(`스케줄 충돌 검사 실패: ${error.message}`);
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('스케줄 충돌 검사 중 예외:', error);
    throw error;
  }
}

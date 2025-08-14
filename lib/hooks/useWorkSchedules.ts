// 근무 스케줄 관리 React Hook

import { useState, useEffect, useCallback } from 'react';
import {
  WorkSchedule,
  ScheduleSummary,
  getWorkSchedules,
  getDayWorkSchedules,
  createWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule,
  getWeeklyScheduleSummary,
  getEmployeeSchedules,
  checkScheduleConflict
} from '../api/work-schedule-api';
import { getStoreEmployees, Employee } from '../api/schedule-api';

export interface UseWorkSchedulesReturn {
  // 상태
  schedules: WorkSchedule[];
  weeklySummary: ScheduleSummary[];
  availableEmployees: Employee[];
  loading: boolean;
  error: string | null;
  
  // 액션
  loadSchedules: (storeId: number, startDate: string, endDate: string) => Promise<void>;
  loadDaySchedules: (storeId: number, date: string) => Promise<void>;
  loadWeeklySummary: (storeId: number, startDate: string) => Promise<void>;
  loadAvailableEmployees: (storeId: number) => Promise<void>;
  addSchedule: (scheduleData: Omit<WorkSchedule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editSchedule: (scheduleId: number, scheduleData: Partial<Omit<WorkSchedule, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  removeSchedule: (scheduleId: number) => Promise<void>;
  checkConflict: (employeeId: number, date: string, startTime: string, endTime: string, excludeScheduleId?: number) => Promise<boolean>;
  
  // 유틸리티
  getEmployeeSchedules: (employeeId: number, startDate: string, endDate: string) => Promise<WorkSchedule[]>;
  clearError: () => void;
}

export function useWorkSchedules(): UseWorkSchedulesReturn {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<ScheduleSummary[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 스케줄 목록 로드
  const loadSchedules = useCallback(async (storeId: number, startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkSchedules(storeId, startDate, endDate);
      setSchedules(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스케줄 로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('스케줄 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 일일 스케줄 로드
  const loadDaySchedules = useCallback(async (storeId: number, date: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDayWorkSchedules(storeId, date);
      setSchedules(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일일 스케줄 로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('일일 스케줄 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 주간 요약 로드
  const loadWeeklySummary = useCallback(async (storeId: number, startDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeeklyScheduleSummary(storeId, startDate);
      setWeeklySummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '주간 요약 로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('주간 요약 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용 가능한 직원 목록 로드
  const loadAvailableEmployees = useCallback(async (storeId: number) => {
    try {
      setError(null);
      const data = await getStoreEmployees(storeId);
      // 활성 상태인 직원만 필터링
      const activeEmployees = data.filter((emp: Employee) => emp.is_active);
      setAvailableEmployees(activeEmployees);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직원 목록 로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('직원 목록 로드 오류:', err);
    }
  }, []);

  // 스케줄 추가
  const addSchedule = useCallback(async (scheduleData: Omit<WorkSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      // 스케줄 충돌 검사
      const hasConflict = await checkScheduleConflict(
        scheduleData.employee_id,
        scheduleData.date,
        scheduleData.start_time,
        scheduleData.end_time
      );

      if (hasConflict) {
        throw new Error('해당 시간에 이미 다른 스케줄이 있습니다.');
      }

      const newSchedule = await createWorkSchedule(scheduleData);
      setSchedules(prev => [...prev, newSchedule].sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.start_time.localeCompare(b.start_time);
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스케줄 추가 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('스케줄 추가 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 스케줄 수정
  const editSchedule = useCallback(async (
    scheduleId: number, 
    scheduleData: Partial<Omit<WorkSchedule, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // 시간 변경이 있는 경우 충돌 검사
      if (scheduleData.employee_id && scheduleData.date && scheduleData.start_time && scheduleData.end_time) {
        const hasConflict = await checkScheduleConflict(
          scheduleData.employee_id,
          scheduleData.date,
          scheduleData.start_time,
          scheduleData.end_time,
          scheduleId
        );

        if (hasConflict) {
          throw new Error('해당 시간에 이미 다른 스케줄이 있습니다.');
        }
      }

      const updatedSchedule = await updateWorkSchedule(scheduleId, scheduleData);
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId ? updatedSchedule : schedule
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스케줄 수정 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('스케줄 수정 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 스케줄 삭제
  const removeSchedule = useCallback(async (scheduleId: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteWorkSchedule(scheduleId);
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스케줄 삭제 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('스케줄 삭제 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 스케줄 충돌 검사
  const checkConflict = useCallback(async (
    employeeId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeScheduleId?: number
  ): Promise<boolean> => {
    try {
      return await checkScheduleConflict(employeeId, date, startTime, endTime, excludeScheduleId);
    } catch (err) {
      console.error('충돌 검사 오류:', err);
      return false;
    }
  }, []);

  // 직원별 스케줄 조회
  const getEmployeeSchedulesCallback = useCallback(async (
    employeeId: number,
    startDate: string,
    endDate: string
  ): Promise<WorkSchedule[]> => {
    try {
      return await getEmployeeSchedules(employeeId, startDate, endDate);
    } catch (err) {
      console.error('직원 스케줄 조회 오류:', err);
      return [];
    }
  }, []);

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    schedules,
    weeklySummary,
    availableEmployees,
    loading,
    error,
    
    // 액션
    loadSchedules,
    loadDaySchedules,
    loadWeeklySummary,
    loadAvailableEmployees,
    addSchedule,
    editSchedule,
    removeSchedule,
    checkConflict,
    
    // 유틸리티
    getEmployeeSchedules: getEmployeeSchedulesCallback,
    clearError
  };
}

// 스케줄 템플릿 관리를 위한 React Hook

import { useState, useEffect, useCallback } from 'react';
import { WeeklyTemplateData, WeekScheduleData, StoreSettings, Employee } from '../types/schedule';
import {
  getScheduleTemplates,
  createScheduleTemplate,
  updateScheduleTemplate,
  toggleScheduleTemplateStatus,
  deleteScheduleTemplate,
  getStoreSettings,
  getUserStores,
  getStoreEmployees,
  createDefaultScheduleTemplate,
  getEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus
} from '../api/schedule-api';
import { createDefaultWeekSchedule } from '../utils/schedule-utils';

export interface UseScheduleTemplatesReturn {
  // 상태
  templates: WeeklyTemplateData[];
  stores: StoreSettings[];
  employees: Employee[];
  currentStore: StoreSettings | null;
  selectedStore: StoreSettings | null; // 호환성을 위한 별칭
  loading: boolean;
  error: string | null;
  
  // 액션
  loadTemplates: (storeId: number) => Promise<void>;
  loadStores: (userId: string) => Promise<void>;
  loadEmployees: (storeId: number) => Promise<void>;
  setCurrentStore: (store: StoreSettings | null) => void;
  setSelectedStore: (store: StoreSettings | null) => void; // 호환성을 위한 별칭
  createTemplate: (storeId: number, templateName: string, scheduleData?: WeekScheduleData) => Promise<number>;
  updateTemplate: (templateId: number, templateName: string, scheduleData: WeekScheduleData) => Promise<void>;
  toggleTemplateStatus: (templateId: number, isActive: boolean) => Promise<void>;
  removeTemplate: (templateId: number) => Promise<void>;
  createDefaultTemplate: (storeId: number, templateName?: string) => Promise<number>;
  // 직원 관리 액션
  addEmployee: (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<Employee>;
  editEmployee: (employeeId: number, employeeData: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>) => Promise<Employee>;
  toggleEmployee: (employeeId: number, isActive: boolean) => Promise<void>;
  clearError: () => void;
}

export function useScheduleTemplates(): UseScheduleTemplatesReturn {
  const [templates, setTemplates] = useState<WeeklyTemplateData[]>([]);
  const [stores, setStores] = useState<StoreSettings[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentStore, setCurrentStore] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 스케줄 템플릿 목록 로드
   */
  const loadTemplates = useCallback(async (storeId: number) => {
    try {
      setLoading(true);
      clearError();
      
      const templatesData = await getScheduleTemplates(storeId);
      setTemplates(templatesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스케줄 템플릿 로드 실패';
      setError(errorMessage);
      console.error('템플릿 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  /**
   * 사용자 스토어 목록 로드
   */
  const loadStores = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      clearError();
      
      const storesData = await getUserStores(userId);
      setStores(storesData);
      
      // 첫 번째 스토어를 현재 스토어로 설정 (스토어가 있는 경우)
      if (storesData.length > 0 && !currentStore) {
        setCurrentStore(storesData[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스토어 목록 로드 실패';
      setError(errorMessage);
      console.error('스토어 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStore, clearError]);

  /**
   * 스토어 직원 목록 로드
   */
  const loadEmployees = useCallback(async (storeId: number) => {
    try {
      setLoading(true);
      clearError();
      
      const employeesData = await getStoreEmployees(storeId);
      setEmployees(employeesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직원 목록 로드 실패';
      setError(errorMessage);
      console.error('직원 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  /**
   * 새 템플릿 생성
   */
  const createTemplate = useCallback(async (
    storeId: number,
    templateName: string,
    scheduleData?: WeekScheduleData
  ): Promise<number> => {
    try {
      setLoading(true);
      clearError();
      
      const finalScheduleData = scheduleData || createDefaultWeekSchedule();
      const templateId = await createScheduleTemplate(storeId, templateName, finalScheduleData);
      
      // 템플릿 목록 새로고침
      await loadTemplates(storeId);
      
      return templateId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '템플릿 생성 실패';
      setError(errorMessage);
      console.error('템플릿 생성 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemplates, clearError]);

  /**
   * 템플릿 업데이트
   */
  const updateTemplate = useCallback(async (
    templateId: number,
    templateName: string,
    scheduleData: WeekScheduleData
  ) => {
    try {
      setLoading(true);
      clearError();
      
      await updateScheduleTemplate(templateId, templateName, scheduleData);
      
      // 로컬 상태 업데이트
      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, template_name: templateName, schedule_data: scheduleData }
          : template
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '템플릿 업데이트 실패';
      setError(errorMessage);
      console.error('템플릿 업데이트 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  /**
   * 템플릿 활성/비활성 상태 변경
   */
  const toggleTemplateStatus = useCallback(async (templateId: number, isActive: boolean) => {
    try {
      setLoading(true);
      clearError();
      
      await toggleScheduleTemplateStatus(templateId, isActive);
      
      // 로컬 상태 업데이트
      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, is_active: isActive }
          : template
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '템플릿 상태 변경 실패';
      setError(errorMessage);
      console.error('템플릿 상태 변경 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  /**
   * 템플릿 삭제
   */
  const removeTemplate = useCallback(async (templateId: number) => {
    try {
      setLoading(true);
      clearError();
      
      await deleteScheduleTemplate(templateId);
      
      // 로컬 상태에서 제거
      setTemplates(prev => prev.filter(template => template.id !== templateId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '템플릿 삭제 실패';
      setError(errorMessage);
      console.error('템플릿 삭제 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  /**
   * 기본 템플릿 생성 (DB 함수 사용)
   */
  const createDefaultTemplate = useCallback(async (
    storeId: number,
    templateName: string = '기본 템플릿'
  ): Promise<number> => {
    try {
      setLoading(true);
      clearError();
      
      const templateId = await createDefaultScheduleTemplate(storeId, templateName);
      
      // 템플릿 목록 새로고침
      await loadTemplates(storeId);
      
      return templateId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '기본 템플릿 생성 실패';
      setError(errorMessage);
      console.error('기본 템플릿 생성 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemplates, clearError]);

  /**
   * 직원 추가
   */
  const addEmployee = useCallback(async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      clearError();
      
      const newEmployee = await createEmployee(employeeData);
      
      // 로컬 상태 업데이트
      setEmployees(prev => [...prev, newEmployee]);
      
      return newEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직원 추가 실패';
      setError(errorMessage);
      console.error('직원 추가 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  /**
   * 직원 정보 수정
   */
  const editEmployee = useCallback(async (
    employeeId: number, 
    employeeData: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setLoading(true);
      clearError();
      
      const updatedEmployee = await updateEmployee(employeeId, employeeData);
      
      // 로컬 상태 업데이트
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? updatedEmployee : emp
      ));
      
      return updatedEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직원 정보 수정 실패';
      setError(errorMessage);
      console.error('직원 정보 수정 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  /**
   * 직원 활성/비활성 상태 변경
   */
  const toggleEmployee = useCallback(async (employeeId: number, isActive: boolean) => {
    try {
      setLoading(true);
      clearError();
      
      await toggleEmployeeStatus(employeeId, isActive);
      
      // 로컬 상태 업데이트
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, is_active: isActive } : emp
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직원 상태 변경 실패';
      setError(errorMessage);
      console.error('직원 상태 변경 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  return {
    // 상태
    templates,
    stores,
    employees,
    currentStore,
    selectedStore: currentStore, // 호환성을 위한 별칭
    loading,
    error,
    
    // 액션
    loadTemplates,
    loadStores,
    loadEmployees,
    setCurrentStore,
    setSelectedStore: setCurrentStore, // 호환성을 위한 별칭
    createTemplate,
    updateTemplate,
    toggleTemplateStatus,
    removeTemplate,
    createDefaultTemplate,
    // 직원 관리 액션
    addEmployee,
    editEmployee,
    toggleEmployee,
    clearError
  };
}

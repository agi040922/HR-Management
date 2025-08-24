// 스토어 관련 API 함수들
import { supabase } from '@/lib/supabase';

// 타입 정의
export interface StoreWithDetails {
  id: number;
  owner_id: string;
  store_name: string;
  time_slot_minutes: number;
  created_at: string;
  updated_at: string;
  templates_count: number;
  employees_count: number;
  active_employees_count: number;
}

export interface StoreTemplate {
  id: number;
  store_id: number;
  template_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  schedule_data: any;
}

export interface StoreEmployee {
  id: number;
  store_id: number;
  name: string;
  position?: string;
  hourly_wage?: number;
  start_date: string;
  is_active: boolean;
  labor_contract?: any | null;
  created_at: string;
  updated_at: string;
}

/**
 * 사용자의 모든 스토어와 관련 통계 조회
 */
export async function getStoresWithDetails(userId: string): Promise<StoreWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select(`
        *,
        templates:weekly_schedule_templates(count),
        employees:employees(count),
        active_employees:employees!inner(count)
      `)
      .eq('owner_id', userId)
      .eq('active_employees.is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('스토어 상세 정보 조회 오류:', error);
      throw new Error(`스토어 상세 정보 조회 실패: ${error.message}`);
    }

    // 데이터 변환
    return (data || []).map(store => ({
      ...store,
      templates_count: store.templates?.[0]?.count || 0,
      employees_count: store.employees?.[0]?.count || 0,
      active_employees_count: store.active_employees?.[0]?.count || 0,
    }));
  } catch (error) {
    console.error('스토어 상세 정보 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 특정 스토어의 템플릿 목록 조회
 */
export async function getStoreTemplates(storeId: number): Promise<StoreTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('스토어 템플릿 조회 오류:', error);
      throw new Error(`스토어 템플릿 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('스토어 템플릿 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 특정 스토어의 직원 목록 조회
 */
export async function getStoreEmployees(storeId: number): Promise<StoreEmployee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('스토어 직원 조회 오류:', error);
      throw new Error(`스토어 직원 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('스토어 직원 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 새 스토어 생성
 */
export async function createStore(
  userId: string,
  storeData: Pick<StoreWithDetails, 'store_name' | 'time_slot_minutes'>
): Promise<StoreWithDetails> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .insert({
        owner_id: userId,
        store_name: storeData.store_name,
        time_slot_minutes: storeData.time_slot_minutes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('스토어 생성 오류:', error);
      throw new Error(`스토어 생성 실패: ${error.message}`);
    }

    // 생성된 스토어에 기본 통계 추가
    return {
      ...data,
      templates_count: 0,
      employees_count: 0,
      active_employees_count: 0
    };
  } catch (error) {
    console.error('스토어 생성 중 예외:', error);
    throw error;
  }
}

/**
 * 스토어 기본 정보 업데이트
 */
export async function updateStoreSettings(
  storeId: number, 
  updates: Partial<Pick<StoreWithDetails, 'store_name' | 'time_slot_minutes'>>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('store_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId);

    if (error) {
      console.error('스토어 설정 업데이트 오류:', error);
      throw new Error(`스토어 설정 업데이트 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('스토어 설정 업데이트 중 예외:', error);
    throw error;
  }
}

/**
 * 스토어 삭제 (관련 데이터 모두 삭제)
 */
export async function deleteStore(storeId: number): Promise<void> {
  try {
    // 트랜잭션으로 관련 데이터 모두 삭제
    const { error } = await supabase
      .from('store_settings')
      .delete()
      .eq('id', storeId);

    if (error) {
      console.error('스토어 삭제 오류:', error);
      throw new Error(`스토어 삭제 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('스토어 삭제 중 예외:', error);
    throw error;
  }
}

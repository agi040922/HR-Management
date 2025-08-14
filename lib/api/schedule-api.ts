// 스케줄 템플릿 관련 API 함수들

import { createClient } from '@supabase/supabase-js';
import { WeeklyTemplateData, WeekScheduleData, StoreSettings, Employee } from '../types/schedule';

// Employee 타입을 다시 export (다른 모듈에서 사용할 수 있도록)
export type { Employee };

// Supabase 클라이언트는 실제 환경에서는 환경변수에서 가져와야 함
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);



/**
 * 스토어의 모든 스케줄 템플릿 조회
 * @param storeId 스토어 ID
 * @returns 스케줄 템플릿 배열
 */
export async function getScheduleTemplates(storeId: number): Promise<WeeklyTemplateData[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('스케줄 템플릿 조회 오류:', error);
      throw new Error(`스케줄 템플릿 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('스케줄 템플릿 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 특정 스케줄 템플릿 조회
 * @param templateId 템플릿 ID
 * @returns 스케줄 템플릿 데이터
 */
export async function getScheduleTemplate(templateId: number): Promise<WeeklyTemplateData | null> {
  try {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 데이터 없음
      }
      console.error('스케줄 템플릿 조회 오류:', error);
      throw new Error(`스케줄 템플릿 조회 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('스케줄 템플릿 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 새로운 스케줄 템플릿 생성
 * @param storeId 스토어 ID
 * @param templateName 템플릿 이름
 * @param scheduleData 스케줄 데이터
 * @returns 생성된 템플릿 ID
 */
export async function createScheduleTemplate(
  storeId: number,
  templateName: string,
  scheduleData: WeekScheduleData
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('weekly_schedule_templates')
      .insert({
        store_id: storeId,
        template_name: templateName,
        schedule_data: scheduleData,
        is_active: true
      })
      .select('id')
      .single();

    if (error) {
      console.error('스케줄 템플릿 생성 오류:', error);
      throw new Error(`스케줄 템플릿 생성 실패: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('스케줄 템플릿 생성 중 예외:', error);
    throw error;
  }
}

/**
 * 스케줄 템플릿 업데이트
 * @param templateId 템플릿 ID
 * @param templateName 템플릿 이름
 * @param scheduleData 스케줄 데이터
 * @returns 성공 여부
 */
export async function updateScheduleTemplate(
  templateId: number,
  templateName: string,
  scheduleData: WeekScheduleData
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('weekly_schedule_templates')
      .update({
        template_name: templateName,
        schedule_data: scheduleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) {
      console.error('스케줄 템플릿 업데이트 오류:', error);
      throw new Error(`스케줄 템플릿 업데이트 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('스케줄 템플릿 업데이트 중 예외:', error);
    throw error;
  }
}

/**
 * 스케줄 템플릿 활성/비활성 상태 변경
 * @param templateId 템플릿 ID
 * @param isActive 활성 상태
 * @returns 성공 여부
 */
export async function toggleScheduleTemplateStatus(templateId: number, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('weekly_schedule_templates')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) {
      console.error('스케줄 템플릿 상태 변경 오류:', error);
      throw new Error(`스케줄 템플릿 상태 변경 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('스케줄 템플릿 상태 변경 중 예외:', error);
    throw error;
  }
}

/**
 * 스케줄 템플릿 삭제
 * @param templateId 템플릿 ID
 * @returns 성공 여부
 */
export async function deleteScheduleTemplate(templateId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('weekly_schedule_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('스케줄 템플릿 삭제 오류:', error);
      throw new Error(`스케줄 템플릿 삭제 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('스케줄 템플릿 삭제 중 예외:', error);
    throw error;
  }
}

// ========================
// 직원 관리 API 함수들
// ========================

/**
 * 스토어의 모든 직원 조회
 * @param storeId 스토어 ID
 * @returns 직원 배열
 */
export async function getEmployees(storeId: number): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('store_id', storeId)
      .order('name', { ascending: true });

    if (error) {
      console.error('직원 목록 조회 오류:', error);
      throw new Error(`직원 목록 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('직원 목록 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 새 직원 생성
 * @param employeeData 직원 데이터
 * @returns 생성된 직원 데이터
 */
export async function createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
  try {
    // 현재 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    // owner_id를 현재 사용자 ID로 설정
    const employeeDataWithOwner = {
      ...employeeData,
      owner_id: user.id
    };

    const { data, error } = await supabase
      .from('employees')
      .insert([employeeDataWithOwner])
      .select()
      .single();

    if (error) {
      console.error('직원 생성 오류:', error);
      throw new Error(`직원 생성 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('직원 생성 중 예외:', error);
    throw error;
  }
}

/**
 * 직원 정보 수정
 * @param employeeId 직원 ID
 * @param employeeData 수정할 직원 데이터
 * @returns 수정된 직원 데이터
 */
export async function updateEmployee(
  employeeId: number, 
  employeeData: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>
): Promise<Employee> {
  try {
    // 현재 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    // owner_id가 포함되지 않은 경우 현재 사용자 ID로 설정
    const employeeDataWithOwner = {
      ...employeeData,
      ...(employeeData.owner_id ? {} : { owner_id: user.id })
    };

    const { data, error } = await supabase
      .from('employees')
      .update(employeeDataWithOwner)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      console.error('직원 정보 수정 오류:', error);
      throw new Error(`직원 정보 수정 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('직원 정보 수정 중 예외:', error);
    throw error;
  }
}

/**
 * 직원 활성/비활성 상태 변경
 * @param employeeId 직원 ID
 * @param isActive 활성 상태
 * @returns 성공 여부
 */
export async function toggleEmployeeStatus(employeeId: number, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: isActive })
      .eq('id', employeeId);

    if (error) {
      console.error('직원 상태 변경 오류:', error);
      throw new Error(`직원 상태 변경 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('직원 상태 변경 중 예외:', error);
    throw error;
  }
}

/**
 * 직원 삭제 (실제로는 비활성화)
 * @param employeeId 직원 ID
 * @returns 성공 여부
 */
export async function deleteEmployee(employeeId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', employeeId);

    if (error) {
      console.error('직원 삭제 오류:', error);
      throw new Error(`직원 삭제 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('직원 삭제 중 예외:', error);
    throw error;
  }
}

/**
 * 스토어 설정 조회
 * @param storeId 스토어 ID
 * @returns 스토어 설정
 */
export async function getStoreSettings(storeId: number): Promise<StoreSettings | null> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 데이터 없음
      }
      console.error('스토어 설정 조회 오류:', error);
      throw new Error(`스토어 설정 조회 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('스토어 설정 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 사용자의 모든 스토어 조회
 * @param userId 사용자 ID
 * @returns 스토어 설정 배열
 */
export async function getUserStores(userId: string): Promise<StoreSettings[]> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('사용자 스토어 조회 오류:', error);
      throw new Error(`사용자 스토어 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('사용자 스토어 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 스토어의 직원 목록 조회
 * @param storeId 스토어 ID
 * @returns 직원 배열
 */
export async function getStoreEmployees(storeId: number): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('직원 목록 조회 오류:', error);
      throw new Error(`직원 목록 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('직원 목록 조회 중 예외:', error);
    throw error;
  }
}

/**
 * 기본 스케줄 템플릿 생성 (DB 함수 호출)
 * @param storeId 스토어 ID
 * @param templateName 템플릿 이름
 * @returns 생성된 템플릿 ID
 */
export async function createDefaultScheduleTemplate(
  storeId: number,
  templateName: string = '기본 템플릿'
): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('create_default_schedule_template', {
        p_store_id: storeId,
        p_template_name: templateName
      });

    if (error) {
      console.error('기본 스케줄 템플릿 생성 오류:', error);
      throw new Error(`기본 스케줄 템플릿 생성 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('기본 스케줄 템플릿 생성 중 예외:', error);
    throw error;
  }
}

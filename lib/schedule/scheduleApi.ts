// 스케줄 관련 API 함수들

import { supabase } from '@/lib/supabase';
import { StoreSettings, WeeklyTemplate, Employee, createDefaultScheduleData } from './scheduleUtils';

// 스토어 목록 로드
export const loadStores = async (userId: string): Promise<StoreSettings[]> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('owner_id', userId);
  
  if (error) throw error;
  return data || [];
};

// 템플릿 목록 로드
export const loadTemplates = async (storeId: number): Promise<WeeklyTemplate[]> => {
  const { data, error } = await supabase
    .from('weekly_schedule_templates')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// 직원 목록 로드
export const loadEmployees = async (storeId: number): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data || [];
};

// 기본 템플릿 생성
export const createDefaultTemplate = async (storeId: number): Promise<WeeklyTemplate> => {
  const defaultSchedule = createDefaultScheduleData();

  const { data, error } = await supabase
    .from('weekly_schedule_templates')
    .insert({
      store_id: storeId,
      template_name: '기본 템플릿',
      schedule_data: defaultSchedule,
      is_active: true
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// 스케줄 저장
export const saveSchedule = async (templateId: number, scheduleData: any): Promise<void> => {
  const { error } = await supabase
    .from('weekly_schedule_templates')
    .update({ schedule_data: scheduleData })
    .eq('id', templateId);
  
  if (error) throw error;
};

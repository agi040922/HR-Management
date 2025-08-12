-- 스토어 소유권 추가
-- 생성일: 2025-08-07 15:28:57

-- 1. store_settings 테이블에 owner_id 컬럼 추가
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 기존 테이블들에 store_id 추가 (멀티 스토어 지원)
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS store_id INTEGER REFERENCES public.store_settings(id) ON DELETE SET NULL;

ALTER TABLE public.work_schedules 
ADD COLUMN IF NOT EXISTS store_id INTEGER REFERENCES public.store_settings(id) ON DELETE CASCADE;

ALTER TABLE public.weekly_schedule_templates 
ADD COLUMN IF NOT EXISTS store_id INTEGER REFERENCES public.store_settings(id) ON DELETE CASCADE;

ALTER TABLE public.schedule_exceptions 
ADD COLUMN IF NOT EXISTS store_id INTEGER REFERENCES public.store_settings(id) ON DELETE CASCADE;

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_store_settings_owner_id ON public.store_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_store_id ON public.employees(store_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_store_id ON public.work_schedules(store_id);
CREATE INDEX IF NOT EXISTS idx_weekly_schedule_templates_store_id ON public.weekly_schedule_templates(store_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_store_id ON public.schedule_exceptions(store_id);

-- 4. RLS (Row Level Security) 정책 설정
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 스토어 소유자만 접근 가능
CREATE POLICY "Users can view their own stores" ON public.store_settings
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own stores" ON public.store_settings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own stores" ON public.store_settings
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own stores" ON public.store_settings
  FOR DELETE USING (auth.uid() = owner_id);

-- 5. 기존 데이터에 대한 기본값 설정 (필요시)
-- 만약 기존 데이터가 있다면 첫 번째 사용자에게 할당하거나 별도 처리 필요

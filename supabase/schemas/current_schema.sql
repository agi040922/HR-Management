-- 아르바이트 관리 시스템 현재 스키마 상태
-- 최종 업데이트: 2025-08-20
-- 주요 변경: 직원 중심 스케줄 시스템으로 변경, time_slots 구조 개선
-- 스토어 소유권 시스템 추가, 멀티 스토어 지원, RLS 정책 적용

-- 직원 테이블
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES public.store_settings(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  hourly_wage INTEGER NOT NULL DEFAULT 10030,
  position VARCHAR(50),
  phone VARCHAR(20),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 근무 스케줄 테이블
CREATE TABLE work_schedules (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  store_id INTEGER REFERENCES public.store_settings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_time INTEGER DEFAULT 0,
  is_overtime BOOLEAN DEFAULT false,
  is_night_shift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range_night_shift CHECK (start_time != end_time),
  CONSTRAINT max_work_duration CHECK (
    CASE 
      WHEN end_time >= start_time THEN
        EXTRACT(EPOCH FROM (end_time - start_time)) <= 86400
      ELSE
        EXTRACT(EPOCH FROM (end_time + INTERVAL '1 day' - start_time)) <= 86400
    END
  ),
  CONSTRAINT valid_break_time_improved CHECK (
    break_time >= 0 AND 
    break_time <= CASE 
      WHEN end_time >= start_time THEN
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60 * 0.5
      ELSE
        EXTRACT(EPOCH FROM (end_time + INTERVAL '1 day' - start_time)) / 60 * 0.5
    END
  ),
  UNIQUE(employee_id, date, start_time)
);

-- 가게 설정 테이블 (멀티 스토어 지원)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id SERIAL PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name VARCHAR(100) NOT NULL DEFAULT 'My Store',
  time_slot_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 프로필 정보를 저장하는 users 테이블
-- Supabase Auth의 auth.users와 1:1 관계로 연동
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 프로필 정보
  display_name VARCHAR(100),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  
  -- 추가 정보
  department VARCHAR(100),
  position VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  hire_date DATE,
  birth_date DATE,
  
  -- 주소 정보
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'South Korea',
  
  -- 설정 정보 (JSON)
  preferences JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- 상태 관리
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 적용
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 레코드만 조회 가능
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 레코드만 수정 가능
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 레코드만 삭제 가능
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = user_id);

-- 인증된 사용자는 자신의 프로필 생성 가능
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성될 때 자동으로 users 테이블에 레코드 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 급여 계산 로그 테이블
CREATE TABLE payroll_calculations (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL,
  weekly_hours DECIMAL(5,2) NOT NULL,
  regular_pay INTEGER NOT NULL,
  overtime_pay INTEGER DEFAULT 0,
  night_shift_pay INTEGER DEFAULT 0,
  weekly_holiday_pay INTEGER DEFAULT 0,
  total_pay INTEGER NOT NULL,
  insurance_fee INTEGER DEFAULT 0,
  final_pay INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 모든 테이블 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_store_settings_owner_id ON public.store_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_store_id ON public.employees(store_id);
CREATE INDEX IF NOT EXISTS idx_employees_owner_id ON employees(owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_owner_store ON employees(owner_id, store_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_store_id ON public.work_schedules(store_id);
CREATE INDEX IF NOT EXISTS idx_weekly_schedule_templates_store_id ON public.weekly_schedule_templates(store_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_store_id ON public.schedule_exceptions(store_id);

-- 기존 인덱스
CREATE INDEX idx_work_schedules_employee_date ON work_schedules(employee_id, date);
CREATE INDEX idx_work_schedules_date ON work_schedules(date);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_payroll_employee_date ON payroll_calculations(employee_id, calculation_date);

-- 주간 스케줄 템플릿 테이블 (멀티 스토어 지원, JSONB 기반)
-- time_slots 구조: 직원 중심으로 변경됨
CREATE TABLE weekly_schedule_templates (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES public.store_settings(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  schedule_data JSONB NOT NULL DEFAULT '{}', -- 요일별 상세 스케줄 정보 (직원 중심 구조)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 기본 중복 방지
  UNIQUE(store_id, template_name)
);

-- JSONB 인덱스 생성 (성능 최적화)
CREATE INDEX idx_weekly_schedule_templates_schedule_data 
ON weekly_schedule_templates USING GIN (schedule_data);

-- 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_weekly_schedule_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_schedule_templates_updated_at
  BEFORE UPDATE ON weekly_schedule_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_schedule_templates_updated_at();

-- 기본 템플릿 데이터 삽입 함수
CREATE OR REPLACE FUNCTION create_default_schedule_template(p_store_id INTEGER, p_template_name VARCHAR DEFAULT '기본 템플릿')
RETURNS INTEGER AS $$
DECLARE
  template_id INTEGER;
  default_schedule JSONB;
BEGIN
  -- 기본 스케줄 구조 생성 (월~금 09:00-18:00, 토일 휴무)
  default_schedule := '{
    "monday": {
      "is_open": true,
      "open_time": "09:00",
      "close_time": "18:00",
      "break_periods": [{"start": "12:00", "end": "13:00", "name": "점심시간"}],
      "time_slots": {}
    },
    "tuesday": {
      "is_open": true,
      "open_time": "09:00", 
      "close_time": "18:00",
      "break_periods": [{"start": "12:00", "end": "13:00", "name": "점심시간"}],
      "time_slots": {}
    },
    "wednesday": {
      "is_open": true,
      "open_time": "09:00",
      "close_time": "18:00", 
      "break_periods": [{"start": "12:00", "end": "13:00", "name": "점심시간"}],
      "time_slots": {}
    },
    "thursday": {
      "is_open": true,
      "open_time": "09:00",
      "close_time": "18:00",
      "break_periods": [{"start": "12:00", "end": "13:00", "name": "점심시간"}],
      "time_slots": {}
    },
    "friday": {
      "is_open": true,
      "open_time": "09:00",
      "close_time": "18:00",
      "break_periods": [{"start": "12:00", "end": "13:00", "name": "점심시간"}],
      "time_slots": {}
    },
    "saturday": {
      "is_open": false,
      "open_time": null,
      "close_time": null,
      "break_periods": [],
      "time_slots": {}
    },
    "sunday": {
      "is_open": false,
      "open_time": null,
      "close_time": null,
      "break_periods": [],
      "time_slots": {}
    }
  }'::JSONB;

  INSERT INTO weekly_schedule_templates (store_id, template_name, schedule_data)
  VALUES (p_store_id, p_template_name, default_schedule)
  RETURNING id INTO template_id;
  
  RETURN template_id;
END;
$$ LANGUAGE plpgsql;

-- 시간 슬롯 생성 헬퍼 함수
CREATE OR REPLACE FUNCTION generate_time_slots(
  p_start_time TIME,
  p_end_time TIME,
  p_slot_minutes INTEGER DEFAULT 30
) RETURNS TEXT[] AS $$
DECLARE
  slots TEXT[] := '{}';
  slot_time TIME := p_start_time;
BEGIN
  WHILE slot_time < p_end_time LOOP
    slots := array_append(slots, slot_time::TEXT);
    slot_time := slot_time + (p_slot_minutes || ' minutes')::INTERVAL;
  END LOOP;
  
  RETURN slots;
END;
$$ LANGUAGE plpgsql;

-- 스케줄 예외사항 테이블 (멀티 스토어 지원, JSONB 활용)
CREATE TABLE schedule_exceptions (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES public.store_settings(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES weekly_schedule_templates(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  exception_type VARCHAR(20) NOT NULL CHECK (exception_type IN ('CANCEL', 'OVERRIDE', 'ADDITIONAL')),
  -- CANCEL: 해당 날짜 근무 취소
  -- OVERRIDE: 해당 날짜 근무시간 변경
  -- ADDITIONAL: 추가 근무
  notes TEXT,
  exception_data JSONB DEFAULT '{}', -- 예외사항 상세 정보
  affected_slots JSONB DEFAULT '[]', -- 영향받는 시간대 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_exception_per_template_date_employee 
    UNIQUE(template_id, employee_id, date, exception_type)
);

-- 근무시간 계산 함수
CREATE OR REPLACE FUNCTION calculate_work_hours(
  p_start_time TIME,
  p_end_time TIME,
  p_break_time INTEGER DEFAULT 0
) RETURNS TABLE (
  total_hours DECIMAL(4,2),
  regular_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2),
  night_hours DECIMAL(4,2)
) AS $$
DECLARE
  work_minutes INTEGER;
  night_start TIME := '22:00:00';
  night_end TIME := '06:00:00';
  regular_limit_minutes INTEGER := 480; -- 8시간
BEGIN
  -- 총 근무시간 계산 (분)
  IF p_end_time >= p_start_time THEN
    -- 같은 날 근무
    work_minutes := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60 - p_break_time;
  ELSE
    -- 야간 근무 (다음날까지)
    work_minutes := EXTRACT(EPOCH FROM (p_end_time + INTERVAL '1 day' - p_start_time)) / 60 - p_break_time;
  END IF;
  
  total_hours := work_minutes / 60.0;
  
  -- 정규/연장 시간 구분
  IF work_minutes <= regular_limit_minutes THEN
    regular_hours := total_hours;
    overtime_hours := 0;
  ELSE
    regular_hours := regular_limit_minutes / 60.0;
    overtime_hours := (work_minutes - regular_limit_minutes) / 60.0;
  END IF;
  
  -- 야간 시간 계산 (22:00-06:00)
  night_hours := 0;
  
  -- 야간 시간 계산 로직 (단순화)
  IF p_start_time >= night_start OR p_end_time <= night_end THEN
    -- 야간 시간대 포함
    IF p_end_time >= p_start_time THEN
      -- 같은 날
      IF p_start_time >= night_start THEN
        night_hours := EXTRACT(EPOCH FROM (LEAST(p_end_time, '23:59:59'::TIME) - p_start_time)) / 3600.0;
      END IF;
    ELSE
      -- 다음날까지
      IF p_start_time >= night_start THEN
        night_hours := EXTRACT(EPOCH FROM ('23:59:59'::TIME - p_start_time)) / 3600.0;
      END IF;
      IF p_end_time <= night_end THEN
        night_hours := night_hours + EXTRACT(EPOCH FROM (p_end_time - '00:00:00'::TIME)) / 3600.0;
      END IF;
    END IF;
  END IF;
  
  RETURN QUERY SELECT total_hours, regular_hours, overtime_hours, night_hours;
END;
$$ LANGUAGE plpgsql;

-- 현재 스케줄 조회 뷰 (템플릿 + 예외사항 결합)
CREATE OR REPLACE VIEW current_schedules AS
WITH date_series AS (
  -- 현재 주부터 4주간의 날짜 생성
  SELECT 
    generate_series(
      date_trunc('week', CURRENT_DATE),
      date_trunc('week', CURRENT_DATE) + INTERVAL '4 weeks',
      INTERVAL '1 day'
    )::DATE as work_date
),
template_schedules AS (
  -- 주간 템플릿 기반 스케줄
  SELECT 
    wst.employee_id,
    ds.work_date,
    wst.start_time,
    wst.end_time,
    wst.break_time,
    'TEMPLATE' as source_type
  FROM date_series ds
  CROSS JOIN weekly_schedule_templates wst
  WHERE wst.is_active = true
    AND EXTRACT(DOW FROM ds.work_date) = wst.day_of_week
),
exception_schedules AS (
  -- 예외사항 스케줄
  SELECT 
    se.employee_id,
    se.date as work_date,
    se.start_time,
    se.end_time,
    se.break_time,
    se.exception_type as source_type
  FROM schedule_exceptions se
  WHERE se.date >= CURRENT_DATE - INTERVAL '1 week'
    AND se.date <= CURRENT_DATE + INTERVAL '4 weeks'
    AND se.exception_type IN ('OVERRIDE', 'EXTRA')
)
-- 최종 스케줄 (예외사항이 템플릿보다 우선)
SELECT 
  ROW_NUMBER() OVER (ORDER BY employee_id, work_date, start_time) as id,
  employee_id,
  work_date as date,
  start_time,
  end_time,
  break_time,
  source_type
FROM (
  -- 예외사항이 있는 날짜는 템플릿 제외
  SELECT * FROM template_schedules ts
  WHERE NOT EXISTS (
    SELECT 1 FROM schedule_exceptions se 
    WHERE se.employee_id = ts.employee_id 
      AND se.date = ts.work_date 
      AND se.exception_type = 'OVERRIDE'
  )
  AND NOT EXISTS (
    SELECT 1 FROM schedule_exceptions se 
    WHERE se.employee_id = ts.employee_id 
      AND se.date = ts.work_date 
      AND se.exception_type = 'CANCEL'
  )
  
  UNION ALL
  
  -- 예외사항 스케줄 추가
  SELECT * FROM exception_schedules
) combined_schedules
ORDER BY employee_id, work_date, start_time;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_weekly_templates_employee_day ON weekly_schedule_templates(employee_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_employee_date ON schedule_exceptions(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date ON schedule_exceptions(date);

-- Partial Unique Index: 활성 템플릿에 대해서만 중복 방지
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_employee_schedule 
ON weekly_schedule_templates(employee_id, day_of_week) 
WHERE is_active = true;

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용
CREATE TRIGGER update_weekly_schedule_templates_updated_at 
  BEFORE UPDATE ON weekly_schedule_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_exceptions_updated_at 
  BEFORE UPDATE ON schedule_exceptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;

-- 스토어 소유자만 접근 가능 (store_settings)
CREATE POLICY "Users can view their own stores" ON public.store_settings
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own stores" ON public.store_settings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own stores" ON public.store_settings
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own stores" ON public.store_settings
  FOR DELETE USING (auth.uid() = owner_id);

-- 직원 데이터 접근 제어 (employees) - owner_id 기반
CREATE POLICY "employees_select_policy" ON employees
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "employees_insert_policy" ON employees
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM store_settings 
      WHERE id = store_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "employees_update_policy" ON employees
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "employees_delete_policy" ON employees
  FOR DELETE
  USING (auth.uid() = owner_id);

-- 스토어 소유자만 근무 스케줄 접근 가능 (work_schedules)
CREATE POLICY "Users can access work schedules of their stores" ON public.work_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.store_settings 
      WHERE store_settings.id = work_schedules.store_id 
      AND store_settings.owner_id = auth.uid()
    )
  );

-- 스토어 소유자만 주간 템플릿 접근 가능 (weekly_schedule_templates)
CREATE POLICY "Users can access templates of their stores" ON public.weekly_schedule_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.store_settings 
      WHERE store_settings.id = weekly_schedule_templates.store_id 
      AND store_settings.owner_id = auth.uid()
    )
  );

-- 스토어 소유자만 예외사항 접근 가능 (schedule_exceptions)
CREATE POLICY "Users can access exceptions of their stores" ON public.schedule_exceptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.store_settings 
      WHERE store_settings.id = schedule_exceptions.store_id 
      AND store_settings.owner_id = auth.uid()
    )
  );

-- 급여 계산 데이터 접근 제어 (payroll_calculations)
CREATE POLICY "Users can access payroll of their employees" ON public.payroll_calculations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.store_settings s ON e.store_id = s.id
      WHERE e.id = payroll_calculations.employee_id 
      AND s.owner_id = auth.uid()
    )
  );

-- 직원 생성 시 자동으로 owner_id 설정하는 함수
CREATE OR REPLACE FUNCTION set_employee_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- owner_id가 설정되지 않은 경우 현재 사용자로 설정
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  
  -- 해당 스토어의 소유자인지 확인
  IF NOT EXISTS (
    SELECT 1 FROM store_settings 
    WHERE id = NEW.store_id AND owner_id = NEW.owner_id
  ) THEN
    RAISE EXCEPTION '해당 스토어에 직원을 추가할 권한이 없습니다.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER trigger_set_employee_owner
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION set_employee_owner();
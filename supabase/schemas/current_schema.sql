-- 아르바이트 관리 시스템 현재 스키마 상태
-- 최종 업데이트: 2025-01-02 17:18:00
-- 주요 변경: 주간 반복 패턴 기반 스케줄 시스템 추가

-- 직원 테이블
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  hourly_wage INTEGER NOT NULL DEFAULT 9860,
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

-- 가게 설정 테이블
CREATE TABLE store_settings (
  id BIGSERIAL PRIMARY KEY,
  store_name VARCHAR(100) NOT NULL DEFAULT '내 가게',
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '22:00',
  time_slot_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 인덱스
CREATE INDEX idx_work_schedules_employee_date ON work_schedules(employee_id, date);
CREATE INDEX idx_work_schedules_date ON work_schedules(date);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_payroll_employee_date ON payroll_calculations(employee_id, calculation_date);

-- 주간 스케줄 템플릿 테이블 (신규)
CREATE TABLE weekly_schedule_templates (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=일요일, 6=토요일
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_time INTEGER DEFAULT 0, -- 휴게시간 (분)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 기본 중복 방지 (is_active 조건은 별도 인덱스로 처리)
  UNIQUE(employee_id, day_of_week)
);

-- 스케줄 예외사항 테이블 (신규)
CREATE TABLE schedule_exceptions (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  break_time INTEGER DEFAULT 0,
  exception_type VARCHAR(20) NOT NULL CHECK (exception_type IN ('OVERRIDE', 'CANCEL', 'EXTRA')),
  -- OVERRIDE: 해당 날짜의 기본 스케줄 대체
  -- CANCEL: 해당 날짜의 기본 스케줄 취소
  -- EXTRA: 기본 스케줄 외 추가 근무
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(employee_id, date, exception_type)
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

-- RLS 정책
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 정책 (개발 단계)
CREATE POLICY "Enable all access for employees" ON employees FOR ALL USING (true);
CREATE POLICY "Enable all access for work_schedules" ON work_schedules FOR ALL USING (true);
CREATE POLICY "Enable all access for store_settings" ON store_settings FOR ALL USING (true);
CREATE POLICY "Enable all access for payroll_calculations" ON payroll_calculations FOR ALL USING (true);
CREATE POLICY "Enable all access for weekly_schedule_templates" ON weekly_schedule_templates FOR ALL USING (true);
CREATE POLICY "Enable all access for schedule_exceptions" ON schedule_exceptions FOR ALL USING (true);
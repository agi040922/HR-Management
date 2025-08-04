-- 개선된 스케줄 시스템: 주간 반복 패턴 + 예외사항 관리
-- 기존 work_schedules 테이블은 유지하되, 새로운 구조 추가

-- 1. 주간 스케줄 템플릿 테이블 생성
CREATE TABLE IF NOT EXISTS weekly_schedule_templates (
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

-- 2. 스케줄 예외사항 테이블 생성
CREATE TABLE IF NOT EXISTS schedule_exceptions (
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

-- 3. 야간 근무 처리를 위한 함수 생성
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

-- 4. 실제 스케줄 조회 뷰 생성 (템플릿 + 예외사항 결합)
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

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_weekly_templates_employee_day ON weekly_schedule_templates(employee_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_employee_date ON schedule_exceptions(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date ON schedule_exceptions(date);

-- 6. Partial Unique Index: 활성 템플릿에 대해서만 중복 방지
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_employee_schedule 
ON weekly_schedule_templates(employee_id, day_of_week) 
WHERE is_active = true;

-- 6. RLS 정책 (기본 오픈, 추후 인증 시 수정)
ALTER TABLE weekly_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for weekly_schedule_templates" ON weekly_schedule_templates FOR ALL USING (true);
CREATE POLICY "Enable all operations for schedule_exceptions" ON schedule_exceptions FOR ALL USING (true);

-- 7. 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weekly_schedule_templates_updated_at 
  BEFORE UPDATE ON weekly_schedule_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_exceptions_updated_at 
  BEFORE UPDATE ON schedule_exceptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 기존 work_schedules 데이터를 weekly_schedule_templates로 마이그레이션하는 함수
CREATE OR REPLACE FUNCTION migrate_existing_schedules()
RETURNS void AS $$
DECLARE
  schedule_record RECORD;
BEGIN
  -- 기존 스케줄에서 주간 패턴 추출
  FOR schedule_record IN
    SELECT 
      employee_id,
      EXTRACT(DOW FROM date::DATE) as day_of_week,
      start_time,
      end_time,
      break_time,
      COUNT(*) as frequency
    FROM work_schedules
    WHERE date >= CURRENT_DATE - INTERVAL '2 weeks'
    GROUP BY employee_id, EXTRACT(DOW FROM date::DATE), start_time, end_time, break_time
    HAVING COUNT(*) >= 2 -- 2회 이상 반복된 패턴만
    ORDER BY employee_id, day_of_week
  LOOP
    -- 주간 템플릿에 삽입 (중복 무시)
    INSERT INTO weekly_schedule_templates (employee_id, day_of_week, start_time, end_time, break_time)
    VALUES (schedule_record.employee_id, schedule_record.day_of_week, schedule_record.start_time, schedule_record.end_time, schedule_record.break_time)
    ON CONFLICT (employee_id, day_of_week, is_active) WHERE is_active = true
    DO NOTHING;
  END LOOP;
  
  RAISE NOTICE '기존 스케줄 마이그레이션 완료';
END;
$$ LANGUAGE plpgsql;

-- 마이그레이션 실행 (선택적)
-- SELECT migrate_existing_schedules();

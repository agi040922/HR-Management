-- 스케줄 예외사항 테이블 개선 - 템플릿 참조 및 JSONB 활용
-- 작성일: 2025-01-04

-- 기존 테이블에 컬럼 추가
ALTER TABLE schedule_exceptions 
ADD COLUMN template_id INTEGER REFERENCES weekly_schedule_templates(id) ON DELETE SET NULL,
ADD COLUMN exception_data JSONB DEFAULT '{}',
ADD COLUMN affected_slots JSONB DEFAULT '[]';

-- 기존 unique constraint 제거 후 새로운 constraint 추가
ALTER TABLE schedule_exceptions 
DROP CONSTRAINT IF EXISTS schedule_exceptions_employee_id_date_exception_type_key;

-- 새로운 unique constraint (템플릿과 날짜 기준)
ALTER TABLE schedule_exceptions 
ADD CONSTRAINT unique_exception_per_template_date_employee 
UNIQUE(template_id, employee_id, date, exception_type);

-- exception_data 필드에 대한 설명
COMMENT ON COLUMN schedule_exceptions.exception_data IS 'JSONB 형태의 예외사항 상세 정보: {original_schedule: {...}, new_schedule: {...}, reason: "..."}';

-- affected_slots 필드에 대한 설명  
COMMENT ON COLUMN schedule_exceptions.affected_slots IS 'JSONB 배열 형태의 영향받는 시간대: [{"day": "monday", "time_slot": "09:00", "employees": [1,2,3]}]';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_template_id ON schedule_exceptions(template_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date_range ON schedule_exceptions(date);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_exception_data ON schedule_exceptions USING GIN(exception_data);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_affected_slots ON schedule_exceptions USING GIN(affected_slots);

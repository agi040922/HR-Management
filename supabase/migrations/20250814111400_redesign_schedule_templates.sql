-- 스케줄 템플릿 시스템 재설계
-- 기존 weekly_schedule_templates 테이블 구조 변경 및 store_settings 정리

-- 1. 기존 weekly_schedule_templates 테이블 삭제 (구조가 완전히 달라짐)
DROP TABLE IF EXISTS weekly_schedule_templates CASCADE;

-- 2. store_settings에서 불필요한 컬럼 제거
ALTER TABLE public.store_settings 
DROP COLUMN IF EXISTS open_time,
DROP COLUMN IF EXISTS close_time;

-- 3. 새로운 weekly_schedule_templates 테이블 생성
CREATE TABLE weekly_schedule_templates (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES public.store_settings(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  schedule_data JSONB NOT NULL DEFAULT '{}', -- 요일별 상세 스케줄 정보
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 기본 중복 방지
  UNIQUE(store_id, template_name)
);

-- 4. schedule_data JSONB 구조 설명 및 예시
-- {
--   "monday": {
--     "is_open": true,
--     "open_time": "09:00",
--     "close_time": "22:00",
--     "break_periods": [
--       {"start": "12:00", "end": "13:00", "name": "점심시간"},
--       {"start": "18:00", "end": "19:00", "name": "저녁시간"}
--     ],
--     "time_slots": {
--       "09:00": [1, 2],      -- employee_id 배열
--       "09:30": [1, 3],
--       "10:00": [2, 3, 4],
--       ...
--     }
--   },
--   "tuesday": { ... },
--   "wednesday": { ... },
--   "thursday": { ... },
--   "friday": { ... },
--   "saturday": { ... },
--   "sunday": { ... }
-- }

-- 5. JSONB 인덱스 생성 (성능 최적화)
CREATE INDEX idx_weekly_schedule_templates_schedule_data 
ON weekly_schedule_templates USING GIN (schedule_data);

-- 6. 업데이트 트리거 생성
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

-- 7. 기본 템플릿 데이터 삽입 함수
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

-- 8. 시간 슬롯 생성 헬퍼 함수
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

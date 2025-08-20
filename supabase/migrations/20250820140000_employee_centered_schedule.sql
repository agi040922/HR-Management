-- 직원 중심 스케줄 시스템으로 변경
-- 기존 JSONB 구조를 유지하면서 time_slots 데이터 구조만 개선

-- 기존 템플릿의 time_slots 구조를 새로운 형태로 변환하는 함수
CREATE OR REPLACE FUNCTION migrate_time_slots_to_employee_centered()
RETURNS void AS $$
DECLARE
    template_record RECORD;
    day_key TEXT;
    time_slot TEXT;
    employee_id INTEGER;
    new_schedule_data JSONB;
    day_data JSONB;
    new_time_slots JSONB;
    employee_slot JSONB;
BEGIN
    -- 모든 템플릿을 순회하면서 time_slots 구조 변경
    FOR template_record IN 
        SELECT id, schedule_data 
        FROM weekly_schedule_templates 
        WHERE schedule_data IS NOT NULL
    LOOP
        new_schedule_data := template_record.schedule_data;
        
        -- 각 요일별로 처리
        FOR day_key IN SELECT * FROM jsonb_object_keys(template_record.schedule_data)
        LOOP
            day_data := template_record.schedule_data->day_key;
            
            -- time_slots가 존재하는 경우에만 처리
            IF day_data ? 'time_slots' AND jsonb_typeof(day_data->'time_slots') = 'object' THEN
                new_time_slots := '{}'::jsonb;
                
                -- 각 시간대별로 처리
                FOR time_slot IN SELECT * FROM jsonb_object_keys(day_data->'time_slots')
                LOOP
                    -- 기존 직원 ID 배열을 새로운 구조로 변환
                    IF jsonb_typeof(day_data->'time_slots'->time_slot) = 'array' THEN
                        -- 새로운 직원 슬롯 배열 생성
                        new_time_slots := new_time_slots || jsonb_build_object(
                            time_slot,
                            (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'employee_id', employee_id::integer,
                                        'start_time', COALESCE(day_data->>'open_time', '09:00'),
                                        'end_time', COALESCE(day_data->>'close_time', '18:00'),
                                        'break_periods', COALESCE(day_data->'break_periods', '[]'::jsonb),
                                        'notes', ''
                                    )
                                )
                                FROM jsonb_array_elements_text(day_data->'time_slots'->time_slot) AS employee_id
                                WHERE employee_id ~ '^\d+$' -- 숫자인 경우만 처리
                            )
                        );
                    END IF;
                END LOOP;
                
                -- 새로운 time_slots로 교체
                new_schedule_data := jsonb_set(
                    new_schedule_data,
                    ARRAY[day_key, 'time_slots'],
                    COALESCE(new_time_slots, '{}'::jsonb)
                );
            END IF;
        END LOOP;
        
        -- 업데이트된 schedule_data 저장
        UPDATE weekly_schedule_templates 
        SET schedule_data = new_schedule_data,
            updated_at = NOW()
        WHERE id = template_record.id;
        
        RAISE NOTICE '템플릿 ID % 변환 완료', template_record.id;
    END LOOP;
    
    RAISE NOTICE '모든 템플릿의 time_slots 구조 변환이 완료되었습니다.';
END;
$$ LANGUAGE plpgsql;

-- 마이그레이션 실행
SELECT migrate_time_slots_to_employee_centered();

-- 마이그레이션 함수 제거 (일회성 사용)
DROP FUNCTION migrate_time_slots_to_employee_centered();

-- 새로운 구조에 대한 설명을 위한 주석 추가
COMMENT ON TABLE weekly_schedule_templates IS '주간 스케줄 템플릿 - schedule_data.time_slots 구조가 직원 중심으로 변경됨';

-- 새로운 time_slots 구조 예시:
-- {
--   "monday": {
--     "is_open": true,
--     "open_time": "09:00",
--     "close_time": "18:00", 
--     "break_periods": [{"start": "12:00", "end": "13:00", "name": "점심시간"}],
--     "time_slots": {
--       "09:00": [
--         {
--           "employee_id": 1,
--           "start_time": "09:00",
--           "end_time": "18:00",
--           "break_periods": [{"start": "12:00", "end": "13:00", "name": "점심시간"}],
--           "notes": "매니저"
--         }
--       ]
--     }
--   }
-- }

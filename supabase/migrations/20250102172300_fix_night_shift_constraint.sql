-- 야간 근무 지원을 위한 시간 제약 조건 수정
-- 기존 valid_time_range 제약 조건 제거 및 새로운 제약 조건 추가

-- 1. 기존 제약 조건 제거
ALTER TABLE work_schedules DROP CONSTRAINT IF EXISTS valid_time_range;

-- 2. 야간 근무를 고려한 새로운 제약 조건 추가
-- 시작시간과 종료시간이 같지 않으면 유효 (야간 근무 허용)
ALTER TABLE work_schedules ADD CONSTRAINT valid_time_range_night_shift 
  CHECK (start_time != end_time);

-- 3. 추가 제약: 최대 근무시간 24시간 제한 (안전장치)
-- 실제로는 노동법상 연속 근무시간 제한이 있지만, DB 레벨에서는 24시간으로 제한
ALTER TABLE work_schedules ADD CONSTRAINT max_work_duration
  CHECK (
    CASE 
      WHEN end_time >= start_time THEN
        -- 같은 날 근무: 정상적인 시간 범위
        EXTRACT(EPOCH FROM (end_time - start_time)) <= 86400 -- 24시간
      ELSE
        -- 야간 근무 (다음날까지): 시작시간부터 24시간 이내
        EXTRACT(EPOCH FROM (end_time + INTERVAL '1 day' - start_time)) <= 86400 -- 24시간
    END
  );

-- 4. 휴게시간 제약 조건도 개선 (최대 근무시간의 50%까지 허용)
ALTER TABLE work_schedules DROP CONSTRAINT IF EXISTS valid_break_time;
ALTER TABLE work_schedules ADD CONSTRAINT valid_break_time_improved
  CHECK (
    break_time >= 0 AND 
    break_time <= CASE 
      WHEN end_time >= start_time THEN
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60 * 0.5 -- 근무시간의 50%
      ELSE
        EXTRACT(EPOCH FROM (end_time + INTERVAL '1 day' - start_time)) / 60 * 0.5
    END
  );

-- 5. 코멘트 추가
COMMENT ON CONSTRAINT valid_time_range_night_shift ON work_schedules IS 
  '야간 근무 지원: 시작시간과 종료시간이 다르면 유효 (22:00-06:00 등 허용)';

COMMENT ON CONSTRAINT max_work_duration ON work_schedules IS 
  '최대 근무시간 24시간 제한 (야간 근무 포함)';

COMMENT ON CONSTRAINT valid_break_time_improved ON work_schedules IS 
  '휴게시간: 0분 이상, 근무시간의 50% 이하 (야간 근무 고려)';

-- HR 관리 시스템 예제 데이터
-- 업데이트: 2025-08-07
-- 사용법: Supabase SQL Editor에서 실행하거나 psql로 실행
-- 주의: 먼저 Supabase Auth를 통해 로그인한 후 해당 사용자의 ID를 확인하여 사용하세요

-- 예제 사용자 ID (실제 환경에서는 auth.users 테이블에서 확인한 실제 user_id를 사용하세요)
-- 테스트 계정: test@example.com / password
-- 실제 user_id를 확인하려면: SELECT id FROM auth.users WHERE email = 'test@example.com';

-- 1. 사용자 정보 삽입 (auth.users에 먼저 사용자가 생성되어야 함)
-- 주의: 아래 user_id는 예제이므로 실제 환경에서는 본인의 user_id로 변경하세요
INSERT INTO users (user_id, display_name, first_name, last_name, employee_id, position, department, phone) VALUES
('56bdf71b-67fd-496f-ae37-011ed3a6bb81', '테스트 관리자', '테스트', '관리자', 'EMP001', '관리자', 'HR', '010-0000-0000')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  employee_id = EXCLUDED.employee_id,
  position = EXCLUDED.position,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- 2. 스토어 설정 데이터 삽입 (owner_id 포함)
INSERT INTO store_settings (owner_id, open_time, close_time, time_slot_minutes) VALUES
('56bdf71b-67fd-496f-ae37-011ed3a6bb81', '09:00', '18:00', 30),
('56bdf71b-67fd-496f-ae37-011ed3a6bb81', '10:00', '19:00', 30),
('56bdf71b-67fd-496f-ae37-011ed3a6bb81', '11:00', '20:00', 60)
ON CONFLICT (id) DO NOTHING;

-- 3. 직원 데이터 삽입 (store_id 포함)
-- 주의: 위에서 생성된 스토어의 실제 ID를 확인하여 사용하세요
-- 스토어 ID 확인: SELECT id FROM store_settings WHERE owner_id = '56bdf71b-67fd-496f-ae37-011ed3a6bb81' ORDER BY id;
INSERT INTO employees (store_id, name, hourly_wage, position, phone, is_active) VALUES
(1, '김철수', 12000, '매니저', '010-1234-5678', true),
(1, '이영희', 10030, '아르바이트', '010-2345-6789', true),
(1, '박민수', 11500, '시니어', '010-3456-7890', true),
(2, '정수진', 10500, '아르바이트', '010-4567-8901', true),
(2, '최민호', 11000, '부매니저', '010-5678-9012', true),
(3, '장미영', 10030, '아르바이트', '010-6789-0123', true)
ON CONFLICT (id) DO NOTHING;

-- 4. 주간 스케줄 템플릿 예제 데이터 (store_id 포함)
INSERT INTO weekly_schedule_templates (
  store_id, 
  template_name, 
  monday_start, monday_end,
  tuesday_start, tuesday_end,
  wednesday_start, wednesday_end,
  thursday_start, thursday_end,
  friday_start, friday_end,
  saturday_start, saturday_end,
  sunday_start, sunday_end,
  is_active
) VALUES
(1, '주중 기본 스케줄', '09:00', '18:00', '09:00', '18:00', '09:00', '18:00', '09:00', '18:00', '09:00', '18:00', '10:00', '17:00', NULL, NULL, true),
(1, '주말 특별 스케줄', '10:00', '19:00', '10:00', '19:00', '10:00', '19:00', '10:00', '19:00', '10:00', '19:00', '09:00', '20:00', '11:00', '18:00', true),
(2, '카페 운영 스케줄', '10:00', '19:00', '10:00', '19:00', '10:00', '19:00', '10:00', '19:00', '10:00', '19:00', '09:00', '20:00', NULL, NULL, true),
(3, '저녁 운영 스케줄', '11:00', '20:00', '11:00', '20:00', '11:00', '20:00', '11:00', '20:00', '11:00', '20:00', '11:00', '21:00', '12:00', '19:00', true)
ON CONFLICT (id) DO NOTHING;

-- 5. 스케줄 예외사항 예제 데이터 (store_id, employee_id 포함)
INSERT INTO schedule_exceptions (
  store_id,
  employee_id,
  date,
  exception_type,
  start_time,
  end_time,
  notes
) VALUES
-- 이번주 예외사항들
(1, 1, CURRENT_DATE + 1, 'OVERRIDE', '10:00', '19:00', '매니저 회의로 인한 시간 변경'),
(1, 2, CURRENT_DATE + 2, 'CANCEL', NULL, NULL, '개인 사정으로 인한 휴무'),
(1, NULL, CURRENT_DATE + 3, 'ADDITIONAL', '20:00', '22:00', '재고 정리를 위한 추가 근무'),
(2, 4, CURRENT_DATE + 4, 'OVERRIDE', '12:00', '18:00', '오전 수업으로 인한 늦은 출근'),
(2, 5, CURRENT_DATE + 5, 'CANCEL', NULL, NULL, '병가'),
-- 다음주 예외사항들
(1, 1, CURRENT_DATE + 8, 'ADDITIONAL', '08:00', '09:00', '오픈 준비를 위한 조기 출근'),
(3, 6, CURRENT_DATE + 10, 'OVERRIDE', '13:00', '21:00', '점심시간 연장 근무')
ON CONFLICT (id) DO NOTHING;

-- 6. 근무 스케줄 예제 데이터 (현재 주 기준)
-- 실제 환경에서는 템플릿을 기반으로 자동 생성하는 것을 권장
WITH date_range AS (
  SELECT generate_series(
    CURRENT_DATE - EXTRACT(dow FROM CURRENT_DATE)::int,
    CURRENT_DATE - EXTRACT(dow FROM CURRENT_DATE)::int + 13,
    '1 day'::interval
  )::date AS schedule_date
),
employee_schedule AS (
  SELECT 
    schedule_date,
    CASE 
      WHEN EXTRACT(dow FROM schedule_date) = 0 THEN NULL -- 일요일
      WHEN EXTRACT(dow FROM schedule_date) IN (1,3,5) THEN 1 -- 월,수,금: 김철수
      WHEN EXTRACT(dow FROM schedule_date) IN (2,4) THEN 2 -- 화,목: 이영희
      WHEN EXTRACT(dow FROM schedule_date) = 6 THEN 3 -- 토: 박민수
    END AS employee_id,
    CASE 
      WHEN EXTRACT(dow FROM schedule_date) IN (1,2,3,4) THEN '09:00'::time
      WHEN EXTRACT(dow FROM schedule_date) = 5 THEN '10:00'::time
      WHEN EXTRACT(dow FROM schedule_date) = 6 THEN '11:00'::time
    END AS start_time,
    CASE 
      WHEN EXTRACT(dow FROM schedule_date) IN (1,2,3,4) THEN '18:00'::time
      WHEN EXTRACT(dow FROM schedule_date) = 5 THEN '22:00'::time
      WHEN EXTRACT(dow FROM schedule_date) = 6 THEN '20:00'::time
    END AS end_time,
    CASE 
      WHEN EXTRACT(dow FROM schedule_date) IN (1,2,3,4) THEN 60
      WHEN EXTRACT(dow FROM schedule_date) = 5 THEN 90
      WHEN EXTRACT(dow FROM schedule_date) = 6 THEN 60
    END AS break_time
  FROM date_range
)
INSERT INTO work_schedules (employee_id, date, start_time, end_time, break_time, is_overtime, is_night_shift)
SELECT 
  employee_id,
  schedule_date,
  start_time,
  end_time,
  break_time,
  CASE WHEN end_time > '18:00'::time THEN true ELSE false END as is_overtime,
  CASE WHEN start_time < '06:00'::time OR end_time > '22:00'::time THEN true ELSE false END as is_night_shift
FROM employee_schedule
WHERE employee_id IS NOT NULL
ON CONFLICT (employee_id, date, start_time) DO NOTHING;

-- ==========================================
-- 사용 가이드 및 확인 쿼리
-- ==========================================

-- 1. 데이터 삽입 후 확인 쿼리들
-- 사용자 정보 확인
-- SELECT * FROM users WHERE user_id = '56bdf71b-67fd-496f-ae37-011ed3a6bb81';

-- 스토어 정보 확인
-- SELECT * FROM store_settings WHERE owner_id = '56bdf71b-67fd-496f-ae37-011ed3a6bb81';

-- 직원 정보 확인
-- SELECT e.*, s.open_time, s.close_time 
-- FROM employees e 
-- LEFT JOIN store_settings s ON e.store_id = s.id 
-- ORDER BY e.store_id, e.name;

-- 주간 템플릿 확인
-- SELECT * FROM weekly_schedule_templates ORDER BY store_id, template_name;

-- 이번주 예외사항 확인
-- SELECT se.*, e.name as employee_name, s.id as store_id
-- FROM schedule_exceptions se
-- LEFT JOIN employees e ON se.employee_id = e.id
-- LEFT JOIN store_settings s ON se.store_id = s.id
-- WHERE se.date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
-- ORDER BY se.date;

-- 근무 스케줄 확인
-- SELECT ws.*, e.name as employee_name
-- FROM work_schedules ws
-- LEFT JOIN employees e ON ws.employee_id = e.id
-- WHERE ws.date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
-- ORDER BY ws.date, ws.start_time;

-- ==========================================
-- 사용 방법
-- ==========================================

/*
1. Supabase 프로젝트 설정:
   - Supabase 대시보드에서 새 프로젝트 생성
   - current_schema.sql을 먼저 실행하여 테이블 생성
   - 20250807062857_add_store_ownership.sql 마이그레이션 실행

2. 인증 설정:
   - Supabase Auth에서 이메일/패스워드 인증 활성화
   - 테스트 계정 생성: test@example.com / password
   - 생성된 사용자의 실제 user_id를 확인

3. 예제 데이터 삽입:
   - 이 파일의 user_id를 실제 user_id로 변경
   - Supabase SQL Editor에서 이 파일 전체 실행
   - 또는 psql 명령어로 실행: psql -f example-data.sql

4. 애플리케이션 테스트:
   - /test/comprehensive 페이지에서 로그인
   - 각 기능별 페이지에서 CRUD 테스트
   - 급여 계산 기능 테스트

5. 주요 테스트 시나리오:
   - 스토어 생성 및 관리
   - 직원 등록 및 관리
   - 주간 템플릿 생성 및 적용
   - 예외사항 등록 (이번주 필터링 확인)
   - 급여 계산 (20시간/40시간 옵션)

6. 문제 해결:
   - RLS 정책으로 인해 데이터가 보이지 않는 경우: user_id 확인
   - 외래키 제약으로 인한 삽입 실패: 순서대로 데이터 삽입
   - 타임존 관련 이슈: 현재 날짜 기준으로 데이터 조정
*/

-- 5. 주간 템플릿 예제 데이터 (실제 DB에 템플릿 테이블이 있다면)
-- 현재 스키마에는 주간 템플릿 테이블이 없으므로 주석 처리
/*
INSERT INTO weekly_templates (name, store_id, is_active) VALUES
('기본 주간 템플릿', 1, true),
('주말 특별 템플릿', 1, true)
ON CONFLICT DO NOTHING;
*/

-- 6. 급여 계산 테스트를 위한 추가 스케줄 (다양한 근무 패턴)
INSERT INTO work_schedules (employee_id, date, start_time, end_time, break_time, is_overtime, is_night_shift) VALUES
-- 연장 근무 예제
(3, CURRENT_DATE + 7, '09:00', '23:00', 90, true, true),
-- 야간 근무 예제  
(5, CURRENT_DATE + 8, '22:00', '06:00', 60, true, true),
-- 짧은 근무 예제
(2, CURRENT_DATE + 9, '14:00', '18:00', 30, false, false)
ON CONFLICT (employee_id, date, start_time) DO NOTHING;

-- 7. 데이터 확인 쿼리
-- 삽입된 데이터를 확인하려면 아래 쿼리들을 실행하세요

-- 직원 목록 확인
-- SELECT * FROM employees WHERE is_active = true;

-- 이번주 스케줄 확인
-- SELECT 
--   e.name,
--   ws.date,
--   ws.start_time,
--   ws.end_time,
--   ws.break_time,
--   ws.is_overtime,
--   ws.is_night_shift
-- FROM work_schedules ws
-- JOIN employees e ON ws.employee_id = e.id
-- WHERE ws.date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
-- ORDER BY ws.date, ws.start_time;

-- 사용자 정보 확인
-- SELECT * FROM users WHERE user_id = '56bdf71b-67fd-496f-ae37-011ed3a6bb81';

-- 스토어 설정 확인
-- SELECT * FROM store_settings;

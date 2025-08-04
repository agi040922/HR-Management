-- 아르바이트 관리 시스템 초기 스키마
-- 생성일: 2025-08-02 12:47:32

-- 직원 테이블
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  hourly_wage INTEGER NOT NULL DEFAULT 9860, -- 2024년 최저임금
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
  break_time INTEGER DEFAULT 0, -- 휴게시간 (분)
  is_overtime BOOLEAN DEFAULT false,
  is_night_shift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제약조건: 종료시간이 시작시간보다 늦어야 함
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  -- 제약조건: 휴게시간은 0분 이상
  CONSTRAINT valid_break_time CHECK (break_time >= 0),
  -- 유니크 제약: 같은 직원이 같은 날짜에 중복 스케줄 방지
  UNIQUE(employee_id, date, start_time)
);

-- 가게 설정 테이블 (영업시간 등)
CREATE TABLE store_settings (
  id BIGSERIAL PRIMARY KEY,
  store_name VARCHAR(100) NOT NULL DEFAULT '내 가게',
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '22:00',
  time_slot_minutes INTEGER NOT NULL DEFAULT 30, -- 타임슬롯 단위 (분)
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
  weekly_holiday_pay INTEGER DEFAULT 0, -- 주휴수당
  total_pay INTEGER NOT NULL,
  insurance_fee INTEGER DEFAULT 0,
  final_pay INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_work_schedules_employee_date ON work_schedules(employee_id, date);
CREATE INDEX idx_work_schedules_date ON work_schedules(date);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_payroll_employee_date ON payroll_calculations(employee_id, calculation_date);

-- RLS (Row Level Security) 정책
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_calculations ENABLE ROW LEVEL SECURITY;

-- 기본 정책: 모든 사용자가 읽기/쓰기 가능 (추후 인증 시스템 추가 시 수정)
CREATE POLICY "Enable all access for employees" ON employees FOR ALL USING (true);
CREATE POLICY "Enable all access for work_schedules" ON work_schedules FOR ALL USING (true);
CREATE POLICY "Enable all access for store_settings" ON store_settings FOR ALL USING (true);
CREATE POLICY "Enable all access for payroll_calculations" ON payroll_calculations FOR ALL USING (true);

-- 기본 가게 설정 데이터 삽입
INSERT INTO store_settings (store_name, open_time, close_time, time_slot_minutes) 
VALUES ('내 카페', '09:00', '22:00', 30);

-- 예제 직원 데이터 삽입
INSERT INTO employees (name, hourly_wage, position, phone, start_date) VALUES
('김민수', 9860, '홀서빙', '010-1234-5678', '2024-01-01'),
('이지은', 10000, '주방보조', '010-2345-6789', '2024-01-15'),
('박준호', 9860, '계산대', '010-3456-7890', '2024-02-01'),
('최수영', 10500, '바리스타', '010-4567-8901', '2024-01-10');

-- 예제 스케줄 데이터 삽입 (주 15시간 미만으로 설계)
INSERT INTO work_schedules (employee_id, date, start_time, end_time, break_time) VALUES
-- 김민수 - 주 14시간
(1, '2024-01-15', '09:00', '13:00', 0), -- 월 4시간
(1, '2024-01-17', '14:00', '18:00', 0), -- 수 4시간
(1, '2024-01-19', '09:00', '13:00', 0), -- 금 4시간
(1, '2024-01-20', '16:00', '18:00', 0), -- 토 2시간

-- 이지은 - 주 12시간
(2, '2024-01-16', '10:00', '14:00', 0), -- 화 4시간
(2, '2024-01-18', '15:00', '19:00', 0), -- 목 4시간
(2, '2024-01-21', '11:00', '15:00', 0), -- 일 4시간

-- 박준호 - 주 10시간
(3, '2024-01-15', '14:00', '19:00', 30), -- 월 5시간 (휴게 30분)
(3, '2024-01-16', '14:00', '19:00', 30), -- 화 5시간 (휴게 30분)

-- 최수영 - 주 16시간 (주휴수당 적용 대상)
(4, '2024-01-15', '06:00', '10:00', 0), -- 월 4시간
(4, '2024-01-16', '06:00', '10:00', 0), -- 화 4시간
(4, '2024-01-17', '06:00', '10:00', 0), -- 수 4시간
(4, '2024-01-18', '06:00', '10:00', 0); -- 목 4시간

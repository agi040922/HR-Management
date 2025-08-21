-- employees 테이블에 근로계약서 정보 저장용 JSONB 컬럼 추가
ALTER TABLE employees 
ADD COLUMN labor_contract JSONB,
ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;

-- 근로계약서 정보에 대한 인덱스 추가 (성능 최적화)
CREATE INDEX idx_employees_labor_contract_type ON employees USING GIN ((labor_contract->>'contractType'));
CREATE INDEX idx_employees_labor_contract_status ON employees USING GIN ((labor_contract->>'status'));

-- 근로계약서 정보 구조에 대한 코멘트 추가
COMMENT ON COLUMN employees.labor_contract IS '근로계약서 정보 (JSON 형태로 저장): contractType, employeeInfo, employerInfo, workConditions, wages, etc.';
COMMENT ON COLUMN employees.start_date IS '근무 시작일 (근로계약서의 계약기간 시작일과 연동)';

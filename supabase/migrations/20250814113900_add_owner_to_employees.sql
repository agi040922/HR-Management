-- employees 테이블에 owner_id 추가 및 권한 관리 개선

-- 1. employees 테이블에 owner_id 컬럼 추가
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 기존 데이터에 대한 owner_id 설정 (store_settings의 owner_id를 참조)
UPDATE employees 
SET owner_id = (
  SELECT ss.owner_id 
  FROM store_settings ss 
  WHERE ss.id = employees.store_id
)
WHERE owner_id IS NULL;

-- 3. owner_id를 NOT NULL로 변경
ALTER TABLE employees 
ALTER COLUMN owner_id SET NOT NULL;

-- 4. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_employees_owner_id ON employees(owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_owner_store ON employees(owner_id, store_id);

-- 5. RLS (Row Level Security) 정책 설정
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 6. 사용자는 자신이 소유한 직원만 조회 가능
CREATE POLICY employees_select_policy ON employees
  FOR SELECT
  USING (auth.uid() = owner_id);

-- 7. 사용자는 자신이 소유한 스토어의 직원만 추가 가능
CREATE POLICY employees_insert_policy ON employees
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM store_settings 
      WHERE id = store_id AND owner_id = auth.uid()
    )
  );

-- 8. 사용자는 자신이 소유한 직원만 수정 가능
CREATE POLICY employees_update_policy ON employees
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 9. 사용자는 자신이 소유한 직원만 삭제 가능
CREATE POLICY employees_delete_policy ON employees
  FOR DELETE
  USING (auth.uid() = owner_id);

-- 10. 직원 생성 시 자동으로 owner_id 설정하는 함수
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

-- 11. 트리거 생성
CREATE TRIGGER trigger_set_employee_owner
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION set_employee_owner();

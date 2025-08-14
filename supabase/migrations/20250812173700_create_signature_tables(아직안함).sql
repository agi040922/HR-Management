-- 서명 관련 테이블 생성
-- 계약서 서명 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  signer_type TEXT NOT NULL CHECK (signer_type IN ('employer', 'employee')),
  signer_name TEXT NOT NULL,
  signature_image_url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contract_signatures_contract_id ON contract_signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_signer_type ON contract_signatures(signer_type);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_signed_at ON contract_signatures(signed_at);

-- RLS 정책 활성화
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;

-- 기본 정책: 인증된 사용자만 접근 가능
CREATE POLICY "Users can view their own signatures" ON contract_signatures
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert signatures" ON contract_signatures
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own signatures" ON contract_signatures
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Storage 버킷 생성 (이미 존재하지 않는 경우)
INSERT INTO storage.buckets (id, name, public)
VALUES ('labor-contracts', 'labor-contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책 생성
CREATE POLICY "Anyone can view signature images" ON storage.objects
  FOR SELECT USING (bucket_id = 'labor-contracts');

CREATE POLICY "Authenticated users can upload signature images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'labor-contracts' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'signatures'
  );

-- 계약서 테이블에 서명 상태 컬럼 추가 (이미 존재하지 않는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'labor_contracts' AND column_name = 'signature_status'
  ) THEN
    ALTER TABLE labor_contracts ADD COLUMN signature_status TEXT DEFAULT 'pending' 
      CHECK (signature_status IN ('pending', 'employer_signed', 'employee_signed', 'completed'));
  END IF;
END $$;

-- 서명 완료 시 계약서 상태 업데이트 함수
CREATE OR REPLACE FUNCTION update_contract_signature_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 고용주와 근로자 서명이 모두 완료되었는지 확인
  IF (
    SELECT COUNT(*) 
    FROM contract_signatures 
    WHERE contract_id = NEW.contract_id 
    AND signer_type IN ('employer', 'employee')
  ) = 2 THEN
    -- 양측 서명 완료
    UPDATE labor_contracts 
    SET signature_status = 'completed'
    WHERE id = NEW.contract_id;
  ELSIF NEW.signer_type = 'employer' THEN
    -- 고용주 서명 완료
    UPDATE labor_contracts 
    SET signature_status = 'employer_signed'
    WHERE id = NEW.contract_id;
  ELSIF NEW.signer_type = 'employee' THEN
    -- 근로자 서명 완료
    UPDATE labor_contracts 
    SET signature_status = 'employee_signed'
    WHERE id = NEW.contract_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_signature_status ON contract_signatures;
CREATE TRIGGER trigger_update_signature_status
  AFTER INSERT ON contract_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_signature_status();

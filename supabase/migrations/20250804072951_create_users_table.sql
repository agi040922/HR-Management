-- 사용자 프로필 정보를 저장하는 users 테이블 생성
-- Supabase Auth의 auth.users와 1:1 관계로 연동

-- users 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 프로필 정보
  display_name VARCHAR(100),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  
  -- 추가 정보
  department VARCHAR(100),
  position VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  hire_date DATE,
  birth_date DATE,
  
  -- 주소 정보
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'South Korea',
  
  -- 설정 정보 (JSON)
  preferences JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- 상태 관리
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- updated_at 자동 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 적용
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 레코드만 조회 가능
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 레코드만 수정 가능
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 레코드만 삭제 가능
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = user_id);

-- 인증된 사용자는 자신의 프로필 생성 가능
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 사용자 정보 접근 가능 (선택사항)
-- CREATE POLICY "Admins can manage all users" ON public.users
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.users 
--       WHERE user_id = auth.uid() 
--       AND (settings->>'role')::text = 'admin'
--     )
--   );

-- 사용자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성될 때 자동으로 users 테이블에 레코드 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 코멘트 추가
COMMENT ON TABLE public.users IS '사용자 프로필 및 추가 정보 테이블';
COMMENT ON COLUMN public.users.user_id IS 'auth.users 테이블의 외래키';
COMMENT ON COLUMN public.users.display_name IS '사용자 표시 이름';
COMMENT ON COLUMN public.users.employee_id IS '직원 ID (고유값)';
COMMENT ON COLUMN public.users.preferences IS '사용자 개인 설정 (JSON)';
COMMENT ON COLUMN public.users.settings IS '시스템 설정 (JSON)';

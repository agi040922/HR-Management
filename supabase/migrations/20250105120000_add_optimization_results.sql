-- 스케줄 최적화 결과 저장 테이블 추가
-- 2025-01-05: 스케줄 최적화 분석 결과 및 이력 관리

-- 최적화 결과 테이블
CREATE TABLE IF NOT EXISTS optimization_results (
  id BIGSERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES public.store_settings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 분석 정보
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  analysis_period_start DATE,
  analysis_period_end DATE,
  
  -- 비용 정보
  current_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  optimized_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_savings DECIMAL(12,2) NOT NULL DEFAULT 0,
  savings_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  -- 제안 정보
  suggestion_count INTEGER NOT NULL DEFAULT 0,
  suggestions JSONB NOT NULL DEFAULT '[]',
  
  -- 리스크 평가
  risk_level VARCHAR(10) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  compliance_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  operational_impact TEXT,
  
  -- 적용 상태
  is_applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_suggestions JSONB DEFAULT '[]',
  
  -- 메타데이터
  employee_count INTEGER DEFAULT 0,
  schedule_count INTEGER DEFAULT 0,
  analysis_version VARCHAR(20) DEFAULT '2025.1',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 최적화 제안 상세 테이블 (정규화된 구조)
CREATE TABLE IF NOT EXISTS optimization_suggestions (
  id BIGSERIAL PRIMARY KEY,
  optimization_result_id BIGINT NOT NULL REFERENCES optimization_results(id) ON DELETE CASCADE,
  
  -- 제안 기본 정보
  suggestion_type VARCHAR(30) NOT NULL CHECK (suggestion_type IN ('REDUCE_HOURS', 'SPLIT_SHIFT', 'AVOID_NIGHT', 'REDISTRIBUTE_WORKLOAD')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  
  -- 비용 정보
  current_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  optimized_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  savings DECIMAL(10,2) NOT NULL DEFAULT 0,
  savings_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  -- 리스크 및 컴플라이언스
  risk_level VARCHAR(10) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  legal_compliance BOOLEAN NOT NULL DEFAULT true,
  
  -- 영향받는 직원들
  affected_employees JSONB NOT NULL DEFAULT '[]',
  implementation_notes TEXT,
  
  -- 적용 상태
  is_selected BOOLEAN NOT NULL DEFAULT false,
  is_applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  
  -- 우선순위 (절약액 기준 자동 계산)
  priority_score DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN risk_level = 'LOW' THEN savings * 1.0
      WHEN risk_level = 'MEDIUM' THEN savings * 0.7
      WHEN risk_level = 'HIGH' THEN savings * 0.4
    END
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 최적화 적용 이력 테이블
CREATE TABLE IF NOT EXISTS optimization_applications (
  id BIGSERIAL PRIMARY KEY,
  optimization_result_id BIGINT NOT NULL REFERENCES optimization_results(id) ON DELETE CASCADE,
  suggestion_id BIGINT REFERENCES optimization_suggestions(id) ON DELETE SET NULL,
  
  -- 적용 정보
  applied_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- 적용 결과
  expected_savings DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual_savings DECIMAL(10,2),
  effectiveness_score DECIMAL(5,2), -- 실제 효과 점수 (0-100)
  
  -- 피드백
  feedback TEXT,
  rollback_reason TEXT,
  is_rolled_back BOOLEAN NOT NULL DEFAULT false,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_optimization_results_store_id ON optimization_results(store_id);
CREATE INDEX IF NOT EXISTS idx_optimization_results_owner_id ON optimization_results(owner_id);
CREATE INDEX IF NOT EXISTS idx_optimization_results_analysis_date ON optimization_results(analysis_date);
CREATE INDEX IF NOT EXISTS idx_optimization_results_savings ON optimization_results(total_savings DESC);

CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_result_id ON optimization_suggestions(optimization_result_id);
CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_type ON optimization_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_priority ON optimization_suggestions(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_risk ON optimization_suggestions(risk_level);

CREATE INDEX IF NOT EXISTS idx_optimization_applications_result_id ON optimization_applications(optimization_result_id);
CREATE INDEX IF NOT EXISTS idx_optimization_applications_applied_by ON optimization_applications(applied_by);
CREATE INDEX IF NOT EXISTS idx_optimization_applications_applied_at ON optimization_applications(applied_at);

-- JSONB 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_optimization_results_suggestions_gin ON optimization_results USING GIN (suggestions);
CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_affected_employees_gin ON optimization_suggestions USING GIN (affected_employees);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_optimization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용
CREATE TRIGGER trigger_optimization_results_updated_at
  BEFORE UPDATE ON optimization_results
  FOR EACH ROW
  EXECUTE FUNCTION update_optimization_updated_at();

CREATE TRIGGER trigger_optimization_suggestions_updated_at
  BEFORE UPDATE ON optimization_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_optimization_updated_at();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_applications ENABLE ROW LEVEL SECURITY;

-- 스토어 소유자만 최적화 결과 접근 가능
CREATE POLICY "Users can access optimization results of their stores" ON optimization_results
  FOR ALL USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.store_settings 
      WHERE store_settings.id = optimization_results.store_id 
      AND store_settings.owner_id = auth.uid()
    )
  );

-- 최적화 제안 접근 제어
CREATE POLICY "Users can access optimization suggestions" ON optimization_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM optimization_results 
      WHERE optimization_results.id = optimization_suggestions.optimization_result_id 
      AND optimization_results.owner_id = auth.uid()
    )
  );

-- 최적화 적용 이력 접근 제어
CREATE POLICY "Users can access optimization applications" ON optimization_applications
  FOR ALL USING (
    auth.uid() = applied_by OR
    EXISTS (
      SELECT 1 FROM optimization_results 
      WHERE optimization_results.id = optimization_applications.optimization_result_id 
      AND optimization_results.owner_id = auth.uid()
    )
  );

-- 최적화 결과 요약 뷰
CREATE OR REPLACE VIEW optimization_summary AS
SELECT 
  or_main.id,
  or_main.store_id,
  ss.store_name,
  or_main.analysis_date,
  or_main.current_cost,
  or_main.optimized_cost,
  or_main.total_savings,
  or_main.savings_percentage,
  or_main.suggestion_count,
  or_main.risk_level,
  or_main.compliance_score,
  or_main.is_applied,
  
  -- 제안 유형별 통계
  COUNT(CASE WHEN os.suggestion_type = 'REDUCE_HOURS' THEN 1 END) as reduce_hours_count,
  COUNT(CASE WHEN os.suggestion_type = 'SPLIT_SHIFT' THEN 1 END) as split_shift_count,
  COUNT(CASE WHEN os.suggestion_type = 'AVOID_NIGHT' THEN 1 END) as avoid_night_count,
  COUNT(CASE WHEN os.suggestion_type = 'REDISTRIBUTE_WORKLOAD' THEN 1 END) as redistribute_count,
  
  -- 리스크별 통계
  COUNT(CASE WHEN os.risk_level = 'HIGH' THEN 1 END) as high_risk_count,
  COUNT(CASE WHEN os.risk_level = 'MEDIUM' THEN 1 END) as medium_risk_count,
  COUNT(CASE WHEN os.risk_level = 'LOW' THEN 1 END) as low_risk_count,
  
  -- 적용 통계
  COUNT(CASE WHEN os.is_applied = true THEN 1 END) as applied_suggestions_count,
  SUM(CASE WHEN os.is_applied = true THEN os.savings ELSE 0 END) as realized_savings

FROM optimization_results or_main
LEFT JOIN public.store_settings ss ON or_main.store_id = ss.id
LEFT JOIN optimization_suggestions os ON or_main.id = os.optimization_result_id
GROUP BY 
  or_main.id, or_main.store_id, ss.store_name, or_main.analysis_date,
  or_main.current_cost, or_main.optimized_cost, or_main.total_savings,
  or_main.savings_percentage, or_main.suggestion_count, or_main.risk_level,
  or_main.compliance_score, or_main.is_applied;

-- 최적화 성과 추적 함수
CREATE OR REPLACE FUNCTION calculate_optimization_effectiveness(
  p_optimization_result_id BIGINT
) RETURNS TABLE (
  total_expected_savings DECIMAL(10,2),
  total_actual_savings DECIMAL(10,2),
  effectiveness_percentage DECIMAL(5,2),
  applied_suggestions_count INTEGER,
  successful_applications_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(oa.expected_savings), 0) as total_expected_savings,
    COALESCE(SUM(oa.actual_savings), 0) as total_actual_savings,
    CASE 
      WHEN SUM(oa.expected_savings) > 0 THEN 
        (SUM(COALESCE(oa.actual_savings, 0)) / SUM(oa.expected_savings) * 100)
      ELSE 0 
    END as effectiveness_percentage,
    COUNT(*)::INTEGER as applied_suggestions_count,
    COUNT(CASE WHEN oa.actual_savings >= oa.expected_savings * 0.8 THEN 1 END)::INTEGER as successful_applications_count
  FROM optimization_applications oa
  WHERE oa.optimization_result_id = p_optimization_result_id
    AND oa.is_rolled_back = false;
END;
$$ LANGUAGE plpgsql;

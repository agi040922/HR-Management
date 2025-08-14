# HR 관리 시스템 - 스케줄 템플릿 관리 API 문서

## 📋 개요

이 문서는 HR 관리 시스템의 스케줄 템플릿 관리 기능에 대한 종합적인 API 및 구현 가이드입니다.

### 주요 기능
- ✅ **스케줄 템플릿 관리**: JSONB 기반 유연한 주간 스케줄 템플릿
- ✅ **직원 관리**: 스토어별 직원 추가/수정/상태 관리
- ✅ **브레이크 시간 설정**: 요일별 세분화된 브레이크 시간 관리
- ✅ **시간 슬롯 관리**: 30분 단위 시간 슬롯별 직원 배정
- ✅ **권한 관리**: RLS 정책 기반 스토어 소유자 권한 제어

## 📁 문서 구조

| 문서 | 설명 |
|------|------|
| **[schedule-template-api.md](./schedule-template-api.md)** | 모든 API 함수와 React Hook 정리 |
| **[schedule-utils.md](./schedule-utils.md)** | 유틸리티 함수 및 헬퍼 함수들 |
| **[template-service.md](./template-service.md)** | 비즈니스 로직 서비스 클래스 |
| **[ui-components.md](./ui-components.md)** | UI 컴포넌트 구조 및 패턴 |

## 🏗️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                             │
├─────────────────────────────────────────────────────────┤
│  Templates Page  │  Employees Page  │  Breaks Page     │
│  - 템플릿 관리    │  - 직원 관리      │  - 브레이크 설정  │
│  - 시간 슬롯 배정 │  - 상태 관리      │  - 요일별 관리    │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                 Business Logic Layer                    │
├─────────────────────────────────────────────────────────┤
│  useScheduleTemplates Hook  │  TemplateService Class   │
│  - 상태 관리                │  - 비즈니스 로직          │
│  - API 호출 조율            │  - 데이터 변환            │
│  - 에러 처리                │  - 검증 로직              │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   API Layer                             │
├─────────────────────────────────────────────────────────┤
│  schedule-api.ts            │  schedule-utils.ts        │
│  - CRUD 작업                │  - 유틸리티 함수          │
│  - Supabase 연동            │  - 시간 변환              │
│  - 에러 처리                │  - 데이터 조작            │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                         │
├─────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                   │
│  - weekly_schedule_templates (JSONB)                   │
│  - employees (RLS 정책)                                │
│  - store_settings                                      │
│  - RLS 정책 및 트리거                                   │
└─────────────────────────────────────────────────────────┘
```

## 🔄 데이터 플로우

### 1. 템플릿 생성/수정 플로우
```
사용자 입력 → UI 컴포넌트 → TemplateService → schedule-utils → API 함수 → Supabase
     ↓
로컬 상태 업데이트 ← useScheduleTemplates Hook ← API 응답 ← Supabase
```

### 2. 직원 관리 플로우
```
직원 폼 → 유효성 검증 → addEmployee/editEmployee → createEmployee/updateEmployee → Supabase
    ↓
직원 목록 업데이트 ← 로컬 상태 업데이트 ← API 응답 ← RLS 정책 적용
```

### 3. 브레이크 시간 설정 플로우
```
브레이크 폼 → 시간 검증 → updateTemplate → updateScheduleTemplate → JSONB 업데이트
     ↓
실시간 UI 업데이트 ← 로컬 상태 동기화 ← API 응답
```

## 📊 핵심 데이터 구조

### JSONB 스케줄 구조
```typescript
{
  "monday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "18:00",
    "break_periods": [
      { "name": "점심시간", "start": "12:00", "end": "13:00" }
    ],
    "time_slots": {
      "09:00": [123, 456],  // 직원 ID 배열
      "09:30": [123],
      "10:00": [456, 789]
    }
  },
  // ... 다른 요일들
}
```

### 직원 데이터 구조
```typescript
{
  "id": 123,
  "store_id": 1,
  "owner_id": "uuid-string",
  "name": "홍길동",
  "position": "매니저",
  "hourly_wage": 12000,
  "phone": "010-1234-5678",
  "start_date": "2025-01-01",
  "is_active": true
}
```

## 🔐 보안 및 권한

### Row Level Security (RLS) 정책
```sql
-- 직원 테이블 접근 제어
CREATE POLICY employees_select_policy ON employees
  FOR SELECT USING (auth.uid() = owner_id);

-- 스토어 설정 접근 제어  
CREATE POLICY store_settings_select_policy ON store_settings
  FOR SELECT USING (auth.uid() = owner_id);

-- 템플릿 접근 제어 (스토어 소유자 기반)
CREATE POLICY templates_select_policy ON weekly_schedule_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM store_settings 
      WHERE id = store_id AND owner_id = auth.uid()
    )
  );
```

### 자동 트리거
```sql
-- 직원 생성 시 owner_id 자동 설정
CREATE TRIGGER set_employee_owner_trigger
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_employee_owner();
```

## 🚀 주요 기능별 사용법

### 1. 새 템플릿 생성
```typescript
// 1. 기본 스케줄 생성
const defaultSchedule = createDefaultWeekSchedule(storeSettings);

// 2. 템플릿 생성
const templateId = await createTemplate(
  storeId, 
  "주간 기본 템플릿", 
  defaultSchedule
);

// 3. 로컬 상태 자동 업데이트
```

### 2. 직원 추가 및 배정
```typescript
// 1. 직원 추가
const newEmployee = await addEmployee({
  store_id: currentStore.id,
  name: "김직원",
  hourly_wage: 10030,
  position: "아르바이트",
  is_active: true
});

// 2. 시간 슬롯에 배정
const updatedSchedule = templateService.toggleEmployeeInSlot(
  scheduleData,
  'monday',
  '14:00',
  newEmployee.id
);
```

### 3. 브레이크 시간 설정
```typescript
// 1. 브레이크 시간 추가
const breakPeriod = {
  name: "점심시간",
  start: "12:00", 
  end: "13:00"
};

// 2. 스케줄에 적용
const updatedSchedule = templateService.addBreakPeriod(
  scheduleData,
  'tuesday',
  breakPeriod
);

// 3. 템플릿 업데이트
await updateTemplate(templateId, templateName, updatedSchedule);
```

## 📈 성능 최적화 전략

### 1. 클라이언트 사이드
- **React.memo()**: 컴포넌트 리렌더링 최적화
- **useCallback()**: 함수 메모이제이션
- **useMemo()**: 복잡한 계산 결과 캐싱
- **지연 로딩**: 필요할 때만 데이터 로드

### 2. 서버 사이드
- **JSONB 인덱스**: 스케줄 데이터 검색 최적화
- **RLS 정책**: 데이터베이스 레벨 권한 제어
- **PostgreSQL 함수**: 서버 사이드 로직 처리

### 3. 네트워크
- **배치 처리**: 여러 변경사항 한 번에 전송
- **낙관적 업데이트**: UI 즉시 반영 후 서버 동기화
- **에러 복구**: 실패 시 자동 재시도

## 🧪 테스트 전략

### 1. 단위 테스트
```typescript
// API 함수 테스트
describe('createEmployee', () => {
  it('should create employee with correct data', async () => {
    const employeeData = {
      store_id: 1,
      name: '테스트직원',
      hourly_wage: 10030,
      is_active: true
    };
    
    const result = await createEmployee(employeeData);
    expect(result.name).toBe('테스트직원');
  });
});

// 유틸리티 함수 테스트
describe('generateTimeSlots', () => {
  it('should generate correct time slots', () => {
    const slots = generateTimeSlots('09:00', '12:00', 30);
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']);
  });
});
```

### 2. 통합 테스트
```typescript
// Hook 테스트
describe('useScheduleTemplates', () => {
  it('should load templates when store changes', async () => {
    const { result } = renderHook(() => useScheduleTemplates());
    
    act(() => {
      result.current.setCurrentStore(mockStore);
    });
    
    await waitFor(() => {
      expect(result.current.templates).toHaveLength(2);
    });
  });
});
```

### 3. E2E 테스트
```typescript
// Playwright 또는 Cypress
test('should create and edit template', async ({ page }) => {
  await page.goto('/templates');
  await page.click('[data-testid="create-template"]');
  await page.fill('[data-testid="template-name"]', '새 템플릿');
  await page.click('[data-testid="save-template"]');
  
  await expect(page.locator('[data-testid="template-list"]')).toContainText('새 템플릿');
});
```

## 🔧 개발 환경 설정

### 필수 의존성
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "react": "^18.x",
    "typescript": "^5.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "jest": "^29.x"
  }
}
```

### 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚨 알려진 제한사항 및 고려사항

### 1. 현재 제한사항
- **시간대 지원**: 현재 로컬 시간대만 지원
- **대량 데이터**: 1000명 이상 직원 시 성능 저하 가능
- **실시간 동기화**: 여러 사용자 동시 편집 시 충돌 가능

### 2. 향후 개선 계획
- **국제화**: 다양한 언어 및 시간대 지원
- **실시간 협업**: WebSocket 기반 실시간 동기화
- **모바일 최적화**: PWA 및 반응형 개선
- **고급 분석**: 스케줄 효율성 분석 대시보드

## 📞 지원 및 문의

### 개발팀 연락처
- **기술 문의**: 개발팀 이메일
- **버그 리포트**: GitHub Issues
- **기능 요청**: 제품 팀 연락처

### 유용한 링크
- [Supabase 문서](https://supabase.com/docs)
- [React Hook 가이드](https://react.dev/reference/react)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0.0 | 2025-08-14 | 초기 스케줄 템플릿 관리 시스템 구현 |
| | | - JSONB 기반 유연한 스케줄 구조 |
| | | - 직원 관리 및 브레이크 시간 설정 |
| | | - RLS 정책 기반 권한 제어 |
| | | - React Hook 및 서비스 클래스 분리 |

---

**📌 이 문서는 지속적으로 업데이트됩니다. 최신 버전을 확인해주세요.**

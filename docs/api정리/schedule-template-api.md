# 스케줄 템플릿 관리 API 정리

## 개요
HR 관리 시스템의 스케줄 템플릿, 직원 관리, 브레이크 시간 설정을 위한 API 함수들을 정리한 문서입니다.

## 파일 구조
```
lib/
├── api/
│   └── schedule-api.ts           # 모든 API 함수들
├── hooks/
│   └── useScheduleTemplates.ts   # React 훅
├── types/
│   └── schedule.ts               # TypeScript 타입 정의
├── utils/
│   └── schedule-utils.ts         # 유틸리티 함수들
└── services/
    └── template-service.ts       # 비즈니스 로직 서비스
```

## API 함수 목록

### 1. 스케줄 템플릿 관리

#### `getScheduleTemplates(storeId: number)`
- **목적**: 스토어의 모든 스케줄 템플릿 조회
- **매개변수**: 
  - `storeId`: 스토어 ID
- **반환값**: `Promise<WeeklyTemplateData[]>`
- **설명**: 특정 스토어의 모든 템플릿을 생성일 역순으로 조회

#### `getScheduleTemplate(templateId: number)`
- **목적**: 특정 스케줄 템플릿 조회
- **매개변수**: 
  - `templateId`: 템플릿 ID
- **반환값**: `Promise<WeeklyTemplateData | null>`
- **설명**: 단일 템플릿 상세 정보 조회

#### `createScheduleTemplate(storeId: number, templateName: string, scheduleData: WeekScheduleData)`
- **목적**: 새로운 스케줄 템플릿 생성
- **매개변수**: 
  - `storeId`: 스토어 ID
  - `templateName`: 템플릿 이름
  - `scheduleData`: 주간 스케줄 데이터 (JSONB)
- **반환값**: `Promise<number>` (생성된 템플릿 ID)
- **설명**: JSONB 구조로 유연한 스케줄 데이터 저장

#### `updateScheduleTemplate(templateId: number, templateName: string, scheduleData: WeekScheduleData)`
- **목적**: 기존 스케줄 템플릿 수정
- **매개변수**: 
  - `templateId`: 템플릿 ID
  - `templateName`: 수정할 템플릿 이름
  - `scheduleData`: 수정할 주간 스케줄 데이터
- **반환값**: `Promise<boolean>`

#### `toggleScheduleTemplateStatus(templateId: number, isActive: boolean)`
- **목적**: 템플릿 활성/비활성 상태 변경
- **매개변수**: 
  - `templateId`: 템플릿 ID
  - `isActive`: 활성 상태 (true/false)
- **반환값**: `Promise<boolean>`

#### `deleteScheduleTemplate(templateId: number)`
- **목적**: 스케줄 템플릿 삭제
- **매개변수**: 
  - `templateId`: 템플릿 ID
- **반환값**: `Promise<boolean>`

#### `createDefaultScheduleTemplate(storeId: number, templateName?: string)`
- **목적**: 기본 스케줄 템플릿 생성
- **매개변수**: 
  - `storeId`: 스토어 ID
  - `templateName`: 템플릿 이름 (선택사항, 기본값: "기본 템플릿")
- **반환값**: `Promise<number>` (생성된 템플릿 ID)
- **설명**: 스토어 설정에 따른 기본 운영시간으로 템플릿 자동 생성

### 2. 직원 관리

#### `getEmployees(storeId: number)`
- **목적**: 스토어의 모든 직원 조회
- **매개변수**: 
  - `storeId`: 스토어 ID
- **반환값**: `Promise<Employee[]>`
- **설명**: 이름순으로 정렬된 직원 목록 반환

#### `createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>)`
- **목적**: 새 직원 생성
- **매개변수**: 
  - `employeeData`: 직원 정보 (ID, 생성/수정일 제외)
- **반환값**: `Promise<Employee>`
- **설명**: RLS 정책에 의해 owner_id 자동 설정

#### `updateEmployee(employeeId: number, employeeData: Partial<Employee>)`
- **목적**: 직원 정보 수정
- **매개변수**: 
  - `employeeId`: 직원 ID
  - `employeeData`: 수정할 직원 정보 (부분 업데이트)
- **반환값**: `Promise<Employee>`

#### `toggleEmployeeStatus(employeeId: number, isActive: boolean)`
- **목적**: 직원 활성/비활성 상태 변경
- **매개변수**: 
  - `employeeId`: 직원 ID
  - `isActive`: 활성 상태
- **반환값**: `Promise<boolean>`

#### `deleteEmployee(employeeId: number)`
- **목적**: 직원 삭제 (실제로는 비활성화)
- **매개변수**: 
  - `employeeId`: 직원 ID
- **반환값**: `Promise<boolean>`
- **설명**: 데이터 보존을 위해 실제 삭제가 아닌 비활성화 처리

### 3. 스토어 관리

#### `getStoreSettings(storeId: number)`
- **목적**: 스토어 설정 조회
- **매개변수**: 
  - `storeId`: 스토어 ID
- **반환값**: `Promise<StoreSettings | null>`

#### `getUserStores(userId: string)`
- **목적**: 사용자가 소유한 모든 스토어 조회
- **매개변수**: 
  - `userId`: 사용자 ID
- **반환값**: `Promise<StoreSettings[]>`
- **설명**: RLS 정책에 의해 소유자만 접근 가능

#### `getStoreEmployees(storeId: number)`
- **목적**: 스토어의 직원 목록 조회 (별칭)
- **매개변수**: 
  - `storeId`: 스토어 ID
- **반환값**: `Promise<Employee[]>`
- **설명**: `getEmployees()`와 동일한 기능

## React Hook: useScheduleTemplates

### 상태 관리
```typescript
interface UseScheduleTemplatesReturn {
  // 상태
  templates: WeeklyTemplateData[];
  stores: StoreSettings[];
  employees: Employee[];
  currentStore: StoreSettings | null;
  loading: boolean;
  error: string | null;
  
  // 템플릿 관리 액션
  loadTemplates: (storeId: number) => Promise<void>;
  createTemplate: (storeId: number, templateName: string, scheduleData?: WeekScheduleData) => Promise<number>;
  updateTemplate: (templateId: number, templateName: string, scheduleData: WeekScheduleData) => Promise<void>;
  toggleTemplateStatus: (templateId: number, isActive: boolean) => Promise<void>;
  removeTemplate: (templateId: number) => Promise<void>;
  createDefaultTemplate: (storeId: number, templateName?: string) => Promise<number>;
  
  // 스토어 관리 액션
  loadStores: (userId: string) => Promise<void>;
  setCurrentStore: (store: StoreSettings | null) => void;
  
  // 직원 관리 액션
  loadEmployees: (storeId: number) => Promise<void>;
  addEmployee: (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<Employee>;
  editEmployee: (employeeId: number, employeeData: Partial<Employee>) => Promise<Employee>;
  toggleEmployee: (employeeId: number, isActive: boolean) => Promise<void>;
  
  // 유틸리티
  clearError: () => void;
}
```

### 주요 특징
- **자동 상태 관리**: API 호출 후 로컬 상태 자동 업데이트
- **에러 처리**: 모든 API 호출에 대한 통합 에러 처리
- **로딩 상태**: 비동기 작업 중 로딩 상태 제공
- **최적화**: useCallback을 사용한 함수 메모이제이션

## 데이터 타입 정의

### WeeklyTemplateData
```typescript
interface WeeklyTemplateData {
  id: number;
  store_id: number;
  template_name: string;
  schedule_data: WeekScheduleData;  // JSONB
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### WeekScheduleData
```typescript
type WeekScheduleData = {
  [K in DayOfWeek]: DaySchedule;
}
```

### DaySchedule
```typescript
interface DaySchedule {
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_periods: BreakPeriod[];
  time_slots: { [timeSlot: string]: number[] };  // 시간대별 직원 ID 배열
}
```

### Employee
```typescript
interface Employee {
  id: number;
  store_id: number;
  name: string;
  position?: string;
  hourly_wage: number;
  is_active: boolean;
  phone?: string;
  start_date?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}
```

### BreakPeriod
```typescript
interface BreakPeriod {
  name: string;
  start: string;  // HH:MM 형식
  end: string;    // HH:MM 형식
}
```

## 보안 및 권한

### Row Level Security (RLS) 정책
- **employees 테이블**: owner_id 기반 접근 제어
- **store_settings 테이블**: owner_id 기반 접근 제어
- **weekly_schedule_templates 테이블**: 스토어 소유자만 접근 가능

### 자동 트리거
- **set_employee_owner()**: 직원 생성 시 owner_id 자동 설정
- **updated_at 트리거**: 모든 테이블의 수정 시간 자동 업데이트

## 사용 예시

### 기본 사용법
```typescript
import { useScheduleTemplates } from '@/lib/hooks/useScheduleTemplates';

function TemplateManagement() {
  const {
    templates,
    stores,
    employees,
    currentStore,
    loading,
    error,
    loadStores,
    loadTemplates,
    loadEmployees,
    createTemplate,
    addEmployee
  } = useScheduleTemplates();

  useEffect(() => {
    if (user) {
      loadStores(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (currentStore) {
      loadTemplates(currentStore.id);
      loadEmployees(currentStore.id);
    }
  }, [currentStore]);

  // 템플릿 생성
  const handleCreateTemplate = async () => {
    const scheduleData = createDefaultWeekSchedule();
    await createTemplate(currentStore.id, "새 템플릿", scheduleData);
  };

  // 직원 추가
  const handleAddEmployee = async () => {
    await addEmployee({
      store_id: currentStore.id,
      name: "홍길동",
      hourly_wage: 10030,
      is_active: true
    });
  };
}
```

## 에러 처리

모든 API 함수는 다음과 같은 에러 처리 패턴을 따릅니다:

```typescript
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');

  if (error) {
    console.error('API 오류:', error);
    throw new Error(`작업 실패: ${error.message}`);
  }

  return data;
} catch (error) {
  console.error('예외 발생:', error);
  throw error;
}
```

## 성능 최적화

1. **JSONB 인덱스**: schedule_data에 GIN 인덱스 적용
2. **쿼리 최적화**: 필요한 컬럼만 선택적으로 조회
3. **로컬 상태 관리**: API 호출 최소화를 위한 클라이언트 상태 캐싱
4. **함수 메모이제이션**: useCallback을 통한 불필요한 리렌더링 방지

## 향후 개선 사항

1. **페이지네이션**: 대량 데이터 처리를 위한 페이징 구현
2. **실시간 업데이트**: Supabase Realtime을 활용한 실시간 동기화
3. **캐싱 전략**: React Query 도입을 통한 고급 캐싱
4. **오프라인 지원**: PWA 기능을 통한 오프라인 데이터 관리

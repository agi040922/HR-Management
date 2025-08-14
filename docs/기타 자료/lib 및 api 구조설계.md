# lib 폴더 구조 및 API 설계 원칙

이 문서는 HR 관리 시스템의 `lib` 폴더 구조와 API 설계 원칙을 설명합니다.

## 목차
1. [lib 폴더 구조 개요](#lib-폴더-구조-개요)
2. [각 폴더별 역할과 기준](#각-폴더별-역할과-기준)
3. [API 설계 및 분리 원칙](#api-설계-및-분리-원칙)
4. [실제 사용 예시](#실제-사용-예시)
5. [베스트 프랙티스](#베스트-프랙티스)

---

## lib 폴더 구조 개요

```
lib/
├── api/                    # 외부 API 호출 및 데이터베이스 연동
│   ├── schedule-api.ts     # 스케줄 템플릿 관련 API
│   └── work-schedule-api.ts # 실제 근무 스케줄 관련 API
├── hooks/                  # React 커스텀 훅
│   ├── useScheduleTemplates.ts
│   └── useWorkSchedules.ts
├── services/               # 비즈니스 로직 서비스
│   └── template-service.ts
├── types/                  # TypeScript 타입 정의
│   └── schedule.ts
├── utils/                  # 유틸리티 함수
│   └── schedule-utils.ts
├── supabase.ts            # Supabase 클라이언트 설정
├── utils.ts               # 공통 유틸리티
├── payroll-calculator-new.ts  # 급여 계산 로직
├── labor-contract-utils.ts    # 근로계약 관련 유틸
├── pdf-generator.ts           # PDF 생성 유틸
└── signature-utils.ts         # 전자서명 유틸
```

---

## 각 폴더별 역할과 기준

### 1. `api/` 폴더

**역할**: 외부 API 호출 및 데이터베이스 CRUD 작업을 담당

**분리 기준**:
- **도메인별 분리**: 테이블이나 기능 도메인 단위로 분리
- **책임별 분리**: 데이터 접근 로직만 포함, 비즈니스 로직 제외

**현재 구조**:
```typescript
// schedule-api.ts - 스케줄 템플릿 관련
export async function getScheduleTemplates(storeId: number)
export async function createScheduleTemplate(...)
export async function getUserStores(userId: string)
export async function getStoreEmployees(storeId: number)

// work-schedule-api.ts - 실제 근무 스케줄 관련
export async function getWorkSchedules(...)
export async function createWorkSchedule(...)
export async function getWeeklyScheduleSummary(...)
```

**분리 원칙**:
1. **테이블 단위**: 주요 테이블별로 API 파일 분리
2. **기능 도메인**: 관련된 테이블들을 하나의 도메인으로 묶어서 분리
3. **복잡도**: 파일이 너무 커지면 세부 기능별로 추가 분리

### 2. `hooks/` 폴더

**역할**: React 상태 관리 및 API 호출을 캡슐화한 커스텀 훅

**분리 기준**:
- **페이지/컴포넌트별**: 특정 페이지나 컴포넌트에서 사용하는 상태와 로직
- **기능별**: 특정 기능 도메인의 상태 관리

**현재 구조**:
```typescript
// useScheduleTemplates.ts - 스케줄 템플릿 관련 상태 관리
export function useScheduleTemplates() {
  // 상태: templates, stores, employees, currentStore
  // 액션: loadTemplates, createTemplate, updateTemplate
}

// useWorkSchedules.ts - 실제 근무 스케줄 상태 관리  
export function useWorkSchedules() {
  // 상태: schedules, weeklySummary, availableEmployees
  // 액션: loadSchedules, addSchedule, editSchedule
}
```

### 3. `services/` 폴더

**역할**: 복잡한 비즈니스 로직을 캡슐화

**분리 기준**:
- **복잡한 비즈니스 로직**: 여러 API를 조합하거나 복잡한 계산이 필요한 경우
- **재사용 가능한 로직**: 여러 컴포넌트에서 공통으로 사용하는 로직

**현재 구조**:
```typescript
// template-service.ts - 템플릿 관련 비즈니스 로직
export class TemplateService {
  // 복잡한 템플릿 생성/수정 로직
  // 여러 API 호출을 조합한 로직
}
```

### 4. `types/` 폴더

**역할**: TypeScript 타입 정의 및 인터페이스

**분리 기준**:
- **도메인별**: 관련된 타입들을 도메인별로 그룹화
- **공통성**: 여러 도메인에서 사용하는 공통 타입은 별도 파일

**현재 구조**:
```typescript
// schedule.ts - 스케줄 관련 모든 타입
export interface WeeklyTemplateData { ... }
export interface WorkSchedule { ... }
export interface Employee { ... }
export interface StoreSettings { ... }
```

### 5. `utils/` 폴더

**역할**: 순수 함수 형태의 유틸리티 함수

**분리 기준**:
- **기능별**: 특정 기능 도메인의 유틸리티 함수
- **공통성**: 프로젝트 전체에서 사용하는 공통 유틸리티

**현재 구조**:
```typescript
// schedule-utils.ts - 스케줄 관련 유틸리티
export function formatTime(time: string): string
export function calculateWorkHours(...): number
export function getDayName(date: string): string

// utils.ts - 공통 유틸리티
export function cn(...inputs: ClassValue[]): string
```

---

## API 설계 및 분리 원칙

### 1. API 분리 전략

#### A. 테이블 단위 분리 (기본 원칙)
```typescript
// user-api.ts
export async function getUsers()
export async function createUser()
export async function updateUser()
export async function deleteUser()

// store-api.ts  
export async function getStores()
export async function createStore()
export async function updateStore()
export async function deleteStore()
```

#### B. 도메인 단위 분리 (관련 테이블 그룹화)
```typescript
// schedule-api.ts (현재 방식)
// 스케줄 템플릿 + 스토어 + 직원 관련 API를 하나로 묶음
export async function getScheduleTemplates()
export async function getUserStores()      // 관련 테이블
export async function getStoreEmployees()  // 관련 테이블
```

#### C. 기능 단위 분리
```typescript
// auth-api.ts
export async function signIn()
export async function signUp()
export async function signOut()

// payroll-api.ts
export async function calculatePayroll()
export async function generatePayslip()
```

### 2. 통합 API 처리 방법

#### A. Service Layer 활용
```typescript
// payroll-service.ts
export class PayrollService {
  async calculateEmployeePayroll(employeeId: number, month: string) {
    // 1. 직원 정보 조회 (employee-api)
    const employee = await getEmployee(employeeId);
    
    // 2. 근무 스케줄 조회 (schedule-api)
    const schedules = await getEmployeeSchedules(employeeId, month);
    
    // 3. 급여 계산 (payroll-calculator)
    const payroll = calculatePayroll(employee, schedules);
    
    // 4. 급여 기록 저장 (payroll-api)
    return await savePayrollRecord(payroll);
  }
}
```

#### B. Custom Hook에서 통합
```typescript
// usePayroll.ts
export function usePayroll() {
  const calculateMonthlyPayroll = async (employeeId: number, month: string) => {
    // 여러 API 호출을 순차적으로 실행
    const employee = await getEmployee(employeeId);
    const schedules = await getEmployeeSchedules(employeeId, month);
    const payroll = calculatePayroll(employee, schedules);
    return payroll;
  };
  
  return { calculateMonthlyPayroll };
}
```

#### C. 복합 API 함수 생성
```typescript
// composite-api.ts
export async function getEmployeePayrollData(employeeId: number, month: string) {
  const [employee, schedules, settings] = await Promise.all([
    getEmployee(employeeId),
    getEmployeeSchedules(employeeId, month),
    getPayrollSettings()
  ]);
  
  return { employee, schedules, settings };
}
```

### 3. API 범위 결정 기준

#### 어디까지 API화 할 것인가?

**API화 해야 하는 것들**:
- ✅ 데이터베이스 CRUD 작업
- ✅ 외부 서비스 호출
- ✅ 파일 업로드/다운로드
- ✅ 인증/권한 관련 작업

**API화 하지 않는 것들**:
- ❌ 단순한 데이터 변환 (utils로)
- ❌ UI 상태 관리 (hooks로)
- ❌ 순수 계산 로직 (utils로)
- ❌ 컴포넌트 간 통신 (props/context로)

**예시**:
```typescript
// ✅ API로 처리
export async function saveEmployee(employeeData: Employee) {
  return await supabase.from('employees').insert(employeeData);
}

// ❌ API가 아닌 utils로 처리
export function formatEmployeeName(employee: Employee): string {
  return `${employee.lastName} ${employee.firstName}`;
}

// ❌ API가 아닌 hooks로 처리
export function useEmployeeForm() {
  const [formData, setFormData] = useState<Employee>({});
  // 폼 상태 관리 로직
}
```

---

## 실제 사용 예시

### 1. 페이지 컴포넌트에서의 사용

```typescript
// SchedulePage.tsx
export default function SchedulePage() {
  // 1. Hook으로 상태 관리
  const { 
    schedules, 
    loading, 
    addSchedule, 
    updateSchedule 
  } = useWorkSchedules();
  
  // 2. Service로 복잡한 비즈니스 로직
  const handleBulkScheduleCreate = async () => {
    await TemplateService.applyTemplateToWeek(templateId, weekStart);
  };
  
  // 3. Utils로 데이터 변환
  const formattedSchedules = schedules.map(schedule => ({
    ...schedule,
    displayTime: formatTimeRange(schedule.start_time, schedule.end_time),
    workHours: calculateWorkHours(schedule.start_time, schedule.end_time, schedule.break_time)
  }));
  
  return (
    <div>
      {formattedSchedules.map(schedule => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}
```

### 2. 레이어별 역할 분담

```typescript
// API Layer - 데이터 접근만
export async function getEmployeeSchedules(employeeId: number, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('work_schedules')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error) throw error;
  return data;
}

// Service Layer - 비즈니스 로직
export class ScheduleService {
  static async generateWeeklyReport(employeeId: number, weekStart: string) {
    // 1. 데이터 수집
    const schedules = await getEmployeeSchedules(employeeId, weekStart, weekEnd);
    const employee = await getEmployee(employeeId);
    
    // 2. 비즈니스 로직 적용
    const totalHours = schedules.reduce((sum, s) => sum + s.work_hours, 0);
    const overtimeHours = schedules.filter(s => s.is_overtime).reduce((sum, s) => sum + s.work_hours, 0);
    
    // 3. 결과 반환
    return {
      employee,
      schedules,
      summary: { totalHours, overtimeHours }
    };
  }
}

// Hook Layer - React 상태 관리
export function useWeeklyReport(employeeId: number, weekStart: string) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const loadReport = async () => {
    setLoading(true);
    try {
      const reportData = await ScheduleService.generateWeeklyReport(employeeId, weekStart);
      setReport(reportData);
    } catch (error) {
      console.error('Report loading failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { report, loading, loadReport };
}

// Utils Layer - 순수 함수
export function formatWorkHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}시간 ${m}분`;
}
```

---

## 베스트 프랙티스

### 1. API 설계 원칙

#### ✅ DO (해야 할 것)
- **단일 책임**: 하나의 API 함수는 하나의 책임만
- **일관된 네이밍**: `get`, `create`, `update`, `delete` 접두사 사용
- **에러 처리**: 모든 API 함수에서 적절한 에러 처리
- **타입 안전성**: TypeScript 타입을 명확히 정의
- **문서화**: JSDoc으로 함수 설명 작성

```typescript
/**
 * 직원의 주간 스케줄을 조회합니다.
 * @param employeeId 직원 ID
 * @param weekStart 주 시작일 (YYYY-MM-DD)
 * @returns 주간 스케줄 배열
 */
export async function getEmployeeWeeklySchedules(
  employeeId: number, 
  weekStart: string
): Promise<WorkSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', weekStart)
      .lte('date', getWeekEnd(weekStart));
    
    if (error) throw new Error(`스케줄 조회 실패: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('직원 주간 스케줄 조회 오류:', error);
    throw error;
  }
}
```

#### ❌ DON'T (하지 말아야 할 것)
- **비즈니스 로직 포함**: API 함수에 복잡한 계산 로직 포함
- **UI 상태 관리**: API 함수에서 React 상태 직접 조작
- **하드코딩**: 매직 넘버나 하드코딩된 값 사용
- **과도한 추상화**: 불필요하게 복잡한 추상화

### 2. 폴더 구조 확장 가이드

#### 프로젝트 성장에 따른 구조 변화

**소규모 프로젝트** (현재):
```
lib/
├── api/
├── hooks/
├── types/
├── utils/
└── services/
```

**중규모 프로젝트**:
```
lib/
├── api/
│   ├── auth/
│   ├── employee/
│   ├── schedule/
│   └── payroll/
├── hooks/
│   ├── auth/
│   ├── employee/
│   └── schedule/
├── services/
│   ├── auth/
│   ├── payroll/
│   └── notification/
├── types/
│   ├── api/
│   ├── ui/
│   └── business/
└── utils/
    ├── date/
    ├── format/
    └── validation/
```

**대규모 프로젝트**:
```
lib/
├── domains/
│   ├── auth/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── employee/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── schedule/
│       ├── api/
│       ├── hooks/
│       ├── services/
│       └── types/
├── shared/
│   ├── api/
│   ├── hooks/
│   ├── types/
│   └── utils/
└── core/
    ├── config/
    ├── constants/
    └── providers/
```

### 3. 성능 최적화 팁

#### API 호출 최적화
```typescript
// ✅ 병렬 호출
const [employees, schedules, stores] = await Promise.all([
  getEmployees(),
  getSchedules(),
  getStores()
]);

// ✅ 캐싱 활용
const cachedStores = useMemo(() => stores, [stores]);

// ✅ 조건부 호출
useEffect(() => {
  if (selectedStore && !schedules.length) {
    loadSchedules(selectedStore.id);
  }
}, [selectedStore]);
```

#### 메모리 최적화
```typescript
// ✅ 적절한 의존성 배열
const memoizedData = useMemo(() => {
  return processScheduleData(schedules);
}, [schedules]); // schedules가 변경될 때만 재계산

// ✅ 클린업 함수
useEffect(() => {
  const subscription = supabase
    .from('schedules')
    .on('*', handleScheduleChange)
    .subscribe();
    
  return () => subscription.unsubscribe(); // 메모리 누수 방지
}, []);
```

---

## 결론

lib 폴더 구조는 다음 원칙을 따라 설계되었습니다:

1. **관심사의 분리**: 각 폴더는 명확한 책임을 가짐
2. **재사용성**: 공통 로직을 재사용 가능한 형태로 분리
3. **확장성**: 프로젝트 성장에 따라 유연하게 확장 가능
4. **유지보수성**: 코드 변경 시 영향 범위를 최소화

이러한 구조를 통해 코드의 품질과 개발 효율성을 높일 수 있으며, 팀 개발 시에도 일관된 코드 작성이 가능합니다.

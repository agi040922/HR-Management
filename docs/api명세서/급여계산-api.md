# 급여 계산 시스템 API 명세서

## 📋 개요
HR 관리 시스템의 급여 계산 관련 데이터 저장 및 조회 API 명세서입니다.  
템플릿 기반 스케줄링과 예외사항을 반영한 월별 급여 자동 계산을 지원합니다.

## 🗄️ 핵심 데이터베이스 구조

### 1. store_settings 테이블
```sql
CREATE TABLE store_settings (
  id SERIAL PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  store_name VARCHAR(100) NOT NULL,
  time_slot_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. employees 테이블
```sql
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES store_settings(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(50) NOT NULL,
  hourly_wage INTEGER NOT NULL DEFAULT 10030,
  position VARCHAR(50),
  phone VARCHAR(20),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  labor_contract JSONB,  -- 근로계약서 정보 (전체 객체 저장)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. weekly_schedule_templates 테이블
```sql
CREATE TABLE weekly_schedule_templates (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES store_settings(id),
  template_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  schedule_data JSONB NOT NULL DEFAULT '{}',  -- 요일별 스케줄 데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. schedule_exceptions 테이블
```sql
CREATE TABLE schedule_exceptions (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES store_settings(id),
  employee_id INTEGER REFERENCES employees(id),
  template_id INTEGER REFERENCES weekly_schedule_templates(id),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  exception_type VARCHAR(20) CHECK (exception_type IN ('CANCEL', 'OVERRIDE', 'EXTRA')),
  notes TEXT,
  exception_data JSONB DEFAULT '{}',    -- 예외사항 상세 정보
  affected_slots JSONB DEFAULT '[]',    -- 영향받는 시간대 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 핵심 API 함수

### 1. 스토어 관리 API

#### getUserStoresForPayroll(userId: string)
**목적**: 급여 계산용 사용자 스토어 목록 조회  
**위치**: `/lib/api/(page)/payroll/payroll-test-api.ts`

```typescript
export async function getUserStoresForPayroll(userId: string): Promise<StoreData[]> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
```

**반환 데이터 구조**:
```typescript
interface StoreData {
  id: number
  owner_id: string
  store_name: string
  time_slot_minutes: number
  created_at: string
  updated_at: string
}
```

#### getStoresWithDetails(userId: string)
**목적**: 스토어와 관련 통계 정보 조회  
**위치**: `/lib/api/(page)/stores/stores-api.ts`

```typescript
export async function getStoresWithDetails(userId: string): Promise<StoreWithDetails[]> {
  const { data, error } = await supabase
    .from('store_settings')
    .select(`
      *,
      templates:weekly_schedule_templates(count),
      employees:employees(count),
      active_employees:employees!inner(count)
    `)
    .eq('owner_id', userId)
    .eq('active_employees.is_active', true)
    .order('created_at', { ascending: false })

  return (data || []).map(store => ({
    ...store,
    templates_count: store.templates?.[0]?.count || 0,
    employees_count: store.employees?.[0]?.count || 0,
    active_employees_count: store.active_employees?.[0]?.count || 0,
  }))
}
```

### 2. 직원 관리 API

#### getStoreEmployeesForPayroll(storeId: number, ownerId: string)
**목적**: 급여 계산용 스토어 직원 목록 조회  
**위치**: `/lib/api/(page)/payroll/payroll-test-api.ts`

```typescript
export async function getStoreEmployeesForPayroll(
  storeId: number, 
  ownerId: string
): Promise<EmployeeData[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('store_id', storeId)
    .eq('owner_id', ownerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
```

**반환 데이터 구조**:
```typescript
interface EmployeeData {
  id: number
  store_id?: number
  owner_id: string
  name: string
  hourly_wage: number
  position?: string
  phone?: string
  start_date: string
  is_active: boolean
  labor_contract?: LaborContract | null  // JSONB 필드
  created_at: string
  updated_at: string
}
```

### 3. 스케줄 템플릿 API

#### getActiveTemplatesForPayroll(storeId: number)
**목적**: 급여 계산용 활성 템플릿 조회  
**위치**: `/lib/api/(page)/payroll/payroll-test-api.ts`

```typescript
export async function getActiveTemplatesForPayroll(storeId: number): Promise<TemplateData[]> {
  const { data, error } = await supabase
    .from('weekly_schedule_templates')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
```

**반환 데이터 구조**:
```typescript
interface TemplateData {
  id: number
  store_id: number
  template_name: string
  is_active: boolean
  schedule_data: any  // JSONB 필드
  created_at: string
  updated_at: string
}
```

### 4. 예외사항 API

#### getExceptionsForPayroll(storeId: number, year: number, month: number)
**목적**: 특정 월의 스케줄 예외사항 조회  
**위치**: `/lib/api/(page)/payroll/payroll-test-api.ts`

```typescript
async function getMonthlyExceptions(
  storeId: number,
  year: number,
  month: number
): Promise<ExceptionData[]> {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

  const { data, error } = await supabase
    .from('schedule_exceptions')
    .select('*')
    .eq('store_id', storeId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}
```

## 📊 JSONB 필드 상세 구조

### 1. schedule_data (템플릿 스케줄)
**테이블**: `weekly_schedule_templates.schedule_data`  
**저장 로직**: 요일별 매장 운영 정보와 직원별 근무 시간 저장

```typescript
interface ScheduleData {
  [day: string]: {  // 'monday', 'tuesday', ..., 'sunday'
    is_open: boolean
    open_time: string      // '09:00'
    close_time: string     // '21:00'
    break_periods: Array<{
      start: string
      end: string
      name: string
    }>
    employees: {
      [employeeId: string]: {
        start_time: string
        end_time: string
        break_periods: Array<{
          start: string
          end: string
          name: string
        }>
      }
    }
  }
}
```

**실제 저장 예시**:
```json
{
  "monday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
    "break_periods": [],
    "employees": {
      "15": {
        "start_time": "09:00",
        "end_time": "18:00",
        "break_periods": [
          {
            "start": "12:00",
            "end": "13:00",
            "name": "휴게시간"
          }
        ]
      },
      "23": {
        "start_time": "13:00",
        "end_time": "21:00",
        "break_periods": []
      }
    }
  },
  "tuesday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
    "employees": {
      "15": {
        "start_time": "09:00",
        "end_time": "18:00",
        "break_periods": []
      }
    }
  }
}
```

### 2. labor_contract (근로계약서)
**테이블**: `employees.labor_contract`  
**저장 로직**: 근로계약서 작성 시 전체 계약 정보를 JSONB로 저장

```typescript
interface LaborContract {
  contractType: 'permanent' | 'temporary' | 'partTime'
  employer: {
    companyName: string
    businessNumber: string
    representative: string
    address: string
  }
  employee: {
    name: string
    birthDate: string
    address: string
    phone: string
  }
  workStartDate: string
  workEndDate?: string
  workplace: string
  jobDescription: string
  workingHours: {
    startTime: string
    endTime: string
    workDaysPerWeek: number
    breakStartTime?: string
    breakEndTime?: string
  }
  salary: {
    salaryType: 'hourly' | 'monthly'
    basicSalary: number
  }
  socialInsurance: {
    nationalPension: boolean
    healthInsurance: boolean
    employmentInsurance: boolean
    workCompensation: boolean
  }
}
```

**실제 저장 예시**:
```json
{
  "contractType": "partTime",
  "employee": {
    "name": "김아르바",
    "phone": "010-1234-5678",
    "birthDate": "1995-05-15",
    "address": "서울시 강남구"
  },
  "workingHours": {
    "startTime": "09:00",
    "endTime": "18:00",
    "workDaysPerWeek": 5,
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "salary": {
    "salaryType": "hourly",
    "basicSalary": 12000
  },
  "socialInsurance": {
    "nationalPension": true,
    "healthInsurance": true,
    "employmentInsurance": true,
    "workCompensation": true
  }
}
```

### 3. exception_data (예외사항 상세)
**테이블**: `schedule_exceptions.exception_data`  
**저장 로직**: 예외사항 위저드에서 수집한 정보 저장

```typescript
interface ExceptionDataJsonb {
  original_schedule: Array<{
    day: string
    dayName: string
    timeSlot: string
    employees: Array<{
      id: number
      name: string
      hourly_wage: number
    }>
  }>
  selected_time_slots: string[]
  reason: string | null
}
```

**실제 저장 예시**:
```json
{
  "original_schedule": [
    {
      "day": "monday",
      "dayName": "월요일",
      "timeSlot": "09:00",
      "employees": [
        {
          "id": 15,
          "name": "김아르바",
          "hourly_wage": 12000
        }
      ]
    }
  ],
  "selected_time_slots": ["09:00"],
  "reason": "개인사정으로 인한 휴무"
}
```

### 4. affected_slots (영향받는 시간대)
**테이블**: `schedule_exceptions.affected_slots`  
**저장 로직**: 예외사항으로 영향받는 시간대와 직원 정보

```typescript
interface AffectedSlot {
  day: string           // 'monday', 'tuesday', ...
  time_slot: string     // '09:00', '10:00', ...
  original_employees: number[]  // 원래 배정된 직원 ID 배열
  exception_type: string        // 'CANCEL', 'OVERRIDE', 'EXTRA'
}
```

**실제 저장 예시**:
```json
[
  {
    "day": "monday",
    "time_slot": "09:00",
    "original_employees": [15, 23],
    "exception_type": "CANCEL"
  },
  {
    "day": "monday",
    "time_slot": "10:00", 
    "original_employees": [15],
    "exception_type": "CANCEL"
  }
]
```

## 🎯 급여 계산 통합 API

### calculateMonthlyPayroll()
**목적**: 월별 급여 통합 계산  
**위치**: `/lib/api/(page)/payroll/payroll-test-api.ts`

```typescript
export async function calculateMonthlyPayroll(
  storeId: number,
  templateId: number,
  ownerId: string,
  year: number,
  month: number
): Promise<MonthlyPayrollSummary> {
  // 1. 기본 데이터 조회
  const [template, employees, exceptions] = await Promise.all([
    getTemplateById(templateId),
    getStoreEmployeesForPayroll(storeId, ownerId),
    getMonthlyExceptions(storeId, year, month)
  ])

  // 2. 직원별 급여 계산
  const results = await Promise.all(
    employees.map(employee => 
      calculateEmployeeMonthlyPayroll(employee, template, exceptions, year, month)
    )
  )

  // 3. 종합 정보 생성
  return {
    store: { id: storeId, template_id: templateId },
    period: { year, month },
    totalEmployees: employees.length,
    totalGrossSalary: results.reduce((sum, r) => sum + r.monthlySalary.grossSalary, 0),
    totalNetSalary: results.reduce((sum, r) => sum + r.netSalary.netSalary, 0),
    totalEmployerCost: results.reduce((sum, r) => sum + r.employerCost.totalCost, 0),
    employees: results
  }
}
```

**급여 계산 로직**:
1. **기본 스케줄 생성**: 템플릿의 `schedule_data`에서 월별 기본 근무 일정 생성
2. **예외사항 반영**: `schedule_exceptions`에서 휴무/시간변경/추가근무 적용
3. **급여 계산**: `lib/payroll-calculator-2025.ts`의 2025년 법정 기준 적용
4. **4대보험 계산**: 국민연금, 건강보험, 장기요양, 고용보험
5. **세금 계산**: 소득세, 지방소득세 (간이세액표 적용)

## 📈 데이터 플로우

### 1. 급여 계산 요청 플로우
```
1. 사용자 입력 (스토어, 템플릿, 년월 선택)
   ↓
2. getUserStoresForPayroll() - 스토어 목록 조회
   ↓
3. getActiveTemplatesForPayroll() - 템플릿 목록 조회
   ↓
4. calculateMonthlyPayroll() - 통합 급여 계산
   ├─ getStoreEmployeesForPayroll() - 직원 목록
   ├─ getMonthlyExceptions() - 예외사항 목록
   └─ 급여 계산 로직 (payroll-calculator-2025.ts)
   ↓
5. PDF 생성 (PayrollStatementCreator 컴포넌트)
```

### 2. 데이터 저장 플로우 (근로계약서 → 급여시스템)
```
1. 근로계약서 작성 (labor-contract/page.tsx)
   ↓
2. 직원 데이터 생성
   - 기본 정보: name, hourly_wage, position, phone
   - JSONB 저장: labor_contract 필드에 전체 계약 정보
   ↓
3. 스케줄 템플릿 자동 업데이트
   - schedule_data JSONB 필드에 직원 스케줄 추가
   - 근로계약서의 workingHours 정보 활용
   ↓
4. 급여 계산 시 labor_contract 정보 활용
   - 계약 유형별 급여 산정 방식 적용
   - 근무시간 정보로 기본 스케줄 검증
```

## 🔒 보안 및 권한

### Row Level Security (RLS) 정책
```sql
-- 스토어: 소유자만 접근
CREATE POLICY "Users can access their own stores" 
ON store_settings FOR ALL USING (auth.uid() = owner_id);

-- 직원: 소유자만 접근
CREATE POLICY "Users can access their own employees" 
ON employees FOR ALL USING (auth.uid() = owner_id);

-- 템플릿: 스토어 소유자만 접근
CREATE POLICY "Users can access templates of their stores" 
ON weekly_schedule_templates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM store_settings 
    WHERE store_settings.id = weekly_schedule_templates.store_id 
    AND store_settings.owner_id = auth.uid()
  )
);

-- 예외사항: 스토어 소유자만 접근
CREATE POLICY "Users can access exceptions of their stores" 
ON schedule_exceptions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM store_settings 
    WHERE store_settings.id = schedule_exceptions.store_id 
    AND store_settings.owner_id = auth.uid()
  )
);
```

## 📊 성능 최적화

### 인덱스 전략
```sql
-- 기본 조회 성능 향상
CREATE INDEX idx_employees_owner_store ON employees(owner_id, store_id);
CREATE INDEX idx_templates_store_active ON weekly_schedule_templates(store_id, is_active);
CREATE INDEX idx_exceptions_store_date ON schedule_exceptions(store_id, date);

-- JSONB 필드 검색 최적화
CREATE INDEX idx_templates_schedule_data ON weekly_schedule_templates USING GIN(schedule_data);
CREATE INDEX idx_employees_labor_contract ON employees USING GIN(labor_contract);
CREATE INDEX idx_exceptions_data ON schedule_exceptions USING GIN(exception_data);
```

### 쿼리 최적화
- **병렬 조회**: `Promise.all()`로 독립적인 데이터 동시 조회
- **필요 필드만 SELECT**: 대용량 JSONB 필드는 필요시에만 조회
- **날짜 범위 제한**: 급여 계산 시 해당 월 데이터만 조회
- **활성 데이터만**: `is_active = true` 조건으로 비활성 데이터 제외

## 🎛️ 에러 처리

### 공통 에러 패턴
```typescript
// API 함수 표준 에러 처리
export async function apiFunction(): Promise<DataType[]> {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('API 호출 오류:', error)
    throw error  // 상위에서 처리하도록 재던짐
  }
}
```

### 사용자 피드백
- **로딩 상태**: 계산 중 사용자에게 진행률 표시
- **에러 메시지**: 구체적이고 실행 가능한 오류 안내
- **부분 실패 처리**: 일부 직원 계산 실패시 전체 중단하지 않음

---

## 📋 주요 파일 위치

### API 구현
- **급여 계산 통합**: `/lib/api/(page)/payroll/payroll-test-api.ts`
- **스토어 관리**: `/lib/api/(page)/stores/stores-api.ts`
- **예외사항 관리**: `/lib/api/(page)/schedule/exceptions/exceptions-api.ts`
- **급여 계산 로직**: `/lib/payroll-calculator-2025.ts`

### UI 구현
- **급여 메인 페이지**: `/app/payroll/page.tsx`
- **급여명세서 컴포넌트**: `/components/(page)/payroll/PayrollStatementCreator.tsx`
- **근로계약서 페이지**: `/app/test/(logic)/labor-contract/page.tsx`

### 타입 정의
- **급여 관련**: `/types/payroll-statement.ts`
- **직원 관련**: `/types/employee.ts`
- **근로계약서**: `/types/labor-contract.ts`

---

**작성일**: 2025-01-24  
**버전**: 1.0  
**작성자**: HR 관리 시스템 개발팀

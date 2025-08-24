# 직원 등록 API 명세서

## 개요
HR 관리 시스템의 직원 등록 관련 API 명세서입니다. 두 가지 방식의 직원 등록을 지원합니다:
1. **간단 등록**: 기본 정보만으로 직원 등록
2. **근로계약서 연동 등록**: 근로계약서 작성과 함께 직원 등록

## 데이터베이스 스키마

### employees 테이블
```sql
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES public.store_settings(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  hourly_wage INTEGER NOT NULL DEFAULT 10030,
  position VARCHAR(50),
  phone VARCHAR(20),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  labor_contract JSONB,  -- 근로계약서 정보 (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 인덱스
```sql
CREATE INDEX idx_employees_owner_id ON employees(owner_id);
CREATE INDEX idx_employees_owner_store ON employees(owner_id, store_id);
CREATE INDEX idx_employees_store_id ON employees(store_id);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_employees_labor_contract_type ON employees USING GIN ((labor_contract->>'contractType'));
```

## API 엔드포인트

### 1. 직원 목록 조회
**GET** `/api/employees`

#### 요청 파라미터
- `store_id` (선택): 특정 스토어의 직원만 조회
- `is_active` (선택): 활성/비활성 상태 필터링

#### 응답
```typescript
interface EmployeeListResponse {
  employees: Employee[];
  total: number;
}

interface Employee {
  id: number;
  store_id?: number;
  owner_id: string;
  name: string;
  hourly_wage: number;
  position?: string;
  phone?: string;
  start_date: string;
  is_active: boolean;
  labor_contract?: LaborContract | null;
  created_at: string;
  updated_at: string;
}
```

#### 구현 방식
```typescript
// Supabase 직접 호출 (현재 방식)
const { data: employeesData, error: employeesError } = await supabase
  .from('employees')
  .select('*')
  .eq('owner_id', user?.id)
  .order('created_at', { ascending: false });
```

### 2. 간단 직원 등록
**POST** `/api/employees`

#### 요청 본문
```typescript
interface CreateEmployeeRequest {
  store_id: number;
  name: string;
  hourly_wage: number;
  position?: string;
  phone?: string;
  start_date: string;
  is_active: boolean;
}
```

#### 응답
```typescript
interface CreateEmployeeResponse {
  employee: Employee;
  message: string;
}
```

#### 구현 방식
```typescript
// 현재 구현 (employees/page.tsx의 handleCreateEmployee)
const { data, error } = await supabase
  .from('employees')
  .insert([{
    store_id: formData.store_id,
    owner_id: user.id, // 자동 설정 (트리거에서 처리)
    name: formData.name,
    hourly_wage: formData.hourly_wage,
    position: formData.position,
    phone: formData.phone,
    start_date: formData.start_date,
    is_active: formData.is_active
  }])
  .select();
```

### 3. 근로계약서 연동 직원 등록
**POST** `/api/employees/with-contract`

#### 요청 본문
```typescript
interface CreateEmployeeWithContractRequest {
  store_id: number;
  template_id?: number; // 스케줄 템플릿 ID (선택사항)
  labor_contract: LaborContract;
}

interface LaborContract {
  contractType: ContractType;
  employer: EmployerInfo;
  employee: EmployeeInfo;
  workStartDate: string;
  workEndDate?: string;
  workplace: string;
  jobDescription: string;
  workingHours: WorkingHours;
  salary: SalaryInfo;
  socialInsurance: SocialInsuranceInfo;
  minorWorkerInfo?: MinorWorkerInfo;
}
```

#### 응답
```typescript
interface CreateEmployeeWithContractResponse {
  employee: Employee;
  template_updated: boolean;
  message: string;
}
```

#### 구현 방식
```typescript
// 현재 구현 (labor-contract/page.tsx의 handleSaveAsEmployee)
const employeeData = {
  store_id: selectedStore.id,
  owner_id: user!.id,
  name: contract.employee.name,
  hourly_wage: contract.salary.salaryType === 'hourly' 
    ? contract.salary.basicSalary 
    : Math.round(contract.salary.basicSalary / (40 * 4)),
  position: contract.jobDescription || '근로자',
  phone: contract.employee.phone,
  start_date: contract.workStartDate,
  is_active: true,
  labor_contract: contract
};

// 1. 직원 등록
const { data: employeeResult, error: employeeError } = await supabase
  .from('employees')
  .insert(employeeData)
  .select()
  .single();

// 2. 스케줄 템플릿 업데이트 (선택사항)
if (selectedTemplate) {
  const templateData = selectedTemplate.schedule_data || {};
  // 근로계약서 정보를 바탕으로 스케줄 자동 생성
  // ...템플릿 업데이트 로직
}
```

### 4. 직원 정보 수정
**PUT** `/api/employees/{id}`

#### 요청 본문
```typescript
interface UpdateEmployeeRequest {
  store_id?: number;
  name?: string;
  hourly_wage?: number;
  position?: string;
  phone?: string;
  start_date?: string;
  is_active?: boolean;
  labor_contract?: LaborContract | null;
}
```

#### 구현 방식
```typescript
// 현재 구현 (employees/page.tsx의 handleUpdateEmployee)
const { error } = await supabase
  .from('employees')
  .update(formData)
  .eq('id', editingEmployee.id);
```

### 5. 직원 삭제
**DELETE** `/api/employees/{id}`

#### 구현 방식
```typescript
// 현재 구현 (employees/page.tsx의 handleDeleteEmployee)
const { error } = await supabase
  .from('employees')
  .delete()
  .eq('id', employeeId);
```

### 6. 직원 상태 변경
**PATCH** `/api/employees/{id}/status`

#### 요청 본문
```typescript
interface UpdateEmployeeStatusRequest {
  is_active: boolean;
}
```

#### 구현 방식
```typescript
// 현재 구현 (employees/page.tsx의 toggleEmployeeStatus)
const { error } = await supabase
  .from('employees')
  .update({ is_active: !employee.is_active })
  .eq('id', employee.id);
```

## 보안 및 권한 관리

### Row Level Security (RLS) 정책
```sql
-- 사용자는 자신이 소유한 직원만 조회 가능
CREATE POLICY employees_select_policy ON employees
  FOR SELECT
  USING (auth.uid() = owner_id);

-- 사용자는 자신이 소유한 스토어의 직원만 추가 가능
CREATE POLICY employees_insert_policy ON employees
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM store_settings 
      WHERE id = store_id AND owner_id = auth.uid()
    )
  );

-- 사용자는 자신이 소유한 직원만 수정/삭제 가능
CREATE POLICY employees_update_policy ON employees
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY employees_delete_policy ON employees
  FOR DELETE
  USING (auth.uid() = owner_id);
```

### 자동 owner_id 설정 트리거
```sql
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
```

## 데이터 유효성 검증

### 클라이언트 측 검증
```typescript
interface EmployeeFormValidation {
  name: string; // 필수, 1-50자
  hourly_wage: number; // 필수, 최저시급(10,030원) 이상
  phone?: string; // 선택, 전화번호 형식
  start_date: string; // 필수, 날짜 형식
  store_id: number; // 필수, 존재하는 스토어 ID
}
```

### 서버 측 검증
- 최저시급 준수 확인 (2025년 기준: 10,030원)
- 스토어 소유권 확인
- 근로계약서 필수 필드 검증 (근로계약서 연동 등록 시)

## 에러 처리

### 공통 에러 코드
```typescript
enum EmployeeErrorCode {
  INVALID_STORE = 'INVALID_STORE',
  INSUFFICIENT_WAGE = 'INSUFFICIENT_WAGE',
  DUPLICATE_EMPLOYEE = 'DUPLICATE_EMPLOYEE',
  CONTRACT_VALIDATION_FAILED = 'CONTRACT_VALIDATION_FAILED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
}
```

### 에러 응답 형식
```typescript
interface ErrorResponse {
  error: {
    code: EmployeeErrorCode;
    message: string;
    details?: any;
  };
}
```

## 스케줄 템플릿 연동 플로우

### UI 플로우 개요
직원 등록 시 스케줄 템플릿과 연동되는 두 가지 방식:

1. **간편 등록**: 직원 등록 후 별도로 스케줄 템플릿 설정 필요
2. **근로계약서 연동 등록**: 등록과 동시에 스케줄 템플릿 자동 업데이트

### 1. 간편 등록에서 스케줄 템플릿 연결

#### UI 구성
```typescript
// employees/page.tsx - 간편 등록 폼
<div className="bg-blue-50 p-3 rounded-lg" data-tutorial="contract-info">
  <p className="text-sm text-blue-800 mb-2">
    💡 <strong>근로계약서와 함께 등록</strong>하고 싶으신가요?
  </p>
  <p className="text-xs text-blue-600 mb-3">
    근로계약서를 작성하면서 직원을 등록하면 법정 서류를 완비할 수 있습니다.
  </p>
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => window.open('/test/labor-contract', '_blank')}
    className="border-blue-300 text-blue-700 hover:bg-blue-100"
  >
    근로계약서 작성하기
  </Button>
</div>
```

#### 플로우
1. **간편 등록 완료** → 직원 DB에 저장 (labor_contract: null)
2. **사용자 액션**: "근로계약서 작성하기" 버튼 클릭
3. **페이지 이동**: `/test/labor-contract` 새 탭에서 열림
4. **별도 작업**: 근로계약서 작성 후 스케줄 템플릿 연동

### 2. 근로계약서 연동 등록에서 스케줄 템플릿 자동 업데이트

#### UI 플로우 상세

##### 2-1. 스토어 선택 모달
```typescript
// labor-contract/page.tsx - 스토어 선택 UI
{showStoreSelection && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          직원을 등록할 스토어 선택
        </h2>
        
        {/* 스토어 선택 드롭다운 */}
        <Select
          value={selectedStore?.id.toString() || ''}
          onValueChange={(value) => {
            const store = stores.find(s => s.id.toString() === value);
            setSelectedStore(store || null);
            if (store) {
              loadTemplates(store.id); // 🔥 스토어 선택 시 템플릿 로드
            } else {
              setTemplates([]);
              setSelectedTemplate(null);
            }
          }}
        >
          {/* 스토어 옵션들 */}
        </Select>
      </div>
    </div>
  </div>
)}
```

##### 2-2. 템플릿 선택 UI (조건부 렌더링)
```typescript
// 스토어 선택 후 템플릿 목록 표시
{selectedStore && templates.length > 0 && (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-2 block">
      스케줄 템플릿 선택 (선택사항)
    </label>
    <Select
      value={selectedTemplate?.id.toString() || ''}
      onValueChange={(value) => {
        const template = templates.find(t => t.id.toString() === value);
        setSelectedTemplate(template || null);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="템플릿을 선택하세요 (선택사항)" />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id.toString()}>
            <div className="flex flex-col">
              <span className="font-medium">{template.template_name}</span>
              <span className="text-xs text-gray-500">
                {template.is_active ? '활성' : '비활성'} | 
                생성일: {new Date(template.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <p className="text-xs text-gray-500 mt-1">
      💡 템플릿을 선택하면 근로계약서의 근로시간 정보를 바탕으로 해당 템플릿에 자동으로 스케줄이 추가됩니다.
    </p>
  </div>
)}
```

##### 2-3. 선택된 정보 미리보기
```typescript
// 선택된 스토어 정보 표시
{selectedStore && (
  <div className="bg-gray-50 p-3 rounded-lg">
    <h4 className="font-medium text-gray-900 mb-2">선택된 스토어 정보</h4>
    <div className="text-sm text-gray-600 space-y-1">
      <p><span className="font-medium">이름:</span> {selectedStore.store_name}</p>
      <p><span className="font-medium">운영시간:</span> {selectedStore.open_time} - {selectedStore.close_time}</p>
      <p><span className="font-medium">등록된 직원:</span> {selectedStore.employees_count}명</p>
      <p><span className="font-medium">스케줄 템플릿:</span> {templates.length}개</p>
    </div>
  </div>
)}

// 선택된 템플릿 정보 및 자동 추가될 스케줄 미리보기
{selectedTemplate && (
  <div className="bg-blue-50 p-3 rounded-lg">
    <h4 className="font-medium text-blue-900 mb-2">선택된 템플릿 정보</h4>
    <div className="text-sm text-blue-700 space-y-1">
      <p><span className="font-medium">템플릿명:</span> {selectedTemplate.template_name}</p>
      <p><span className="font-medium">상태:</span> {selectedTemplate.is_active ? '활성' : '비활성'}</p>
      <p className="text-xs mt-2">
        ✅ 근로계약서의 근무시간({contract.workingHours.startTime} - {contract.workingHours.endTime}, 
        주 {contract.workingHours.workDaysPerWeek}일)이 이 템플릿에 자동으로 추가됩니다.
      </p>
    </div>
  </div>
)}
```

### 3. 스케줄 템플릿 자동 업데이트 로직

#### 3-1. 템플릿 로드 함수
```typescript
// labor-contract/page.tsx
const loadTemplates = async (storeId: number) => {
  try {
    const templateList = await getStoreTemplates(storeId); // stores-api.ts 호출
    setTemplates(templateList);
    setSelectedTemplate(null);
  } catch (error) {
    console.error('템플릿 목록 로드 오류:', error);
    setTemplates([]);
  }
};
```

#### 3-2. 직원 등록 + 템플릿 업데이트 통합 로직
```typescript
// labor-contract/page.tsx - handleSaveAsEmployee 함수
const handleSaveAsEmployee = async () => {
  if (!selectedStore) {
    alert('스토어를 선택해주세요.');
    return;
  }

  try {
    setSaving(true);

    // 1️⃣ 근로계약서 정보를 바탕으로 직원 데이터 생성
    const employeeData = {
      store_id: selectedStore.id,
      owner_id: user!.id,
      name: contract.employee.name,
      hourly_wage: contract.salary.salaryType === 'hourly' 
        ? contract.salary.basicSalary 
        : Math.round(contract.salary.basicSalary / (40 * 4)), // 월급→시급 변환
      position: contract.jobDescription || '근로자',
      phone: contract.employee.phone,
      start_date: contract.workStartDate,
      is_active: true,
      labor_contract: contract // 🔥 근로계약서 전체 정보 저장
    };

    // 2️⃣ 직원 등록
    const { data: employeeResult, error: employeeError } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (employeeError) throw employeeError;

    // 3️⃣ 선택된 템플릿이 있다면 스케줄 템플릿에 직원 추가
    if (selectedTemplate) {
      try {
        const templateData = selectedTemplate.schedule_data || {};
        
        // 4️⃣ 근로계약서의 근로시간 정보를 기반으로 스케줄 데이터 생성
        const workDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const employeeSchedule = {
          start_time: contract.workingHours.startTime,
          end_time: contract.workingHours.endTime,
          break_periods: contract.workingHours.breakStartTime && contract.workingHours.breakEndTime ? [
            {
              start: contract.workingHours.breakStartTime,
              end: contract.workingHours.breakEndTime,
              name: '휴게시간'
            }
          ] : []
        };

        // 5️⃣ 주 근무일수에 따라 해당 요일에만 스케줄 추가
        const workDaysCount = contract.workingHours.workDaysPerWeek || 5;
        for (let i = 0; i < Math.min(workDaysCount, workDays.length); i++) {
          const day = workDays[i];
          if (!templateData[day]) {
            templateData[day] = {
              is_open: true,
              open_time: contract.workingHours.startTime,
              close_time: contract.workingHours.endTime,
              break_periods: [],
              employees: {}
            };
          }
          
          if (!templateData[day].employees) {
            templateData[day].employees = {};
          }
          
          // 6️⃣ 새로 등록된 직원을 템플릿에 추가
          templateData[day].employees[employeeResult.id] = employeeSchedule;
        }

        // 7️⃣ 템플릿 업데이트
        const { error: templateError } = await supabase
          .from('weekly_schedule_templates')
          .update({
            schedule_data: templateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTemplate.id);

        if (templateError) {
          console.error('템플릿 업데이트 오류:', templateError);
          alert('직원은 등록되었지만 스케줄 템플릿 업데이트에 실패했습니다.');
        } else {
          alert('근로계약서가 작성되고 직원이 등록되었으며, 선택된 스케줄 템플릿에 자동으로 추가되었습니다!');
        }
      } catch (templateError) {
        console.error('템플릿 처리 오류:', templateError);
        alert('직원은 등록되었지만 스케줄 템플릿 처리 중 오류가 발생했습니다.');
      }
    } else {
      alert('근로계약서가 작성되고 직원이 등록되었습니다!');
    }

    // 8️⃣ 폼 초기화
    setShowStoreSelection(false);
    setSelectedStore(null);
    setSelectedTemplate(null);
    setTemplates([]);
    
    const newContract = createDefaultContract(selectedType);
    setContract(newContract);
    
  } catch (error) {
    console.error('직원 등록 오류:', error);
    alert('직원 등록 중 오류가 발생했습니다.');
  } finally {
    setSaving(false);
  }
};
```

### 4. 관련 API 연동

#### 스토어 API 연동
```typescript
// stores-api.ts
export async function getStoresWithDetails(userId: string): Promise<StoreWithDetails[]>
export async function getStoreTemplates(storeId: number): Promise<StoreTemplate[]>
```

#### 스케줄 템플릿 데이터 구조
```typescript
// 템플릿 데이터 구조 (JSONB)
interface TemplateScheduleData {
  [day: string]: { // 'monday', 'tuesday', etc.
    is_open: boolean;
    open_time: string;
    close_time: string;
    break_periods: BreakPeriod[];
    employees: {
      [employeeId: string]: {
        start_time: string;
        end_time: string;
        break_periods: BreakPeriod[];
      }
    }
  }
}

interface StoreTemplate {
  id: number;
  store_id: number;
  template_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  schedule_data: TemplateScheduleData;
}
```

### 5. UI 상태 관리

#### 상태 변수들
```typescript
// labor-contract/page.tsx
const [stores, setStores] = useState<StoreWithDetails[]>([]);
const [selectedStore, setSelectedStore] = useState<StoreWithDetails | null>(null);
const [templates, setTemplates] = useState<StoreTemplate[]>([]);
const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplate | null>(null);
const [showStoreSelection, setShowStoreSelection] = useState(false);
const [saving, setSaving] = useState(false);
```

#### 상태 변화 플로우
1. **"직원으로 등록" 버튼 클릭** → `setShowStoreSelection(true)`
2. **스토어 선택** → `setSelectedStore()` + `loadTemplates()` 호출
3. **템플릿 선택** → `setSelectedTemplate()`
4. **"직원 등록" 버튼 클릭** → `handleSaveAsEmployee()` 실행
5. **등록 완료** → 모든 상태 초기화

### 6. 에러 처리 및 사용자 피드백

#### 에러 상황별 처리
```typescript
// 템플릿 로드 실패
catch (error) {
  console.error('템플릿 목록 로드 오류:', error);
  setTemplates([]);
}

// 템플릿 업데이트 실패 (직원 등록은 성공)
if (templateError) {
  console.error('템플릿 업데이트 오류:', templateError);
  alert('직원은 등록되었지만 스케줄 템플릿 업데이트에 실패했습니다.');
}

// 전체 프로세스 실패
catch (error) {
  console.error('직원 등록 오류:', error);
  alert('직원 등록 중 오류가 발생했습니다.');
}
```

#### 사용자 피드백 메시지
- **템플릿 선택 시**: "근로계약서의 근무시간이 이 템플릿에 자동으로 추가됩니다."
- **등록 성공 (템플릿 포함)**: "근로계약서가 작성되고 직원이 등록되었으며, 선택된 스케줄 템플릿에 자동으로 추가되었습니다!"
- **등록 성공 (템플릿 없음)**: "근로계약서가 작성되고 직원이 등록되었습니다!"
- **부분 실패**: "직원은 등록되었지만 스케줄 템플릿 업데이트에 실패했습니다."

## 성능 최적화

### 인덱스 활용
- `owner_id`와 `store_id` 복합 인덱스로 빠른 조회
- `labor_contract` JSONB 필드에 GIN 인덱스로 계약 유형별 검색 최적화

### 페이지네이션
대량의 직원 데이터 처리를 위한 페이지네이션 지원:

```typescript
interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: 'name' | 'created_at' | 'hourly_wage';
  sort_order?: 'asc' | 'desc';
}
```

## 향후 개선 사항

### API 레이어 분리
현재는 컴포넌트에서 Supabase를 직접 호출하고 있으나, 향후 API 레이어 분리 예정:

```typescript
// 예정된 API 구조
// lib/api/employees-api.ts
export async function createEmployee(data: CreateEmployeeRequest): Promise<Employee>
export async function updateEmployee(id: number, data: UpdateEmployeeRequest): Promise<Employee>
export async function deleteEmployee(id: number): Promise<void>
export async function getEmployees(params: GetEmployeesParams): Promise<Employee[]>
```

### 배치 작업 지원
- 다중 직원 등록
- 일괄 시급 조정
- 대량 상태 변경

## 스케줄 템플릿 연동 시 실제 저장 구조

### 핵심 함수: `handleSaveAsEmployee`
**위치**: `/app/test/(logic)/labor-contract/page.tsx`

```typescript
const handleSaveAsEmployee = async () => {
  // 1. 직원 데이터 생성 및 저장
  const employeeData = {
    store_id: selectedStore.id,
    owner_id: user!.id,
    name: contract.employee.name,
    hourly_wage: contract.salary.salaryType === 'hourly' 
      ? contract.salary.basicSalary 
      : Math.round(contract.salary.basicSalary / (40 * 4)),
    position: contract.jobDescription || '근로자',
    phone: contract.employee.phone,
    start_date: contract.workStartDate,
    is_active: true,
    labor_contract: contract
  };

  const { data: employeeResult } = await supabase
    .from('employees')
    .insert(employeeData)
    .select()
    .single();

  // 2. 선택된 템플릿에 직원 스케줄 추가
  if (selectedTemplate) {
    const templateData = selectedTemplate.schedule_data || {};
    
    const employeeSchedule = {
      start_time: contract.workingHours.startTime,
      end_time: contract.workingHours.endTime,
      break_periods: contract.workingHours.breakStartTime && contract.workingHours.breakEndTime ? [
        {
          start: contract.workingHours.breakStartTime,
          end: contract.workingHours.breakEndTime,
          name: '휴게시간'
        }
      ] : []
    };

    // 주 근무일수에 따라 해당 요일에만 스케줄 추가
    const workDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workDaysCount = contract.workingHours.workDaysPerWeek || 5;
    
    for (let i = 0; i < Math.min(workDaysCount, workDays.length); i++) {
      const day = workDays[i];
      if (!templateData[day]) {
        templateData[day] = {
          is_open: true,
          open_time: contract.workingHours.startTime,
          close_time: contract.workingHours.endTime,
          break_periods: [],
          employees: {}
        };
      }
      
      if (!templateData[day].employees) {
        templateData[day].employees = {};
      }
      
      // 새로 등록된 직원을 템플릿에 추가
      templateData[day].employees[employeeResult.id] = employeeSchedule;
    }

    // 템플릿 업데이트
    await supabase
      .from('weekly_schedule_templates')
      .update({
        schedule_data: templateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedTemplate.id);
  }
};
```

### 실제 저장 예제

#### 입력 데이터 예시
```typescript
// 근로계약서 정보
const contract = {
  employee: {
    name: "김아르바",
    phone: "010-1234-5678"
  },
  workingHours: {
    startTime: "09:00",
    endTime: "18:00",
    workDaysPerWeek: 5,
    breakStartTime: "12:00",
    breakEndTime: "13:00"
  },
  salary: {
    salaryType: "hourly",
    basicSalary: 12000
  },
  jobDescription: "매장 판매직",
  workStartDate: "2025-01-25"
};

// 선택된 스토어
const selectedStore = {
  id: 1,
  store_name: "강남점",
  owner_id: "user-123"
};

// 선택된 템플릿
const selectedTemplate = {
  id: 2,
  template_name: "주중 기본 템플릿",
  schedule_data: {
    monday: {
      is_open: true,
      open_time: "09:00",
      close_time: "21:00",
      employees: {
        "3": {
          start_time: "09:00",
          end_time: "15:00",
          break_periods: []
        }
      }
    },
    tuesday: {
      is_open: true,
      open_time: "09:00", 
      close_time: "21:00",
      employees: {}
    }
    // ... 다른 요일들
  }
};
```

#### 1. employees 테이블에 저장되는 데이터
```json
{
  "id": 15,
  "store_id": 1,
  "owner_id": "user-123",
  "name": "김아르바",
  "hourly_wage": 12000,
  "position": "매장 판매직",
  "phone": "010-1234-5678",
  "start_date": "2025-01-25",
  "is_active": true,
  "labor_contract": {
    "employee": {
      "name": "김아르바",
      "phone": "010-1234-5678"
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
    "jobDescription": "매장 판매직",
    "workStartDate": "2025-01-25"
  },
  "created_at": "2025-01-24T16:00:00.000Z",
  "updated_at": "2025-01-24T16:00:00.000Z"
}
```

#### 2. weekly_schedule_templates 테이블의 schedule_data JSONB 업데이트
**업데이트 전**:
```json
{
  "monday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
    "employees": {
      "3": {
        "start_time": "09:00",
        "end_time": "15:00",
        "break_periods": []
      }
    }
  },
  "tuesday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00", 
    "employees": {}
  },
  "wednesday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
    "employees": {}
  }
  // ... 다른 요일들
}
```

**업데이트 후** (주 5일 근무로 월-금요일에 추가):
```json
{
  "monday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
    "employees": {
      "3": {
        "start_time": "09:00",
        "end_time": "15:00",
        "break_periods": []
      },
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
        "break_periods": [
          {
            "start": "12:00",
            "end": "13:00",
            "name": "휴게시간"
          }
        ]
      }
    }
  },
  "wednesday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
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
      }
    }
  },
  "thursday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
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
      }
    }
  },
  "friday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
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
      }
    }
  },
  "saturday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "21:00",
    "employees": {}
  },
  "sunday": {
    "is_open": false,
    "employees": {}
  }
}
```

### 템플릿 업데이트 로직 상세

#### 1. 요일별 스케줄 생성
- `workDaysPerWeek` 값에 따라 월요일부터 순차적으로 스케줄 추가
- 예: `workDaysPerWeek: 5` → 월, 화, 수, 목, 금요일에만 추가
- 예: `workDaysPerWeek: 6` → 월, 화, 수, 목, 금, 토요일에 추가

#### 2. 직원 스케줄 객체 구조
```typescript
{
  start_time: string,        // 근무 시작 시간
  end_time: string,          // 근무 종료 시간  
  break_periods: Array<{     // 휴게시간 배열
    start: string,
    end: string,
    name: string
  }>
}
```

#### 3. 기존 템플릿 데이터 보존
- 기존에 등록된 다른 직원들의 스케줄은 그대로 유지
- 새로운 직원만 `employees` 객체에 추가
- 요일별 매장 운영 정보(`is_open`, `open_time`, `close_time`)는 변경하지 않음

### 감사 로그
직원 정보 변경 이력 추적을 위한 감사 로그 테이블 추가 예정

---

## 참고 파일 위치

### 주요 구현 파일
- **직원 관리 페이지**: `/app/employees/page.tsx`
- **근로계약서 페이지**: `/app/test/(logic)/labor-contract/page.tsx`
- **스토어 API**: `/lib/api/(page)/stores/stores-api.ts`
- **타입 정의**: `/types/employee.ts`, `/types/labor-contract.ts`

### 데이터베이스 관련
- **현재 스키마**: `/supabase/schemas/current_schema.sql`
- **마이그레이션 파일**: `/supabase/migrations/`

### UI 컴포넌트
- **근로계약서 폼**: `/components/(page)/labor-contract/ContractForm.tsx`
- **근로계약서 미리보기**: `/components/(page)/labor-contract/ContractPreview.tsx`

---

*최종 업데이트: 2025-08-24*
*작성자: HR 관리 시스템 개발팀*

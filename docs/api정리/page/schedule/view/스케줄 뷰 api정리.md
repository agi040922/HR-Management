# 스케줄 관리 시스템 아키텍처 문서

## 개요
HR 관리 시스템의 스케줄 관리 모듈은 5개의 핵심 파일로 구성되어 있으며, 각각 명확한 역할과 책임을 가지고 있습니다.

## 파일 구조 및 역할

### 1. `/app/schedule/view/page.tsx` - 메인 페이지 컴포넌트
**역할**: 스케줄 관리의 메인 UI 컴포넌트 및 상태 관리

#### 주요 상태 관리
```typescript
// 데이터 상태
const [stores, setStores] = useState<StoreSettings[]>([]);
const [selectedStore, setSelectedStore] = useState<StoreSettings | null>(null);
const [templates, setTemplates] = useState<WeeklyTemplate[]>([]);
const [selectedTemplate, setSelectedTemplate] = useState<WeeklyTemplate | null>(null);
const [employees, setEmployees] = useState<Employee[]>([]);
const [scheduleData, setScheduleData] = useState<any>({});
const [timeSlots, setTimeSlots] = useState<string[]>([]);

// 모달 상태
const [showEmployeeModal, setShowEmployeeModal] = useState(false);
const [showEmployeeTooltip, setShowEmployeeTooltip] = useState(false);
const [showStoreHoursModal, setShowStoreHoursModal] = useState(false);
```

#### 핵심 함수들

**데이터 로딩 함수**
- `handleLoadStores()`: 사용자의 스토어 목록 로드
- `handleLoadTemplates(storeId)`: 선택된 스토어의 템플릿 목록 로드
- `handleLoadEmployees(storeId)`: 선택된 스토어의 직원 목록 로드

**스케줄 관리 함수**
- `addEmployeeToSlot(employeeId, scheduleInfo, day, timeSlot)`: 직원을 특정 날짜에 배치
- `removeEmployeeFromSlot(day, timeSlot, employeeId)`: 직원을 스케줄에서 제거
- `handleUpdateStoreHours(day, isOpen, openTime, closeTime)`: 영업시간 변경

**모달 제어 함수**
- `openEmployeeModal(day, time)`: 직원 추가 모달 열기
- `closeEmployeeModal()`: 직원 추가 모달 닫기
- `handleEmployeeClick()`: 직원 정보 툴팁 표시

**저장 및 초기화**
- `handleSaveSchedule()`: 스케줄 데이터 저장
- `handleResetTemplate()`: 스케줄 초기화

#### 데이터 구조
```typescript
// 새로운 단순화된 스케줄 구조
scheduleData = {
  monday: {
    is_open: true,
    open_time: "09:00",
    close_time: "18:00",
    break_periods: [],
    employees: {
      [employeeId]: {
        start_time: "09:00",
        end_time: "17:00",
        break_periods: [
          { start: "12:00", end: "13:00", name: "점심시간" }
        ]
      }
    }
  }
}
```

---

### 2. `/lib/schedule/scheduleApi.ts` - API 레이어
**역할**: Supabase와의 데이터 통신을 담당하는 API 함수들

#### 핵심 API 함수들

**데이터 로딩**
```typescript
export const loadStores = async (userId: string): Promise<StoreSettings[]>
// 사용자의 스토어 목록을 Supabase에서 조회

export const loadTemplates = async (storeId: number): Promise<WeeklyTemplate[]>
// 특정 스토어의 주간 스케줄 템플릿 목록 조회

export const loadEmployees = async (storeId: number): Promise<Employee[]>
// 특정 스토어의 활성 직원 목록 조회
```

**데이터 조작**
```typescript
export const createDefaultTemplate = async (storeId: number): Promise<WeeklyTemplate>
// 기본 스케줄 템플릿 생성 (새 스토어용)

export const saveSchedule = async (templateId: number, scheduleData: any): Promise<void>
// 스케줄 데이터를 데이터베이스에 저장
```

#### 데이터베이스 테이블 연동
- `store_settings`: 스토어 기본 정보
- `weekly_schedule_templates`: 주간 스케줄 템플릿
- `employees`: 직원 정보

---

### 3. `/lib/schedule/scheduleUtils.ts` - 유틸리티 함수
**역할**: 스케줄 데이터 처리 및 계산 로직

#### 핵심 유틸리티 함수들

**시간 슬롯 생성**
```typescript
export const generateTimeSlots = (startTime: string, endTime: string, slotMinutes: number): string[]
// 시작시간부터 종료시간까지 지정된 간격으로 시간 슬롯 배열 생성
```

**직원 스케줄 조회**
```typescript
export const getSlotEmployees = (
  scheduleData: any, 
  employees: Employee[], 
  day: string, 
  timeSlot: string
): (Employee & {slot_data: ScheduleSlot; isBreakTime?: boolean})[]
// 특정 날짜/시간의 근무 직원 목록 조회 (휴게시간 여부 포함)
```

**근무시간 계산**
```typescript
export const calculateWeeklyWorkHours = (
  scheduleData: any, 
  employees: Employee[], 
  days: string[]
): {[employeeId: number]: {name: string, hours: number, shifts: number}}
// 직원별 주간 총 근무시간 및 근무 횟수 계산
```

**기본 데이터 생성**
```typescript
export const createDefaultScheduleData = () => object
// 기본 주간 스케줄 데이터 구조 생성 (월-금 09:00-18:00, 토-일 휴무)
```

#### 타입 정의
```typescript
export interface Employee {
  id: number;
  name: string;
  position?: string;
  store_id: number;
  hourly_wage?: number;
}

export interface ScheduleSlot {
  start_time: string;
  end_time: string;
  break_periods: Array<{
    start: string;
    end: string;
    name: string;
  }>;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  time_slot_minutes: number;
  owner_id: string;
}

export interface WeeklyTemplate {
  id: number;
  store_id: number;
  template_name: string;
  schedule_data: any;
  is_active: boolean;
}
```

---

### 4. `/components/schedule/ScheduleTable.tsx` - 스케줄 테이블 컴포넌트
**역할**: 주간 스케줄을 시각적으로 표시하는 테이블 UI

#### 주요 기능

**직원 표시 로직**
```typescript
const getSlotEmployees = (day: string, timeSlot: string): (Employee & {slot_data: ScheduleSlot; isBreakTime?: boolean})[]
// 해당 시간대에 근무하는 직원들을 필터링하여 반환
// 근무시간 내 여부와 휴게시간 여부를 판단
```

**시각적 구분**
- **일반 근무시간**: 파란색 배경 (`bg-blue-100`)
- **휴게시간**: 주황색 배경 (`bg-orange-100`) + 테두리
- **영업시간 외**: 회색 배경 (`bg-gray-100`)

**상호작용**
- 직원 클릭 시 상세 정보 툴팁 표시
- 휴게시간 hover 시 휴게시간 정보 표시

#### Props 인터페이스
```typescript
interface ScheduleTableProps {
  scheduleData: any;
  timeSlots: string[];
  employees: Employee[];
  days: string[];
  dayNames: string[];
  onEmployeeClick: (day: string, timeSlot: string, employee: Employee, slotData: ScheduleSlot) => void;
}
```

---

### 5. `/components/schedule/EmployeeModal.tsx` - 직원 추가 모달
**역할**: 직원 스케줄 등록을 위한 모달 UI

#### 주요 기능

**입력 폼 구성**
- 요일 선택 (영업일만 활성화)
- 직원 선택 (시각적 선택 UI)
- 시작/종료 시간 설정 (30분 간격)
- 휴게시간 관리 (추가/삭제/편집)

**휴게시간 관리**
```typescript
const [breakPeriods, setBreakPeriods] = useState<BreakPeriod[]>([
  { start: '12:00', end: '13:00', name: '점심시간' }
]);

const addBreakPeriod = () => void
const removeBreakPeriod = (index: number) => void
const updateBreakPeriod = (index: number, field: keyof BreakPeriod, value: string) => void
```

**데이터 전달**
```typescript
interface EmployeeModalProps {
  onSelectEmployee: (employeeId: number, scheduleData: {
    start_time: string;
    end_time: string;
    break_periods: BreakPeriod[];
  }, day?: string, timeSlot?: string) => void;
}
```

---

## 데이터 흐름

### 1. 초기 로딩 과정
```
사용자 로그인 → 스토어 목록 로드 → 스토어 선택 → 템플릿/직원 로드 → 스케줄 데이터 표시
```

### 2. 직원 추가 과정
```
직원 추가 버튼 클릭 → EmployeeModal 열기 → 스케줄 정보 입력 → addEmployeeToSlot 호출 → 상태 업데이트 → 테이블 재렌더링
```

### 3. 영업시간 변경 과정
```
영업시간 설정 버튼 → 영업시간 모달 → 시간 변경 → handleUpdateStoreHours → 시간 슬롯 재계산 → 테이블 업데이트
```

### 4. 저장 과정
```
저장 버튼 클릭 → handleSaveSchedule → scheduleApi.saveSchedule → Supabase 업데이트
```

---

## 주요 개선사항

### 1. 데이터 구조 단순화
- 기존: `day.time_slots[timeSlot][employeeId]` (복잡한 중첩)
- 개선: `day.employees[employeeId]` (직원별 직접 관리)

### 2. 시각적 개선
- 휴게시간 색상 구분 (주황색)
- 영업시간 외 시간 회색 처리
- 직관적인 툴팁 정보

### 3. 기능 확장
- 다중 휴게시간 지원
- 실시간 영업시간 변경
- 30분 단위 정밀 시간 설정

---

## 확장 가능성

### 1. 추가 가능한 기능
- 직원별 근무 패턴 템플릿
- 자동 스케줄 최적화
- 급여 계산 연동
- 알림 시스템

### 2. 성능 최적화
- 메모이제이션 적용
- 가상화된 테이블
- 지연 로딩

### 3. 사용자 경험 개선
- 드래그 앤 드롭 스케줄링
- 키보드 단축키
- 모바일 반응형 UI

---

## 개발 과정에서 발생한 주요 이슈 및 해결방법

### 1. 스케줄 초기화 오류
**문제**: 기존 `createDefaultTemplate` 함수 호출 시 오류 발생
```
Error: createDefaultTemplate is not a function
```

**원인**: 
- `createDefaultTemplate`은 데이터베이스에 새 템플릿을 생성하는 함수
- 스케줄 초기화는 로컬 상태만 리셋하면 되는 작업

**해결방법**:
```typescript
// 기존 (오류 발생)
const defaultSchedule = await createDefaultTemplate(selectedStore.id);

// 수정 후
const defaultSchedule = createDefaultScheduleData();
setScheduleData(defaultSchedule);
```

### 2. 데이터 구조 복잡성 문제
**문제**: 기존 중첩 구조로 인한 복잡한 데이터 접근
```typescript
// 기존 복잡한 구조
scheduleData[day].time_slots[timeSlot][employeeId]
```

**해결방법**: 데이터 구조 단순화
```typescript
// 개선된 구조
scheduleData[day].employees[employeeId] = {
  start_time: "09:00",
  end_time: "17:00", 
  break_periods: [...]
}
```

**효과**:
- 코드 가독성 향상
- 유지보수성 개선
- 성능 최적화

### 3. TypeScript 타입 불일치 오류
**문제**: `onSelectEmployee` 함수 시그니처 불일치
```
Type '(employeeId: number, scheduleInfo: {...}) => void' is not assignable to type '(employeeId: number, day?: string, timeSlot?: string) => void'
```

**해결방법**: 인터페이스 통일
```typescript
// EmployeeModal.tsx에서 수정
interface EmployeeModalProps {
  onSelectEmployee: (
    employeeId: number, 
    scheduleInfo: {
      start_time: string;
      end_time: string;
      break_periods: BreakPeriod[];
    }, 
    day?: string, 
    timeSlot?: string
  ) => void;
}
```

### 4. 시간 슬롯 동적 생성 이슈
**문제**: 고정된 9-18시 시간 슬롯으로 인한 유연성 부족

**해결방법**: 실제 영업시간 기반 동적 생성
```typescript
const generateDynamicTimeSlots = () => {
  let earliestOpen = '23:59';
  let latestClose = '00:00';
  
  days.forEach(day => {
    const dayData = scheduleData[day];
    if (dayData?.is_open) {
      if (dayData.open_time < earliestOpen) earliestOpen = dayData.open_time;
      if (dayData.close_time > latestClose) latestClose = dayData.close_time;
    }
  });
  
  return generateTimeSlots(earliestOpen, latestClose, 30);
};
```

### 5. JSX 구문 오류
**문제**: 모달 컴포넌트에서 닫는 태그 불일치
```
')' expected. Identifier expected.
```

**원인**: 복잡한 중첩 구조에서 태그 매칭 실수

**해결방법**: 
- 단계별 구조 확인
- 각 열린 태그에 대응하는 닫는 태그 검증
- IDE의 자동 포맷팅 활용

### 6. 상태 관리 복잡성
**문제**: 여러 모달 상태와 데이터 상태 간 충돌

**해결방법**: 명확한 상태 분리
```typescript
// 모달 상태
const [showEmployeeModal, setShowEmployeeModal] = useState(false);
const [showEmployeeTooltip, setShowEmployeeTooltip] = useState(false);
const [showStoreHoursModal, setShowStoreHoursModal] = useState(false);

// 데이터 상태
const [scheduleData, setScheduleData] = useState<any>({});
const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
```

### 7. 휴게시간 시각화 문제
**문제**: 휴게시간과 일반 근무시간 구분이 어려움

**해결방법**: 색상 및 스타일 차별화
```typescript
const isBreakTime = slot.break_periods?.some((bp: any) => 
  timeSlot >= bp.start && timeSlot < bp.end
) || false;

// 조건부 스타일링
className={`... ${isBreakTime ? 'bg-orange-100 border-orange-300' : 'bg-blue-100'}`}
```

---

## 개발 가이드라인

### 1. 새로운 기능 추가 시
1. `scheduleUtils.ts`에 로직 함수 추가
2. `scheduleApi.ts`에 API 함수 추가 (필요시)
3. 메인 페이지에 상태 및 핸들러 추가
4. 컴포넌트에 UI 구현

### 2. 데이터 구조 변경 시
1. 타입 정의 업데이트 (`scheduleUtils.ts`)
2. API 함수 수정 (`scheduleApi.ts`)
3. 유틸리티 함수 수정
4. 컴포넌트 렌더링 로직 수정

### 3. 테스트 권장사항
- 각 유틸리티 함수 단위 테스트
- API 함수 통합 테스트
- 컴포넌트 렌더링 테스트
- 사용자 시나리오 E2E 테스트

### 4. 디버깅 팁
- TypeScript 오류는 즉시 해결 (런타임 오류 방지)
- 복잡한 데이터 구조는 단순화 우선 고려
- 상태 변경 시 불변성 유지
- 컴포넌트 재렌더링 최적화 (React.memo, useMemo 활용)

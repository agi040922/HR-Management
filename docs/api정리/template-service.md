# 템플릿 서비스 클래스 정리

## 개요
스케줄 템플릿 페이지의 비즈니스 로직을 분리한 서비스 클래스입니다.  
파일 위치: `lib/services/template-service.ts`

## TemplateService 클래스

### 목적
- UI 컴포넌트에서 비즈니스 로직 분리
- 템플릿 관련 복잡한 데이터 조작 로직 캡슐화
- 재사용 가능한 템플릿 관리 기능 제공
- 코드 가독성 및 유지보수성 향상

### 클래스 구조
```typescript
export class TemplateService {
  private storeSettings: StoreSettings | null = null;
  private employees: Employee[] = [];

  constructor(storeSettings?: StoreSettings, employees?: Employee[]) {
    this.storeSettings = storeSettings || null;
    this.employees = employees || [];
  }

  // 메서드들...
}
```

## 주요 메서드

### 1. 초기화 및 설정

#### `updateContext(storeSettings?: StoreSettings, employees?: Employee[]): void`
- **목적**: 서비스 컨텍스트 업데이트 (스토어 설정, 직원 목록)
- **매개변수**: 
  - `storeSettings`: 스토어 설정 정보
  - `employees`: 직원 목록
- **설명**: 스토어나 직원 정보가 변경될 때 호출

#### `initializeFormData(template?: WeeklyTemplateData): TemplateFormData`
- **목적**: 템플릿 폼 데이터 초기화
- **매개변수**: 
  - `template`: 기존 템플릿 (편집 모드인 경우)
- **반환값**: 초기화된 폼 데이터
- **설명**: 
  - 새 템플릿: 기본 스케줄로 초기화
  - 기존 템플릿: 해당 데이터로 초기화

### 2. 스케줄 업데이트

#### `updateScheduleData(currentData: WeekScheduleData, day: DayOfWeek, updates: Partial<DaySchedule>): WeekScheduleData`
- **목적**: 특정 요일의 스케줄 데이터 업데이트
- **매개변수**: 
  - `currentData`: 현재 주간 스케줄 데이터
  - `day`: 업데이트할 요일
  - `updates`: 업데이트할 데이터 (부분 업데이트)
- **반환값**: 업데이트된 주간 스케줄 데이터
- **특징**: 불변성 유지하며 업데이트

#### `updateOperatingHours(scheduleData: WeekScheduleData, day: DayOfWeek, openTime: string | null, closeTime: string | null): WeekScheduleData`
- **목적**: 운영시간 변경 및 시간 슬롯 재생성
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 요일
  - `openTime`: 개점 시간 (null이면 휴무)
  - `closeTime`: 폐점 시간
- **반환값**: 업데이트된 스케줄 데이터
- **로직**: 
  1. 운영시간 업데이트
  2. 시간 슬롯 재생성
  3. 기존 직원 배정 유지 (유효한 시간대만)

### 3. 브레이크 시간 관리

#### `updateBreakPeriods(scheduleData: WeekScheduleData, day: DayOfWeek, breakPeriods: BreakPeriod[]): WeekScheduleData`
- **목적**: 브레이크 시간 업데이트
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 요일
  - `breakPeriods`: 새로운 브레이크 시간 배열
- **반환값**: 업데이트된 스케줄 데이터
- **특징**: 시간순 자동 정렬

#### `addBreakPeriod(scheduleData: WeekScheduleData, day: DayOfWeek, breakPeriod: BreakPeriod): WeekScheduleData`
- **목적**: 새로운 브레이크 시간 추가
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 요일
  - `breakPeriod`: 추가할 브레이크 시간
- **반환값**: 업데이트된 스케줄 데이터
- **검증**: 시간 중복 및 유효성 검사

#### `removeBreakPeriod(scheduleData: WeekScheduleData, day: DayOfWeek, breakIndex: number): WeekScheduleData`
- **목적**: 브레이크 시간 제거
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 요일
  - `breakIndex`: 제거할 브레이크 시간 인덱스
- **반환값**: 업데이트된 스케줄 데이터

### 4. 직원 배정 관리

#### `toggleEmployeeInSlot(scheduleData: WeekScheduleData, day: DayOfWeek, timeSlot: string, employeeId: number): WeekScheduleData`
- **목적**: 시간 슬롯에서 직원 배정 토글
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 요일
  - `timeSlot`: 시간 슬롯
  - `employeeId`: 직원 ID
- **반환값**: 업데이트된 스케줄 데이터
- **로직**: 
  - 이미 배정된 경우: 제거
  - 배정되지 않은 경우: 추가

#### `assignEmployeeToSlot(scheduleData: WeekScheduleData, day: DayOfWeek, timeSlot: string, employeeId: number): WeekScheduleData`
- **목적**: 특정 시간 슬롯에 직원 배정
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 요일
  - `timeSlot`: 시간 슬롯
  - `employeeId`: 직원 ID
- **반환값**: 업데이트된 스케줄 데이터
- **특징**: 중복 배정 방지

#### `removeEmployeeFromSlot(scheduleData: WeekScheduleData, day: DayOfWeek, timeSlot: string, employeeId: number): WeekScheduleData`
- **목적**: 시간 슬롯에서 직원 제거
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 요일
  - `timeSlot`: 시간 슬롯
  - `employeeId`: 직원 ID
- **반환값**: 업데이트된 스케줄 데이터

### 5. 스케줄 복사 및 유틸리티

#### `copyDaySchedule(scheduleData: WeekScheduleData, fromDay: DayOfWeek, toDay: DayOfWeek): WeekScheduleData`
- **목적**: 요일 간 스케줄 복사
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `fromDay`: 복사할 요일
  - `toDay`: 복사될 요일
- **반환값**: 업데이트된 스케줄 데이터
- **복사 내용**: 운영시간, 브레이크 시간, 직원 배정

#### `clearDaySchedule(scheduleData: WeekScheduleData, day: DayOfWeek): WeekScheduleData`
- **목적**: 특정 요일 스케줄 초기화
- **매개변수**: 
  - `scheduleData`: 현재 스케줄 데이터
  - `day`: 초기화할 요일
- **반환값**: 업데이트된 스케줄 데이터
- **결과**: 휴무일로 설정

### 6. 검증 및 분석

#### `validateScheduleData(scheduleData: WeekScheduleData): ValidationResult`
- **목적**: 스케줄 데이터 유효성 검증
- **매개변수**: 
  - `scheduleData`: 검증할 스케줄 데이터
- **반환값**: 검증 결과 객체
- **검증 항목**: 
  - 운영시간 유효성
  - 브레이크 시간 중복 여부
  - 직원 배정 유효성
  - 시간 슬롯 일관성

#### `getScheduleStatistics(scheduleData: WeekScheduleData): ScheduleStatistics`
- **목적**: 스케줄 통계 정보 생성
- **매개변수**: 
  - `scheduleData`: 분석할 스케줄 데이터
- **반환값**: 통계 정보 객체
- **통계 항목**: 
  - 총 운영 시간
  - 요일별 운영 시간
  - 브레이크 시간 총합
  - 직원 배정 현황

#### `findConflicts(scheduleData: WeekScheduleData): ScheduleConflict[]`
- **목적**: 스케줄 충돌 사항 검색
- **매개변수**: 
  - `scheduleData`: 검사할 스케줄 데이터
- **반환값**: 충돌 사항 배열
- **충돌 유형**: 
  - 브레이크 시간 중복
  - 운영시간 외 직원 배정
  - 비활성 직원 배정

## 타입 정의

### TemplateFormData
```typescript
interface TemplateFormData {
  template_name: string;
  schedule_data: WeekScheduleData;
}
```

### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  day: DayOfWeek;
  type: 'operating_hours' | 'break_period' | 'employee_assignment';
  message: string;
}
```

### ScheduleStatistics
```typescript
interface ScheduleStatistics {
  totalOperatingHours: number;
  dailyOperatingHours: Record<DayOfWeek, number>;
  totalBreakHours: number;
  employeeAssignmentCount: number;
  operatingDaysCount: number;
}
```

### ScheduleConflict
```typescript
interface ScheduleConflict {
  day: DayOfWeek;
  timeSlot?: string;
  type: 'break_overlap' | 'invalid_employee' | 'outside_hours';
  description: string;
  severity: 'error' | 'warning';
}
```

## 사용 예시

### 기본 사용법
```typescript
import { TemplateService } from '@/lib/services/template-service';

// 서비스 인스턴스 생성
const templateService = new TemplateService(storeSettings, employees);

// 폼 데이터 초기화
const formData = templateService.initializeFormData();

// 운영시간 변경
const updatedSchedule = templateService.updateOperatingHours(
  formData.schedule_data,
  'monday',
  '08:00',
  '22:00'
);

// 브레이크 시간 추가
const scheduleWithBreak = templateService.addBreakPeriod(
  updatedSchedule,
  'monday',
  { name: '점심시간', start: '12:00', end: '13:00' }
);

// 직원 배정
const finalSchedule = templateService.toggleEmployeeInSlot(
  scheduleWithBreak,
  'monday',
  '14:00',
  123
);
```

### React 컴포넌트에서 사용
```typescript
function TemplateEditor() {
  const { stores, employees } = useScheduleTemplates();
  const [formData, setFormData] = useState<TemplateFormData>();
  
  // 서비스 인스턴스 생성
  const templateService = useMemo(() => 
    new TemplateService(currentStore, employees), 
    [currentStore, employees]
  );

  // 운영시간 변경 핸들러
  const handleOperatingHoursChange = (day: DayOfWeek, openTime: string | null, closeTime: string | null) => {
    const updatedSchedule = templateService.updateOperatingHours(
      formData.schedule_data,
      day,
      openTime,
      closeTime
    );
    setFormData(prev => ({ ...prev, schedule_data: updatedSchedule }));
  };

  // 직원 배정 토글 핸들러
  const handleEmployeeToggle = (day: DayOfWeek, timeSlot: string, employeeId: number) => {
    const updatedSchedule = templateService.toggleEmployeeInSlot(
      formData.schedule_data,
      day,
      timeSlot,
      employeeId
    );
    setFormData(prev => ({ ...prev, schedule_data: updatedSchedule }));
  };
}
```

### 검증 및 분석
```typescript
// 스케줄 검증
const validation = templateService.validateScheduleData(scheduleData);
if (!validation.isValid) {
  console.log('검증 오류:', validation.errors);
}

// 통계 정보 생성
const stats = templateService.getScheduleStatistics(scheduleData);
console.log('총 운영시간:', stats.totalOperatingHours);

// 충돌 검사
const conflicts = templateService.findConflicts(scheduleData);
if (conflicts.length > 0) {
  console.log('충돌 사항:', conflicts);
}
```

## 설계 원칙

### 1. 단일 책임 원칙 (SRP)
- 각 메서드는 하나의 명확한 책임만 가짐
- 스케줄 관리 관련 로직만 포함

### 2. 불변성 (Immutability)
- 모든 메서드는 새로운 객체를 반환
- 기존 데이터 변경 없이 새로운 상태 생성

### 3. 타입 안전성
- TypeScript를 활용한 컴파일 타임 타입 검사
- 명확한 인터페이스 정의

### 4. 재사용성
- UI 컴포넌트와 독립적인 비즈니스 로직
- 다양한 컨텍스트에서 재사용 가능

### 5. 테스트 용이성
- 순수 함수 중심의 설계
- 외부 의존성 최소화

## 성능 최적화

1. **메모이제이션**: 복잡한 계산 결과 캐싱
2. **지연 평가**: 필요할 때만 계산 수행
3. **얕은 복사**: 변경되지 않은 부분은 참조 유지
4. **배치 처리**: 여러 변경사항을 한 번에 처리

## 확장 가능성

1. **플러그인 시스템**: 커스텀 검증 규칙 추가
2. **이벤트 시스템**: 상태 변경 시 콜백 실행
3. **국제화**: 다양한 지역의 근무 규칙 지원
4. **템플릿 시스템**: 미리 정의된 스케줄 템플릿

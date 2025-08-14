# 스케줄 유틸리티 함수 정리

## 개요
스케줄 템플릿 관리를 위한 유틸리티 함수들을 정리한 문서입니다.  
파일 위치: `lib/utils/schedule-utils.ts`

## 시간 변환 함수

### `timeToMinutes(time: string): number`
- **목적**: HH:MM 형식의 시간을 분 단위로 변환
- **매개변수**: 
  - `time`: "HH:MM" 형식의 시간 문자열
- **반환값**: 분 단위 숫자
- **예시**: 
  ```typescript
  timeToMinutes("09:30") // 570
  timeToMinutes("14:15") // 855
  ```

### `minutesToTime(minutes: number): string`
- **목적**: 분 단위 숫자를 HH:MM 형식으로 변환
- **매개변수**: 
  - `minutes`: 분 단위 숫자
- **반환값**: "HH:MM" 형식 문자열
- **예시**: 
  ```typescript
  minutesToTime(570)  // "09:30"
  minutesToTime(855)  // "14:15"
  ```

## 시간 슬롯 생성 함수

### `generateTimeSlots(startTime: string, endTime: string, slotMinutes: number): string[]`
- **목적**: 시작 시간부터 종료 시간까지 지정된 간격으로 시간 슬롯 배열 생성
- **매개변수**: 
  - `startTime`: 시작 시간 ("HH:MM")
  - `endTime`: 종료 시간 ("HH:MM")
  - `slotMinutes`: 슬롯 간격 (분)
- **반환값**: 시간 슬롯 문자열 배열
- **예시**: 
  ```typescript
  generateTimeSlots("09:00", "12:00", 30)
  // ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
  ```

## 브레이크 시간 검증 함수

### `isTimeInBreakPeriod(time: string, breakPeriods: BreakPeriod[]): boolean`
- **목적**: 특정 시간이 브레이크 시간에 포함되는지 확인
- **매개변수**: 
  - `time`: 확인할 시간 ("HH:MM")
  - `breakPeriods`: 브레이크 시간 배열
- **반환값**: 브레이크 시간 포함 여부 (boolean)
- **예시**: 
  ```typescript
  const breaks = [{ name: "점심시간", start: "12:00", end: "13:00" }];
  isTimeInBreakPeriod("12:30", breaks) // true
  isTimeInBreakPeriod("14:00", breaks) // false
  ```

## 기본 스케줄 생성 함수

### `createDefaultWeekSchedule(storeSettings?: StoreSettings): WeekScheduleData`
- **목적**: 기본 주간 스케줄 데이터 생성
- **매개변수**: 
  - `storeSettings`: 스토어 설정 (선택사항)
- **반환값**: 기본 주간 스케줄 데이터
- **설명**: 
  - 스토어 설정이 있으면 해당 운영시간 적용
  - 없으면 기본값 (09:00-18:00, 30분 간격) 적용
  - 모든 요일을 영업일로 설정 (일요일 제외)

### `createDefaultDaySchedule(openTime?: string, closeTime?: string, slotMinutes?: number): DaySchedule`
- **목적**: 기본 일일 스케줄 데이터 생성
- **매개변수**: 
  - `openTime`: 개점 시간 (기본값: "09:00")
  - `closeTime`: 폐점 시간 (기본값: "18:00")
  - `slotMinutes`: 슬롯 간격 (기본값: 30)
- **반환값**: 일일 스케줄 데이터
- **구조**: 
  ```typescript
  {
    is_open: true,
    open_time: "09:00",
    close_time: "18:00",
    break_periods: [],
    time_slots: {
      "09:00": [],
      "09:30": [],
      // ... 30분 간격으로 생성
    }
  }
  ```

## 스케줄 조작 함수

### `updateDayOperatingHours(scheduleData: WeekScheduleData, day: DayOfWeek, openTime: string | null, closeTime: string | null, slotMinutes: number): WeekScheduleData`
- **목적**: 특정 요일의 운영시간 업데이트
- **매개변수**: 
  - `scheduleData`: 기존 주간 스케줄 데이터
  - `day`: 요일
  - `openTime`: 새로운 개점 시간 (null이면 휴무)
  - `closeTime`: 새로운 폐점 시간
  - `slotMinutes`: 슬롯 간격
- **반환값**: 업데이트된 주간 스케줄 데이터
- **설명**: 
  - 운영시간 변경 시 시간 슬롯 자동 재생성
  - 기존 직원 배정 정보는 유지 (유효한 시간대만)

### `updateDayBreakPeriods(scheduleData: WeekScheduleData, day: DayOfWeek, breakPeriods: BreakPeriod[]): WeekScheduleData`
- **목적**: 특정 요일의 브레이크 시간 업데이트
- **매개변수**: 
  - `scheduleData`: 기존 주간 스케줄 데이터
  - `day`: 요일
  - `breakPeriods`: 새로운 브레이크 시간 배열
- **반환값**: 업데이트된 주간 스케줄 데이터
- **설명**: 시간순으로 자동 정렬

## 직원 배정 함수

### `addEmployeeToTimeSlot(scheduleData: WeekScheduleData, day: DayOfWeek, timeSlot: string, employeeId: number, slotMinutes: number): WeekScheduleData`
- **목적**: 특정 시간 슬롯에 직원 추가
- **매개변수**: 
  - `scheduleData`: 기존 주간 스케줄 데이터
  - `day`: 요일
  - `timeSlot`: 시간 슬롯 ("HH:MM")
  - `employeeId`: 직원 ID
  - `slotMinutes`: 슬롯 간격
- **반환값**: 업데이트된 주간 스케줄 데이터
- **설명**: 
  - 해당 시간 슬롯이 없으면 자동 생성
  - 중복 배정 방지

### `removeEmployeeFromTimeSlot(scheduleData: WeekScheduleData, day: DayOfWeek, timeSlot: string, employeeId: number): WeekScheduleData`
- **목적**: 특정 시간 슬롯에서 직원 제거
- **매개변수**: 
  - `scheduleData`: 기존 주간 스케줄 데이터
  - `day`: 요일
  - `timeSlot`: 시간 슬롯 ("HH:MM")
  - `employeeId`: 직원 ID
- **반환값**: 업데이트된 주간 스케줄 데이터

### `toggleEmployeeInTimeSlot(scheduleData: WeekScheduleData, day: DayOfWeek, timeSlot: string, employeeId: number, slotMinutes: number): WeekScheduleData`
- **목적**: 시간 슬롯에서 직원 배정 토글 (있으면 제거, 없으면 추가)
- **매개변수**: 
  - `scheduleData`: 기존 주간 스케줄 데이터
  - `day`: 요일
  - `timeSlot`: 시간 슬롯 ("HH:MM")
  - `employeeId`: 직원 ID
  - `slotMinutes`: 슬롯 간격
- **반환값**: 업데이트된 주간 스케줄 데이터

## 스케줄 복사 함수

### `copyDaySchedule(scheduleData: WeekScheduleData, fromDay: DayOfWeek, toDay: DayOfWeek): WeekScheduleData`
- **목적**: 한 요일의 스케줄을 다른 요일로 복사
- **매개변수**: 
  - `scheduleData`: 기존 주간 스케줄 데이터
  - `fromDay`: 복사할 요일
  - `toDay`: 복사될 요일
- **반환값**: 업데이트된 주간 스케줄 데이터
- **설명**: 운영시간, 브레이크 시간, 직원 배정 모두 복사

## 검증 함수

### `validateTimeSlot(timeSlot: string): boolean`
- **목적**: 시간 슬롯 형식 검증
- **매개변수**: 
  - `timeSlot`: 검증할 시간 문자열
- **반환값**: 유효성 여부 (boolean)
- **검증 조건**: "HH:MM" 형식, 유효한 시간 범위

### `validateBreakPeriod(breakPeriod: BreakPeriod): boolean`
- **목적**: 브레이크 시간 유효성 검증
- **매개변수**: 
  - `breakPeriod`: 검증할 브레이크 시간
- **반환값**: 유효성 여부 (boolean)
- **검증 조건**: 
  - 시작 시간 < 종료 시간
  - 유효한 시간 형식
  - 이름이 비어있지 않음

### `validateDaySchedule(daySchedule: DaySchedule): boolean`
- **목적**: 일일 스케줄 유효성 검증
- **매개변수**: 
  - `daySchedule`: 검증할 일일 스케줄
- **반환값**: 유효성 여부 (boolean)
- **검증 조건**: 
  - 영업일인 경우 개점/폐점 시간 필수
  - 개점 시간 < 폐점 시간
  - 브레이크 시간 유효성
  - 시간 슬롯 유효성

## 사용 예시

### 기본 스케줄 생성
```typescript
import { createDefaultWeekSchedule, createDefaultDaySchedule } from '@/lib/utils/schedule-utils';

// 기본 주간 스케줄 생성
const weekSchedule = createDefaultWeekSchedule();

// 커스텀 일일 스케줄 생성
const daySchedule = createDefaultDaySchedule("10:00", "20:00", 60);
```

### 운영시간 변경
```typescript
import { updateDayOperatingHours } from '@/lib/utils/schedule-utils';

const updatedSchedule = updateDayOperatingHours(
  currentSchedule,
  'monday',
  '08:00',
  '22:00',
  30
);
```

### 직원 배정
```typescript
import { addEmployeeToTimeSlot, removeEmployeeFromTimeSlot } from '@/lib/utils/schedule-utils';

// 직원 추가
const scheduleWithEmployee = addEmployeeToTimeSlot(
  currentSchedule,
  'tuesday',
  '14:00',
  123,  // 직원 ID
  30
);

// 직원 제거
const scheduleWithoutEmployee = removeEmployeeFromTimeSlot(
  scheduleWithEmployee,
  'tuesday',
  '14:00',
  123
);
```

### 브레이크 시간 설정
```typescript
import { updateDayBreakPeriods } from '@/lib/utils/schedule-utils';

const breakPeriods = [
  { name: "점심시간", start: "12:00", end: "13:00" },
  { name: "저녁시간", start: "18:00", end: "19:00" }
];

const scheduleWithBreaks = updateDayBreakPeriods(
  currentSchedule,
  'wednesday',
  breakPeriods
);
```

### 스케줄 복사
```typescript
import { copyDaySchedule } from '@/lib/utils/schedule-utils';

// 월요일 스케줄을 화요일로 복사
const scheduleWithCopy = copyDaySchedule(
  currentSchedule,
  'monday',
  'tuesday'
);
```

## 성능 고려사항

1. **불변성 유지**: 모든 함수는 새로운 객체를 반환하여 React 상태 관리에 최적화
2. **메모리 효율성**: 필요한 부분만 복사하여 메모리 사용량 최소화
3. **타입 안전성**: TypeScript 타입 시스템을 활용한 런타임 오류 방지
4. **검증 최적화**: 빠른 실패(fail-fast) 원칙으로 불필요한 연산 방지

## 상수 정의

```typescript
export const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일'
};

export const DAY_ORDER: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 
  'friday', 'saturday', 'sunday'
];

export const DEFAULT_SLOT_MINUTES = 30;
export const DEFAULT_OPEN_TIME = "09:00";
export const DEFAULT_CLOSE_TIME = "18:00";
```

# 근로계약서 유틸리티 함수 (labor-contract-utils.ts)

## 개요
근로계약서 데이터의 검증, 계산, 변환 등을 담당하는 핵심 유틸리티 함수들을 제공합니다. 한국 노동법에 따른 검증 로직과 계산 기능이 포함되어 있습니다.

## 주요 기능

### 1. 데이터 검증 함수

#### `validateLaborContract(contract: LaborContract): ValidationError[]`
- **목적**: 근로계약서 데이터의 유효성을 검증
- **검증 항목**:
  - 필수 필드 검증 (사업체명, 대표자명, 근로자명 등)
  - 날짜 형식 및 논리적 유효성 검증
  - 근로시간 법적 제한 검증 (일일 최대 8시간)
  - 최저시급 준수 검증 (2025년 기준 10,030원)
  - 연소근로자 특별 검증 (만 18세 미만)
- **반환값**: ValidationError 배열 (오류가 없으면 빈 배열)

#### `isValidDate(dateString: string): boolean`
- **목적**: YYYY-MM-DD 형식의 날짜 문자열 유효성 검증
- **사용 예**: 근로개시일, 근로종료일 검증

#### `isValidTimeFormat(timeString: string): boolean`
- **목적**: HH:MM 형식의 시간 문자열 유효성 검증
- **사용 예**: 근무시간, 휴게시간 검증

### 2. 계산 함수

#### `calculateAge(birthdate: string): number`
- **목적**: 생년월일로부터 만 나이 계산
- **사용 예**: 연소근로자 판별

#### `calculateDailyWorkHours(startTime, endTime, breakStartTime?, breakEndTime?): number`
- **목적**: 일일 실제 근로시간 계산 (휴게시간 제외)
- **매개변수**:
  - `startTime`: 근무 시작시간 (HH:MM)
  - `endTime`: 근무 종료시간 (HH:MM)
  - `breakStartTime`: 휴게 시작시간 (선택)
  - `breakEndTime`: 휴게 종료시간 (선택)

#### `calculateWeeklyWorkHours(contract: LaborContract): number`
- **목적**: 주간 총 근로시간 계산
- **계산 방식**: 일일 근로시간 × 주 근무일수

#### `calculateMonthlySalary(contract: LaborContract): number`
- **목적**: 월 예상 급여 계산 (세전)
- **지원 급여 유형**:
  - 시간급: 시급 × 월 예상 근로시간
  - 일급: 일급 × 월 예상 근무일수
  - 월급: 기본급 + 각종 수당

### 3. 형식 변환 함수

#### `formatCurrency(amount: number): string`
- **목적**: 숫자를 한국어 금액 형식으로 변환
- **예시**: 1000000 → "1,000,000원"

#### `getKoreanDayOfWeek(day: string): string`
- **목적**: 영문 요일을 한글로 변환
- **예시**: "monday" → "월요일"

#### `getContractTitle(contractType: ContractType): string`
- **목적**: 계약 유형별 제목 반환
- **지원 유형**:
  - `regular`: "근로계약서"
  - `part-time`: "단시간근로계약서"
  - `fixed-term`: "기간제근로계약서"
  - `minor`: "연소근로자근로계약서"
  - `foreign-agriculture`: "외국인근로자(농업)근로계약서"

### 4. 검증 함수

#### `isValidBusinessNumber(businessNumber: string): boolean`
- **목적**: 사업자등록번호 형식 검증 (XXX-XX-XXXXX)

#### `isValidPhoneNumber(phoneNumber: string): boolean`
- **목적**: 전화번호 형식 검증 (다양한 한국 전화번호 형식 지원)

### 5. 기본 데이터 생성

#### `createDefaultContract(contractType: ContractType): LaborContract`
- **목적**: 계약 유형별 기본 계약서 데이터 생성
- **특징**: 각 계약 유형에 맞는 기본값과 필수 필드 설정

## 상수 정의

### `MINIMUM_WAGE`
- **값**: 10,030원 (2025년 최저시급)

### `LEGAL_WORKING_HOURS`
- **DAILY_MAX**: 8시간 (일일 최대 근로시간)
- **WEEKLY_MAX**: 40시간 (주간 최대 근로시간)

## 사용 예시

```typescript
import { validateLaborContract, calculateMonthlySalary } from '@/lib/labor-contract-utils';

// 계약서 검증
const errors = validateLaborContract(contract);
if (errors.length > 0) {
  console.log('검증 오류:', errors);
}

// 월급 계산
const monthlySalary = calculateMonthlySalary(contract);
console.log('예상 월급:', formatCurrency(monthlySalary));
```

## 주의사항

1. **한국 노동법 준수**: 모든 검증 로직은 한국 노동법을 기준으로 작성됨
2. **최저시급 업데이트**: 매년 최저시급 변경 시 `MINIMUM_WAGE` 상수 업데이트 필요
3. **연소근로자**: 만 18세 미만 근로자에 대한 특별 검증 로직 포함
4. **외국인 농업근로자**: 일반 근로시간 제한 예외 적용

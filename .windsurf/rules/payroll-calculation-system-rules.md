---
trigger: model_decision
description: 이 문서는 한국 노동법에 따른 정확한 급여 계산을 위한 규칙과 함수 사용법을 정의합니다.
---

## 📋 기본 원칙

### 1. 모든 급여 계산은 `@/lib/payroll-calculator-new.ts`의 함수를 사용할 것
### 2. 2025년 최저시급 10,030원 기준으로 계산
### 3. 한국 노동법 및 4대보험 요율을 정확히 반영
### 4. 함수는 독립적으로 사용 가능하며, 필요한 것만 import

---

## 🔧 함수별 사용법 및 매커니즘

### 1. 근무시간 계산 (`calculateWorkHours`)

**매커니즘**: 시작/종료 시간과 휴게시간을 입력받아 정규/연장/야간 시간을 분리 계산

```typescript
import { calculateWorkHours } from '@/lib/payroll-calculator-new'

const workHours = calculateWorkHours(
  '09:00',  // 시작시간 (HH:mm)
  '18:00',  // 종료시간 (HH:mm)
  60        // 휴게시간 (분)
)

// 결과: { totalHours, regularHours, overtimeHours, nightHours, isNightShift }
```

**계산식**:
- 총 근무시간 = (종료시간 - 시작시간) - 휴게시간
- 정규시간 = min(총 근무시간, 8시간)
- 연장시간 = max(총 근무시간 - 8시간, 0)
- 야간시간 = 22:00-06:00 구간 근무시간

---

### 2. 월급 계산 (`calculateMonthlySalary`)

**매커니즘**: 주간 근무시간과 시급으로 주휴수당 포함한 세전 월급 계산

```typescript
import { calculateMonthlySalary } from '@/lib/payroll-calculator-new'

const monthlySalary = calculateMonthlySalary(
  40,     // 주간 근무시간
  10030   // 시급 (기본값: 최저시급)
)

// 결과: { grossSalary, totalWorkingHours, holidayHours }
```

**계산식**:
- 주휴시간 = 주 15시간 이상 시 (주간시간/40) × 8시간, 미만 시 0
- 월 총 근무시간 = (주간시간 + 주휴시간) × 4.345주
- 세전 월급 = 월 총 근무시간 × 시급

---

### 3. 4대보험료 계산 (`calculateInsurance`)

**매커니즘**: 세전 월급 기준으로 근로자/사업주 부담 4대보험료 분리 계산

```typescript
import { calculateInsurance } from '@/lib/payroll-calculator-new'

const insurance = calculateInsurance(2096270) // 세전 월급

// 결과: { employee: {...}, employer: {...} }
```

**계산식 (2025년 요율)**:
- **근로자 부담**: 국민연금 4.5%, 건강보험 3.545%, 장기요양 12.95%(건보의), 고용보험 0.9%
- **사업주 부담**: 위 + 고용안정 0.25%, 산재보험 0.7%

---

### 4. 실수령액 계산 (`calculateNetSalary`)

**매커니즘**: 세전 월급에서 4대보험료와 소득세를 공제한 실제 입금액 계산

```typescript
import { calculateNetSalary } from '@/lib/payroll-calculator-new'

const netSalary = calculateNetSalary(
  2096270,  // 세전 월급
  1         // 부양가족 수 (기본값: 1)
)

// 결과: { grossSalary, employeeInsurance, incomeTax, localTax, totalDeductions, netSalary }
```

**계산식**:
- 4대보험료 = calculateInsurance()의 employee.total
- 근로소득세 = 간이세액표 기준 (근사치)
- 지방소득세 = 근로소득세 × 10%
- 실수령액 = 세전월급 - (4대보험료 + 근로소득세 + 지방소득세)

---

### 5. 사업주 부담 비용 (`calculateEmployerCost`)

**매커니즘**: 근로자 1명 고용 시 사업주가 실제로 부담하는 총 비용 계산

```typescript
import { calculateEmployerCost } from '@/lib/payroll-calculator-new'

const employerCost = calculateEmployerCost(2096270) // 세전 월급

// 결과: { grossSalary, employerInsurance, totalCost }
```

**계산식**:
- 사업주 4대보험료 = calculateInsurance()의 employer.total
- 총 부담 비용 = 근로자 세전 월급 + 사업주 4대보험료

---

### 6. 일일 급여 계산 (`calculatePayroll`) - 기존 호환성

**매커니즘**: 하루 근무에 대한 기본급, 연장수당, 야간수당, 주휴수당 계산

```typescript
import { calculatePayroll } from '@/lib/payroll-calculator-new'

const workHours = calculateWorkHours('09:00', '18:00', 60)
const payroll = calculatePayroll(
  workHours,  // 근무시간 정보
  10030,      // 시급
  40          // 주간 총 근무시간
)

// 결과: { regularPay, overtimePay, nightPay, holidayPay, totalPay, isEligibleForHolidayPay }
```

**계산식**:
- 기본급 = 정규시간 × 시급
- 연장수당 = 연장시간 × 시급 × 1.5
- 야간수당 = 야간시간 × 시급 × 0.5
- 주휴수당 = 주 15시간 이상 시 (기본급 + 연장수당) ÷ 5

---

## 🎯 실제 사용 시나리오

### 시나리오 1: 월급만 빠르게 계산
```typescript
import { calculateMonthlySalary } from '@/lib/payroll-calculator-new'

// 주 40시간, 최저시급 근무자의 월급
const salary = calculateMonthlySalary(40)
console.log(`세전 월급: ${salary.grossSalary.toLocaleString()}원`)
```

### 시나리오 2: 실수령액까지 계산
```typescript
import { calculateMonthlySalary, calculateNetSalary } from '@/lib/payroll-calculator-new'

const monthlySalary = calculateMonthlySalary(40)
const netSalary = calculateNetSalary(monthlySalary.grossSalary, 1)

console.log(`세전: ${netSalary.grossSalary.toLocaleString()}원`)
console.log(`실수령: ${netSalary.netSalary.toLocaleString()}원`)
```

### 시나리오 3: 사업주 관점에서 총 비용 계산
```typescript
import { calculateMonthlySalary, calculateEmployerCost } from '@/lib/payroll-calculator-new'

const monthlySalary = calculateMonthlySalary(40)
const employerCost = calculateEmployerCost(monthlySalary.grossSalary)

console.log(`근로자 월급: ${employerCost.grossSalary.toLocaleString()}원`)
console.log(`사업주 총 부담: ${employerCost.totalCost.toLocaleString()}원`)
```

### 시나리오 4: 완전한 급여 명세서 생성
```typescript
import { 
  calculateMonthlySalary, 
  calculateNetSalary, 
  calculateEmployerCost,
  calculateInsurance 
} from '@/lib/payroll-calculator-new'

const weeklyHours = 40
const dependents = 1

const monthlySalary = calculateMonthlySalary(weeklyHours)
const netSalary = calculateNetSalary(monthlySalary.grossSalary, dependents)
const employerCost = calculateEmployerCost(monthlySalary.grossSalary)
const insurance = calculateInsurance(monthlySalary.grossSalary)

// 완전한 급여 정보 객체
const payrollStatement = {
  employee: {
    grossSalary: monthlySalary.grossSalary,
    netSalary: netSalary.netSalary,
    deductions: {
      insurance: insurance.employee.total,
      incomeTax: netSalary.incomeTax,
      localTax: netSalary.localTax
    }
  },
  employer: {
    totalCost: employerCost.totalCost,
    insurance: insurance.employer.total
  }
}
```

---

## ⚠️ 주의사항

1. **소득세 계산**: 현재는 근사치 계산이므로, 정확한 계산을 위해서는 국세청 간이세액표 데이터 연동 필요
2. **산재보험 요율**: 업종별로 상이하므로 필요시 업종에 맞는 요율로 수정
3. **법령 변경**: 최저시급이나 보험 요율 변경 시 상수 값 업데이트 필요
4. **반올림**: 모든 금액은 원 단위로 반올림 처리됨

---

## 🔄 테스트 방법

`/test` 페이지에서 다양한 시나리오를 실시간으로 테스트할 수 있습니다:
- 일반 근무 (9시-18시)
- 야간 근무 (22시-06시)  
- 연장 근무 (8시-21시)
- 단시간 근무 (주휴수당 비대상)

---

**이 Rules를 따라 급여 계산 시스템을 구현하면 한국 노동법에 맞는 정확한 계산이 보장됩니다.**

// 급여명세서 관련 타입 정의

export interface CompanyInfo {
  name: string;
  businessNumber: string;
  representative: string;
  address: string;
  logo?: string;
}

export interface EmployeeInfo {
  name: string;
  department: string;
  position: string;
  employeeId: string;
}

export interface PayrollPeriod {
  startDate: string;
  endDate: string;
  paymentDate: string;
}

// 지급 항목
export interface PaymentItem {
  id: string;
  name: string;
  amount: number;
  category: 'basic' | 'allowance' | 'bonus';
  isRequired?: boolean;
}

// 공제 항목
export interface DeductionItem {
  id: string;
  name: string;
  amount: number;
  category: 'insurance' | 'tax' | 'other';
  rate?: number; // 요율 (%)
  isAutoCalculated?: boolean;
}

// 4대보험 요율 (2025년 기준)
export interface InsuranceRates {
  nationalPension: number; // 4.5%
  healthInsurance: number; // 3.545%
  longTermCare: number; // 건강보험료의 12.95%
  employmentInsurance: number; // 0.8%
}

// 급여명세서 메인 데이터
export interface PayrollStatement {
  id?: string;
  companyInfo: CompanyInfo;
  employeeInfo: EmployeeInfo;
  payrollPeriod: PayrollPeriod;
  paymentItems: PaymentItem[];
  deductionItems: DeductionItem[];
  totalPayment: number; // 지급 총액 (세전)
  totalDeduction: number; // 공제 총액
  netPayment: number; // 실 지급액
  createdAt?: string;
  updatedAt?: string;
}

// 검증 오류
export interface PayrollValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range';
}

// 급여 계산 결과
export interface PayrollCalculationResult {
  grossPay: number; // 총 지급액
  totalDeductions: number; // 총 공제액
  netPay: number; // 실 지급액
  insuranceDeductions: {
    nationalPension: number;
    healthInsurance: number;
    longTermCare: number;
    employmentInsurance: number;
  };
  taxDeductions: {
    incomeTax: number;
    localTax: number;
  };
}

// 기본 상수
export const DEFAULT_INSURANCE_RATES: InsuranceRates = {
  nationalPension: 4.5,
  healthInsurance: 3.545,
  longTermCare: 12.95, // 건강보험료의 12.95%
  employmentInsurance: 0.8,
};

export const DEFAULT_PAYMENT_ITEMS: PaymentItem[] = [
  {
    id: 'basic-salary',
    name: '기본급',
    amount: 0,
    category: 'basic',
    isRequired: true,
  },
  {
    id: 'overtime-allowance',
    name: '연장근로수당',
    amount: 0,
    category: 'allowance',
  },
  {
    id: 'night-allowance',
    name: '야간근로수당',
    amount: 0,
    category: 'allowance',
  },
  {
    id: 'holiday-allowance',
    name: '휴일근로수당',
    amount: 0,
    category: 'allowance',
  },
  {
    id: 'meal-allowance',
    name: '식대',
    amount: 0,
    category: 'allowance',
  },
  {
    id: 'transport-allowance',
    name: '차량유지비',
    amount: 0,
    category: 'allowance',
  },
  {
    id: 'position-allowance',
    name: '직책수당',
    amount: 0,
    category: 'allowance',
  },
  {
    id: 'performance-bonus',
    name: '성과급/상여금',
    amount: 0,
    category: 'bonus',
  },
];

export const DEFAULT_DEDUCTION_ITEMS: DeductionItem[] = [
  {
    id: 'national-pension',
    name: '국민연금',
    amount: 0,
    category: 'insurance',
    rate: DEFAULT_INSURANCE_RATES.nationalPension,
    isAutoCalculated: true,
  },
  {
    id: 'health-insurance',
    name: '건강보험',
    amount: 0,
    category: 'insurance',
    rate: DEFAULT_INSURANCE_RATES.healthInsurance,
    isAutoCalculated: true,
  },
  {
    id: 'long-term-care',
    name: '장기요양보험',
    amount: 0,
    category: 'insurance',
    rate: DEFAULT_INSURANCE_RATES.longTermCare,
    isAutoCalculated: true,
  },
  {
    id: 'employment-insurance',
    name: '고용보험',
    amount: 0,
    category: 'insurance',
    rate: DEFAULT_INSURANCE_RATES.employmentInsurance,
    isAutoCalculated: true,
  },
  {
    id: 'income-tax',
    name: '소득세',
    amount: 0,
    category: 'tax',
    isAutoCalculated: true,
  },
  {
    id: 'local-tax',
    name: '지방소득세',
    amount: 0,
    category: 'tax',
    isAutoCalculated: true,
  },
  {
    id: 'union-fee',
    name: '노동조합비',
    amount: 0,
    category: 'other',
  },
  {
    id: 'advance-repayment',
    name: '가불금 상환액',
    amount: 0,
    category: 'other',
  },
];

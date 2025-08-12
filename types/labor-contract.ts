// 근로계약서 관련 타입 정의

// 계약서 유형
export type ContractType = 
  | 'permanent'           // 기간의 정함이 없는 경우
  | 'fixed-term'          // 기간의 정함이 있는 경우  
  | 'minor'               // 연소근로자
  | 'part-time'           // 단시간근로자
  | 'construction-daily'  // 건설일용근로자
  | 'foreign-worker'      // 외국인근로자
  | 'foreign-agriculture' // 외국인근로자(농업·축산업·어업)
  | 'foreign-worker-en'   // 외국인근로자 (영문)
  | 'foreign-agriculture-en'; // 외국인근로자(농업·축산업·어업) (영문)

export type SalaryType = 'monthly' | 'daily' | 'hourly';
export type PaymentMethod = 'direct' | 'bank-transfer';

// 사업주 정보
export interface EmployerInfo {
  companyName: string;
  address: string;
  representative: string;
  phone: string;
  businessNumber?: string;
}

// 근로자 정보
export interface EmployeeInfo {
  name: string;
  address: string;
  phone: string;
  birthdate?: string; // YYYY-MM-DD
}

// 근로시간 정보
export interface WorkingHours {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breakStartTime?: string; // HH:MM
  breakEndTime?: string; // HH:MM
  workDaysPerWeek: number;
  weeklyHoliday: string; // 요일
}

// 임금 정보
export interface SalaryInfo {
  basicSalary: number;
  salaryType: SalaryType;
  bonusAmount?: number;
  hasBonus: boolean;
  otherAllowances: Array<{
    name: string;
    amount: number;
  }>;
  payDate: number; // 매월 몇 일
  paymentMethod: PaymentMethod;
}

// 사회보험 정보
export interface SocialInsurance {
  employmentInsurance: boolean;
  workersCompensation: boolean;
  nationalPension: boolean;
  healthInsurance: boolean;
}

// 연소근로자 추가 정보
export interface MinorWorkerInfo {
  guardianName: string;
  guardianBirthdate: string;
  guardianAddress: string;
  guardianPhone: string;
  guardianRelationship: string;
  consentProvided: boolean;
  familyCertificateProvided: boolean;
}

// 단시간근로자 근로시간 정보
export interface PartTimeSchedule {
  [key: string]: {
    workHours: number;
    startTime: string;
    endTime: string;
    breakTime?: {
      start: string;
      end: string;
    };
  };
}

// 외국인근로자 추가 정보
export interface ForeignWorkerInfo {
  homeCountryAddress: string;
  probationPeriodMonths?: number;
  useProbationPeriod: boolean;
  accommodationProvided: boolean;
  accommodationType?: string;
  accommodationCost?: number;
  mealsProvided: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  mealCost?: number;
}

// 건설일용근로자 추가 정보
export interface ConstructionWorkerInfo {
  overtimeHours: number;
  overtimeRate: number;
  nightWorkHours: number;
  nightWorkRate: number;
  holidayWorkHours: number;
  holidayWorkRate: number;
}

// 메인 근로계약서 데이터 구조
export interface LaborContract {
  id?: string;
  contractType: ContractType;
  
  // 기본 정보
  employer: EmployerInfo;
  employee: EmployeeInfo;
  
  // 근로 조건
  workStartDate: string; // YYYY-MM-DD
  workEndDate?: string; // 기간제의 경우
  workplace: string;
  jobDescription: string;
  
  // 근로시간
  workingHours: WorkingHours;
  
  // 임금
  salary: SalaryInfo;
  
  // 사회보험
  socialInsurance: SocialInsurance;
  
  // 유형별 추가 정보
  minorWorkerInfo?: MinorWorkerInfo;
  partTimeSchedule?: PartTimeSchedule;
  foreignWorkerInfo?: ForeignWorkerInfo;
  constructionWorkerInfo?: ConstructionWorkerInfo;
  
  // 메타데이터
  createdAt?: string;
  updatedAt?: string;
}

// 폼 검증을 위한 에러 타입
export interface ValidationError {
  field: string;
  message: string;
}

// PDF 생성 옵션
export interface PDFOptions {
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// 계약서 템플릿 정보
export interface ContractTemplate {
  type: ContractType;
  title: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
}

// 상수 정의
export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    type: 'permanent',
    title: '표준근로계약서 (기간의 정함이 없는 경우)',
    description: '정규직 근로자를 위한 표준 계약서',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'workingHours', 'salary'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'fixed-term',
    title: '표준근로계약서 (기간의 정함이 있는 경우)',
    description: '계약직 근로자를 위한 표준 계약서',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workEndDate', 'workplace', 'jobDescription', 'workingHours', 'salary'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'minor',
    title: '연소근로자 표준근로계약서',
    description: '만 18세 미만 근로자를 위한 계약서',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'workingHours', 'salary', 'minorWorkerInfo'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'part-time',
    title: '단시간근로자 표준근로계약서',
    description: '파트타임 근로자를 위한 계약서',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'partTimeSchedule', 'salary'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'construction-daily',
    title: '건설일용근로자 표준근로계약서',
    description: '건설업 일용직 근로자를 위한 계약서',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'workingHours', 'salary', 'constructionWorkerInfo'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'foreign-worker',
    title: '외국인근로자 표준근로계약서',
    description: '외국인 근로자를 위한 계약서',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'workingHours', 'salary', 'foreignWorkerInfo'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'foreign-agriculture',
    title: '외국인근로자 표준근로계약서 (농업·축산업·어업)',
    description: '농업, 축산업, 어업 분야 외국인 근로자를 위한 계약서',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'workingHours', 'salary', 'foreignWorkerInfo'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'foreign-worker-en',
    title: 'Standard Labor Contract for Foreign Workers (English)',
    description: 'Labor contract for foreign workers in English',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'workingHours', 'salary', 'foreignWorkerInfo'],
    optionalFields: ['socialInsurance']
  },
  {
    type: 'foreign-agriculture-en',
    title: 'Standard Labor Contract for Foreign Workers (Agriculture/Livestock/Fishery) (English)',
    description: 'Labor contract for foreign workers in agriculture, livestock, and fishery sectors in English',
    requiredFields: ['employer', 'employee', 'workStartDate', 'workplace', 'jobDescription', 'workingHours', 'salary', 'foreignWorkerInfo'],
    optionalFields: ['socialInsurance']
  }
];

// 최저시급 (2025년 기준)
export const MINIMUM_WAGE = 10030;

// 법정 근로시간
export const LEGAL_WORKING_HOURS = {
  WEEKLY_MAX: 40,
  DAILY_MAX: 8,
  BREAK_MINIMUM: 30 // 4시간 이상 근로 시 최소 휴게시간(분)
};

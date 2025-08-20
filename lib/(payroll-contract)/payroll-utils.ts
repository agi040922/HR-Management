// 급여명세서 관련 유틸리티 함수

import {
  PayrollStatement,
  PayrollValidationError,
  PayrollCalculationResult,
  PaymentItem,
  DeductionItem,
  DEFAULT_INSURANCE_RATES,
  DEFAULT_PAYMENT_ITEMS,
  DEFAULT_DEDUCTION_ITEMS,
  CompanyInfo,
  EmployeeInfo,
  PayrollPeriod,
} from '@/types/payroll-statement';

// 기본 급여명세서 데이터 생성
export function createDefaultPayrollStatement(): PayrollStatement {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // 이번 달 1일부터 말일까지
  const startDate = new Date(currentYear, currentMonth, 1);
  const endDate = new Date(currentYear, currentMonth + 1, 0);
  const paymentDate = new Date(currentYear, currentMonth, 25);

  return {
    companyInfo: {
      name: '',
      businessNumber: '',
      representative: '',
      address: '',
    },
    employeeInfo: {
      name: '',
      department: '',
      position: '',
      employeeId: '',
    },
    payrollPeriod: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      paymentDate: paymentDate.toISOString().split('T')[0],
    },
    paymentItems: [...DEFAULT_PAYMENT_ITEMS],
    deductionItems: [...DEFAULT_DEDUCTION_ITEMS],
    totalPayment: 0,
    totalDeduction: 0,
    netPayment: 0,
  };
}

// 급여 계산 함수
export function calculatePayroll(paymentItems: PaymentItem[]): PayrollCalculationResult {
  // 총 지급액 계산
  const grossPay = paymentItems.reduce((sum, item) => sum + item.amount, 0);
  
  // 4대보험 기준소득월액 (상한/하한 적용)
  const pensionBase = Math.min(Math.max(grossPay, 350000), 5530000); // 2025년 기준
  const healthBase = Math.min(Math.max(grossPay, 0), 10650000); // 2025년 기준
  
  // 4대보험 계산
  const nationalPension = Math.floor(pensionBase * DEFAULT_INSURANCE_RATES.nationalPension / 100);
  const healthInsurance = Math.floor(healthBase * DEFAULT_INSURANCE_RATES.healthInsurance / 100);
  const longTermCare = Math.floor(healthInsurance * DEFAULT_INSURANCE_RATES.longTermCare / 100);
  const employmentInsurance = Math.floor(grossPay * DEFAULT_INSURANCE_RATES.employmentInsurance / 100);
  
  // 소득세 계산 (간이세액표 적용 - 단순화)
  const incomeTax = calculateIncomeTax(grossPay);
  const localTax = Math.floor(incomeTax * 0.1); // 지방소득세는 소득세의 10%
  
  const insuranceDeductions = {
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
  };
  
  const taxDeductions = {
    incomeTax,
    localTax,
  };
  
  const totalDeductions = 
    nationalPension + healthInsurance + longTermCare + employmentInsurance + 
    incomeTax + localTax;
  
  const netPay = grossPay - totalDeductions;
  
  return {
    grossPay,
    totalDeductions,
    netPay,
    insuranceDeductions,
    taxDeductions,
  };
}

// 간이세액표 기반 소득세 계산 (단순화된 버전)
function calculateIncomeTax(monthlyIncome: number): number {
  // 2025년 근로소득 간이세액표 (단순화)
  if (monthlyIncome <= 1060000) return 0;
  if (monthlyIncome <= 1400000) return Math.floor((monthlyIncome - 1060000) * 0.06);
  if (monthlyIncome <= 2000000) return Math.floor(20400 + (monthlyIncome - 1400000) * 0.15);
  if (monthlyIncome <= 3000000) return Math.floor(110400 + (monthlyIncome - 2000000) * 0.24);
  if (monthlyIncome <= 5000000) return Math.floor(350400 + (monthlyIncome - 3000000) * 0.35);
  return Math.floor(1050400 + (monthlyIncome - 5000000) * 0.38);
}

// 공제 항목 자동 계산 업데이트
export function updateAutoCalculatedDeductions(
  paymentItems: PaymentItem[],
  deductionItems: DeductionItem[]
): DeductionItem[] {
  const calculation = calculatePayroll(paymentItems);
  
  return deductionItems.map(item => {
    if (!item.isAutoCalculated) return item;
    
    switch (item.id) {
      case 'national-pension':
        return { ...item, amount: calculation.insuranceDeductions.nationalPension };
      case 'health-insurance':
        return { ...item, amount: calculation.insuranceDeductions.healthInsurance };
      case 'long-term-care':
        return { ...item, amount: calculation.insuranceDeductions.longTermCare };
      case 'employment-insurance':
        return { ...item, amount: calculation.insuranceDeductions.employmentInsurance };
      case 'income-tax':
        return { ...item, amount: calculation.taxDeductions.incomeTax };
      case 'local-tax':
        return { ...item, amount: calculation.taxDeductions.localTax };
      default:
        return item;
    }
  });
}

// 급여명세서 검증
export function validatePayrollStatement(statement: PayrollStatement): PayrollValidationError[] {
  const errors: PayrollValidationError[] = [];
  
  // 회사 정보 검증
  if (!statement.companyInfo.name.trim()) {
    errors.push({ field: 'companyInfo.name', message: '회사명을 입력해주세요.', type: 'required' });
  }
  
  if (!statement.companyInfo.businessNumber.trim()) {
    errors.push({ field: 'companyInfo.businessNumber', message: '사업자등록번호를 입력해주세요.', type: 'required' });
  } else if (!/^\d{3}-\d{2}-\d{5}$/.test(statement.companyInfo.businessNumber)) {
    errors.push({ field: 'companyInfo.businessNumber', message: '사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)', type: 'format' });
  }
  
  if (!statement.companyInfo.representative.trim()) {
    errors.push({ field: 'companyInfo.representative', message: '대표자명을 입력해주세요.', type: 'required' });
  }
  
  if (!statement.companyInfo.address.trim()) {
    errors.push({ field: 'companyInfo.address', message: '회사 주소를 입력해주세요.', type: 'required' });
  }
  
  // 직원 정보 검증
  if (!statement.employeeInfo.name.trim()) {
    errors.push({ field: 'employeeInfo.name', message: '직원명을 입력해주세요.', type: 'required' });
  }
  
  if (!statement.employeeInfo.department.trim()) {
    errors.push({ field: 'employeeInfo.department', message: '소속 부서를 입력해주세요.', type: 'required' });
  }
  
  if (!statement.employeeInfo.position.trim()) {
    errors.push({ field: 'employeeInfo.position', message: '직위를 입력해주세요.', type: 'required' });
  }
  
  // 급여 기간 검증
  if (!statement.payrollPeriod.startDate) {
    errors.push({ field: 'payrollPeriod.startDate', message: '급여 시작일을 입력해주세요.', type: 'required' });
  }
  
  if (!statement.payrollPeriod.endDate) {
    errors.push({ field: 'payrollPeriod.endDate', message: '급여 종료일을 입력해주세요.', type: 'required' });
  }
  
  if (!statement.payrollPeriod.paymentDate) {
    errors.push({ field: 'payrollPeriod.paymentDate', message: '지급일을 입력해주세요.', type: 'required' });
  }
  
  // 날짜 순서 검증
  if (statement.payrollPeriod.startDate && statement.payrollPeriod.endDate) {
    const startDate = new Date(statement.payrollPeriod.startDate);
    const endDate = new Date(statement.payrollPeriod.endDate);
    
    if (startDate >= endDate) {
      errors.push({ field: 'payrollPeriod.endDate', message: '종료일은 시작일보다 늦어야 합니다.', type: 'range' });
    }
  }
  
  // 기본급 검증
  const basicSalary = statement.paymentItems.find(item => item.id === 'basic-salary');
  if (!basicSalary || basicSalary.amount <= 0) {
    errors.push({ field: 'paymentItems.basic-salary', message: '기본급을 입력해주세요.', type: 'required' });
  }
  
  // 최저시급 검증 (2025년 기준 10,030원)
  const totalPayment = statement.paymentItems.reduce((sum, item) => sum + item.amount, 0);
  if (totalPayment > 0 && totalPayment < 2087580) { // 최저시급 × 주 40시간 × 4.345주 × 1.2(주휴수당)
    errors.push({ field: 'paymentItems', message: '급여가 최저임금에 미달합니다.', type: 'range' });
  }
  
  return errors;
}

// 숫자를 한국 통화 형식으로 포맷
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

// 날짜를 한국 형식으로 포맷
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 급여명세서 제목 생성
export function getPayrollTitle(payrollPeriod: PayrollPeriod): string {
  const startDate = new Date(payrollPeriod.startDate);
  const year = startDate.getFullYear();
  const month = startDate.getMonth() + 1;
  
  return `${year}년 ${month}월분 급여명세서`;
}

// JSON으로 급여명세서 내보내기
export function exportPayrollAsJSON(statement: PayrollStatement): void {
  const dataStr = JSON.stringify(statement, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `급여명세서_${statement.employeeInfo.name}_${getPayrollTitle(statement.payrollPeriod).replace(/\s/g, '_')}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

// JSON에서 급여명세서 가져오기
export async function importPayrollFromJSON(file: File): Promise<PayrollStatement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const statement = JSON.parse(content) as PayrollStatement;
        
        // 기본 검증
        if (!statement.companyInfo || !statement.employeeInfo || !statement.payrollPeriod) {
          throw new Error('올바르지 않은 급여명세서 파일입니다.');
        }
        
        resolve(statement);
      } catch (error) {
        reject(new Error('JSON 파일을 읽는 중 오류가 발생했습니다.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };
    
    reader.readAsText(file);
  });
}

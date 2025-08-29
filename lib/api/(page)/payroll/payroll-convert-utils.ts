// 급여 계산 결과를 급여명세서 형태로 변환하는 유틸리티

import { PayrollCalculationResult } from './payroll-test-api'
import { PayrollStatement, PaymentItem, DeductionItem } from '@/types/payroll-statement'

/**
 * PayrollCalculationResult를 PayrollStatement로 변환
 */
export function convertToPayrollStatement(
  employeeResult: PayrollCalculationResult,
  year: number,
  month: number,
  storeName: string
): PayrollStatement {
  // 지급 항목 구성
  const basicSalaryWithoutHoliday = employeeResult.monthlySalary.grossSalary - 
    (employeeResult.monthlySalary.holidayHours * employeeResult.employee.hourly_wage)
  const holidayPayAmount = employeeResult.monthlySalary.holidayHours * employeeResult.employee.hourly_wage

  const paymentItems: PaymentItem[] = [
    {
      id: 'basic-salary',
      name: '기본급',
      amount: Math.round(basicSalaryWithoutHoliday),
      category: 'basic',
      isRequired: true
    }
  ]

  // 주휴수당이 있는 경우 별도 항목으로 추가
  if (holidayPayAmount > 0) {
    paymentItems.push({
      id: 'holiday-pay',
      name: '주휴수당',
      amount: Math.round(holidayPayAmount),
      category: 'allowance',
      isRequired: false
    })
  }

  // 예외사항으로 인한 추가/차감이 있다면 반영
  const exceptionAdjustment = employeeResult.exceptionAdjustments.reduce(
    (sum, adj) => sum + adj.payDifference, 
    0
  )

  if (exceptionAdjustment !== 0) {
    paymentItems.push({
      id: 'exception-adjustment',
      name: exceptionAdjustment > 0 ? '예외사항 추가급여' : '예외사항 차감급여',
      amount: Math.abs(exceptionAdjustment),
      category: exceptionAdjustment > 0 ? 'allowance' : 'basic'
    })
  }

  // 공제 항목 구성
  const deductionItems: DeductionItem[] = [
    {
      id: 'national-pension',
      name: '국민연금',
      amount: employeeResult.insurance.employee.nationalPension,
      category: 'insurance',
      rate: 4.5,
      isAutoCalculated: true
    },
    {
      id: 'health-insurance',
      name: '건강보험',
      amount: employeeResult.insurance.employee.healthInsurance,
      category: 'insurance',
      rate: 3.545,
      isAutoCalculated: true
    },
    {
      id: 'long-term-care',
      name: '장기요양보험',
      amount: employeeResult.insurance.employee.longTermCare,
      category: 'insurance',
      rate: 12.95,
      isAutoCalculated: true
    },
    {
      id: 'employment-insurance',
      name: '고용보험',
      amount: employeeResult.insurance.employee.employment,
      category: 'insurance',
      rate: 0.9,
      isAutoCalculated: true
    },
    {
      id: 'income-tax',
      name: '소득세',
      amount: employeeResult.netSalary.incomeTax,
      category: 'tax',
      isAutoCalculated: true
    },
    {
      id: 'local-tax',
      name: '지방소득세',
      amount: employeeResult.netSalary.localTax,
      category: 'tax',
      isAutoCalculated: true
    }
  ]

  const totalPayment = paymentItems.reduce((sum, item) => sum + item.amount, 0)
  const totalDeduction = deductionItems.reduce((sum, item) => sum + item.amount, 0)

  return {
    companyInfo: {
      name: storeName,
      businessNumber: '',
      representative: '',
      address: ''
    },
    employeeInfo: {
      name: employeeResult.employee.name,
      department: storeName,
      position: employeeResult.employee.position || '근로자',
      employeeId: employeeResult.employee.id.toString()
    },
    payrollPeriod: {
      startDate: `${year}-${month.toString().padStart(2, '0')}-01`,
      endDate: `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
      paymentDate: new Date().toISOString().split('T')[0]
    },
    paymentItems,
    deductionItems,
    totalPayment,
    totalDeduction,
    netPayment: totalPayment - totalDeduction
  }
}

/**
 * 예외사항 정보를 급여명세서용 문자열로 변환
 */
export function formatExceptionsForStatement(
  exceptionAdjustments: Array<{
    date: string
    type: 'CANCEL' | 'OVERRIDE' | 'EXTRA'
    hoursDifference: number
    payDifference: number
  }>
): string {
  if (exceptionAdjustments.length === 0) return ''

  return exceptionAdjustments.map(adj => {
    const typeLabel = adj.type === 'CANCEL' ? '휴무' : 
                     adj.type === 'OVERRIDE' ? '시간변경' : '추가근무'
    
    return `${adj.date} ${typeLabel}: ${adj.hoursDifference >= 0 ? '+' : ''}${adj.hoursDifference.toFixed(1)}시간 (${adj.payDifference >= 0 ? '+' : ''}${adj.payDifference.toLocaleString()}원)`
  }).join('\n')
}

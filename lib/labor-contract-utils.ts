import { LaborContract, ValidationError, ContractType, MINIMUM_WAGE, LEGAL_WORKING_HOURS } from '@/types/labor-contract';

/**
 * 근로계약서 데이터 검증
 */
export function validateLaborContract(contract: LaborContract): ValidationError[] {
  const errors: ValidationError[] = [];

  // 필수 필드 검증
  if (!contract.employer.companyName.trim()) {
    errors.push({ field: 'employer.companyName', message: '사업체명은 필수입니다.' });
  }

  if (!contract.employer.representative.trim()) {
    errors.push({ field: 'employer.representative', message: '대표자명은 필수입니다.' });
  }

  if (!contract.employer.address.trim()) {
    errors.push({ field: 'employer.address', message: '사업장 주소는 필수입니다.' });
  }

  if (!contract.employer.phone.trim()) {
    errors.push({ field: 'employer.phone', message: '사업장 전화번호는 필수입니다.' });
  }

  if (!contract.employee.name.trim()) {
    errors.push({ field: 'employee.name', message: '근로자명은 필수입니다.' });
  }

  if (!contract.employee.address.trim()) {
    errors.push({ field: 'employee.address', message: '근로자 주소는 필수입니다.' });
  }

  if (!contract.employee.phone.trim()) {
    errors.push({ field: 'employee.phone', message: '근로자 연락처는 필수입니다.' });
  }

  // 날짜 검증
  if (!contract.workStartDate) {
    errors.push({ field: 'workStartDate', message: '근로개시일은 필수입니다.' });
  } else if (!isValidDate(contract.workStartDate)) {
    errors.push({ field: 'workStartDate', message: '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)' });
  }

  // 기간제 계약의 경우 종료일 검증
  if (contract.contractType === 'fixed-term') {
    if (!contract.workEndDate) {
      errors.push({ field: 'workEndDate', message: '기간제 계약의 경우 근로종료일은 필수입니다.' });
    } else if (!isValidDate(contract.workEndDate)) {
      errors.push({ field: 'workEndDate', message: '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)' });
    } else if (contract.workStartDate && new Date(contract.workEndDate) <= new Date(contract.workStartDate)) {
      errors.push({ field: 'workEndDate', message: '근로종료일은 근로개시일보다 늦어야 합니다.' });
    }
  }

  // 근무장소, 업무내용 검증
  if (!contract.workplace.trim()) {
    errors.push({ field: 'workplace', message: '근무장소는 필수입니다.' });
  }

  if (!contract.jobDescription.trim()) {
    errors.push({ field: 'jobDescription', message: '업무내용은 필수입니다.' });
  }

  // 근로시간 검증
  if (!contract.workingHours.startTime || !contract.workingHours.endTime) {
    errors.push({ field: 'workingHours', message: '근로시간은 필수입니다.' });
  } else {
    const workHours = calculateDailyWorkHours(contract.workingHours.startTime, contract.workingHours.endTime, 
      contract.workingHours.breakStartTime, contract.workingHours.breakEndTime);
    
    if (workHours > LEGAL_WORKING_HOURS.DAILY_MAX && contract.contractType !== 'foreign-agriculture') {
      errors.push({ field: 'workingHours', message: `일일 근로시간은 ${LEGAL_WORKING_HOURS.DAILY_MAX}시간을 초과할 수 없습니다.` });
    }
  }

  // 임금 검증
  if (!contract.salary.basicSalary || contract.salary.basicSalary <= 0) {
    errors.push({ field: 'salary.basicSalary', message: '기본급은 0보다 커야 합니다.' });
  }

  // 최저시급 검증 (시간급의 경우)
  if (contract.salary.salaryType === 'hourly' && contract.salary.basicSalary < MINIMUM_WAGE) {
    errors.push({ field: 'salary.basicSalary', message: `시간급은 최저시급 ${MINIMUM_WAGE.toLocaleString()}원 이상이어야 합니다.` });
  }

  if (!contract.salary.payDate || contract.salary.payDate < 1 || contract.salary.payDate > 31) {
    errors.push({ field: 'salary.payDate', message: '임금지급일은 1일부터 31일 사이여야 합니다.' });
  }

  // 연소근로자 추가 검증
  if (contract.contractType === 'minor') {
    if (contract.employee.birthdate) {
      const age = calculateAge(contract.employee.birthdate);
      if (age >= 18) {
        errors.push({ field: 'employee.birthdate', message: '연소근로자는 만 18세 미만이어야 합니다.' });
      }
    }

    if (!contract.minorWorkerInfo) {
      errors.push({ field: 'minorWorkerInfo', message: '연소근로자의 경우 친권자 정보는 필수입니다.' });
    } else {
      if (!contract.minorWorkerInfo.guardianName.trim()) {
        errors.push({ field: 'minorWorkerInfo.guardianName', message: '친권자명은 필수입니다.' });
      }
      if (!contract.minorWorkerInfo.consentProvided) {
        errors.push({ field: 'minorWorkerInfo.consentProvided', message: '친권자 동의는 필수입니다.' });
      }
    }
  }

  // 외국인근로자 수습기간 검증
  if ((contract.contractType === 'foreign-worker' || contract.contractType === 'foreign-agriculture') && 
      contract.foreignWorkerInfo?.useProbationPeriod) {
    if (!contract.foreignWorkerInfo.probationPeriodMonths || 
        contract.foreignWorkerInfo.probationPeriodMonths > 3) {
      errors.push({ field: 'foreignWorkerInfo.probationPeriodMonths', message: '수습기간은 최대 3개월까지 가능합니다.' });
    }
  }

  return errors;
}

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 나이 계산
 */
export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 일일 근로시간 계산
 */
export function calculateDailyWorkHours(
  startTime: string, 
  endTime: string, 
  breakStartTime?: string, 
  breakEndTime?: string
): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  let workMinutes = end - start;
  
  if (breakStartTime && breakEndTime) {
    const breakStart = timeToMinutes(breakStartTime);
    const breakEnd = timeToMinutes(breakEndTime);
    workMinutes -= (breakEnd - breakStart);
  }
  
  return workMinutes / 60;
}

/**
 * 시간 문자열을 분으로 변환 (HH:MM -> minutes)
 */
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 주간 근로시간 계산
 */
export function calculateWeeklyWorkHours(contract: LaborContract): number {
  if (contract.contractType === 'part-time' && contract.partTimeSchedule) {
    return Object.values(contract.partTimeSchedule).reduce((total, day) => total + day.workHours, 0);
  }
  
  const dailyHours = calculateDailyWorkHours(
    contract.workingHours.startTime,
    contract.workingHours.endTime,
    contract.workingHours.breakStartTime,
    contract.workingHours.breakEndTime
  );
  
  return dailyHours * contract.workingHours.workDaysPerWeek;
}

/**
 * 월 예상 급여 계산 (세전)
 */
export function calculateMonthlySalary(contract: LaborContract): number {
  const { basicSalary, salaryType } = contract.salary;
  
  switch (salaryType) {
    case 'monthly':
      return basicSalary;
    case 'daily':
      // 주 5일 기준으로 월 22일 근무 가정
      return basicSalary * 22;
    case 'hourly':
      const weeklyHours = calculateWeeklyWorkHours(contract);
      // 월 4.33주 기준
      return basicSalary * weeklyHours * 4.33;
    default:
      return 0;
  }
}

/**
 * 계약서 유형별 제목 반환
 */
export function getContractTitle(contractType: ContractType): string {
  const titles = {
    permanent: '표준근로계약서 (기간의 정함이 없는 경우)',
    'fixed-term': '표준근로계약서 (기간의 정함이 있는 경우)',
    minor: '연소근로자 표준근로계약서',
    construction: '건설일용근로자 표준근로계약서',
    'part-time': '단시간근로자 표준근로계약서',
    foreign: '외국인근로자 표준근로계약서',
    'foreign-agriculture': '외국인근로자 표준근로계약서 (농업·축산업·어업 분야)'
  };
  
  return titles[contractType] || '표준근로계약서';
}

/**
 * 요일 한글 변환
 */
export function getKoreanDayOfWeek(day: string): string {
  const days = {
    'monday': '월',
    'tuesday': '화',
    'wednesday': '수',
    'thursday': '목',
    'friday': '금',
    'saturday': '토',
    'sunday': '일'
  };
  
  return days[day.toLowerCase() as keyof typeof days] || day;
}

/**
 * 숫자를 한국어 금액 형식으로 변환
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

/**
 * 시간 형식 검증 (HH:MM)
 */
export function isValidTimeFormat(timeString: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeString);
}

/**
 * 사업자등록번호 형식 검증
 */
export function isValidBusinessNumber(businessNumber: string): boolean {
  const regex = /^\d{3}-\d{2}-\d{5}$/;
  return regex.test(businessNumber);
}

/**
 * 전화번호 형식 검증
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const regex = /^(\d{2,3}-\d{3,4}-\d{4}|\d{10,11})$/;
  return regex.test(phoneNumber.replace(/\s/g, ''));
}

/**
 * 기본 계약서 데이터 생성
 */
export function createDefaultContract(contractType: ContractType): LaborContract {
  const baseContract: LaborContract = {
    contractType,
    employer: {
      companyName: '',
      address: '',
      representative: '',
      phone: '',
      businessNumber: ''
    },
    employee: {
      name: '',
      address: '',
      phone: '',
      birthdate: ''
    },
    workStartDate: '',
    workplace: '',
    jobDescription: '',
    workingHours: {
      startTime: '09:00',
      endTime: '18:00',
      breakStartTime: '12:00',
      breakEndTime: '13:00',
      workDaysPerWeek: 5,
      weeklyHoliday: '일'
    },
    salary: {
      basicSalary: 0,
      salaryType: 'monthly',
      bonusAmount: 0,
      hasBonus: false,
      otherAllowances: [],
      payDate: 25,
      paymentMethod: 'bank-transfer'
    },
    socialInsurance: {
      employmentInsurance: true,
      workersCompensation: true,
      nationalPension: true,
      healthInsurance: true
    }
  };

  // 유형별 추가 설정
  switch (contractType) {
    case 'fixed-term':
      baseContract.workEndDate = '';
      break;
    case 'minor':
      baseContract.minorWorkerInfo = {
        guardianName: '',
        guardianBirthdate: '',
        guardianAddress: '',
        guardianPhone: '',
        guardianRelationship: '부',
        consentProvided: false,
        familyCertificateProvided: false
      };
      break;
    case 'part-time':
      baseContract.partTimeSchedule = {
        monday: { workHours: 0, startTime: '', endTime: '' },
        tuesday: { workHours: 0, startTime: '', endTime: '' },
        wednesday: { workHours: 0, startTime: '', endTime: '' },
        thursday: { workHours: 0, startTime: '', endTime: '' },
        friday: { workHours: 0, startTime: '', endTime: '' },
        saturday: { workHours: 0, startTime: '', endTime: '' },
        sunday: { workHours: 0, startTime: '', endTime: '' }
      };
      break;
    case 'foreign':
    case 'foreign-agriculture':
      baseContract.foreignWorkerInfo = {
        homeCountryAddress: '',
        probationPeriodMonths: 0,
        useProbationPeriod: false,
        accommodationProvided: false,
        accommodationType: '',
        accommodationCost: 0,
        mealsProvided: {
          breakfast: false,
          lunch: false,
          dinner: false
        },
        mealCost: 0
      };
      break;
    case 'construction':
      baseContract.constructionWorkerInfo = {
        overtimeHours: 0,
        overtimeRate: 0,
        nightWorkHours: 0,
        nightWorkRate: 0,
        holidayWorkHours: 0,
        holidayWorkRate: 0
      };
      break;
  }

  return baseContract;
}

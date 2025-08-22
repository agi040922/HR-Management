'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle } from 'lucide-react';

import { LaborContract } from '@/types/labor-contract';
import { 
  getContractTitle, 
  formatCurrency, 
  calculateMonthlySalary,
  calculateWeeklyWorkHours 
} from '@/lib/(labor-contract)/labor-contract-utils';

interface ContractPreviewProps {
  contract: LaborContract;
}

export default function ContractPreview({ contract }: ContractPreviewProps) {
  const contractTitle = getContractTitle(contract.contractType);
  const monthlySalary = calculateMonthlySalary(contract);
  const weeklyHours = calculateWeeklyWorkHours(contract);
  const isEnglish = contract.contractType.endsWith('-en');

  const formatDate = (dateString: string) => {
    if (!dateString) return isEnglish ? '____/____/____' : '____년 __월 __일';
    const date = new Date(dateString);
    if (isEnglish) {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return isEnglish ? '__:__ AM/PM' : '__시 __분';
    const [hours, minutes] = timeString.split(':');
    if (isEnglish) {
      const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    }
    return `${hours}시 ${minutes}분`;
  };

  const getSalaryTypeText = () => {
    if (isEnglish) {
      switch (contract.salary.salaryType) {
        case 'monthly': return 'Monthly Salary';
        case 'daily': return 'Daily Wage';
        case 'hourly': return 'Hourly Wage';
        default: return '';
      }
    }
    switch (contract.salary.salaryType) {
      case 'monthly': return '월급';
      case 'daily': return '일급';
      case 'hourly': return '시급';
      default: return '';
    }
  };

  const getPaymentMethodText = () => {
    if (isEnglish) {
      return contract.salary.paymentMethod === 'direct' 
        ? 'Direct payment to employee' 
        : 'Bank transfer to employee account';
    }
    return contract.salary.paymentMethod === 'direct' 
      ? '근로자에게 직접지급' 
      : '근로자 명의 예금통장에 입금';
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm max-w-4xl mx-auto">
      {/* 계약서 제목 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{contractTitle}</h1>
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant="outline">{contract.contractType}</Badge>
          {monthlySalary > 0 && (
            <Badge variant="secondary">
              예상 월급여: {formatCurrency(Math.round(monthlySalary))}
            </Badge>
          )}
        </div>
      </div>

      {/* 계약 당사자 */}
      <div className="mb-6">
        <p className="text-center text-lg mb-4">
          <span className="font-semibold underline decoration-dotted">
            {contract.employer.companyName || '________________'}
          </span>
          {isEnglish ? (
            <> (hereinafter referred to as &quot;Employer&quot;) and </>
          ) : (
            <> (이하 &quot;사업주&quot;라 함)과(와) </>
          )}
          <span className="font-semibold underline decoration-dotted ml-2">
            {contract.employee.name || '________________'}
          </span>
          {isEnglish ? (
            <> (hereinafter referred to as &quot;Employee&quot;) hereby enter into the following employment contract.</>
          ) : (
            <> (이하 &quot;근로자&quot;라 함)은 다음과 같이 근로계약을 체결한다.</>
          )}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        {/* 1. 근로개시일/계약기간 */}
        <div>
          <h3 className="font-bold mb-2">
            1. {isEnglish ? 
              (contract.contractType === 'fixed-term' ? 'Employment Period' : 'Employment Start Date') :
              (contract.contractType === 'fixed-term' ? '근로계약기간' : '근로개시일')
            }
          </h3>
          <p className="ml-4">
            {contract.contractType === 'fixed-term' ? (
              <>
                {isEnglish ? 'From' : ''} {formatDate(contract.workStartDate)} {isEnglish ? 'to' : '부터'} {formatDate(contract.workEndDate || '')} {isEnglish ? '' : '까지'}
              </>
            ) : (
              <>
                {isEnglish ? 'From' : ''} {formatDate(contract.workStartDate)} {isEnglish ? '' : '부터'}
              </>
            )}
          </p>
        </div>

        {/* 2. 근무장소 */}
        <div>
          <h3 className="font-bold mb-2">2. {isEnglish ? 'Workplace' : '근무장소'}</h3>
          <p className="ml-4">{contract.workplace || '________________'}</p>
        </div>

        {/* 3. 업무의 내용 */}
        <div>
          <h3 className="font-bold mb-2">3. {isEnglish ? 'Job Description' : '업무의 내용'}</h3>
          <p className="ml-4 whitespace-pre-wrap">{contract.jobDescription || '________________'}</p>
        </div>

        {/* 4. 소정근로시간 */}
        <div>
          <h3 className="font-bold mb-2">4. {isEnglish ? 'Working Hours' : '소정근로시간'}</h3>
          <p className="ml-4">
            {isEnglish ? 'From' : ''} {formatTime(contract.workingHours.startTime)} {isEnglish ? 'to' : '부터'} {formatTime(contract.workingHours.endTime)} {isEnglish ? '' : '까지'}
            {(contract.workingHours.breakStartTime && contract.workingHours.breakEndTime) && (
              <span>
                {isEnglish ? ' (Break time: ' : ' (휴게시간: '}{formatTime(contract.workingHours.breakStartTime)} ~ {formatTime(contract.workingHours.breakEndTime)})
              </span>
            )}
          </p>
          {weeklyHours > 0 && (
            <p className="ml-4 text-gray-600 text-xs mt-1">
              {isEnglish ? `${weeklyHours.toFixed(1)} hours per week` : `주 ${weeklyHours.toFixed(1)}시간 근무`}
            </p>
          )}
        </div>

        {/* 5. 근무일/휴일 */}
        <div>
          <h3 className="font-bold mb-2">5. {isEnglish ? 'Working Days/Holidays' : '근무일/휴일'}</h3>
          <p className="ml-4">
            {isEnglish ? 
              `${contract.workingHours.workDaysPerWeek} days per week, Weekly holiday: ${contract.workingHours.weeklyHoliday}` :
              `매주 ${contract.workingHours.workDaysPerWeek}일 근무, 주휴일 매주 ${contract.workingHours.weeklyHoliday}요일`
            }
          </p>
        </div>

        {/* 6. 임금 */}
        <div>
          <h3 className="font-bold mb-2">6. {isEnglish ? 'Wages' : '임금'}</h3>
          <div className="ml-4 space-y-2">
            <p>
              - {getSalaryTypeText()}: {formatCurrency(contract.salary.basicSalary)}
            </p>
            
            <p>
              - {isEnglish ? 'Bonus: ' : '상여금: '}{contract.salary.hasBonus ? (isEnglish ? 'Yes' : '있음') : (isEnglish ? 'No' : '없음')} 
              {contract.salary.hasBonus && contract.salary.bonusAmount && (
                <span> ({formatCurrency(contract.salary.bonusAmount)})</span>
              )}
            </p>

            {contract.salary.otherAllowances.length > 0 && (
              <div>
                <p>- {isEnglish ? 'Other Allowances: Yes' : '기타급여(제수당 등): 있음'}</p>
                <div className="ml-4">
                  {contract.salary.otherAllowances.map((allowance, index) => (
                    <p key={index}>
                      · {allowance.name}: {formatCurrency(allowance.amount)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <p>
              - {isEnglish ? `Pay Date: ${contract.salary.payDate}th of each month (paid on previous day if holiday)` : `임금지급일: 매월 ${contract.salary.payDate}일 (휴일의 경우는 전일 지급)`}
            </p>
            
            <p>
              - {isEnglish ? 'Payment Method: ' : '지급방법: '}{getPaymentMethodText()}
            </p>
          </div>
        </div>

        {/* 7. 연차유급휴가 */}
        <div>
          <h3 className="font-bold mb-2">7. {isEnglish ? 'Annual Paid Leave' : '연차유급휴가'}</h3>
          <p className="ml-4">
            - {isEnglish ? 'Annual paid leave shall be granted in accordance with the Labor Standards Act' : '연차유급휴가는 근로기준법에서 정하는 바에 따라 부여함'}
            {contract.contractType === 'part-time' && (
              <span> {isEnglish ? '(granted proportionally to regular workers\' working hours)' : '(통상근로자의 근로시간에 비례하여 부여)'}</span>
            )}
          </p>
        </div>

        {/* 8. 사회보험 적용여부 */}
        <div>
          <h3 className="font-bold mb-2">8. {isEnglish ? 'Social Insurance Coverage (Check applicable)' : '사회보험 적용여부(해당란에 체크)'}</h3>
          <div className="ml-4 flex flex-wrap gap-4">
            {[
              { key: 'employmentInsurance', label: isEnglish ? 'Employment Insurance' : '고용보험' },
              { key: 'workersCompensation', label: isEnglish ? 'Workers\' Compensation' : '산재보험' },
              { key: 'nationalPension', label: isEnglish ? 'National Pension' : '국민연금' },
              { key: 'healthInsurance', label: isEnglish ? 'Health Insurance' : '건강보험' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1">
                {contract.socialInsurance[key as keyof typeof contract.socialInsurance] ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 연소근로자 추가 정보 */}
        {contract.contractType === 'minor' && contract.minorWorkerInfo && (
          <div>
            <h3 className="font-bold mb-2">8. {isEnglish ? 'Family Certificate and Consent Form' : '가족관계증명서 및 동의서'}</h3>
            <div className="ml-4 space-y-1">
              <p>
                - {isEnglish ? 'Family relationship certificate submitted: ' : '가족관계기록사항에 관한 증명서 제출 여부: '}
                {contract.minorWorkerInfo.familyCertificateProvided ? (isEnglish ? 'Yes' : ' 제출') : (isEnglish ? 'No' : ' 미제출')}
              </p>
              <p>
                - {isEnglish ? 'Parental/Guardian consent form provided: ' : '친권자 또는 후견인의 동의서 구비 여부: '}
                {contract.minorWorkerInfo.consentProvided ? (isEnglish ? 'Yes' : ' 구비') : (isEnglish ? 'No' : ' 미구비')}
              </p>
            </div>
          </div>
        )}

        {/* 9. 근로계약서 교부 */}
        <div>
          <h3 className="font-bold mb-2">
            {contract.contractType === 'minor' ? '10' : '9'}. {isEnglish ? 'Delivery of Employment Contract' : '근로계약서 교부'}
          </h3>
          <p className="ml-4">
            - {isEnglish ? 
              `The employer shall copy this contract and deliver it to the employee regardless of the employee's request for delivery upon conclusion of the employment contract (Implementation of Article 17${contract.contractType === 'minor' ? ', Article 67' : ''} of the Labor Standards Act)` :
              `사업주는 근로계약을 체결함과 동시에 본 계약서를 사본하여 근로자의 교부요구와 관계없이 근로자에게 교부함 (근로기준법 제17조${contract.contractType === 'minor' ? ', 제67조' : ''} 이행)`
            }
          </p>
        </div>

        {/* 10. 근로계약, 취업규칙 등의 성실한 이행의무 */}
        <div>
          <h3 className="font-bold mb-2">
            {contract.contractType === 'minor' ? '11' : '10'}. {isEnglish ? 'Faithful Performance of Employment Contract and Work Rules' : '근로계약, 취업규칙 등의 성실한 이행의무'}
          </h3>
          <p className="ml-4">
            - {isEnglish ? 
              'Both the employer and employee must comply with and faithfully perform the employment contract, work rules, and collective agreements' :
              '사업주와 근로자는 각자가 근로계약, 취업규칙, 단체협약을 지키고 성실하게 이행하여야 함'
            }
          </p>
        </div>

        {/* 11. 기타 */}
        <div>
          <h3 className="font-bold mb-2">
            {contract.contractType === 'minor' ? '12' : '11'}. {isEnglish ? 'Others' : '기타'}
          </h3>
          <p className="ml-4">
            - {isEnglish ? 
              'Matters not specified in this contract shall be governed by the Labor Standards Act' :
              '이 계약에 정함이 없는 사항은 근로기준법령에 의함'
            }
            {contract.contractType === 'minor' && (
              <br />
            )}
            {contract.contractType === 'minor' && (
              <span>
                - {isEnglish ? 
                  'For persons aged 13 or older but under 15, an employment permit must be obtained from the Minister of Employment and Labor, and matters not specified in this contract shall be governed by the Labor Standards Act' :
                  '13세 이상 15세 미만인 자에 대해서는 고용노동부장관으로부터 취직인허증을 교부받아야 하며, 이 계약에 정함이 없는 사항은 근로기준법령에 의함'
                }
              </span>
            )}
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* 서명란 */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="mb-4">
            {isEnglish ? 
              new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
              `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 사업주 */}
          <div>
            <h4 className="font-bold mb-3">{isEnglish ? '(Employer)' : '(사업주)'}</h4>
            <div className="space-y-2 text-sm">
              <p>
                {isEnglish ? 'Company Name: ' : '사업체명: '}{contract.employer.companyName || '________________'} 
                ({isEnglish ? 'Phone: ' : '전화: '}{contract.employer.phone || '________________'})
              </p>
              <p>{isEnglish ? 'Address: ' : '주소: '}{contract.employer.address || '________________'}</p>
              <p>{isEnglish ? 'Representative: ' : '대표자: '}{contract.employer.representative || '________________'} {isEnglish ? '(Signature)' : '(서명)'}</p>
            </div>
          </div>

          {/* 근로자 */}
          <div>
            <h4 className="font-bold mb-3">{isEnglish ? '(Employee)' : '(근로자)'}</h4>
            <div className="space-y-2 text-sm">
              <p>{isEnglish ? 'Address: ' : '주소: '}{contract.employee.address || '________________'}</p>
              <p>{isEnglish ? 'Contact: ' : '연락처: '}{contract.employee.phone || '________________'}</p>
              <p>{isEnglish ? 'Name: ' : '성명: '}{contract.employee.name || '________________'} {isEnglish ? '(Signature)' : '(서명)'}</p>
            </div>
          </div>
        </div>

        {/* 연소근로자 친권자 동의서 */}
        {contract.contractType === 'minor' && contract.minorWorkerInfo && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold mb-3">친권자(후견인) 동의서</h4>
            <div className="space-y-2 text-sm">
              <p>○ 친권자(후견인) 인적사항</p>
              <div className="ml-4 space-y-1">
                <p>성명: {contract.minorWorkerInfo.guardianName || '________________'}</p>
                <p>생년월일: {contract.minorWorkerInfo.guardianBirthdate || '________________'}</p>
                <p>주소: {contract.minorWorkerInfo.guardianAddress || '________________'}</p>
                <p>연락처: {contract.minorWorkerInfo.guardianPhone || '________________'}</p>
                <p>연소근로자와의 관계: {contract.minorWorkerInfo.guardianRelationship}</p>
              </div>
              
              <p className="mt-4">○ 연소근로자 인적사항</p>
              <div className="ml-4 space-y-1">
                <p>성명: {contract.employee.name || '________________'}</p>
                <p>생년월일: {contract.employee.birthdate || '________________'}</p>
                <p>주소: {contract.employee.address || '________________'}</p>
                <p>연락처: {contract.employee.phone || '________________'}</p>
              </div>

              <p className="mt-4">○ 사업장 개요</p>
              <div className="ml-4 space-y-1">
                <p>회사명: {contract.employer.companyName || '________________'}</p>
                <p>회사주소: {contract.employer.address || '________________'}</p>
                <p>대표자: {contract.employer.representative || '________________'}</p>
                <p>회사전화: {contract.employer.phone || '________________'}</p>
              </div>

              <p className="mt-4">
                본인은 위 연소근로자 <span className="font-semibold">{contract.employee.name || '________________'}</span>가 
                위 사업장에서 근로를 하는 것에 대하여 동의합니다.
              </p>

              <div className="mt-4 text-center">
                <p>{new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일</p>
                <p className="mt-2">
                  친권자(후견인) {contract.minorWorkerInfo.guardianName || '________________'} (인)
                </p>
              </div>

              <p className="mt-4 text-xs text-gray-600">
                첨부: 가족관계증명서 1부
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 미리보기 하단 정보 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">계약서 요약</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium">기본 정보</p>
            <p>유형: {contractTitle}</p>
            <p>근무일: 주 {contract.workingHours.workDaysPerWeek}일</p>
          </div>
          <div>
            <p className="font-medium">근로 조건</p>
            <p>근로시간: 주 {weeklyHours.toFixed(1)}시간</p>
            <p>기본급: {formatCurrency(contract.salary.basicSalary)}</p>
          </div>
          <div>
            <p className="font-medium">예상 급여</p>
            <p>월 급여: {formatCurrency(Math.round(monthlySalary))}</p>
            <p>시급 환산: {contract.salary.salaryType === 'hourly' ? formatCurrency(contract.salary.basicSalary) : formatCurrency(Math.round(monthlySalary / (weeklyHours * 4.33)))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

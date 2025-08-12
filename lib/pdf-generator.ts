import { LaborContract, ContractType } from '@/types/labor-contract';
import { 
  getContractTitle, 
  formatCurrency, 
  calculateMonthlySalary,
  calculateWeeklyWorkHours 
} from '@/lib/labor-contract-utils';

/**
 * html2canvas-pro와 jsPDF를 사용한 PDF 생성 함수
 * lab(), oklch() 등 모든 최신 CSS 색상 함수 지원
 */
export async function generateContractPDF(contract: LaborContract): Promise<void> {
  try {
    // html2canvas-pro와 jsPDF 동적 로드
    const [html2canvas, jsPDFModule] = await Promise.all([
      import('html2canvas-pro'),
      import('jspdf')
    ]);
    
    const { jsPDF } = jsPDFModule;
    
    // 임시 컨테이너 생성
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.innerHTML = generateContractHTML(contract);
    
    document.body.appendChild(tempContainer);
    
    // 잠시 대기하여 렌더링 완료
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // html2canvas-pro로 캔버스 생성 (모든 최신 CSS 색상 지원!)
    const canvas = await html2canvas.default(tempContainer, {
      scale: 2,
      useCORS: false,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
      logging: false
    });
    
    // 임시 컨테이너 제거
    document.body.removeChild(tempContainer);
    
    // PDF 생성
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // 캔버스를 PDF에 추가 (좌측 여백 10mm 추가)
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const leftMargin = 10; // 좌측 여백 10mm
    const rightMargin = 10; // 우측 여백 10mm
    const imgWidth = 210 - leftMargin - rightMargin; // A4 width에서 여백 제외
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', leftMargin, 10, imgWidth, imgHeight);
    
    // PDF 다운로드
    const filename = `근로계약서_${contract.employee.name || '근로자'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    throw new Error('PDF 생성 중 오류가 발생했습니다.');
  }
}

/**
 * 계약서 HTML 생성 (한국어/영문 자동 선택)
 */
function generateContractHTML(contract: LaborContract): string {
  const isEnglish = contract.contractType.endsWith('-en');
  
  if (isEnglish) {
    return generateEnglishContractHTML(contract);
  } else {
    return generateKoreanContractHTML(contract);
  }
}

/**
 * 한국어 계약서 HTML 생성
 */
function generateKoreanContractHTML(contract: LaborContract): string {
  const contractTitle = getContractTitle(contract.contractType);
  const monthlySalary = calculateMonthlySalary(contract);
  const weeklyHours = calculateWeeklyWorkHours(contract);

  const formatDate = (dateString: string) => {
    if (!dateString) return '____년 __월 __일';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '__시 __분';
    const [hours, minutes] = timeString.split(':');
    return `${hours}시 ${minutes}분`;
  };

  const getSalaryTypeText = () => {
    switch (contract.salary.salaryType) {
      case 'monthly': return '월급';
      case 'daily': return '일급';
      case 'hourly': return '시간급';
      default: return '';
    }
  };

  const getPaymentMethodText = () => {
    return contract.salary.paymentMethod === 'direct' ? '근로자에게 직접지급' : '근로자 명의 예금통장에 입금';
  };

  const socialInsuranceItems = [
    { key: 'employmentInsurance', label: '고용보험' },
    { key: 'workersCompensation', label: '산재보험' },
    { key: 'nationalPension', label: '국민연금' },
    { key: 'healthInsurance', label: '건강보험' }
  ];

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${contractTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans KR', Arial, sans-serif !important;
          font-size: 12px !important;
          line-height: 1.6 !important;
          color: #333333 !important;
          background: #ffffff !important;
          background-color: #ffffff !important;
          padding: 20px !important;
        }
        
        /* Tailwind CSS lab() 색상 강제 오버라이드 */
        * {
          color: inherit !important;
          background-color: transparent !important;
          border-color: #000000 !important;
        }
        
        /* 모든 요소의 색상을 안전한 형식으로 강제 */
        *:not(.signature-line):not(.checkbox) {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          background: #ffffff;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        th, td {
          border: 1px solid #000000;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        
        .title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .contract-parties {
          text-align: center;
          font-size: 14px;
          margin-bottom: 25px;
          line-height: 1.8;
        }
        
        .underline {
          text-decoration: underline;
          text-decoration-style: dotted;
          font-weight: 500;
        }
        
        .content {
          margin-bottom: 20px;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-weight: 700;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .section-content {
          margin-left: 15px;
          line-height: 1.7;
        }
        
        .subsection {
          margin-bottom: 5px;
        }
        
        .checkbox {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 1px solid #333;
          margin-right: 5px;
          text-align: center;
          line-height: 10px;
          font-size: 10px;
        }
        
        .checkbox.checked {
          background-color: #333;
          color: white;
        }
        
        .signature-section {
          margin-top: 40px;
          page-break-inside: avoid;
        }
        
        .signature-date {
          text-align: center;
          margin-bottom: 20px;
          font-size: 13px;
        }
        
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 20px;
        }
        
        .signature-box {
          border: none;
        }
        
        .signature-title {
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 13px;
        }
        
        .signature-info {
          line-height: 1.8;
        }
        
        .guardian-consent {
          margin-top: 30px;
          padding: 15px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          page-break-inside: avoid;
        }
        
        .guardian-title {
          font-weight: 700;
          margin-bottom: 15px;
          font-size: 13px;
        }
        
        .guardian-section {
          margin-bottom: 15px;
        }
        
        .guardian-section-title {
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .guardian-info {
          margin-left: 15px;
          line-height: 1.6;
        }
        
        .consent-text {
          margin: 15px 0;
          text-align: center;
          font-weight: 500;
        }
        
        .guardian-signature {
          text-align: center;
          margin-top: 15px;
        }
        
        .attachment {
          margin-top: 10px;
          font-size: 11px;
          color: #666;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .container {
            max-width: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- 헤더 -->
        <div class="header">
          <div class="title">${contractTitle}</div>
        </div>
        
        <!-- 계약 당사자 -->
        <div class="contract-parties">
          <span class="underline">${contract.employer.companyName || '________________'}</span>
          (이하 "사업주"라 함)과(와) 
          <span class="underline">${contract.employee.name || '________________'}</span>
          (이하 "근로자"라 함)은 다음과 같이 근로계약을 체결한다.
        </div>
        
        <div class="content">
          <!-- 1. 근로개시일/계약기간 -->
          <div class="section">
            <div class="section-title">
              1. ${contract.contractType === 'fixed-term' ? '근로계약기간' : '근로개시일'}
            </div>
            <div class="section-content">
              ${contract.contractType === 'fixed-term' ? 
                `${formatDate(contract.workStartDate)}부터 ${formatDate(contract.workEndDate || '')}까지` :
                `${formatDate(contract.workStartDate)}부터`
              }
            </div>
          </div>
          
          <!-- 2. 근무장소 -->
          <div class="section">
            <div class="section-title">2. 근무장소</div>
            <div class="section-content">${contract.workplace || '________________'}</div>
          </div>
          
          <!-- 3. 업무의 내용 -->
          <div class="section">
            <div class="section-title">3. 업무의 내용</div>
            <div class="section-content">${contract.jobDescription || '________________'}</div>
          </div>
          
          <!-- 4. 소정근로시간 -->
          <div class="section">
            <div class="section-title">4. 소정근로시간</div>
            <div class="section-content">
              ${formatTime(contract.workingHours.startTime)}부터 ${formatTime(contract.workingHours.endTime)}까지
              ${(contract.workingHours.breakStartTime && contract.workingHours.breakEndTime) ? 
                ` (휴게시간: ${formatTime(contract.workingHours.breakStartTime)} ~ ${formatTime(contract.workingHours.breakEndTime)})` : ''
              }
            </div>
          </div>
          
          <!-- 5. 근무일/휴일 -->
          <div class="section">
            <div class="section-title">5. 근무일/휴일</div>
            <div class="section-content">
              매주 ${contract.workingHours.workDaysPerWeek}일 근무, 주휴일 매주 ${contract.workingHours.weeklyHoliday}요일
            </div>
          </div>
          
          <!-- 6. 임금 -->
          <div class="section">
            <div class="section-title">6. 임금</div>
            <div class="section-content">
              <div class="subsection">- ${getSalaryTypeText()}: ${formatCurrency(contract.salary.basicSalary)}</div>
              <div class="subsection">
                - 상여금: ${contract.salary.hasBonus ? '있음' : '없음'} 
                ${contract.salary.hasBonus && contract.salary.bonusAmount ? 
                  `(${formatCurrency(contract.salary.bonusAmount)})` : ''
                }
              </div>
              ${contract.salary.otherAllowances.length > 0 ? `
                <div class="subsection">- 기타급여(제수당 등): 있음</div>
                <div style="margin-left: 15px;">
                  ${contract.salary.otherAllowances.map(allowance => 
                    `<div>· ${allowance.name}: ${formatCurrency(allowance.amount)}</div>`
                  ).join('')}
                </div>
              ` : ''}
              <div class="subsection">- 임금지급일: 매월 ${contract.salary.payDate}일 (휴일의 경우는 전일 지급)</div>
              <div class="subsection">- 지급방법: ${getPaymentMethodText()}</div>
            </div>
          </div>
          
          <!-- 7. 연차유급휴가 -->
          <div class="section">
            <div class="section-title">7. 연차유급휴가</div>
            <div class="section-content">
              - 연차유급휴가는 근로기준법에서 정하는 바에 따라 부여함
              ${contract.contractType === 'part-time' ? ' (통상근로자의 근로시간에 비례하여 부여)' : ''}
            </div>
          </div>
          
          <!-- 8. 사회보험 적용여부 -->
          <div class="section">
            <div class="section-title">8. 사회보험 적용여부(해당란에 체크)</div>
            <div class="section-content">
              ${socialInsuranceItems.map(({ key, label }) => 
                `<span class="checkbox ${contract.socialInsurance[key as keyof typeof contract.socialInsurance] ? 'checked' : ''}">
                  ${contract.socialInsurance[key as keyof typeof contract.socialInsurance] ? '✓' : ''}
                </span> ${label}`
              ).join(' ')}
            </div>
          </div>
          
          ${contract.contractType === 'minor' && contract.minorWorkerInfo ? `
            <!-- 연소근로자 추가 정보 -->
            <div class="section">
              <div class="section-title">8. 가족관계증명서 및 동의서</div>
              <div class="section-content">
                <div class="subsection">
                  - 가족관계기록사항에 관한 증명서 제출 여부: ${contract.minorWorkerInfo.familyCertificateProvided ? '제출' : '미제출'}
                </div>
                <div class="subsection">
                  - 친권자 또는 후견인의 동의서 구비 여부: ${contract.minorWorkerInfo.consentProvided ? '구비' : '미구비'}
                </div>
              </div>
            </div>
          ` : ''}
          
          <!-- 9. 근로계약서 교부 -->
          <div class="section">
            <div class="section-title">${contract.contractType === 'minor' ? '10' : '9'}. 근로계약서 교부</div>
            <div class="section-content">
              - 사업주는 근로계약을 체결함과 동시에 본 계약서를 사본하여 근로자의 교부요구와 관계없이 근로자에게 교부함
              (근로기준법 제17조${contract.contractType === 'minor' ? ', 제67조' : ''} 이행)
            </div>
          </div>
          
          <!-- 10. 근로계약, 취업규칙 등의 성실한 이행의무 -->
          <div class="section">
            <div class="section-title">${contract.contractType === 'minor' ? '11' : '10'}. 근로계약, 취업규칙 등의 성실한 이행의무</div>
            <div class="section-content">
              - 사업주와 근로자는 각자가 근로계약, 취업규칙, 단체협약을 지키고 성실하게 이행하여야 함
            </div>
          </div>
          
          <!-- 11. 기타 -->
          <div class="section">
            <div class="section-title">${contract.contractType === 'minor' ? '12' : '11'}. 기타</div>
            <div class="section-content">
              - 이 계약에 정함이 없는 사항은 근로기준법령에 의함
              ${contract.contractType === 'minor' ? `
                <br>- 13세 이상 15세 미만인 자에 대해서는 고용노동부장관으로부터 취직인허증을 교부받아야 하며, 
                이 계약에 정함이 없는 사항은 근로기준법령에 의함
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- 서명란 -->
        <div class="signature-section">
          <div class="signature-date">
            ${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일
          </div>
          
          <div class="signature-grid">
            <!-- 사업주 -->
            <div class="signature-box">
              <div class="signature-title">(사업주)</div>
              <div class="signature-info">
                <div>사업체명: ${contract.employer.companyName || '________________'} (전화: ${contract.employer.phone || '________________'})</div>
                <div>주소: ${contract.employer.address || '________________'}</div>
                <div>대표자: ${contract.employer.representative || '________________'} (서명)</div>
              </div>
            </div>
            
            <!-- 근로자 -->
            <div class="signature-box">
              <div class="signature-title">(근로자)</div>
              <div class="signature-info">
                <div>주소: ${contract.employee.address || '________________'}</div>
                <div>연락처: ${contract.employee.phone || '________________'}</div>
                <div>성명: ${contract.employee.name || '________________'} (서명)</div>
              </div>
            </div>
          </div>
          
          ${contract.contractType === 'minor' && contract.minorWorkerInfo ? `
            <!-- 연소근로자 친권자 동의서 -->
            <div class="guardian-consent">
              <div class="guardian-title">친권자(후견인) 동의서</div>
              
              <div class="guardian-section">
                <div class="guardian-section-title">○ 친권자(후견인) 인적사항</div>
                <div class="guardian-info">
                  <div>성명: ${contract.minorWorkerInfo.guardianName || '________________'}</div>
                  <div>생년월일: ${contract.minorWorkerInfo.guardianBirthdate || '________________'}</div>
                  <div>주소: ${contract.minorWorkerInfo.guardianAddress || '________________'}</div>
                  <div>연락처: ${contract.minorWorkerInfo.guardianPhone || '________________'}</div>
                  <div>연소근로자와의 관계: ${contract.minorWorkerInfo.guardianRelationship}</div>
                </div>
              </div>
              
              <div class="guardian-section">
                <div class="guardian-section-title">○ 연소근로자 인적사항</div>
                <div class="guardian-info">
                  <div>성명: ${contract.employee.name || '________________'}</div>
                  <div>생년월일: ${contract.employee.birthdate || '________________'}</div>
                  <div>주소: ${contract.employee.address || '________________'}</div>
                  <div>연락처: ${contract.employee.phone || '________________'}</div>
                </div>
              </div>
              
              <div class="guardian-section">
                <div class="guardian-section-title">○ 사업장 개요</div>
                <div class="guardian-info">
                  <div>회사명: ${contract.employer.companyName || '________________'}</div>
                  <div>회사주소: ${contract.employer.address || '________________'}</div>
                  <div>대표자: ${contract.employer.representative || '________________'}</div>
                  <div>회사전화: ${contract.employer.phone || '________________'}</div>
                </div>
              </div>
              
              <div class="consent-text">
                본인은 위 연소근로자 <strong>${contract.employee.name || '________________'}</strong>가 
                위 사업장에서 근로를 하는 것에 대하여 동의합니다.
              </div>
              
              <div class="guardian-signature">
                <div>${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일</div>
                <div style="margin-top: 10px;">
                  친권자(후견인) ${contract.minorWorkerInfo.guardianName || '________________'} (인)
                </div>
              </div>
              
              <div class="attachment">
                첨부: 가족관계증명서 1부
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 영문 계약서 HTML 생성
 */
function generateEnglishContractHTML(contract: LaborContract): string {
  const contractTitle = getEnglishContractTitle(contract.contractType);
  const monthlySalary = calculateMonthlySalary(contract);
  const weeklyHours = calculateWeeklyWorkHours(contract);

  const getSalaryTypeText = () => {
    switch (contract.salary.salaryType) {
      case 'monthly': return 'Monthly wage';
      case 'daily': return 'Daily wage';
      case 'hourly': return 'Hourly wage';
      default: return '';
    }
  };

  const getPaymentMethodText = () => {
    return contract.salary.paymentMethod === 'direct' ? 'In person' : 'By direct deposit transfer into the employee\'s account';
  };

  const socialInsuranceItems = [
    { key: 'employmentInsurance', label: 'Employment Insurance' },
    { key: 'workersCompensation', label: 'Workers\' Compensation Insurance' },
    { key: 'nationalPension', label: 'National Pension' },
    { key: 'healthInsurance', label: 'Health Insurance' }
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${contractTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans', Arial, sans-serif !important;
          font-size: 12px !important;
          line-height: 1.6 !important;
          color: #333333 !important;
          background: #ffffff !important;
          background-color: #ffffff !important;
          padding: 20px !important;
        }
        
        /* Tailwind CSS lab() 색상 강제 오버라이드 */
        * {
          color: inherit !important;
          background-color: transparent !important;
          border-color: #000000 !important;
        }
        
        /* 모든 요소의 색상을 안전한 형식으로 강제 */
        *:not(.signature-line):not(.checkbox) {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          background: #ffffff;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .contract-parties {
          text-align: center;
          font-size: 14px;
          margin-bottom: 25px;
          line-height: 1.8;
        }
        
        .underline {
          text-decoration: underline;
          text-decoration-style: dotted;
          font-weight: 500;
        }
        
        .content {
          margin-bottom: 20px;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-weight: 700;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .section-content {
          line-height: 1.8;
        }
        
        .subsection {
          margin-bottom: 5px;
        }
        
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 40px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-title {
          font-weight: 700;
          margin-bottom: 15px;
          font-size: 14px;
        }
        
        .signature-info {
          text-align: left;
          line-height: 2;
        }
        
        .checkbox {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 1px solid #000000;
          margin-right: 5px;
          text-align: center;
          line-height: 10px;
          font-size: 10px;
        }
        
        .checkbox.checked {
          background: #ffffff;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        th, td {
          border: 1px solid #000000;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <!-- Header -->
          <div class="header">
            <div class="title">${contractTitle}</div>
          </div>
          
          <!-- Contract Parties -->
          <div class="contract-parties">
            <span class="underline">${contract.employer.companyName || '________________'}</span> (hereinafter referred to as "Employer") and 
            <span class="underline">${contract.employee.name || '________________'}</span> (hereinafter referred to as "Employee") 
            agree to conclude the following labor contract.
          </div>
          
          <!-- 1. Workplace and Job Description -->
          <div class="section">
            <div class="section-title">1. Workplace and Job Description</div>
            <div class="section-content">
              <div class="subsection">- Workplace: ${contract.workplace || '________________'}</div>
              <div class="subsection">- Job Description: ${contract.jobDescription || '________________'}</div>
            </div>
          </div>
          
          <!-- 2. Contract Period -->
          <div class="section">
            <div class="section-title">2. Contract Period</div>
            <div class="section-content">
              ${contract.contractType.includes('permanent') ? 
                'Indefinite period' : 
                `From ${contract.workStartDate} to ${contract.workEndDate || ''}`
              }
            </div>
          </div>
          
          <!-- 3. Working Hours -->
          <div class="section">
            <div class="section-title">3. Working Hours</div>
            <div class="section-content">
              <div class="subsection">- Working hours: ${contract.workingHours.startTime} ~ ${contract.workingHours.endTime}</div>
              <div class="subsection">- Break time: ${contract.workingHours.breakStartTime} ~ ${contract.workingHours.breakEndTime}</div>
              ${contract.workingHours.overtimeAllowed ? 
                `<div class="subsection">- Overtime allowed</div>` : ''
              }
            </div>
          </div>
          
          <!-- 4. Working Days/Holidays -->
          <div class="section">
            <div class="section-title">4. Working Days/Holidays</div>
            <div class="section-content">
              ${contract.workingHours.workDaysPerWeek} days per week, Weekly holiday: ${contract.workingHours.weeklyHoliday}
            </div>
          </div>
          
          <!-- 5. Payment -->
          <div class="section">
            <div class="section-title">5. Payment</div>
            <div class="section-content">
              <div class="subsection">- ${getSalaryTypeText()}: ${formatCurrency(contract.salary.basicSalary)} KRW</div>
              <div class="subsection">
                - Bonus: ${contract.salary.hasBonus ? 'Yes' : 'No'} 
                ${contract.salary.hasBonus && contract.salary.bonusAmount ? 
                  `(${formatCurrency(contract.salary.bonusAmount)} KRW)` : ''
                }
              </div>
              ${contract.salary.otherAllowances.length > 0 ? `
                <div class="subsection">- Extra pay: Yes</div>
                <div style="margin-left: 15px;">
                  ${contract.salary.otherAllowances.map(allowance => 
                    `<div>· ${allowance.name}: ${formatCurrency(allowance.amount)} KRW</div>`
                  ).join('')}
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- 6. Payment Date -->
          <div class="section">
            <div class="section-title">6. Payment Date</div>
            <div class="section-content">
              Every ${contract.salary.payDate}th day of the month. If the payment day falls on a holiday, the payment will be made one day before the holiday.
            </div>
          </div>
          
          <!-- 7. Payment Methods -->
          <div class="section">
            <div class="section-title">7. Payment Methods</div>
            <div class="section-content">
              ${getPaymentMethodText()}
              ${contract.salary.paymentMethod === 'bank-transfer' ? 
                '<br>※ The employer will not retain the bank book and the seal of the employee.' : ''
              }
            </div>
          </div>
          
          <!-- 8. Social Insurance -->
          <div class="section">
            <div class="section-title">8. Social Insurance Coverage (Check applicable boxes)</div>
            <div class="section-content">
              ${socialInsuranceItems.map(({ key, label }) => 
                `<span class="checkbox ${contract.socialInsurance[key as keyof typeof contract.socialInsurance] ? 'checked' : ''}">
                  ${contract.socialInsurance[key as keyof typeof contract.socialInsurance] ? '✓' : ''}
                </span> ${label}`
              ).join(' ')}
            </div>
          </div>
          
          ${contract.contractType.includes('foreign') ? `
            <!-- 9. Accommodations and Meals -->
            <div class="section">
              <div class="section-title">9. Accommodations and Meals</div>
              <div class="section-content">
                <div class="subsection">1) Provision of accommodation</div>
                <div class="subsection">- Provision of accommodation: ${contract.foreignWorkerInfo?.accommodationProvided ? 'Provided' : 'Not provided'}</div>
                ${contract.foreignWorkerInfo?.accommodationProvided ? `
                  <div class="subsection">- Cost of accommodation paid by employee: ${formatCurrency(contract.foreignWorkerInfo.accommodationCost || 0)} KRW/month</div>
                ` : ''}
                <div class="subsection">2) Provision of meals</div>
                <div class="subsection">- Provision of meals: ${contract.foreignWorkerInfo?.mealsProvided ? 'Provided' : 'Not provided'}</div>
                ${contract.foreignWorkerInfo?.mealsProvided ? `
                  <div class="subsection">- Cost of meals paid by employee: ${formatCurrency(contract.foreignWorkerInfo.mealCost || 0)} KRW/month</div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Final Clauses -->
          <div class="section">
            <div class="section-title">10. General Provisions</div>
            <div class="section-content">
              Both employees and employers shall comply with collective agreements, rules of employment, and terms of labor contracts and be obliged to fulfill them in good faith.
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">11. Applicable Law</div>
            <div class="section-content">
              Other matters not regulated in this contract will follow provisions of the Labor Standards Act.
            </div>
          </div>
          
          <!-- Date and Signatures -->
          <div class="section" style="text-align: center; margin-top: 30px;">
            ${new Date().toLocaleDateString('en-CA')} (YY/MM/DD)
          </div>
          
          <div class="signature-grid">
            <!-- Employer -->
            <div class="signature-box">
              <div class="signature-title">Employer</div>
              <div class="signature-info">
                <div>Company: ${contract.employer.companyName || '________________'}</div>
                <div>Phone: ${contract.employer.phone || '________________'}</div>
                <div>Address: ${contract.employer.address || '________________'}</div>
                <div>Representative: ${contract.employer.representative || '________________'} (signature)</div>
              </div>
            </div>
            
            <!-- Employee -->
            <div class="signature-box">
              <div class="signature-title">Employee</div>
              <div class="signature-info">
                <div>Address: ${contract.employee.address || '________________'}</div>
                <div>Phone: ${contract.employee.phone || '________________'}</div>
                <div>Name: ${contract.employee.name || '________________'} (signature)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 영문 계약서 제목 반환
 */
function getEnglishContractTitle(contractType: ContractType): string {
  switch (contractType) {
    case 'foreign-worker-en':
      return 'Standard Labor Contract for Foreign Workers';
    case 'foreign-agriculture-en':
      return 'Standard Labor Contract for Foreign Workers (Agriculture/Livestock/Fishery)';
    default:
      return 'Standard Labor Contract';
  }
}

/**
 * 계약서 데이터를 JSON으로 내보내기
 */
export function exportContractAsJSON(contract: LaborContract): void {
  const dataStr = JSON.stringify(contract, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `근로계약서_${contract.employee.name || '근로자'}_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

/**
 * JSON 파일에서 계약서 데이터 가져오기
 */
export function importContractFromJSON(file: File): Promise<LaborContract> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contract = JSON.parse(e.target?.result as string) as LaborContract;
        resolve(contract);
      } catch (error) {
        reject(new Error('잘못된 JSON 파일 형식입니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file);
  });
}

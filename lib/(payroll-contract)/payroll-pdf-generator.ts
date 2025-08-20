// 급여명세서 PDF 생성 유틸리티 (html2canvas-pro 사용)

import { PayrollStatement } from '@/types/payroll-statement';
import { formatCurrency, formatDate, getPayrollTitle } from '@/lib/(payroll-contract)/payroll-utils';

/**
 * html2canvas-pro와 jsPDF를 사용한 PDF 생성 함수
 * 한글 폰트 지원을 위해 Google Fonts 사용
 */
export async function generatePayrollPDF(statement: PayrollStatement): Promise<void> {
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
    tempContainer.innerHTML = generatePayrollHTML(statement);
    
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
    const filename = `급여명세서_${statement.employeeInfo.name || '직원'}_${getPayrollTitle(statement.payrollPeriod).replace(/\s/g, '_')}.pdf`;
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    throw new Error('PDF 생성 중 오류가 발생했습니다.');
  }
}

/**
 * 급여명세서 HTML 생성 (한글 폰트 지원)
 */
function generatePayrollHTML(statement: PayrollStatement): string {
  const totalPayment = statement.paymentItems.reduce((sum, item) => sum + item.amount, 0);
  const totalDeduction = statement.deductionItems.reduce((sum, item) => sum + item.amount, 0);
  const netPayment = totalPayment - totalDeduction;

  const paymentsByCategory = {
    basic: statement.paymentItems.filter(item => item.category === 'basic' && item.amount > 0),
    allowance: statement.paymentItems.filter(item => item.category === 'allowance' && item.amount > 0),
    bonus: statement.paymentItems.filter(item => item.category === 'bonus' && item.amount > 0),
  };

  const deductionsByCategory = {
    insurance: statement.deductionItems.filter(item => item.category === 'insurance' && item.amount > 0),
    tax: statement.deductionItems.filter(item => item.category === 'tax' && item.amount > 0),
    other: statement.deductionItems.filter(item => item.category === 'other' && item.amount > 0),
  };

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${getPayrollTitle(statement.payrollPeriod)}</title>
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
        
        .title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .company-info {
          text-align: center;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .company-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .company-details {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .period-info {
          text-align: center;
          margin-bottom: 25px;
          font-size: 13px;
          line-height: 1.8;
        }
        
        .employee-info {
          margin-bottom: 25px;
          background-color: #f9f9f9;
          padding: 15px;
          border: 1px solid #ddd;
        }
        
        .employee-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 15px;
        }
        
        .employee-item {
          text-align: center;
        }
        
        .employee-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .employee-value {
          font-weight: 600;
          font-size: 12px;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 15px;
          text-align: center;
          padding: 8px;
          background-color: #f0f0f0;
          border: 1px solid #ccc;
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
        
        th {
          background-color: #f5f5f5;
          font-weight: 600;
          text-align: center;
        }
        
        .amount-cell {
          text-align: right;
          font-weight: 500;
        }
        
        .category-badge {
          display: inline-block;
          padding: 2px 6px;
          font-size: 9px;
          background-color: #e0e0e0;
          border-radius: 3px;
          margin-left: 5px;
        }
        
        .basic-badge { background-color: #e3f2fd; color: #1976d2; }
        .allowance-badge { background-color: #f3e5f5; color: #7b1fa2; }
        .bonus-badge { background-color: #e8f5e8; color: #388e3c; }
        .insurance-badge { background-color: #fff3e0; color: #f57c00; }
        .tax-badge { background-color: #ffebee; color: #d32f2f; }
        .other-badge { background-color: #f5f5f5; color: #616161; }
        
        .total-row {
          font-weight: 700;
          background-color: #f0f8ff;
        }
        
        .total-payment {
          background-color: #e3f2fd !important;
          color: #1976d2 !important;
        }
        
        .total-deduction {
          background-color: #ffebee !important;
          color: #d32f2f !important;
        }
        
        .net-payment-section {
          margin: 30px 0;
          padding: 20px;
          background-color: #e8f5e8;
          border: 2px solid #4caf50;
          border-radius: 8px;
          text-align: center;
        }
        
        .net-payment-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .calculation-formula {
          font-size: 12px;
          margin-bottom: 15px;
          color: #666;
        }
        
        .net-amount {
          font-size: 24px;
          font-weight: 700;
          color: #2e7d32;
        }
        
        .signature-section {
          margin-top: 40px;
          page-break-inside: avoid;
        }
        
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 20px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-title {
          font-weight: 700;
          margin-bottom: 15px;
          font-size: 13px;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          height: 40px;
          margin: 10px 0;
        }
        
        .signature-text {
          font-size: 11px;
          color: #666;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
          line-height: 1.5;
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
          <div class="title">급여명세서</div>
        </div>
        
        <!-- 회사 정보 -->
        <div class="company-info">
          <div class="company-name">${statement.companyInfo.name || '회사명'}</div>
          <div class="company-details">사업자등록번호: ${statement.companyInfo.businessNumber || '000-00-00000'}</div>
          <div class="company-details">대표자: ${statement.companyInfo.representative || '대표자명'}</div>
          <div class="company-details">주소: ${statement.companyInfo.address || '회사 주소'}</div>
        </div>
        
        <!-- 급여 기간 정보 -->
        <div class="period-info">
          <div>지급 대상 기간: ${getPayrollTitle(statement.payrollPeriod)}</div>
          <div>(${formatDate(statement.payrollPeriod.startDate)} ~ ${formatDate(statement.payrollPeriod.endDate)})</div>
          <div>지급일: ${formatDate(statement.payrollPeriod.paymentDate)}</div>
        </div>
        
        <!-- 직원 정보 -->
        <div class="employee-info">
          <div class="employee-grid">
            <div class="employee-item">
              <div class="employee-label">직원명</div>
              <div class="employee-value">${statement.employeeInfo.name || '-'}</div>
            </div>
            <div class="employee-item">
              <div class="employee-label">사원번호</div>
              <div class="employee-value">${statement.employeeInfo.employeeId || '-'}</div>
            </div>
            <div class="employee-item">
              <div class="employee-label">소속 부서</div>
              <div class="employee-value">${statement.employeeInfo.department || '-'}</div>
            </div>
            <div class="employee-item">
              <div class="employee-label">직위</div>
              <div class="employee-value">${statement.employeeInfo.position || '-'}</div>
            </div>
          </div>
        </div>
        
        <!-- 지급 내역 -->
        <div class="section">
          <div class="section-title">지급 내역</div>
          <table>
            <thead>
              <tr>
                <th>지급 항목</th>
                <th style="width: 120px;">금액</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsByCategory.basic.map(item => `
                <tr>
                  <td>
                    ${item.name}
                    <span class="category-badge basic-badge">기본</span>
                  </td>
                  <td class="amount-cell">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              
              ${paymentsByCategory.allowance.map(item => `
                <tr>
                  <td>
                    ${item.name}
                    <span class="category-badge allowance-badge">수당</span>
                  </td>
                  <td class="amount-cell">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              
              ${paymentsByCategory.bonus.map(item => `
                <tr>
                  <td>
                    ${item.name}
                    <span class="category-badge bonus-badge">상여</span>
                  </td>
                  <td class="amount-cell">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              
              <tr class="total-row total-payment">
                <td><strong>지급 총액 (세전)</strong></td>
                <td class="amount-cell"><strong>${formatCurrency(totalPayment)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 공제 내역 -->
        <div class="section">
          <div class="section-title">공제 내역</div>
          <table>
            <thead>
              <tr>
                <th>공제 항목</th>
                <th style="width: 120px;">금액</th>
              </tr>
            </thead>
            <tbody>
              ${deductionsByCategory.insurance.map(item => `
                <tr>
                  <td>
                    ${item.name}
                    <span class="category-badge insurance-badge">보험</span>
                    ${item.rate ? `<span style="font-size: 10px; color: #666;">(${item.rate}%)</span>` : ''}
                  </td>
                  <td class="amount-cell">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              
              ${deductionsByCategory.tax.map(item => `
                <tr>
                  <td>
                    ${item.name}
                    <span class="category-badge tax-badge">세금</span>
                  </td>
                  <td class="amount-cell">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              
              ${deductionsByCategory.other.map(item => `
                <tr>
                  <td>
                    ${item.name}
                    <span class="category-badge other-badge">기타</span>
                  </td>
                  <td class="amount-cell">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              
              <tr class="total-row total-deduction">
                <td><strong>공제 총액</strong></td>
                <td class="amount-cell"><strong>${formatCurrency(totalDeduction)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 최종 지급액 -->
        <div class="net-payment-section">
          <div class="net-payment-title">최종 계산</div>
          <div class="calculation-formula">
            지급 총액 (${formatCurrency(totalPayment)}) - 공제 총액 (${formatCurrency(totalDeduction)})
          </div>
          <div class="net-amount">실 지급액: ${formatCurrency(netPayment)}</div>
        </div>
        
        <!-- 서명란 -->
        <div class="signature-section">
          <div class="signature-grid">
            <div class="signature-box">
              <div class="signature-title">회사 담당자</div>
              <div class="signature-line"></div>
              <div class="signature-text">(서명)</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">직원</div>
              <div class="signature-line"></div>
              <div class="signature-text">(서명)</div>
            </div>
          </div>
        </div>
        
        <!-- 하단 정보 -->
        <div class="footer">
          <p>본 급여명세서는 근로기준법에 따라 작성되었습니다.</p>
          <p>문의사항이 있으시면 인사팀으로 연락주시기 바랍니다.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 급여명세서 데이터를 JSON으로 내보내기
export function exportPayrollAsJSON(statement: PayrollStatement): void {
  const dataStr = JSON.stringify(statement, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `Payroll_Data_${statement.employeeInfo.name}_${getPayrollTitle(statement.payrollPeriod).replace(/\s/g, '_')}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

// JSON에서 급여명세서 데이터 가져오기
export async function importPayrollFromJSON(file: File): Promise<PayrollStatement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const statement = JSON.parse(content) as PayrollStatement;
        
        // 기본 검증
        if (!statement.companyInfo || !statement.employeeInfo || !statement.payrollPeriod) {
          throw new Error('Invalid payroll statement file.');
        }
        
        resolve(statement);
      } catch (error) {
        reject(new Error('Error reading JSON file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };
    
    reader.readAsText(file);
  });
}

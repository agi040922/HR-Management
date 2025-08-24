'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Eye, AlertCircle, Upload, Save, FileDown, HelpCircle, Calculator } from 'lucide-react';

import {
  PayrollStatement,
  PayrollValidationError,
} from '@/types/payroll-statement';
import {
  createDefaultPayrollStatement,
  validatePayrollStatement,
  updateAutoCalculatedDeductions,
  exportPayrollAsJSON,
  importPayrollFromJSON,
} from '@/lib/(payroll-contract)/payroll-utils';
import { generatePayrollPDF } from '@/lib/(payroll-contract)/payroll-pdf-generator';

import PayrollForm from '@/components/(page)/test/payroll-statement/PayrollForm';
import PayrollPreview from '@/components/(page)/test/payroll-statement/PayrollPreview';

export default function PayrollStatementPage() {
  const [statement, setStatement] = useState<PayrollStatement>(createDefaultPayrollStatement());
  const [validationErrors, setValidationErrors] = useState<PayrollValidationError[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 실시간 검증
  useEffect(() => {
    const errors = validatePayrollStatement(statement);
    setValidationErrors(errors);
  }, [statement]);

  // 급여명세서 데이터 변경 핸들러
  const handleStatementChange = (updatedStatement: Partial<PayrollStatement>) => {
    setStatement(prev => ({ ...prev, ...updatedStatement }));
  };

  // 자동 계산 핸들러
  const handleAutoCalculate = () => {
    const updatedDeductions = updateAutoCalculatedDeductions(
      statement.paymentItems,
      statement.deductionItems
    );
    
    const totalPayment = statement.paymentItems.reduce((sum, item) => sum + item.amount, 0);
    const totalDeduction = updatedDeductions.reduce((sum, item) => sum + item.amount, 0);
    const netPayment = totalPayment - totalDeduction;

    setStatement(prev => ({
      ...prev,
      deductionItems: updatedDeductions,
      totalPayment,
      totalDeduction,
      netPayment,
    }));
  };

  // PDF 생성 핸들러
  const handleGeneratePDF = async () => {
    const errors = validatePayrollStatement(statement);
    if (errors.length > 0) {
      alert('입력 내용을 확인해주세요. 필수 항목이 누락되었거나 잘못된 형식입니다.');
      return;
    }

    setIsLoading(true);
    try {
      await generatePayrollPDF(statement);
      alert('PDF가 성공적으로 생성되었습니다.');
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 저장 핸들러
  const handleSaveStatement = async () => {
    const errors = validatePayrollStatement(statement);
    if (errors.length > 0) {
      alert('입력 내용을 확인해주세요. 필수 항목이 누락되었거나 잘못된 형식입니다.');
      return;
    }

    setIsLoading(true);
    try {
      // DB 저장 로직 (추후 구현)
      const savedStatement = {
        ...statement,
        id: statement.id || `payroll-${Date.now()}`,
        createdAt: statement.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('급여명세서 저장:', savedStatement);
      setStatement(savedStatement);
      alert('급여명세서가 저장되었습니다.');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // JSON 내보내기 핸들러
  const handleExportJSON = () => {
    try {
      exportPayrollAsJSON(statement);
      alert('JSON 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('JSON 내보내기 오류:', error);
      alert('JSON 내보내기 중 오류가 발생했습니다.');
    }
  };

  // JSON 가져오기 핸들러
  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const importedStatement = await importPayrollFromJSON(file);
      setStatement(importedStatement);
      alert('JSON 파일이 성공적으로 가져와졌습니다.');
    } catch (error) {
      console.error('JSON 가져오기 오류:', error);
      alert('JSON 파일을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
    
    // 파일 입력 초기화
    event.target.value = '';
  };

  const hasErrors = validationErrors.length > 0;

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 relative">
              <h1 className="text-3xl font-bold text-gray-900">급여명세서 작성</h1>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              {showTooltip && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowTooltip(false)}
                  />
                  <div className="absolute top-8 left-0 z-50 w-80 p-4 bg-white rounded-lg border shadow-lg">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">급여명세서 작성 가이드:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 근로기준법에 따른 표준 급여명세서를 작성할 수 있습니다</li>
                        <li>• 회사 및 직원 정보를 먼저 입력하세요</li>
                        <li>• 지급 항목 입력 후 자동 계산 버튼을 클릭하세요</li>
                        <li>• 실시간으로 미리보기가 업데이트됩니다</li>
                        <li>• 모든 필수 항목 입력 후 PDF로 다운로드 가능합니다</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreviewMode ? '입력 모드' : '미리보기'}
              </Button>
              
              <div className="hidden">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  id="json-import"
                />
              </div>
              
              <Button
                onClick={() => document.getElementById('json-import')?.click()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
                가져오기
              </Button>
              
              <Button
                onClick={handleExportJSON}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <FileDown className="h-4 w-4" />
                내보내기
              </Button>
              
              <Button
                onClick={handleSaveStatement}
                disabled={hasErrors || isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                저장
              </Button>
              
              <Button
                onClick={handleGeneratePDF}
                disabled={hasErrors || isLoading}
                size="sm"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4" />
                {isLoading ? '생성 중...' : 'PDF 다운로드'}
              </Button>
            </div>
          </div>

          {/* 오류 알림 */}
          {hasErrors && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                입력 내용을 확인해주세요. {validationErrors.length}개의 오류가 있습니다.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className={`${isPreviewMode ? 'lg:block hidden' : 'block'}`}>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">급여명세서 정보 입력</h2>
              <PayrollForm
                statement={statement}
                onChange={handleStatementChange}
                validationErrors={validationErrors}
                onAutoCalculate={handleAutoCalculate}
              />
            </div>
          </div>

          {/* 미리보기 */}
          <div className={`${isPreviewMode ? 'block' : 'lg:block hidden'}`}>
            <div className="space-y-4 sticky top-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200 flex-1">실시간 미리보기</h2>
                {!hasErrors && (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 ml-4">
                    완료
                  </Badge>
                )}
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
                <PayrollPreview statement={statement} />
              </div>
            </div>
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">사용 가이드</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">입력 방법</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>회사 정보와 직원 정보를 먼저 입력하세요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>기본급을 포함한 지급 항목을 입력하세요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>자동 계산 버튼으로 4대보험과 세금을 계산하세요</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">자동 계산</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>국민연금: 기준소득월액의 4.5%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>건강보험: 보수월액의 3.545%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>장기요양보험: 건강보험료의 12.95%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>고용보험: 보수월액의 0.8%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>소득세 및 지방소득세 자동 계산</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">주의사항</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>2025년 최저시급 10,030원 기준 적용</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>4대보험 상한액 및 하한액 자동 적용</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>간이세액표 기준 소득세 계산</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>모든 필수 항목 입력 후 PDF 생성 가능</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

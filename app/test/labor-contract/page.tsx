'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Eye, AlertCircle, Upload, Save, FileDown, HelpCircle } from 'lucide-react';

import { LaborContract, ContractType, CONTRACT_TEMPLATES, ValidationError } from '@/types/labor-contract';
import { validateLaborContract, createDefaultContract, getContractTitle } from '@/lib/labor-contract-utils';
import { generateContractPDF, exportContractAsJSON, importContractFromJSON } from '@/lib/pdf-generator';

import ContractForm from '@/components/labor-contract/ContractForm';
import ContractPreview from '@/components/labor-contract/ContractPreview';

export default function LaborContractPage() {
  const [selectedType, setSelectedType] = useState<ContractType>('permanent');
  const [contract, setContract] = useState<LaborContract>(createDefaultContract('permanent'));
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 계약서 유형 변경 시 기본 데이터 재설정
  useEffect(() => {
    const newContract = createDefaultContract(selectedType);
    setContract(newContract);
    setValidationErrors([]);
  }, [selectedType]);

  // 실시간 검증
  useEffect(() => {
    const errors = validateLaborContract(contract);
    setValidationErrors(errors);
  }, [contract]);

  const handleContractChange = (updatedContract: Partial<LaborContract>) => {
    setContract(prev => ({ ...prev, ...updatedContract }));
  };

  const handleGeneratePDF = async () => {
    const errors = validateLaborContract(contract);
    if (errors.length > 0) {
      alert('입력 내용을 확인해주세요. 필수 항목이 누락되었거나 잘못된 형식입니다.');
      return;
    }

    try {
      await generateContractPDF(contract);
      alert('PDF가 성공적으로 생성되었습니다.');
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleSaveContract = async () => {
    const errors = validateLaborContract(contract);
    if (errors.length > 0) {
      alert('입력 내용을 확인해주세요. 필수 항목이 누락되었거나 잘못된 형식입니다.');
      return;
    }

    try {
      // DB 저장 로직 (추후 구현)
      console.log('계약서 저장:', contract);
      alert('계약서가 저장되었습니다.');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleExportJSON = () => {
    try {
      exportContractAsJSON(contract);
      alert('JSON 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('JSON 내보내기 오류:', error);
      alert('JSON 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedContract = await importContractFromJSON(file);
      setContract(importedContract);
      setSelectedType(importedContract.contractType);
      alert('JSON 파일이 성공적으로 가져와졌습니다.');
    } catch (error) {
      console.error('JSON 가져오기 오류:', error);
      alert('JSON 파일을 가져오는 중 오류가 발생했습니다.');
    }
    
    // 파일 입력 초기화
    event.target.value = '';
  };

  const selectedTemplate = CONTRACT_TEMPLATES.find(t => t.type === selectedType);
  const hasErrors = validationErrors.length > 0;

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 relative">
              <h1 className="text-3xl font-bold text-gray-900">근로계약서 작성</h1>
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
                      <p className="font-medium mb-2">근로계약서 작성 가이드:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 근로기준법에 따른 표준 근로계약서를 작성할 수 있습니다</li>
                        <li>• 계약 유형을 먼저 선택하고 필수 정보를 입력하세요</li>
                        <li>• 실시간으로 미리보기가 업데이트됩니다</li>
                        <li>• 모든 필수 항목 입력 후 PDF로 다운로드 가능합니다</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-3">
                <Select value={selectedType} onValueChange={(value: ContractType) => setSelectedType(value)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="계약서 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TEMPLATES.map((template) => (
                      <SelectItem key={template.type} value={template.type}>
                        <div>
                          <div className="font-medium">{template.title}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              >
                <Upload className="h-4 w-4" />
                가져오기
              </Button>
              
              <Button
                onClick={handleExportJSON}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                내보내기
              </Button>
              
              <Button
                onClick={handleSaveContract}
                disabled={hasErrors}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                저장
              </Button>
              
              <Button
                onClick={handleGeneratePDF}
                disabled={hasErrors}
                size="sm"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4" />
                PDF 다운로드
              </Button>
            </div>
          </div>


        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className={`${isPreviewMode ? 'lg:block hidden' : 'block'}`}>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">계약서 정보 입력</h2>
              <ContractForm
                contract={contract}
                onChange={handleContractChange}
                validationErrors={validationErrors}
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
                <ContractPreview contract={contract} />
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
                      <span>계약서 유형을 먼저 선택하세요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>필수 항목부터 차례로 입력하세요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>실시간으로 미리보기가 업데이트됩니다</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">주의사항</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>최저시급 기준을 준수하세요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>법정 근로시간을 확인하세요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>연소근로자는 친권자 동의 필요</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">저장 및 출력</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>모든 필수 항목 입력 후 저장 가능</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>PDF로 다운로드하여 출력하세요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>저장된 계약서는 나중에 수정 가능</span>
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

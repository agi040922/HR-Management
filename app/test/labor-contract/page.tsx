'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, AlertCircle, Upload, Save, FileDown } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">근로계약서 작성</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계약서 유형 선택
              </label>
              <Select value={selectedType} onValueChange={(value: ContractType) => setSelectedType(value)}>
                <SelectTrigger className="w-full sm:w-96">
                  <SelectValue placeholder="계약서 유형을 선택하세요" />
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

            <div className="flex flex-wrap gap-2">
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
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
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                가져오기
              </Button>
              
              <Button
                onClick={handleExportJSON}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                내보내기
              </Button>
              
              <Button
                onClick={handleSaveContract}
                disabled={hasErrors}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                저장
              </Button>
              
              <Button
                onClick={handleGeneratePDF}
                disabled={hasErrors}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF 다운로드
              </Button>
            </div>
          </div>

          {selectedTemplate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">{selectedTemplate.title}</h3>
              <p className="text-blue-700 mb-3">{selectedTemplate.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  필수 항목: {selectedTemplate.requiredFields.length}개
                </Badge>
                <Badge variant="outline">
                  선택 항목: {selectedTemplate.optionalFields.length}개
                </Badge>
              </div>
            </div>
          )}

          {/* 검증 오류 표시 */}
          {hasErrors && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <div className="font-medium mb-2">다음 항목을 확인해주세요:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm">{error.message}</li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li className="text-sm text-gray-600">
                      외 {validationErrors.length - 5}개 항목...
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <div className={`${isPreviewMode ? 'lg:block hidden' : 'block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  계약서 정보 입력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContractForm
                  contract={contract}
                  onChange={handleContractChange}
                  validationErrors={validationErrors}
                />
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 */}
          <div className={`${isPreviewMode ? 'block' : 'lg:block hidden'}`}>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  실시간 미리보기
                  {!hasErrors && (
                    <Badge variant="default" className="ml-2">
                      완료
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[80vh] overflow-y-auto">
                <ContractPreview contract={contract} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>사용 가이드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">📝 입력 방법</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 계약서 유형을 먼저 선택하세요</li>
                    <li>• 필수 항목부터 차례로 입력하세요</li>
                    <li>• 실시간으로 미리보기가 업데이트됩니다</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⚠️ 주의사항</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 최저시급 기준을 준수하세요</li>
                    <li>• 법정 근로시간을 확인하세요</li>
                    <li>• 연소근로자는 친권자 동의 필요</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">💾 저장 및 출력</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 모든 필수 항목 입력 후 저장 가능</li>
                    <li>• PDF로 다운로드하여 출력하세요</li>
                    <li>• 저장된 계약서는 나중에 수정 가능</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

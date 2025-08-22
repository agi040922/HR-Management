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
import { validateLaborContract, createDefaultContract, getContractTitle } from '@/lib/(labor-contract)/labor-contract-utils';
import { generateContractPDF, exportContractAsJSON, importContractFromJSON } from '@/lib/(labor-contract)/pdf-generator';
import { getStoresWithDetails, StoreWithDetails, getStoreTemplates, StoreTemplate } from '@/lib/api/(page)/stores/stores-api';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

import ContractForm from '@/components/(page)/labor-contract/ContractForm';
import ContractPreview from '@/components/(page)/labor-contract/ContractPreview';

export default function LaborContractPage() {
  const { user, loading } = useAuth();
  const [selectedType, setSelectedType] = useState<ContractType>('permanent');
  const [contract, setContract] = useState<LaborContract>(createDefaultContract('permanent'));
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // 스토어 관련 상태
  const [stores, setStores] = useState<StoreWithDetails[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreWithDetails | null>(null);
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplate | null>(null);
  const [showStoreSelection, setShowStoreSelection] = useState(false);
  const [saving, setSaving] = useState(false);

  // 사용자 로그인 후 스토어 목록 로드
  useEffect(() => {
    if (user) {
      loadStores();
    }
  }, [user]);

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

  const loadStores = async () => {
    try {
      const storeList = await getStoresWithDetails(user!.id);
      setStores(storeList);
    } catch (error) {
      console.error('스토어 목록 로드 오류:', error);
    }
  };

  const loadTemplates = async (storeId: number) => {
    try {
      const templateList = await getStoreTemplates(storeId);
      setTemplates(templateList);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('템플릿 목록 로드 오류:', error);
      setTemplates([]);
    }
  };

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

    // 스토어 선택 단계로 이동
    setShowStoreSelection(true);
  };

  const handleSaveAsEmployee = async () => {
    if (!selectedStore) {
      alert('스토어를 선택해주세요.');
      return;
    }

    try {
      setSaving(true);

      // 근로계약서 정보를 바탕으로 직원 데이터 생성
      const employeeData = {
        store_id: selectedStore.id,
        owner_id: user!.id,
        name: contract.employee.name,
        hourly_wage: contract.salary.salaryType === 'hourly' 
          ? contract.salary.basicSalary 
          : Math.round(contract.salary.basicSalary / (40 * 4)), // 월급을 시급으로 대략 계산
        position: contract.jobDescription || '근로자',
        phone: contract.employee.phone,
        start_date: contract.workStartDate,
        is_active: true,
        labor_contract: contract
      };

      // 직원 등록
      const { data: employeeResult, error: employeeError } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (employeeError) {
        throw employeeError;
      }

      // 선택된 템플릿이 있다면 스케줄 템플릿에 직원 추가
      if (selectedTemplate) {
        try {
          const templateData = selectedTemplate.schedule_data || {};
          
          // 근로계약서의 근로시간 정보를 기반으로 스케줄 데이터 생성
          const workDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const employeeSchedule = {
            start_time: contract.workingHours.startTime,
            end_time: contract.workingHours.endTime,
            break_periods: contract.workingHours.breakStartTime && contract.workingHours.breakEndTime ? [
              {
                start: contract.workingHours.breakStartTime,
                end: contract.workingHours.breakEndTime,
                name: '휴게시간'
              }
            ] : []
          };

          // 주 근무일수에 따라 해당 요일에만 스케줄 추가
          const workDaysCount = contract.workingHours.workDaysPerWeek || 5;
          for (let i = 0; i < Math.min(workDaysCount, workDays.length); i++) {
            const day = workDays[i];
            if (!templateData[day]) {
              templateData[day] = {
                is_open: true,
                open_time: contract.workingHours.startTime,
                close_time: contract.workingHours.endTime,
                break_periods: [],
                employees: {}
              };
            }
            
            if (!templateData[day].employees) {
              templateData[day].employees = {};
            }
            
            // 새로 등록된 직원을 템플릿에 추가
            templateData[day].employees[employeeResult.id] = employeeSchedule;
          }

          // 템플릿 업데이트
          const { error: templateError } = await supabase
            .from('weekly_schedule_templates')
            .update({
              schedule_data: templateData,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedTemplate.id);

          if (templateError) {
            console.error('템플릿 업데이트 오류:', templateError);
            // 템플릿 업데이트 실패해도 직원 등록은 성공이므로 경고만 표시
            alert('직원은 등록되었지만 스케줄 템플릿 업데이트에 실패했습니다.');
          } else {
            alert('근로계약서가 작성되고 직원이 등록되었으며, 선택된 스케줄 템플릿에 자동으로 추가되었습니다!');
          }
        } catch (templateError) {
          console.error('템플릿 처리 오류:', templateError);
          alert('직원은 등록되었지만 스케줄 템플릿 처리 중 오류가 발생했습니다.');
        }
      } else {
        alert('근로계약서가 작성되고 직원이 등록되었습니다!');
      }

      setShowStoreSelection(false);
      setSelectedStore(null);
      setSelectedTemplate(null);
      setTemplates([]);
      
      // 새 계약서로 초기화
      const newContract = createDefaultContract(selectedType);
      setContract(newContract);
      
    } catch (error) {
      console.error('직원 등록 오류:', error);
      alert('직원 등록 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4" />
                직원으로 등록
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

        {/* 스토어 선택 모달 */}
        {showStoreSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  직원을 등록할 스토어 선택
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">{contract.employee.name}</span>님을 등록할 스토어를 선택해주세요.
                    </p>
                    
                    {stores.length > 0 ? (
                      <Select
                        value={selectedStore?.id.toString() || ''}
                        onValueChange={(value) => {
                          const store = stores.find(s => s.id.toString() === value);
                          setSelectedStore(store || null);
                          if (store) {
                            loadTemplates(store.id);
                          } else {
                            setTemplates([]);
                            setSelectedTemplate(null);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="스토어를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{store.store_name}</span>
                                <span className="text-xs text-gray-500">
                                  {store.open_time} - {store.close_time} | 직원 {store.employees_count}명
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-3">등록된 스토어가 없습니다.</p>
                        <Button
                          onClick={() => {
                            setShowStoreSelection(false);
                            window.open('/stores', '_blank');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          스토어 생성하기
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 템플릿 선택 */}
                  {selectedStore && templates.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        스케줄 템플릿 선택 (선택사항)
                      </label>
                      <Select
                        value={selectedTemplate?.id.toString() || ''}
                        onValueChange={(value) => {
                          const template = templates.find(t => t.id.toString() === value);
                          setSelectedTemplate(template || null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="템플릿을 선택하세요 (선택사항)" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{template.template_name}</span>
                                <span className="text-xs text-gray-500">
                                  {template.is_active ? '활성' : '비활성'} | 
                                  생성일: {new Date(template.created_at).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        💡 템플릿을 선택하면 근로계약서의 근로시간 정보를 바탕으로 해당 템플릿에 자동으로 스케줄이 추가됩니다.
                      </p>
                    </div>
                  )}

                  {selectedStore && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">선택된 스토어 정보</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">이름:</span> {selectedStore.store_name}</p>
                        <p><span className="font-medium">운영시간:</span> {selectedStore.open_time} - {selectedStore.close_time}</p>
                        <p><span className="font-medium">등록된 직원:</span> {selectedStore.employees_count}명</p>
                        <p><span className="font-medium">스케줄 템플릿:</span> {templates.length}개</p>
                      </div>
                    </div>
                  )}

                  {selectedTemplate && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">선택된 템플릿 정보</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><span className="font-medium">템플릿명:</span> {selectedTemplate.template_name}</p>
                        <p><span className="font-medium">상태:</span> {selectedTemplate.is_active ? '활성' : '비활성'}</p>
                        <p className="text-xs mt-2">
                          ✅ 근로계약서의 근무시간({contract.workingHours.startTime} - {contract.workingHours.endTime}, 
                          주 {contract.workingHours.workDaysPerWeek}일)이 이 템플릿에 자동으로 추가됩니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowStoreSelection(false);
                      setSelectedStore(null);
                      setSelectedTemplate(null);
                      setTemplates([]);
                    }}
                    variant="outline"
                    size="sm"
                    disabled={saving}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSaveAsEmployee}
                    disabled={!selectedStore || saving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {saving ? '등록 중...' : '직원 등록'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

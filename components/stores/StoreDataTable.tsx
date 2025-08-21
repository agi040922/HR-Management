'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  FileText, 
  Clock, 
  Settings,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Scroll
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StoreWithDetails, StoreTemplate, StoreEmployee } from '@/lib/api/stores-api';

interface StoreDataTableProps {
  stores: StoreWithDetails[];
  onEditStore: (store: StoreWithDetails) => void;
  onDeleteStore: (storeId: number) => void;
  onViewSchedule: (storeId: number) => void;
  onLoadTemplates: (storeId: number) => Promise<StoreTemplate[]>;
  onLoadEmployees: (storeId: number) => Promise<StoreEmployee[]>;
}

interface ExpandedData {
  templates: StoreTemplate[];
  employees: StoreEmployee[];
  loading: boolean;
}

export default function StoreDataTable({
  stores,
  onEditStore,
  onDeleteStore,
  onViewSchedule,
  onLoadTemplates,
  onLoadEmployees
}: StoreDataTableProps) {
  const [expandedStores, setExpandedStores] = useState<Set<number>>(new Set());
  const [storeData, setStoreData] = useState<Map<number, ExpandedData>>(new Map());

  const toggleStoreExpansion = async (storeId: number) => {
    const newExpanded = new Set(expandedStores);
    
    if (expandedStores.has(storeId)) {
      // 축소
      newExpanded.delete(storeId);
      setExpandedStores(newExpanded);
    } else {
      // 확장
      newExpanded.add(storeId);
      setExpandedStores(newExpanded);
      
      // 데이터가 없으면 로드
      if (!storeData.has(storeId)) {
        setStoreData(prev => new Map(prev.set(storeId, {
          templates: [],
          employees: [],
          loading: true
        })));

        try {
          const [templates, employees] = await Promise.all([
            onLoadTemplates(storeId),
            onLoadEmployees(storeId)
          ]);

          setStoreData(prev => new Map(prev.set(storeId, {
            templates,
            employees,
            loading: false
          })));
        } catch (error) {
          console.error('데이터 로드 오류:', error);
          setStoreData(prev => new Map(prev.set(storeId, {
            templates: [],
            employees: [],
            loading: false
          })));
        }
      }
    }
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return '--:--';
    return time.substring(0, 5); // HH:MM 형식으로 변환
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "활성" : "비활성"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {stores.map((store) => {
        const isExpanded = expandedStores.has(store.id);
        const data = storeData.get(store.id);

        return (
          <div key={store.id} className="border rounded-lg bg-white shadow-sm">
            {/* 스토어 헤더 */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStoreExpansion(store.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <Settings className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {store.store_name || `스토어 #${store.id}`}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(store.open_time)} - {formatTime(store.close_time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        템플릿 {store.templates_count}개
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        직원 {store.active_employees_count}/{store.employees_count}명
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {store.time_slot_minutes}분 단위
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewSchedule(store.id)}
                    className="h-8 w-8 p-0"
                    title="스케줄 보기"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditStore(store)}
                    className="h-8 w-8 p-0"
                    title="편집"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteStore(store.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 확장된 내용 */}
            {isExpanded && (
              <div className="p-4">
                {data?.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">데이터 로딩 중...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 템플릿 섹션 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-gray-900">스케줄 템플릿</h4>
                        <Badge variant="secondary">{data?.templates.length || 0}</Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {data?.templates.length === 0 ? (
                          <div className="text-sm text-gray-500 py-4 text-center border rounded-lg bg-gray-50">
                            등록된 템플릿이 없습니다
                          </div>
                        ) : (
                          data?.templates.map((template) => (
                            <div key={template.id} className="p-3 border rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">
                                    {template.template_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    생성일: {formatDate(template.created_at)}
                                  </div>
                                </div>
                                {getStatusBadge(template.is_active)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* 직원 섹션 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-gray-900">직원 목록</h4>
                        <Badge variant="secondary">{data?.employees.length || 0}</Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {data?.employees.length === 0 ? (
                          <div className="text-sm text-gray-500 py-4 text-center border rounded-lg bg-gray-50">
                            등록된 직원이 없습니다
                          </div>
                        ) : (
                          data?.employees.map((employee) => (
                            <div key={employee.id} className="p-3 border rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {employee.name}
                                    {employee.labor_contract && (
                                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600">
                                        <Scroll className="h-3 w-3" />
                                        계약서
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {employee.position && `${employee.position} • `}
                                    {employee.hourly_wage ? `시급 ${employee.hourly_wage.toLocaleString()}원` : '시급 미설정'}
                                    {employee.start_date && ` • 입사 ${formatDate(employee.start_date)}`}
                                  </div>
                                  {employee.labor_contract && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      근로계약서: {employee.labor_contract.contractType === 'permanent' ? '정규직' : 
                                                   employee.labor_contract.contractType === 'fixed-term' ? '계약직' : 
                                                   employee.labor_contract.contractType === 'part-time' ? '파트타임' : '기타'}
                                    </div>
                                  )}
                                </div>
                                {getStatusBadge(employee.is_active)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

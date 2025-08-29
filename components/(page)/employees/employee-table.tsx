'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Edit, 
  Trash2, 
  Phone,
  DollarSign,
  Store,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronRight,
  Scroll,
  FileText
} from 'lucide-react'
import { StoreData, EmployeeData } from '@/lib/api/(page)/employees/employees-api'

interface EmployeeTableProps {
  employees: EmployeeData[]
  stores: StoreData[]
  expandedRows: Set<number>
  onToggleExpansion: (employeeId: number) => void
  onToggleStatus: (employee: EmployeeData) => void
  onEdit: (employee: EmployeeData) => void
  onDelete: (employeeId: number) => void
  onViewContract: (contract: any) => void
  getContractTypeLabel: (contractType: string) => string
}

export function EmployeeTable({
  employees,
  stores,
  expandedRows,
  onToggleExpansion,
  onToggleStatus,
  onEdit,
  onDelete,
  onViewContract,
  getContractTypeLabel
}: EmployeeTableProps) {
  const getStoreById = (storeId?: number) => {
    return stores.find(store => store.id === storeId)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>이름</TableHead>
          <TableHead>스토어</TableHead>
          <TableHead>시급</TableHead>
          <TableHead>직책</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="w-[120px]">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const store = getStoreById(employee.store_id)
          const isExpanded = expandedRows.has(employee.id)
          
          return (
            <React.Fragment key={employee.id}>
              <TableRow className="hover:bg-gray-50">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpansion(employee.id)}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{employee.name}</span>
                    {employee.labor_contract && (
                      <Badge variant="outline" className="text-xs">
                        <Scroll className="h-3 w-3 mr-1" />
                        계약서
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Store className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {store ? store.store_name : '스토어 미지정'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>{employee.hourly_wage.toLocaleString()}원</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {employee.position || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                    {employee.is_active ? '활성' : '비활성'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {employee.labor_contract && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewContract(employee.labor_contract)}
                        title="근로계약서 보기"
                        className="p-1"
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(employee)}
                      title={employee.is_active ? '비활성화' : '활성화'}
                      className="p-1"
                    >
                      {employee.is_active ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-600" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
                      className="p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(employee.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              
              {/* 확장된 행 - 드릴 다운 정보 */}
              {isExpanded && (
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={7}>
                    <div className="py-4 px-2 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">연락처 정보</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{employee.phone || '연락처 없음'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">근무 정보</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">시작일:</span>
                              <span>{new Date(employee.start_date).toLocaleDateString('ko-KR')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">등록일:</span>
                              <span>{new Date(employee.created_at).toLocaleDateString('ko-KR')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">수정일:</span>
                              <span>{new Date(employee.updated_at).toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {store && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">스토어 상세 정보</h4>
                          <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-600">운영시간:</span>
                                <span className="ml-2">{store.open_time} - {store.close_time}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">시간 단위:</span>
                                <span className="ml-2">{store.time_slot_minutes}분</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 근로계약서 정보 */}
                      {employee.labor_contract && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">근로계약서 정보</h4>
                          <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-600">계약 유형:</span>
                                <span className="ml-2">{getContractTypeLabel(employee.labor_contract.contractType)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">계약 기간:</span>
                                <span className="ml-2">
                                  {employee.labor_contract.workStartDate} ~ {employee.labor_contract.workEndDate || '정함없음'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewContract(employee.labor_contract)}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                상세보기
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}

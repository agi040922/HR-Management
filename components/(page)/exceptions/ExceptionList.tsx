'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Calendar,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { 
  ExceptionData, 
  EmployeeData, 
  TemplateData,
  getExceptionTypeLabel,
  getExceptionTypeBadgeVariant
} from '@/lib/api/(page)/schedule/exceptions/exceptions-api'

interface ExceptionListProps {
  exceptions: ExceptionData[]
  employees: EmployeeData[]
  templates: TemplateData[]
  viewMode: 'table' | 'cards'
  onDeleteException: (exceptionId: number) => void
}

export default function ExceptionList({
  exceptions,
  employees,
  templates,
  viewMode,
  onDeleteException
}: ExceptionListProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRowExpansion = (exceptionId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(exceptionId)) {
      newExpanded.delete(exceptionId)
    } else {
      newExpanded.add(exceptionId)
    }
    setExpandedRows(newExpanded)
  }

  if (viewMode === 'table') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>날짜</TableHead>
            <TableHead>직원</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>시간</TableHead>
            <TableHead>템플릿</TableHead>
            <TableHead className="w-[100px]">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exceptions.map((exception) => {
            const employee = employees.find(emp => emp.id === exception.employee_id)
            const template = templates.find(t => t.id === exception.template_id)
            const isExpanded = expandedRows.has(exception.id)
            
            return (
              <React.Fragment key={exception.id}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(exception.id)}
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
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(exception.date).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{employee?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getExceptionTypeBadgeVariant(exception.exception_type) as any}>
                      {getExceptionTypeLabel(exception.exception_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {exception.exception_type !== 'CANCEL' && exception.start_time && exception.end_time ? (
                      <span>{exception.start_time} - {exception.end_time}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {template?.template_name || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteException(exception.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* 확장된 행 - 상세 정보 */}
                {isExpanded && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={7}>
                      <div className="py-4 px-2 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">상세 정보</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">직원 시급:</span>
                                <span>{employee?.hourly_wage?.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">직원 직책:</span>
                                <span>{employee?.position || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">등록일:</span>
                                <span>{new Date(exception.created_at).toLocaleDateString('ko-KR')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">템플릿 정보</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">템플릿 ID:</span>
                                <span>#{template?.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">상태:</span>
                                <span>{template?.is_active ? '활성' : '비활성'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {exception.notes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">메모</h4>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                              {exception.notes}
                            </div>
                          </div>
                        )}
                        
                        {exception.exception_data && Object.keys(exception.exception_data).length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">예외사항 데이터</h4>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(exception.exception_data, null, 2)}
                              </pre>
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

  // 카드 뷰
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exceptions.slice(0, 6).map((exception) => {
          const employee = employees.find(emp => emp.id === exception.employee_id)
          const template = templates.find(t => t.id === exception.template_id)
          
          return (
            <Card key={exception.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date(exception.date).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteException(exception.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={getExceptionTypeBadgeVariant(exception.exception_type) as any}>
                    {getExceptionTypeLabel(exception.exception_type)}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span>{employee?.name || 'Unknown'}</span>
                  </div>
                  
                  {template && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>템플릿: {template.template_name}</span>
                    </div>
                  )}

                  {exception.exception_type !== 'CANCEL' && exception.start_time && exception.end_time && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{exception.start_time} - {exception.end_time}</span>
                    </div>
                  )}
                </div>

                {exception.notes && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {exception.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {exceptions.length > 6 && (
        <div className="text-center mt-4">
          <Button variant="outline">
            더 보기 ({exceptions.length - 6}건)
          </Button>
        </div>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Edit, 
  Trash2, 
  Phone,
  DollarSign,
  Store,
  UserCheck,
  UserX
} from 'lucide-react'
import { StoreData, EmployeeData } from '@/lib/api/(page)/employees/employees-api'

interface EmployeeCardsProps {
  employees: EmployeeData[]
  stores: StoreData[]
  onToggleStatus: (employee: EmployeeData) => void
  onEdit: (employee: EmployeeData) => void
  onDelete: (employeeId: number) => void
}

export function EmployeeCards({
  employees,
  stores,
  onToggleStatus,
  onEdit,
  onDelete
}: EmployeeCardsProps) {
  const getStoreById = (storeId?: number) => {
    return stores.find(store => store.id === storeId)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((employee) => {
        const store = getStoreById(employee.store_id)
        return (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{employee.name}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(employee)}
                    title={employee.is_active ? '비활성화' : '활성화'}
                  >
                    {employee.is_active ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-600" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(employee.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Store className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {store ? store.store_name : '스토어 미지정'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  시급 {employee.hourly_wage.toLocaleString()}원
                </span>
              </div>

              {employee.position && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    직책: {employee.position}
                  </span>
                </div>
              )}

              {employee.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
              )}

              <Separator />
              
              <div className="flex items-center justify-between">
                <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                  {employee.is_active ? '활성' : '비활성'}
                </Badge>
                <div className="text-xs text-gray-500">
                  등록: {new Date(employee.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

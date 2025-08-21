import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import { PayrollFilters } from '@/types/payroll'

interface PayrollFiltersProps {
  filters: PayrollFilters
  onUpdateFilters: (filters: Partial<PayrollFilters>) => void
}

export function PayrollFiltersComponent({ filters, onUpdateFilters }: PayrollFiltersProps) {
  return (
    <div className="bg-white rounded border shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="직원명 또는 직책으로 검색..."
              value={filters.searchTerm}
              onChange={(e) => onUpdateFilters({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        <Select 
          value={filters.filterStatus} 
          onValueChange={(value: PayrollFilters['filterStatus']) => onUpdateFilters({ filterStatus: value })}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="필터 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 직원</SelectItem>
            <SelectItem value="holiday-eligible">주휴수당 대상</SelectItem>
            <SelectItem value="holiday-not-eligible">주휴수당 미대상</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

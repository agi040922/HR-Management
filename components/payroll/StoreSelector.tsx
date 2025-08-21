import React from 'react'
import { Button } from '@/components/ui/button'
import { Store } from '@/types/payroll'

interface StoreSelectorProps {
  stores: Store[]
  selectedStores: Set<number>
  onToggleStore: (storeId: number) => void
  onToggleAllStores: () => void
}

export function StoreSelector({
  stores,
  selectedStores,
  onToggleStore,
  onToggleAllStores
}: StoreSelectorProps) {
  return (
    <div className="bg-white rounded border shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">스토어 선택</h3>
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleAllStores}
        >
          {selectedStores.size === stores.length ? '전체 해제' : '전체 선택'}
        </Button>
        <span className="text-sm text-gray-500">
          {selectedStores.size}개 스토어 선택됨
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stores.map(store => (
          <div
            key={store.id}
            className={`p-3 border rounded cursor-pointer transition-colors ${
              selectedStores.has(store.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onToggleStore(store.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{store.store_name}</span>
              <input
                type="checkbox"
                checked={selectedStores.has(store.id)}
                onChange={() => onToggleStore(store.id)}
                className="rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StoreData } from '@/lib/api/(page)/schedule/exceptions/exceptions-api'

interface StoreSelectorProps {
  stores: StoreData[]
  selectedStore: StoreData | null
  onStoreChange: (store: StoreData | null) => void
}

export default function StoreSelector({ stores, selectedStore, onStoreChange }: StoreSelectorProps) {
  if (stores.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        스토어:
      </label>
      <Select
        value={selectedStore?.id.toString() || ''}
        onValueChange={(value) => {
          const store = stores.find(s => s.id.toString() === value)
          onStoreChange(store || null)
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="스토어를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id.toString()}>
              {store.store_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StoreWithDetails } from '@/lib/api/(page)/stores/stores-api';

interface StoreFormModalProps {
  isOpen: boolean;
  editingStore: StoreWithDetails | null;
  onClose: () => void;
  onSubmit: (formData: StoreFormData) => Promise<void>;
}

export interface StoreFormData {
  store_name: string;
  time_slot_minutes: number;
}

export default function StoreFormModal({
  isOpen,
  editingStore,
  onClose,
  onSubmit
}: StoreFormModalProps) {
  const [formData, setFormData] = useState<StoreFormData>({
    store_name: '',
    time_slot_minutes: 30
  });
  const [loading, setLoading] = useState(false);

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editingStore) {
      setFormData({
        store_name: editingStore.store_name || '',
        time_slot_minutes: editingStore.time_slot_minutes
      });
    } else {
      setFormData({
        store_name: '',
        time_slot_minutes: 30
      });
    }
  }, [editingStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.store_name.trim()) {
      alert('스토어 이름을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('스토어 저장 오류:', error);
      alert('스토어 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StoreFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingStore ? '스토어 수정' : '새 스토어 생성'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 스토어 이름 */}
          <div>
            <Label htmlFor="store_name">스토어 이름 *</Label>
            <Input
              id="store_name"
              type="text"
              value={formData.store_name}
              onChange={(e) => handleInputChange('store_name', e.target.value)}
              placeholder="예: 강남점, 본점 등"
              required
              className="mt-1"
            />
          </div>


          {/* 시간 단위 */}
          <div>
            <Label htmlFor="time_slot_minutes">시간 단위</Label>
            <select
              id="time_slot_minutes"
              value={formData.time_slot_minutes}
              onChange={(e) => handleInputChange('time_slot_minutes', parseInt(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15분</option>
              <option value={30}>30분</option>
              <option value={60}>60분</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              스케줄 관리에서 사용할 시간 간격을 설정합니다
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? '저장 중...' : (editingStore ? '수정' : '생성')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

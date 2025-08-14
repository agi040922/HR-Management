'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useScheduleTemplates } from '@/lib/hooks/useScheduleTemplates';
import { useWorkSchedules } from '@/lib/hooks/useWorkSchedules';
import { WorkSchedule } from '@/lib/api/work-schedule-api';
import { Employee } from '@/lib/types/schedule';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  ArrowLeft,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function WorkSchedulesPage() {
  const { user } = useAuth();
  const { stores, selectedStore, setSelectedStore, loading: storesLoading, loadStores } = useScheduleTemplates();
  const {
    schedules,
    availableEmployees,
    loading,
    error,
    loadDaySchedules,
    loadAvailableEmployees,
    addSchedule,
    editSchedule,
    removeSchedule,
    checkConflict,
    clearError
  } = useWorkSchedules();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    start_time: '09:00',
    end_time: '18:00',
    break_time: 60,
    is_overtime: false,
    is_night_shift: false
  });

  // 사용자 로그인 시 스토어 목록 로드
  useEffect(() => {
    if (user) {
      loadStores(user.id);
    }
  }, [user, loadStores]);

  // 스토어 변경 시 직원 목록과 스케줄 로드
  useEffect(() => {
    if (selectedStore) {
      loadAvailableEmployees(selectedStore.id);
      loadDaySchedules(selectedStore.id, selectedDate);
    }
  }, [selectedStore, selectedDate, loadAvailableEmployees, loadDaySchedules]);

  // 날짜 변경 핸들러
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedStore) {
      loadDaySchedules(selectedStore.id, date);
    }
  };

  // 폼 데이터 초기화
  const resetForm = () => {
    setFormData({
      employee_id: '',
      start_time: '09:00',
      end_time: '18:00',
      break_time: 60,
      is_overtime: false,
      is_night_shift: false
    });
  };

  // 스케줄 추가 모달 열기
  const handleAddSchedule = () => {
    resetForm();
    setEditingSchedule(null);
    setShowAddModal(true);
  };

  // 스케줄 수정 모달 열기
  const handleEditSchedule = (schedule: WorkSchedule) => {
    setFormData({
      employee_id: schedule.employee_id.toString(),
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      break_time: schedule.break_time,
      is_overtime: schedule.is_overtime,
      is_night_shift: schedule.is_night_shift
    });
    setEditingSchedule(schedule);
    setShowAddModal(true);
  };

  // 스케줄 저장
  const handleSaveSchedule = async () => {
    if (!selectedStore || !formData.employee_id) {
      alert('스토어와 직원을 선택해주세요.');
      return;
    }

    try {
      const scheduleData = {
        employee_id: parseInt(formData.employee_id),
        store_id: selectedStore.id,
        date: selectedDate,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_time: formData.break_time,
        is_overtime: formData.is_overtime,
        is_night_shift: formData.is_night_shift
      };

      // 시간 유효성 검사
      if (formData.start_time >= formData.end_time) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
      }

      if (editingSchedule) {
        await editSchedule(editingSchedule.id!, scheduleData);
      } else {
        await addSchedule(scheduleData);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('스케줄 저장 오류:', err);
    }
  };

  // 스케줄 삭제
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
      try {
        await removeSchedule(scheduleId);
      } catch (err) {
        console.error('스케줄 삭제 오류:', err);
      }
    }
  };

  // 근무 시간 계산
  const calculateWorkHours = (startTime: string, endTime: string, breakTime: number) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const workMinutes = totalMinutes - breakTime;
    return Math.round((workMinutes / 60) * 100) / 100;
  };

  // 요일 이름 가져오기
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  if (storesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/test/comprehensive/templates" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} />
            템플릿으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-blue-600" size={28} />
            근무 스케줄 관리
          </h1>
        </div>
        
        <button
          onClick={handleAddSchedule}
          disabled={!selectedStore}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Plus size={20} />
          스케줄 추가
        </button>
      </div>

      {/* 스토어 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">스토어 선택</label>
        <select
          value={selectedStore?.id || ''}
          onChange={(e) => {
            const store = stores.find(s => s.id === parseInt(e.target.value));
            setSelectedStore(store || null);
          }}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">스토어를 선택하세요</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.store_name}
            </option>
          ))}
        </select>
      </div>

      {/* 날짜 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">날짜 선택</label>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-lg font-medium">
            {selectedDate} ({getDayName(selectedDate)}요일)
          </span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 스케줄 목록 */}
      {selectedStore && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="text-green-600" size={20} />
              {selectedDate} 근무 스케줄 ({schedules.length}명)
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">등록된 스케줄이 없습니다.</p>
              <button
                onClick={handleAddSchedule}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                첫 번째 스케줄을 추가해보세요
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {schedule.employee?.name || '알 수 없는 직원'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {schedule.employee?.position || '직책 없음'} • 시급: {schedule.employee?.hourly_wage?.toLocaleString()}원
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                          <span>
                            휴게시간: {schedule.break_time}분
                          </span>
                          <span>
                            근무시간: {calculateWorkHours(schedule.start_time, schedule.end_time, schedule.break_time)}시간
                          </span>
                          {schedule.is_overtime && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                              연장근무
                            </span>
                          )}
                          {schedule.is_night_shift && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              야간근무
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="수정"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id!)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 스케줄 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingSchedule ? '스케줄 수정' : '스케줄 추가'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 직원 선택 */}
              <div>
                <label className="block text-sm font-medium mb-1">직원</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">직원을 선택하세요</option>
                  {availableEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.position || '직책 없음'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 시작 시간 */}
              <div>
                <label className="block text-sm font-medium mb-1">시작 시간</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 종료 시간 */}
              <div>
                <label className="block text-sm font-medium mb-1">종료 시간</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 휴게시간 */}
              <div>
                <label className="block text-sm font-medium mb-1">휴게시간 (분)</label>
                <input
                  type="number"
                  min="0"
                  max="480"
                  value={formData.break_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, break_time: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 옵션들 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_overtime}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_overtime: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">연장근무</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_night_shift}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_night_shift: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">야간근무</span>
                </label>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

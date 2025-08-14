'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useScheduleTemplates } from '@/lib/hooks/useScheduleTemplates';
import { useWorkSchedules } from '@/lib/hooks/useWorkSchedules';
import { WorkSchedule, ScheduleSummary } from '@/lib/api/work-schedule-api';
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
  User,
  AlertTriangle,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function ScheduleViewPage() {
  const { user } = useAuth();
  const { stores, selectedStore, setSelectedStore, loading: storesLoading, loadStores } = useScheduleTemplates();
  const {
    weeklySummary,
    loading,
    error,
    loadWeeklySummary,
    clearError
  } = useWorkSchedules();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    return monday.toISOString().split('T')[0];
  });

  const [viewMode, setViewMode] = useState<'week' | 'table'>('week');

  // 사용자 로그인 시 스토어 목록 로드
  useEffect(() => {
    if (user) {
      loadStores(user.id);
    }
  }, [user, loadStores]);

  // 스토어 변경 시 주간 요약 로드
  useEffect(() => {
    if (selectedStore) {
      loadWeeklySummary(selectedStore.id, currentWeekStart);
    }
  }, [selectedStore, currentWeekStart, loadWeeklySummary]);

  // 주 변경 핸들러
  const changeWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(currentWeekStart);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate.toISOString().split('T')[0]);
  };

  // 요일 이름 가져오기
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 근무 시간 계산
  const calculateWorkHours = (startTime: string, endTime: string, breakTime: number) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const workMinutes = totalMinutes - breakTime;
    return Math.round((workMinutes / 60) * 100) / 100;
  };

  // 주간 통계 계산
  const getWeeklyStats = () => {
    const totalEmployees = new Set(
      weeklySummary.flatMap(day => 
        day.schedules.map(schedule => schedule.employee_id)
      )
    ).size;
    
    const totalHours = weeklySummary.reduce((sum, day) => sum + day.total_hours, 0);
    const totalShifts = weeklySummary.reduce((sum, day) => sum + day.schedules.length, 0);
    
    return {
      totalEmployees,
      totalHours: Math.round(totalHours * 100) / 100,
      totalShifts
    };
  };

  const weeklyStats = getWeeklyStats();

  // 로딩 상태 처리
  if (storesLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  // 로그인 필요
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600">스케줄을 보려면 먼저 로그인해주세요.</p>
        </div>
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
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} />
            템플릿으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="text-green-600" size={28} />
            스케줄표 보기
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            주간 보기
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            테이블 보기
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 스토어 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">스토어 선택</label>
        <select
          value={selectedStore?.id || ''}
          onChange={(e) => {
            const store = stores.find(s => s.id === parseInt(e.target.value));
            setSelectedStore(store || null);
          }}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">스토어를 선택하세요</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.store_name}
            </option>
          ))}
        </select>
        {stores.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            등록된 스토어가 없습니다. 먼저 스토어를 생성해주세요.
          </p>
        )}
      </div>

      {/* 주간 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeWeek('prev')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-lg font-semibold">
            {formatDate(currentWeekStart)} - {formatDate(
              new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0]
            )}
          </div>
          
          <button
            onClick={() => changeWeek('next')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 주간 통계 */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={16} />
            <span>직원: {weeklyStats.totalEmployees}명</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-green-600" size={16} />
            <span>총 근무시간: {weeklyStats.totalHours}시간</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-purple-600" size={16} />
            <span>총 근무: {weeklyStats.totalShifts}회</span>
          </div>
        </div>
      </div>

      {selectedStore && (
        <>
          {/* 주간 보기 */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-200">
                {weeklySummary.map((daySummary, index) => (
                  <div key={daySummary.date} className="p-4 border-r border-gray-200 last:border-r-0">
                    <div className="text-center mb-3">
                      <div className="font-semibold text-gray-900">
                        {getDayName(daySummary.date)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(daySummary.date)}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {daySummary.total_employees}명 • {daySummary.total_hours}시간
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {daySummary.schedules.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-4">
                          휴무
                        </div>
                      ) : (
                        daySummary.schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs"
                          >
                            <div className="font-medium text-blue-900 truncate">
                              {schedule.employee?.name}
                            </div>
                            <div className="text-blue-700">
                              {schedule.start_time} - {schedule.end_time}
                            </div>
                            <div className="text-blue-600">
                              {calculateWorkHours(schedule.start_time, schedule.end_time, schedule.break_time)}시간
                            </div>
                            {(schedule.is_overtime || schedule.is_night_shift) && (
                              <div className="flex gap-1 mt-1">
                                {schedule.is_overtime && (
                                  <span className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded text-xs">
                                    연장
                                  </span>
                                )}
                                {schedule.is_night_shift && (
                                  <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs">
                                    야간
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 테이블 보기 */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">날짜</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">요일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">직원</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">근무시간</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">휴게시간</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">실근무시간</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">구분</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {weeklySummary.flatMap(daySummary => 
                      daySummary.schedules.length === 0 ? (
                        <tr key={daySummary.date}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(daySummary.date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getDayName(daySummary.date)}
                          </td>
                          <td colSpan={5} className="px-4 py-3 text-sm text-gray-400 text-center">
                            휴무
                          </td>
                        </tr>
                      ) : (
                        daySummary.schedules.map((schedule, index) => (
                          <tr key={schedule.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {index === 0 ? formatDate(daySummary.date) : ''}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {index === 0 ? getDayName(daySummary.date) : ''}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="text-gray-400" size={16} />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {schedule.employee?.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {schedule.employee?.position}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {schedule.start_time} - {schedule.end_time}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {schedule.break_time}분
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {calculateWorkHours(schedule.start_time, schedule.end_time, schedule.break_time)}시간
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-1">
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
                                {!schedule.is_overtime && !schedule.is_night_shift && (
                                  <span className="text-gray-400 text-xs">일반근무</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          )}

          {/* 데이터 없음 */}
          {!loading && weeklySummary.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 mb-2">해당 주에 등록된 스케줄이 없습니다.</p>
              <Link
                href="/test/comprehensive/templates/schedules"
                className="text-blue-600 hover:text-blue-800"
              >
                스케줄을 추가해보세요
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

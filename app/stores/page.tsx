'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Settings,
  HelpCircle,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// 타입 정의
interface StoreData {
  id: number
  owner_id: string
  open_time: string
  close_time: string
  time_slot_minutes: number
  created_at: string
  updated_at: string
}

interface StoreFormData {
  open_time: string
  close_time: string
  time_slot_minutes: number
}

export default function StoresPage() {
  const { user, loading } = useAuth()
  const [stores, setStores] = useState<StoreData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreData | null>(null)
  const [formData, setFormData] = useState<StoreFormData>({
    open_time: '09:00',
    close_time: '18:00',
    time_slot_minutes: 30
  })
  const [sortBy, setSortBy] = useState<'created_at' | 'open_time'>('created_at')
  const [filterBy, setFilterBy] = useState<'all' | 'morning' | 'evening'>('all')

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores()
    }
  }, [user])

  const loadStores = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('스토어 데이터 로드 오류:', error)
      } else {
        setStores(data || [])
      }
    } catch (error) {
      console.error('스토어 로드 중 오류:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingStore) {
        // 수정
        const { error } = await supabase
          .from('store_settings')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingStore.id)

        if (error) throw error
      } else {
        // 생성
        const { error } = await supabase
          .from('store_settings')
          .insert({
            ...formData,
            owner_id: user?.id
          })

        if (error) throw error
      }

      // 폼 초기화 및 데이터 새로고침
      setFormData({
        open_time: '09:00',
        close_time: '18:00',
        time_slot_minutes: 30
      })
      setShowCreateForm(false)
      setEditingStore(null)
      loadStores()
    } catch (error) {
      console.error('스토어 저장 오류:', error)
    }
  }

  const handleEdit = (store: StoreData) => {
    setEditingStore(store)
    setFormData({
      open_time: store.open_time,
      close_time: store.close_time,
      time_slot_minutes: store.time_slot_minutes
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (storeId: number) => {
    if (!confirm('정말로 이 스토어를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('store_settings')
        .delete()
        .eq('id', storeId)

      if (error) throw error
      loadStores()
    } catch (error) {
      console.error('스토어 삭제 오류:', error)
    }
  }

  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingStore(null)
    setFormData({
      open_time: '09:00',
      close_time: '18:00',
      time_slot_minutes: 30
    })
  }

  // 필터링 및 정렬
  const filteredAndSortedStores = stores
    .filter(store => {
      if (filterBy === 'all') return true
      const openHour = parseInt(store.open_time.split(':')[0])
      if (filterBy === 'morning') return openHour < 12
      if (filterBy === 'evening') return openHour >= 12
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.open_time.localeCompare(b.open_time)
    })

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">스토어 관리</h1>
          <div className="group relative">
            <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-6 invisible group-hover:visible bg-black text-white text-sm rounded px-2 py-1 whitespace-nowrap z-10">
              스토어별 운영시간과 스케줄 설정을 관리합니다
            </div>
          </div>
          
          {/* 필터 및 정렬 드롭다운 */}
          <div className="flex gap-2 ml-4">
            <div className="relative">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'created_at' | 'open_time')}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">생성순</option>
                <option value="open_time">오픈시간순</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'morning' | 'evening')}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="morning">오전 오픈</option>
                <option value="evening">오후 오픈</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          새 스토어
        </Button>
      </div>

      {/* 생성/수정 폼 */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingStore ? '스토어 수정' : '새 스토어 생성'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="open_time">오픈 시간</Label>
                  <Input
                    id="open_time"
                    type="time"
                    value={formData.open_time}
                    onChange={(e) => setFormData({...formData, open_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="close_time">마감 시간</Label>
                  <Input
                    id="close_time"
                    type="time"
                    value={formData.close_time}
                    onChange={(e) => setFormData({...formData, close_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time_slot_minutes">시간 단위 (분)</Label>
                  <select
                    id="time_slot_minutes"
                    value={formData.time_slot_minutes}
                    onChange={(e) => setFormData({...formData, time_slot_minutes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15분</option>
                    <option value={30}>30분</option>
                    <option value={60}>60분</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingStore ? '수정' : '생성'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 스토어 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedStores.map((store) => (
          <Card key={store.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">스토어 #{store.id}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(store)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(store.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {store.open_time} - {store.close_time}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">시간 단위</span>
                  <Badge variant="secondary">
                    {store.time_slot_minutes}분
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500 pt-2 border-t">
                  생성일: {new Date(store.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 빈 상태 */}
      {filteredAndSortedStores.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {stores.length === 0 ? '스토어가 없습니다' : '필터 조건에 맞는 스토어가 없습니다'}
            </h3>
            <p className="text-gray-600 mb-4">
              {stores.length === 0 
                ? '첫 번째 스토어를 생성하여 시작하세요' 
                : '다른 필터 옵션을 선택해보세요'
              }
            </p>
            {stores.length === 0 && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 스토어 생성
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

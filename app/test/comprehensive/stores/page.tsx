'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Settings
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface StoreData {
  id: number
  owner_id: string
  store_name: string
  time_slot_minutes: number
  created_at: string
  updated_at: string
}

interface StoreFormData {
  store_name: string
  time_slot_minutes: number
}

export default function StoresPage() {
  const { user, loading } = useAuth()
  const [stores, setStores] = useState<StoreData[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreData | null>(null)
  const [formData, setFormData] = useState<StoreFormData>({
    store_name: '',
    time_slot_minutes: 30
  })
  const [submitting, setSubmitting] = useState(false)

  // 스토어 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores()
    }
  }, [user])

  const loadStores = async () => {
    try {
      setLoadingStores(true)
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('스토어 로드 오류:', error)
        toast.error('스토어 데이터를 불러오는데 실패했습니다')
      } else {
        setStores(data || [])
      }
    } catch (error) {
      console.error('스토어 로드 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setLoadingStores(false)
    }
  }

  // 스토어 생성
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('store_settings')
        .insert([
          {
            owner_id: user.id,
            ...formData
          }
        ])
        .select()

      if (error) {
        console.error('스토어 생성 오류:', error)
        toast.error('스토어 생성에 실패했습니다')
      } else {
        toast.success('스토어가 성공적으로 생성되었습니다')
        setShowCreateForm(false)
        setFormData({
          store_name: '',
          time_slot_minutes: 30
        })
        loadStores() // 목록 새로고침
      }
    } catch (error) {
      console.error('스토어 생성 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  // 스토어 수정
  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStore) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('store_settings')
        .update(formData)
        .eq('id', editingStore.id)
        .eq('owner_id', user?.id)

      if (error) {
        console.error('스토어 수정 오류:', error)
        toast.error('스토어 수정에 실패했습니다')
      } else {
        toast.success('스토어가 성공적으로 수정되었습니다')
        setEditingStore(null)
        setFormData({
          store_name: '',
          time_slot_minutes: 30
        })
        loadStores() // 목록 새로고침
      }
    } catch (error) {
      console.error('스토어 수정 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  // 스토어 삭제
  const handleDeleteStore = async (storeId: number) => {
    if (!confirm('정말로 이 스토어를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('store_settings')
        .delete()
        .eq('id', storeId)
        .eq('owner_id', user?.id)

      if (error) {
        console.error('스토어 삭제 오류:', error)
        toast.error('스토어 삭제에 실패했습니다')
      } else {
        toast.success('스토어가 성공적으로 삭제되었습니다')
        loadStores() // 목록 새로고침
      }
    } catch (error) {
      console.error('스토어 삭제 중 예외:', error)
      toast.error('예상치 못한 오류가 발생했습니다')
    }
  }

  // 스토어 수정 시작 버튼
  const startEdit = (store: StoreData) => {
    setEditingStore(store)
    setFormData({
      store_name: store.store_name,
      time_slot_minutes: store.time_slot_minutes
    })
    setShowCreateForm(false)
  }

  // 스토어 수정 취소 버튼
  const cancelEdit = () => {
    setEditingStore(null)
    setShowCreateForm(false)
    setFormData({
      store_name: '',
      time_slot_minutes: 30
    })
  }

  if (loading || loadingStores) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">스토어 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">스토어 관리</h1>
          <p className="text-gray-600">스토어를 생성하고 운영 설정을 관리하세요</p>
        </div>
        <Button 
          onClick={() => {
            setShowCreateForm(true)
            setEditingStore(null)
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>새 스토어 생성</span>
        </Button>
      </div>

      {/* 스토어 생성/수정 폼 */}
      {(showCreateForm || editingStore) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>{editingStore ? '스토어 수정' : '새 스토어 생성'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingStore ? handleUpdateStore : handleCreateStore} className="space-y-4">
              <div>
                <Label htmlFor="store_name">스토어 이름</Label>
                <Input
                  id="store_name"
                  type="text"
                  value={formData.store_name}
                  onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                  placeholder="스토어 이름을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="time_slot_minutes">시간 슬롯 (분)</Label>
                <Input
                  id="time_slot_minutes"
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={formData.time_slot_minutes}
                  onChange={(e) => setFormData({...formData, time_slot_minutes: parseInt(e.target.value)})}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  스케줄 관리 시 사용할 시간 단위 (15분 단위로 설정)
                </p>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? '처리 중...' : (editingStore ? '수정하기' : '생성하기')}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 스토어 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length > 0 ? (
          stores.map((store) => (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5" />
                    <span>스토어 #{store.id}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(store)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStore(store.id)}
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
                  <span className="text-sm font-medium">
                    {store.store_name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {store.time_slot_minutes}분 단위
                  </span>
                </div>

                <Separator />
                
                <div className="text-xs text-gray-500">
                  생성일: {new Date(store.created_at).toLocaleDateString('ko-KR')}
                </div>
                
                <div className="flex space-x-2">
                  <Badge variant="secondary">활성</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 스토어가 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  첫 번째 스토어를 생성하여 HR 관리를 시작하세요
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>첫 스토어 생성하기</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 도움말 */}
      <Card>
        <CardHeader>
          <CardTitle>스토어 관리 도움말</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            • <strong>오픈/마감 시간:</strong> 스토어의 기본 운영 시간을 설정합니다
          </p>
          <p className="text-sm text-gray-600">
            • <strong>시간 슬롯:</strong> 스케줄 관리 시 사용할 최소 시간 단위입니다
          </p>
          <p className="text-sm text-gray-600">
            • <strong>직원 관리:</strong> 각 스토어별로 직원을 등록하고 관리할 수 있습니다
          </p>
          <p className="text-sm text-gray-600">
            • <strong>스케줄 관리:</strong> 주간 템플릿과 예외사항을 통해 효율적으로 스케줄을 관리하세요
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

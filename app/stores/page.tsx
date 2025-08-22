'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  HelpCircle,
  ChevronDown,
  Settings,
  PlayCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useTutorial } from '@/components/TutorialProvider'
import { storesTutorialSteps } from '@/lib/tutorial/tutorial-steps'
import { getTutorialTheme, TutorialStorage } from '@/lib/tutorial/tutorial-utils'

// 모듈화된 컴포넌트 및 API import
import StoreDataTable from '@/components/(page)/stores/StoreDataTable'
import StoreFormModal, { StoreFormData } from '@/components/(page)/stores/StoreFormModal'
import {
  getStoresWithDetails,
  getStoreTemplates,
  getStoreEmployees,
  updateStoreSettings,
  deleteStore,
  StoreWithDetails,
  StoreTemplate,
  StoreEmployee
} from '@/lib/api/(page)/stores/stores-api'
import { supabase } from '@/lib/supabase'

// 필터 및 정렬 타입
type SortOption = 'created_at' | 'store_name' | 'employees_count'
type FilterOption = 'all' | 'has_templates' | 'has_employees' | 'active_only'

export default function StoresPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { startTutorial } = useTutorial()
  
  // 상태 관리
  const [stores, setStores] = useState<StoreWithDetails[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreWithDetails | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('created_at')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [error, setError] = useState<string | null>(null)

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadStores()
    }
  }, [user])

  const loadStores = async () => {
    try {
      setLoadingData(true)
      setError(null)
      const data = await getStoresWithDetails(user!.id)
      setStores(data)
    } catch (error) {
      console.error('스토어 로드 중 오류:', error)
      setError('스토어 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoadingData(false)
    }
  }

  const handleFormSubmit = async (formData: StoreFormData) => {
    try {
      if (editingStore) {
        // 수정
        await updateStoreSettings(editingStore.id, formData)
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

      // 데이터 새로고침
      await loadStores()
      setShowFormModal(false)
      setEditingStore(null)
    } catch (error) {
      console.error('스토어 저장 오류:', error)
      throw error
    }
  }

  const handleEditStore = (store: StoreWithDetails) => {
    setEditingStore(store)
    setShowFormModal(true)
  }

  const handleDeleteStore = async (storeId: number) => {
    if (!confirm('정말로 이 스토어를 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.')) return

    try {
      await deleteStore(storeId)
      await loadStores()
    } catch (error) {
      console.error('스토어 삭제 오류:', error)
      alert('스토어 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleViewSchedule = (storeId: number) => {
    router.push(`/schedule/view?store=${storeId}`)
  }

  const handleLoadTemplates = async (storeId: number): Promise<StoreTemplate[]> => {
    try {
      return await getStoreTemplates(storeId)
    } catch (error) {
      console.error('템플릿 로드 오류:', error)
      return []
    }
  }

  const handleLoadEmployees = async (storeId: number): Promise<StoreEmployee[]> => {
    try {
      return await getStoreEmployees(storeId)
    } catch (error) {
      console.error('직원 로드 오류:', error)
      return []
    }
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingStore(null)
  }

  // 튜토리얼 시작
  const handleStartTutorial = () => {
    const theme = getTutorialTheme()
    startTutorial(storesTutorialSteps, theme)
    TutorialStorage.setTutorialCompleted('stores', false) // 다시 볼 수 있도록
  }

  // 필터링 및 정렬
  const filteredAndSortedStores = stores
    .filter(store => {
      switch (filterBy) {
        case 'has_templates':
          return store.templates_count > 0
        case 'has_employees':
          return store.employees_count > 0
        case 'active_only':
          return store.active_employees_count > 0
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'store_name':
          return (a.store_name || '').localeCompare(b.store_name || '')
        case 'employees_count':
          return b.employees_count - a.employees_count
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadStores}>다시 시도</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900" data-tutorial="stores-header">스토어 관리</h1>
          <div className="group relative">
            <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-6 invisible group-hover:visible bg-black text-white text-sm rounded px-2 py-1 whitespace-nowrap z-10">
              스토어별 템플릿과 직원을 드릴다운으로 확인할 수 있습니다
            </div>
          </div>
          
          {/* 튜토리얼 시작 버튼 */}
          <Button
            onClick={handleStartTutorial}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <PlayCircle className="h-4 w-4" />
            튜토리얼 시작
          </Button>
          
          {/* 필터 및 정렬 드롭다운 */}
          <div className="flex gap-2 ml-4" data-tutorial="store-filters">
            <div className="relative">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">생성순</option>
                <option value="store_name">이름순</option>
                <option value="employees_count">직원수순</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="has_templates">템플릿 있음</option>
                <option value="has_employees">직원 있음</option>
                <option value="active_only">활성 직원만</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2"
          data-tutorial="new-store-button"
        >
          <Plus className="h-4 w-4" />
          새 스토어
        </Button>
      </div>

      {/* 스토어 데이터 테이블 */}
      <div data-tutorial="store-table">
        <StoreDataTable
          stores={filteredAndSortedStores}
          onEditStore={handleEditStore}
          onDeleteStore={handleDeleteStore}
          onViewSchedule={handleViewSchedule}
          onLoadTemplates={handleLoadTemplates}
          onLoadEmployees={handleLoadEmployees}
        />
      </div>


      {/* 빈 상태 */}
      {filteredAndSortedStores.length === 0 && (
        <div className="text-center py-12">
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
            <Button onClick={() => setShowFormModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              새 스토어 생성
            </Button>
          )}
        </div>
      )}

      {/* 스토어 폼 모달 */}
      <StoreFormModal
        isOpen={showFormModal}
        editingStore={editingStore}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

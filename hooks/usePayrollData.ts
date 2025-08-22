import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PayrollAPI } from '@/lib/api/(page)/payroll/payroll-api'
import { PayrollCalculator, DateUtils } from '@/lib/utils/payroll-calculator'
import { 
  Store, 
  Employee, 
  WorkSchedule, 
  WeeklyTemplate, 
  StorePayrollData, 
  PayrollTotals,
  PayrollFilters 
} from '@/types/payroll'

export function usePayrollData() {
  const { user } = useAuth()
  
  // 기본 데이터
  const [stores, setStores] = useState<Store[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [templates, setTemplates] = useState<WeeklyTemplate[]>([])
  
  // 튜토리얼
  const [tutorialStep, setTutorialStep] = useState<number>(0)

  // 선택된 스토어 및 템플릿
  const [selectedStores, setSelectedStores] = useState<Set<number>>(new Set())
  const [storeTemplates, setStoreTemplates] = useState<Map<number, WeeklyTemplate>>(new Map())
  
  // 계산된 급여 데이터
  const [storePayrollData, setStorePayrollData] = useState<StorePayrollData[]>([])
  
  // 필터
  const [filters, setFilters] = useState<PayrollFilters>({
    searchTerm: '',
    filterStatus: 'all',
    selectedPeriod: 'current-week'
  })
  
  // UI 상태
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 초기 데이터 로딩
   */
  const loadInitialData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const [storesData, employeesData, templatesData] = await Promise.all([
        PayrollAPI.getStores(user.id),
        PayrollAPI.getEmployees(user.id),
        PayrollAPI.getWeeklyTemplates(user.id)
      ])

      setStores(storesData)
      setEmployees(employeesData)
      setTemplates(templatesData)

      // 스케줄 데이터 로딩
      await loadScheduleData(filters.selectedPeriod)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 기간별 스케줄 데이터 로딩
   */
  const loadScheduleData = async (period: PayrollFilters['selectedPeriod']) => {
    if (!user?.id) return

    try {
      const now = new Date()
      let startDate: Date
      let endDate: Date

      switch (period) {
        case 'current-week':
          startDate = DateUtils.getStartOfWeek(now)
          endDate = DateUtils.getEndOfWeek(now)
          break
        case 'last-week':
          const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          startDate = DateUtils.getStartOfWeek(lastWeek)
          endDate = DateUtils.getEndOfWeek(lastWeek)
          break
        case 'current-month':
          startDate = DateUtils.getStartOfMonth(now)
          endDate = DateUtils.getEndOfMonth(now)
          break
        default:
          startDate = DateUtils.getStartOfWeek(now)
          endDate = DateUtils.getEndOfWeek(now)
      }

      const schedulesData = await PayrollAPI.getSchedules(
        user.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      setSchedules(schedulesData)
    } catch (err: any) {
      setError(err.message)
    }
  }

  /**
   * 스토어별 급여 계산
   */
  const calculateStorePayrolls = () => {
    const newStorePayrollData: StorePayrollData[] = []

    selectedStores.forEach(storeId => {
      const store = stores.find(s => s.id === storeId)
      const template = storeTemplates.get(storeId)
      
      if (!store) return

      const storeEmployees = employees.filter(emp => emp.store_id === storeId)
      const storeSchedules = schedules.filter(sch => sch.store_id === storeId)

      const payrollData = storeEmployees.map(employee => 
        PayrollCalculator.calculateEmployeePayroll(employee, storeSchedules)
      )

      const totals = PayrollCalculator.calculateTotals(payrollData)

      newStorePayrollData.push({
        store,
        template,
        payrollData,
        totals
      })
    })

    setStorePayrollData(newStorePayrollData)
  }

  /**
   * 필터링된 스토어 데이터
   */
  const getFilteredStoreData = () => {
    return storePayrollData.map(storeData => ({
      ...storeData,
      payrollData: storeData.payrollData.filter(data => {
        const matchesSearch = data.employee.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                             data.employee.position.toLowerCase().includes(filters.searchTerm.toLowerCase())
        
        const matchesFilter = filters.filterStatus === 'all' ||
                             (filters.filterStatus === 'holiday-eligible' && data.isEligibleForHolidayPay) ||
                             (filters.filterStatus === 'holiday-not-eligible' && !data.isEligibleForHolidayPay)
        
        return matchesSearch && matchesFilter
      })
    }))
  }

  /**
   * 전체 합계 계산
   */
  const getGrandTotals = (): PayrollTotals => {
    return storePayrollData.reduce((acc, storeData) => ({
      totalEmployees: acc.totalEmployees + storeData.totals.totalEmployees,
      totalHours: acc.totalHours + storeData.totals.totalHours,
      totalRegularPay: acc.totalRegularPay + storeData.totals.totalRegularPay,
      totalOvertimePay: acc.totalOvertimePay + storeData.totals.totalOvertimePay,
      totalNightPay: acc.totalNightPay + storeData.totals.totalNightPay,
      totalHolidayPay: acc.totalHolidayPay + storeData.totals.totalHolidayPay,
      totalPay: acc.totalPay + storeData.totals.totalPay
    }), {
      totalEmployees: 0,
      totalHours: 0,
      totalRegularPay: 0,
      totalOvertimePay: 0,
      totalNightPay: 0,
      totalHolidayPay: 0,
      totalPay: 0
    })
  }

  /**
   * 스토어 선택/해제
   */
  const toggleStore = (storeId: number) => {
    const newSelected = new Set(selectedStores)
    if (newSelected.has(storeId)) {
      newSelected.delete(storeId)
      const newTemplates = new Map(storeTemplates)
      newTemplates.delete(storeId)
      setStoreTemplates(newTemplates)
    } else {
      newSelected.add(storeId)
    }
    setSelectedStores(newSelected)
  }

  /**
   * 전체 스토어 선택/해제
   */
  const toggleAllStores = () => {
    if (selectedStores.size === stores.length) {
      setSelectedStores(new Set())
      setStoreTemplates(new Map())
    } else {
      setSelectedStores(new Set(stores.map(store => store.id)))
    }
  }

  /**
   * 템플릿 선택
   */
  const selectTemplate = (storeId: number, templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId))
    if (template) {
      const newTemplates = new Map(storeTemplates)
      newTemplates.set(storeId, template)
      setStoreTemplates(newTemplates)
    }
  }

  /**
   * 필터 업데이트
   */
  const updateFilters = (newFilters: Partial<PayrollFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  /**
   * 기간 변경 시 스케줄 재로딩
   */
  const changePeriod = async (period: PayrollFilters['selectedPeriod']) => {
    updateFilters({ selectedPeriod: period })
    await loadScheduleData(period)
  }

  // 초기 데이터 로딩
  useEffect(() => {
    if (user) {
      loadInitialData()
    }
  }, [user])

  // 스토어 선택 변경 시 급여 계산
  useEffect(() => {
    if (selectedStores.size > 0) {
      calculateStorePayrolls()
    }
  }, [selectedStores, storeTemplates, schedules, employees])

  // 기간 변경 시 스케줄 재로딩
  useEffect(() => {
    if (user) {
      loadScheduleData(filters.selectedPeriod)
    }
  }, [filters.selectedPeriod])

  return {
    // 데이터
    stores,
    employees,
    schedules,
    templates,
    storePayrollData,
    
    // 선택 상태
    selectedStores,
    storeTemplates,
    
    // 필터
    filters,
    
    // UI 상태
    loading,
    error,
    
    // 계산된 데이터
    filteredStoreData: getFilteredStoreData(),
    grandTotals: getGrandTotals(),
    
    // 액션
    toggleStore,
    toggleAllStores,
    selectTemplate,
    updateFilters,
    changePeriod,
    refreshData: loadInitialData
  }
}

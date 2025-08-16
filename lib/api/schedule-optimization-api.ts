// 스케줄 최적화 API
// Supabase와 연동하여 스케줄 데이터를 가져오고 최적화 분석을 수행

import { createClient } from '@supabase/supabase-js'
import { 
  optimizeSchedule, 
  calculateCurrentCost,
  type Employee, 
  type Schedule, 
  type OptimizationResult 
} from '../schedule-optimizer-2025'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * 직원 데이터를 가져옵니다
 */
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, hourly_wage, position, skills')
      .eq('status', 'active')

    if (error) throw error

    return data.map(emp => ({
      id: emp.id,
      name: emp.name,
      hourlyWage: emp.hourly_wage || 10030, // 기본값: 최저시급
      position: emp.position || '직원',
      skills: emp.skills || []
    }))
  } catch (error) {
    console.error('직원 데이터 조회 실패:', error)
    throw new Error('직원 데이터를 불러올 수 없습니다.')
  }
}

/**
 * 스케줄 데이터를 가져옵니다 (최근 4주)
 */
export async function fetchSchedules(storeId?: string): Promise<Schedule[]> {
  try {
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    let query = supabase
      .from('work_schedules')
      .select(`
        id,
        employee_id,
        date,
        start_time,
        end_time,
        break_time,
        is_holiday,
        employees!inner(name, status)
      `)
      .gte('date', fourWeeksAgo.toISOString().split('T')[0])
      .eq('employees.status', 'active')

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(schedule => ({
      employeeId: schedule.employee_id,
      date: schedule.date,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      breakTime: schedule.break_time || 60, // 기본 휴게시간 60분
      isHoliday: schedule.is_holiday || false
    }))
  } catch (error) {
    console.error('스케줄 데이터 조회 실패:', error)
    throw new Error('스케줄 데이터를 불러올 수 없습니다.')
  }
}

/**
 * 스토어 목록을 가져옵니다
 */
export async function fetchStores() {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, address')
      .eq('status', 'active')

    if (error) throw error
    return data
  } catch (error) {
    console.error('스토어 데이터 조회 실패:', error)
    throw new Error('스토어 데이터를 불러올 수 없습니다.')
  }
}

/**
 * 스케줄 최적화 분석을 수행합니다
 */
export async function performOptimizationAnalysis(storeId?: string): Promise<OptimizationResult> {
  try {
    const [employees, schedules] = await Promise.all([
      fetchEmployees(),
      fetchSchedules(storeId)
    ])

    if (employees.length === 0) {
      throw new Error('분석할 직원 데이터가 없습니다.')
    }

    if (schedules.length === 0) {
      throw new Error('분석할 스케줄 데이터가 없습니다.')
    }

    const optimizationResult = optimizeSchedule(employees, schedules)
    
    // 최적화 결과를 DB에 저장 (선택사항)
    await saveOptimizationResult(optimizationResult, storeId)
    
    return optimizationResult
  } catch (error) {
    console.error('최적화 분석 실패:', error)
    throw error
  }
}

/**
 * 현재 비용만 계산합니다 (빠른 조회용)
 */
export async function calculateCurrentScheduleCost(storeId?: string): Promise<{
  totalCost: number
  employeeCount: number
  scheduleCount: number
}> {
  try {
    const [employees, schedules] = await Promise.all([
      fetchEmployees(),
      fetchSchedules(storeId)
    ])

    const { totalCost } = calculateCurrentCost(employees, schedules)
    
    return {
      totalCost,
      employeeCount: employees.length,
      scheduleCount: schedules.length
    }
  } catch (error) {
    console.error('비용 계산 실패:', error)
    throw error
  }
}

/**
 * 최적화 결과를 DB에 저장합니다
 */
async function saveOptimizationResult(result: OptimizationResult, storeId?: string) {
  try {
    const { error } = await supabase
      .from('optimization_results')
      .insert({
        store_id: storeId,
        analysis_date: new Date().toISOString(),
        current_cost: result.currentTotalCost,
        optimized_cost: result.optimizedTotalCost,
        total_savings: result.totalSavings,
        savings_percentage: result.totalSavingsPercentage,
        suggestion_count: result.suggestions.length,
        risk_level: result.riskAssessment.overallRisk,
        compliance_score: result.riskAssessment.complianceScore,
        suggestions: result.suggestions,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('최적화 결과 저장 실패:', error)
      // 저장 실패해도 분석 결과는 반환
    }
  } catch (error) {
    console.error('최적화 결과 저장 중 오류:', error)
  }
}

/**
 * 과거 최적화 결과를 조회합니다
 */
export async function fetchOptimizationHistory(storeId?: string, limit: number = 10) {
  try {
    let query = supabase
      .from('optimization_results')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(limit)

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('최적화 이력 조회 실패:', error)
    return []
  }
}

/**
 * 특정 직원의 스케줄 최적화 제안을 조회합니다
 */
export async function getEmployeeOptimizationSuggestions(employeeId: string, storeId?: string) {
  try {
    const [employees, schedules] = await Promise.all([
      fetchEmployees(),
      fetchSchedules(storeId)
    ])

    const targetEmployee = employees.find(emp => emp.id === employeeId)
    if (!targetEmployee) {
      throw new Error('해당 직원을 찾을 수 없습니다.')
    }

    const employeeSchedules = schedules.filter(schedule => schedule.employeeId === employeeId)
    
    const optimizationResult = optimizeSchedule([targetEmployee], employeeSchedules)
    
    return {
      employee: targetEmployee,
      suggestions: optimizationResult.suggestions,
      currentCost: optimizationResult.currentTotalCost,
      optimizedCost: optimizationResult.optimizedTotalCost,
      savings: optimizationResult.totalSavings
    }
  } catch (error) {
    console.error('직원별 최적화 제안 조회 실패:', error)
    throw error
  }
}

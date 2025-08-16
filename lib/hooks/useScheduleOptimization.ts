// 스케줄 최적화 Hook
// 최적화 분석 및 데이터 관리를 위한 커스텀 Hook

import { useState, useEffect, useCallback } from 'react'
import { 
  performOptimizationAnalysis,
  calculateCurrentScheduleCost,
  fetchOptimizationHistory,
  getEmployeeOptimizationSuggestions,
  fetchStores
} from '../api/schedule-optimization-api'
import type { OptimizationResult } from '../schedule-optimizer-2025'

interface UseScheduleOptimizationProps {
  storeId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useScheduleOptimization({
  storeId,
  autoRefresh = false,
  refreshInterval = 300000 // 5분
}: UseScheduleOptimizationProps = {}) {
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [currentCost, setCurrentCost] = useState<{
    totalCost: number
    employeeCount: number
    scheduleCount: number
  } | null>(null)
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 현재 비용 조회
  const loadCurrentCost = useCallback(async () => {
    try {
      setError(null)
      const cost = await calculateCurrentScheduleCost(storeId)
      setCurrentCost(cost)
    } catch (err) {
      console.error('현재 비용 조회 실패:', err)
      setError(err instanceof Error ? err.message : '비용 조회에 실패했습니다.')
    }
  }, [storeId])

  // 최적화 분석 수행
  const performAnalysis = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await performOptimizationAnalysis(storeId)
      setOptimizationResult(result)
      
      // 현재 비용도 함께 업데이트
      await loadCurrentCost()
      
      return result
    } catch (err) {
      console.error('최적화 분석 실패:', err)
      const errorMessage = err instanceof Error ? err.message : '최적화 분석에 실패했습니다.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [storeId, loadCurrentCost])

  // 최적화 이력 조회
  const loadOptimizationHistory = useCallback(async (limit: number = 10) => {
    try {
      const history = await fetchOptimizationHistory(storeId, limit)
      setOptimizationHistory(history)
    } catch (err) {
      console.error('최적화 이력 조회 실패:', err)
    }
  }, [storeId])

  // 스토어 목록 조회
  const loadStores = useCallback(async () => {
    try {
      const storeList = await fetchStores()
      setStores(storeList)
    } catch (err) {
      console.error('스토어 목록 조회 실패:', err)
    }
  }, [])

  // 특정 직원의 최적화 제안 조회
  const getEmployeeSuggestions = useCallback(async (employeeId: string) => {
    try {
      setLoading(true)
      const suggestions = await getEmployeeOptimizationSuggestions(employeeId, storeId)
      return suggestions
    } catch (err) {
      console.error('직원별 최적화 제안 조회 실패:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [storeId])

  // 초기 데이터 로드
  useEffect(() => {
    loadCurrentCost()
    loadOptimizationHistory()
    loadStores()
  }, [loadCurrentCost, loadOptimizationHistory, loadStores])

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadCurrentCost()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadCurrentCost])

  // 최적화 제안 필터링 및 정렬 유틸리티
  const getFilteredSuggestions = useCallback((
    type?: string,
    riskLevel?: string,
    minSavings?: number
  ) => {
    if (!optimizationResult) return []

    let filtered = optimizationResult.suggestions

    if (type) {
      filtered = filtered.filter(s => s.type === type)
    }

    if (riskLevel) {
      filtered = filtered.filter(s => s.riskLevel === riskLevel)
    }

    if (minSavings) {
      filtered = filtered.filter(s => s.savings >= minSavings)
    }

    return filtered.sort((a, b) => b.savings - a.savings)
  }, [optimizationResult])

  // 최적화 통계 계산
  const getOptimizationStats = useCallback(() => {
    if (!optimizationResult) return null

    const suggestions = optimizationResult.suggestions
    const totalSuggestions = suggestions.length
    const highRiskCount = suggestions.filter(s => s.riskLevel === 'HIGH').length
    const mediumRiskCount = suggestions.filter(s => s.riskLevel === 'MEDIUM').length
    const lowRiskCount = suggestions.filter(s => s.riskLevel === 'LOW').length

    const typeStats = suggestions.reduce((acc, suggestion) => {
      acc[suggestion.type] = (acc[suggestion.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalSuggestions,
      riskDistribution: {
        high: highRiskCount,
        medium: mediumRiskCount,
        low: lowRiskCount
      },
      typeDistribution: typeStats,
      averageSavings: suggestions.length > 0 
        ? suggestions.reduce((sum, s) => sum + s.savings, 0) / suggestions.length 
        : 0,
      maxSavings: Math.max(...suggestions.map(s => s.savings), 0),
      complianceRate: optimizationResult.riskAssessment.complianceScore
    }
  }, [optimizationResult])

  return {
    // 데이터
    optimizationResult,
    currentCost,
    optimizationHistory,
    stores,
    
    // 상태
    loading,
    error,
    
    // 액션
    performAnalysis,
    loadCurrentCost,
    loadOptimizationHistory,
    getEmployeeSuggestions,
    
    // 유틸리티
    getFilteredSuggestions,
    getOptimizationStats,
    
    // 편의 함수
    refresh: () => {
      loadCurrentCost()
      loadOptimizationHistory()
    },
    
    clearError: () => setError(null),
    
    hasData: optimizationResult !== null,
    hasSuggestions: (optimizationResult?.suggestions?.length ?? 0) > 0,
    
    // 요약 정보
    summary: optimizationResult ? {
      totalSavings: optimizationResult.totalSavings,
      savingsPercentage: optimizationResult.totalSavingsPercentage,
      suggestionCount: optimizationResult.suggestions.length,
      riskLevel: optimizationResult.riskAssessment.overallRisk,
      complianceScore: optimizationResult.riskAssessment.complianceScore
    } : null
  }
}

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingDown, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Calendar,
  Moon,
  Sun,
  Target,
  BarChart3,
  Lightbulb,
  Shield,
  RefreshCw,
  Download,
  Filter,
  TrendingUp,
  Calculator,
  Loader2
} from 'lucide-react'
import { useScheduleOptimization } from '@/lib/hooks/useScheduleOptimization'
import type { OptimizationSuggestion } from '@/lib/schedule-optimizer-2025'

interface OptimizationSuggestionProps {
  storeId?: string
}

export function OptimizationSuggestionComponent({ storeId }: OptimizationSuggestionProps) {
  const {
    optimizationResult,
    currentCost,
    loading,
    error,
    performAnalysis,
    getFilteredSuggestions,
    getOptimizationStats,
    summary
  } = useScheduleOptimization({ storeId })

  const [selectedSuggestionType, setSelectedSuggestionType] = useState<string>('ALL')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL')
  const [minSavings, setMinSavings] = useState<number>(0)

  // 컴포넌트 마운트 시 분석 수행
  useEffect(() => {
    if (!optimizationResult && !loading) {
      performAnalysis()
    }
  }, [optimizationResult, loading, performAnalysis])

  // 필터링된 제안 가져오기
  const filteredSuggestions = getFilteredSuggestions(
    selectedSuggestionType === 'ALL' ? undefined : selectedSuggestionType,
    selectedRiskLevel === 'ALL' ? undefined : selectedRiskLevel,
    minSavings || undefined
  )

  // 통계 정보
  const stats = getOptimizationStats()

  // 제안 유형별 아이콘
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'REDUCE_HOURS':
        return <Clock className="h-4 w-4" />
      case 'SPLIT_SHIFT':
        return <Calendar className="h-4 w-4" />
      case 'AVOID_NIGHT':
        return <Moon className="h-4 w-4" />
      case 'REDISTRIBUTE_WORKLOAD':
        return <Users className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  // 리스크 레벨별 색상
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return 'destructive'
      case 'MEDIUM':
        return 'secondary'
      case 'LOW':
        return 'default'
      default:
        return 'default'
    }
  }

  // 제안 유형별 한국어 이름
  const getSuggestionTypeName = (type: string) => {
    switch (type) {
      case 'REDUCE_HOURS':
        return '근무시간 단축'
      case 'SPLIT_SHIFT':
        return '시프트 분할'
      case 'AVOID_NIGHT':
        return '야간근무 조정'
      case 'REDISTRIBUTE_WORKLOAD':
        return '업무 재분배'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>스케줄 최적화 분석 중...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={() => performAnalysis()}
          >
            다시 시도
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!optimizationResult) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground mb-4">최적화 분석 데이터가 없습니다.</p>
          <Button onClick={() => performAnalysis()}>
            <BarChart3 className="h-4 w-4 mr-2" />
            분석 시작
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">현재 비용</p>
                <p className="text-2xl font-bold">
                  ₩{optimizationResult.currentTotalCost.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">예상 절약</p>
                <p className="text-2xl font-bold text-green-600">
                  ₩{optimizationResult.totalSavings.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">절약률</p>
                <p className="text-2xl font-bold text-blue-600">
                  {optimizationResult.totalSavingsPercentage.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">제안 수</p>
                <p className="text-2xl font-bold">
                  {optimizationResult.suggestions.length}개
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 리스크 평가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            리스크 평가
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant={getRiskColor(optimizationResult.riskAssessment.overallRisk)}>
                {optimizationResult.riskAssessment.overallRisk}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">전체 리스크</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {optimizationResult.riskAssessment.complianceScore.toFixed(0)}%
              </p>
              <p className="text-sm text-muted-foreground">법적 준수율</p>
            </div>
            <div className="text-center">
              <p className="text-sm">{optimizationResult.riskAssessment.operationalImpact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 필터 및 제안 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              최적화 제안
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => performAnalysis()}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 필터 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">제안 유형</label>
              <select 
                className="ml-2 border rounded px-2 py-1"
                value={selectedSuggestionType}
                onChange={(e) => setSelectedSuggestionType(e.target.value)}
              >
                <option value="ALL">전체</option>
                <option value="REDUCE_HOURS">근무시간 단축</option>
                <option value="SPLIT_SHIFT">시프트 분할</option>
                <option value="AVOID_NIGHT">야간근무 조정</option>
                <option value="REDISTRIBUTE_WORKLOAD">업무 재분배</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">리스크 레벨</label>
              <select 
                className="ml-2 border rounded px-2 py-1"
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
              >
                <option value="ALL">전체</option>
                <option value="LOW">낮음</option>
                <option value="MEDIUM">보통</option>
                <option value="HIGH">높음</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">최소 절약액</label>
              <input 
                type="number" 
                className="ml-2 border rounded px-2 py-1 w-24"
                value={minSavings}
                onChange={(e) => setMinSavings(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* 제안 목록 */}
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSuggestionIcon(suggestion.type)}
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge variant={getRiskColor(suggestion.riskLevel)}>
                          {suggestion.riskLevel}
                        </Badge>
                        <Badge variant="outline">
                          {getSuggestionTypeName(suggestion.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">현재 비용</p>
                          <p className="font-medium">₩{suggestion.currentCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">최적화 비용</p>
                          <p className="font-medium">₩{suggestion.optimizedCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">절약액</p>
                          <p className="font-medium text-green-600">₩{suggestion.savings.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">절약률</p>
                          <p className="font-medium text-blue-600">{suggestion.savingsPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm">
                          <span className="font-medium">구현 방법:</span> {suggestion.implementation}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">영향받는 직원:</span> {suggestion.affectedEmployees.length}명
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        상세보기
                      </Button>
                      <Button size="sm" variant="default">
                        적용하기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuggestions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">필터 조건에 맞는 제안이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              최적화 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.riskDistribution.high}</p>
                <p className="text-sm text-muted-foreground">고위험 제안</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.riskDistribution.medium}</p>
                <p className="text-sm text-muted-foreground">중위험 제안</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.riskDistribution.low}</p>
                <p className="text-sm text-muted-foreground">저위험 제안</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">₩{stats.averageSavings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">평균 절약액</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

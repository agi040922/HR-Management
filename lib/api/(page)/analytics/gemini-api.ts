// Gemini AI 분석 API
import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface PayrollAnalysisData {
  employeeData: {
    name: string
    hourlyWage: number
    weeklyHours: number
    position?: string
  }[]
  payrollCalculations: {
    grossSalary: number
    netSalary: number
    employerCost: number
    totalWorkingHours: number
    holidayHours: number
  }[]
  exceptions: {
    id: number
    employee_id?: number
    date: string
    exception_type: 'CANCEL' | 'OVERRIDE' | 'EXTRA'
    start_time?: string
    end_time?: string
    notes?: string
  }[]
  scheduleTemplate: any
  currentDate: string
}

export interface AnalysisResult {
  summary: {
    totalPayrollCost: number
    employeeCount: number
    efficiencyScore: number
    complianceRate: number
    keyInsights: string[]
  }
  recommendations: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: 'cost' | 'schedule' | 'compliance' | 'efficiency'
    expectedSavings?: number
    implementationTime?: string
  }[]
  insights: {
    title: string
    description: string
    metrics?: {
      label: string
      value: string
      change?: string
    }[]
  }[]
  actionPlan: {
    title: string
    description: string
    timeline: string
    responsible: string
    estimatedCost?: number
    steps?: string[]
  }[]
}

/**
 * Gemini AI를 사용하여 급여 및 스케줄 데이터를 분석
 */
export async function analyzePayrollAndSchedule(data: PayrollAnalysisData): Promise<AnalysisResult> {
  try {
    console.log('🔧 Gemini API 초기화 중...')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    console.log('✅ Gemini 모델 로드 완료')
    
    const prompt = `
당신은 한국의 노동법과 급여 계산에 전문적인 지식을 가진 HR 분석 전문가입니다.
다음 데이터를 분석하여 급여 최적화, 스케줄 효율성, 법적 준수사항, 비용 분석에 대한 종합적인 분석 결과를 제공해주세요.

## 분석 데이터:

### 직원 정보:
${JSON.stringify(data.employeeData, null, 2)}

### 급여 계산 결과:
${JSON.stringify(data.payrollCalculations, null, 2)}

### 예외사항 (이번 주):
${JSON.stringify(data.exceptions, null, 2)}

### 스케줄 템플릿:
${JSON.stringify(data.scheduleTemplate, null, 2)}

### 현재 날짜: ${data.currentDate}

## 분석 요청사항:

1. **급여 최적화**: 현재 급여 구조에서 개선할 수 있는 부분
2. **스케줄 효율성**: 근무 스케줄의 효율성과 개선 방안
3. **법적 준수사항**: 한국 노동법 기준으로 준수해야 할 사항들
4. **비용 분석**: 사업주 입장에서의 비용 최적화 방안

## 응답 형식:
다음 JSON 형식으로 응답해주세요:

{
  "summary": {
    "totalPayrollCost": 총급여비용숫자,
    "employeeCount": 직원수숫자,
    "efficiencyScore": 효율성점수숫자,
    "complianceRate": 준수율숫자,
    "keyInsights": ["인사이트1", "인사이트2", "인사이트3"]
  },
  "recommendations": [
    {
      "title": "추천사항 제목",
      "description": "상세 설명",
      "priority": "high|medium|low",
      "category": "cost|schedule|compliance|efficiency",
      "expectedSavings": 예상절약금액숫자,
      "implementationTime": "구현기간"
    }
  ],
  "insights": [
    {
      "title": "분석 제목",
      "description": "분석 설명",
      "metrics": [
        {
          "label": "지표명",
          "value": "지표값",
          "change": "+5%"
        }
      ]
    }
  ],
  "actionPlan": [
    {
      "title": "실행계획 제목",
      "description": "실행계획 설명",
      "timeline": "실행기간",
      "responsible": "담당자",
      "estimatedCost": 예상비용숫자,
      "steps": ["단계1", "단계2"]
    }
  ]
}

특히 다음 사항들을 중점적으로 분석해주세요:
- 2025년 최저시급 10,030원 기준 준수 여부
- 주휴수당 계산의 적정성 (주 15시간 이상 근무 시)
- 4대보험료 계산의 정확성
- 야간근무수당 및 연장근무수당의 적정성
- 예외사항으로 인한 급여 변동 영향
- 스케줄 최적화를 통한 비용 절감 방안
`

    console.log('📤 Gemini API 요청 전송 중...')
    const response = await model.generateContent(prompt)
    console.log('📥 Gemini API 응답 수신 완료')
    
    const result = response.response.text()
    console.log('📝 원본 응답:', result.substring(0, 200) + '...')
    
    // JSON 파싱
    console.log('🔄 JSON 파싱 시작...')
    const cleanedResult = result.replace(/```json\n?|```\n?/g, '').trim()
    console.log('🧹 정리된 JSON:', cleanedResult.substring(0, 200) + '...')
    
    const parsedResult = JSON.parse(cleanedResult)
    console.log('✅ JSON 파싱 완료:', parsedResult)
    
    const finalResult = {
      summary: parsedResult.summary || {
        totalPayrollCost: 0,
        employeeCount: 0,
        efficiencyScore: 0,
        complianceRate: 0,
        keyInsights: ['분석 결과를 가져올 수 없습니다.']
      },
      recommendations: parsedResult.recommendations || [],
      insights: parsedResult.insights || [],
      actionPlan: parsedResult.actionPlan || []
    }
    
    console.log('🎯 최종 분석 결과:', finalResult)
    return finalResult
  } catch (error) {
    console.error('❌ Gemini API 오류:', error)
    console.error('❌ 오류 상세:', {
      message: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : null,
      type: typeof error
    })
    throw new Error(`AI 분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

/**
 * 급여 최적화 제안을 위한 간단한 분석
 */
export async function getPayrollOptimizationSuggestions(
  weeklyHours: number,
  hourlyWage: number,
  employeeCount: number
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
한국의 노동법 전문가로서 다음 조건에 대한 급여 최적화 제안을 해주세요:

- 주간 근무시간: ${weeklyHours}시간
- 시급: ${hourlyWage}원
- 직원 수: ${employeeCount}명
- 2025년 최저시급: 10,030원

3-5개의 구체적인 최적화 제안을 배열 형태로 응답해주세요.
예: ["제안1", "제안2", "제안3"]
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    try {
      return JSON.parse(response)
    } catch {
      // JSON 파싱 실패 시 텍스트를 배열로 변환
      return response.split('\n').filter(line => line.trim().length > 0).slice(0, 5)
    }
  } catch (error) {
    console.error('급여 최적화 제안 오류:', error)
    return [
      '주휴수당 대상 여부 재검토 (주 15시간 이상 근무 시)',
      '야간근무 및 연장근무 스케줄 최적화',
      '4대보험료 절감을 위한 급여 구조 조정',
      '파트타임과 풀타임 직원 비율 최적화',
      '법정 근로시간 준수를 통한 추가 비용 방지'
    ]
  }
}

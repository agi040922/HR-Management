'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  DollarSign, 
  Users, 
  Store,
  TrendingUp,
  FileText,
  Download
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  calculateMonthlySalary,
  calculateInsurance,
  calculateIncomeTax,
  calculateNetSalary,
  calculateEmployerCost,
  getPayrollExamples,
  type MonthlySalaryResult,
  type InsuranceResult,
  type NetSalaryResult,
  type EmployerCostResult
} from '@/lib/payroll-calculator-new'

interface StoreData {
  id: number
  owner_id: string
  open_time: string
  close_time: string
}

interface EmployeeData {
  id: number
  store_id?: number
  name: string
  hourly_wage: number
  position?: string
  is_active: boolean
}

interface PayrollCalculation {
  employee: EmployeeData
  store: StoreData | undefined
  weeklyHours: number
  monthlyHours: number
  monthlySalaryResult: MonthlySalaryResult
  insuranceResult: InsuranceResult
  taxResult: { incomeTax: number; localTax: number }
  netSalaryResult: NetSalaryResult
  employerCostResult: EmployerCostResult
}

export default function PayrollPage() {
  const { user, loading } = useAuth()
  const [stores, setStores] = useState<StoreData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedStore, setSelectedStore] = useState<number | 'all'>('all')
  const [workHoursType, setWorkHoursType] = useState<'20' | '40'>('40')
  const [payrollResults, setPayrollResults] = useState<PayrollCalculation[]>([])
  const [calculating, setCalculating] = useState(false)

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoadingData(true)

      // 스토어 데이터 로드
      const { data: storesData, error: storesError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (storesError) {
        console.error('스토어 로드 오류:', storesError)
        alert('스토어 데이터를 불러오는데 실패했습니다')
      } else {
        setStores(storesData || [])
      }

      // 직원 데이터 로드
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (employeesError) {
        console.error('직원 로드 오류:', employeesError)
        alert('직원 데이터를 불러오는데 실패했습니다')
      } else {
        setEmployees(employeesData || [])
      }

    } catch (error) {
      console.error('데이터 로드 중 예외:', error)
      alert('예상치 못한 오류가 발생했습니다')
    } finally {
      setLoadingData(false)
    }
  }

  const calculatePayroll = async () => {
    try {
      setCalculating(true)
      
      const filteredEmployees = selectedStore === 'all' 
        ? employees 
        : employees.filter(emp => emp.store_id === selectedStore)

      if (filteredEmployees.length === 0) {
        alert('급여를 계산할 직원이 없습니다')
        return
      }

      const results: PayrollCalculation[] = []

      for (const employee of filteredEmployees) {
        const store = stores.find(s => s.id === employee.store_id)
        
        // 근무시간 계산 (주당 20시간 또는 40시간)
        const weeklyHours = parseInt(workHoursType)
        const monthlyHours = weeklyHours * 4.33 // 월평균 주수

        // 월 총급여 계산
        const monthlySalaryResult = calculateMonthlySalary(weeklyHours, employee.hourly_wage)

        // 4대보험 계산
        const insuranceResult = calculateInsurance(monthlySalaryResult.grossSalary)

        // 소득세 계산
        const taxResult = calculateIncomeTax(monthlySalaryResult.grossSalary)

        // 실수령액 계산
        const netSalaryResult = calculateNetSalary(monthlySalaryResult.grossSalary)

        // 사업주 부담 비용 계산
        const employerCostResult = calculateEmployerCost(monthlySalaryResult.grossSalary)

        results.push({
          employee,
          store,
          weeklyHours,
          monthlyHours,
          monthlySalaryResult,
          insuranceResult,
          taxResult,
          netSalaryResult,
          employerCostResult
        })
      }

      setPayrollResults(results)
      alert(`${results.length}명의 급여가 계산되었습니다`)

    } catch (error) {
      console.error('급여 계산 중 오류:', error)
      alert('급여 계산 중 오류가 발생했습니다')
    } finally {
      setCalculating(false)
    }
  }

  const getTotalSummary = () => {
    if (payrollResults.length === 0) return null

    const totalGross = payrollResults.reduce((sum, result) => sum + result.monthlySalaryResult.grossSalary, 0)
    const totalNet = payrollResults.reduce((sum, result) => sum + result.netSalaryResult.netSalary, 0)
    const totalEmployerCost = payrollResults.reduce((sum, result) => sum + result.employerCostResult.totalCost, 0)
    const totalInsurance = payrollResults.reduce((sum, result) => sum + result.insuranceResult.employee.total, 0)
    const totalTax = payrollResults.reduce((sum, result) => sum + result.taxResult.incomeTax + result.taxResult.localTax, 0)

    return {
      totalGross,
      totalNet,
      totalEmployerCost,
      totalInsurance,
      totalTax,
      employeeCount: payrollResults.length
    }
  }

  const exportPayrollData = () => {
    if (payrollResults.length === 0) {
      alert('내보낼 급여 데이터가 없습니다')
      return
    }

    const csvData = [
      ['직원명', '스토어', '시급', '주당근무시간', '월근무시간', '세전급여', '4대보험', '소득세', '지방세', '실수령액', '사업주부담'],
      ...payrollResults.map(result => [
        result.employee.name,
        result.store ? `스토어 #${result.store.id}` : '미지정',
        result.employee.hourly_wage.toLocaleString(),
        result.weeklyHours,
        Math.round(result.monthlyHours),
        result.monthlySalaryResult.grossSalary.toLocaleString(),
        result.insuranceResult.employee.total.toLocaleString(),
        result.taxResult.incomeTax.toLocaleString(),
        result.taxResult.localTax.toLocaleString(),
        result.netSalaryResult.netSalary.toLocaleString(),
        result.employerCostResult.totalCost.toLocaleString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `급여계산_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('급여 데이터가 CSV 파일로 내보내졌습니다')
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">급여 계산 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const summary = getTotalSummary()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">급여 계산</h1>
          <p className="text-gray-600">직원들의 급여를 정확하게 계산하고 관리하세요</p>
        </div>
        {payrollResults.length > 0 && (
          <Button 
            onClick={exportPayrollData}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>CSV 내보내기</span>
          </Button>
        )}
      </div>

      {/* 직원이 없는 경우 안내 */}
      {employees.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 직원이 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              급여를 계산하려면 먼저 직원을 등록해주세요
            </p>
            <Button asChild>
              <a href="/test/comprehensive/employees">직원 관리로 이동</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {employees.length > 0 && (
        <>
          {/* 계산 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>급여 계산 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="store-filter">스토어 선택</Label>
                  <Select value={selectedStore.toString()} onValueChange={(value) => setSelectedStore(value === 'all' ? 'all' : parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 스토어</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          스토어 #{store.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="work-hours">주당 근무시간</Label>
                  <Select value={workHoursType} onValueChange={(value: '20' | '40') => setWorkHoursType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20시간 (파트타임)</SelectItem>
                      <SelectItem value="40">40시간 (풀타임)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button 
                    onClick={calculatePayroll} 
                    disabled={calculating}
                    className="w-full flex items-center space-x-2"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>{calculating ? '계산 중...' : '급여 계산'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계산 결과 요약 */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>급여 계산 요약</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{summary.employeeCount}</p>
                    <p className="text-sm text-gray-600">총 직원 수</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{summary.totalGross.toLocaleString()}원</p>
                    <p className="text-sm text-gray-600">총 세전급여</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{summary.totalNet.toLocaleString()}원</p>
                    <p className="text-sm text-gray-600">총 실수령액</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{(summary.totalInsurance + summary.totalTax).toLocaleString()}원</p>
                    <p className="text-sm text-gray-600">총 공제액</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{summary.totalEmployerCost.toLocaleString()}원</p>
                    <p className="text-sm text-gray-600">사업주 부담</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 급여 계산 결과 */}
          {payrollResults.length > 0 && (
            <Tabs defaultValue="detailed">
              <TabsList>
                <TabsTrigger value="detailed">상세 내역</TabsTrigger>
                <TabsTrigger value="summary">요약 보기</TabsTrigger>
              </TabsList>

              <TabsContent value="detailed" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {payrollResults.map((result, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>{result.employee.name}</span>
                          </div>
                          <Badge variant="outline">
                            {result.store ? `스토어 #${result.store.id}` : '미지정'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 기본 정보 */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">시급</p>
                            <p className="font-medium">{result.employee.hourly_wage.toLocaleString()}원</p>
                          </div>
                          <div>
                            <p className="text-gray-600">월 근무시간</p>
                            <p className="font-medium">{Math.round(result.monthlyHours)}시간</p>
                          </div>
                        </div>

                        <Separator />

                        {/* 급여 정보 */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">세전 급여</span>
                            <span className="font-medium text-green-600">{result.monthlySalaryResult.grossSalary.toLocaleString()}원</span>
                          </div>
                          
                          <div className="text-sm text-gray-600 pl-4">
                            <div className="flex justify-between">
                              <span>국민연금</span>
                              <span>-{result.insuranceResult.employee.nationalPension.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>건강보험</span>
                              <span>-{result.insuranceResult.employee.healthInsurance.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>고용보험</span>
                              <span>-{result.insuranceResult.employee.employment.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>소득세</span>
                              <span>-{result.taxResult.incomeTax.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>지방소득세</span>
                              <span>-{result.taxResult.localTax.toLocaleString()}원</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-between font-medium">
                            <span>실수령액</span>
                            <span className="text-blue-600">{result.netSalaryResult.netSalary.toLocaleString()}원</span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">사업주 부담</span>
                            <span className="text-purple-600">{result.employerCostResult.totalCost.toLocaleString()}원</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>급여 계산 요약표</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">직원명</th>
                            <th className="text-left p-2">스토어</th>
                            <th className="text-right p-2">시급</th>
                            <th className="text-right p-2">월근무시간</th>
                            <th className="text-right p-2">세전급여</th>
                            <th className="text-right p-2">공제액</th>
                            <th className="text-right p-2">실수령액</th>
                            <th className="text-right p-2">사업주부담</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrollResults.map((result, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{result.employee.name}</td>
                              <td className="p-2">{result.store ? `스토어 #${result.store.id}` : '미지정'}</td>
                              <td className="p-2 text-right">{result.employee.hourly_wage.toLocaleString()}</td>
                              <td className="p-2 text-right">{Math.round(result.monthlyHours)}</td>
                              <td className="p-2 text-right text-green-600">{result.monthlySalaryResult.grossSalary.toLocaleString()}</td>
                              <td className="p-2 text-right text-red-600">
                                {(result.insuranceResult.employee.total + result.taxResult.incomeTax + result.taxResult.localTax).toLocaleString()}
                              </td>
                              <td className="p-2 text-right text-blue-600 font-medium">{result.netSalaryResult.netSalary.toLocaleString()}</td>
                              <td className="p-2 text-right text-purple-600">{result.employerCostResult.totalCost.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 font-medium">
                          <tr>
                            <td className="p-2" colSpan={4}>합계</td>
                            <td className="p-2 text-right text-green-600">{summary?.totalGross.toLocaleString()}</td>
                            <td className="p-2 text-right text-red-600">
                              {((summary?.totalInsurance || 0) + (summary?.totalTax || 0)).toLocaleString()}
                            </td>
                            <td className="p-2 text-right text-blue-600">{summary?.totalNet.toLocaleString()}</td>
                            <td className="p-2 text-right text-purple-600">{summary?.totalEmployerCost.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {/* 급여 계산 예시 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>급여 계산 기준 (2025년)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">기본 정보</h4>
              <div className="space-y-1 text-sm">
                <p>• 최저시급: 10,030원</p>
                <p>• 주 40시간 기준 월급: 1,740,520원</p>
                <p>• 주 20시간 기준 월급: 870,260원</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">4대보험 요율</h4>
              <div className="space-y-1 text-sm">
                <p>• 국민연금: 4.5% (근로자/사업주 각각)</p>
                <p>• 건강보험: 3.545% (근로자/사업주 각각)</p>
                <p>• 고용보험: 0.9% (근로자), 1.55% (사업주)</p>
                <p>• 산재보험: 사업주 부담 (업종별 상이)</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">계산 방식</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. 세전 급여 = 시급 × 월 근무시간</p>
              <p>2. 4대보험 공제 = 세전급여 × 각 보험료율</p>
              <p>3. 소득세 = 간이세액표 기준 계산</p>
              <p>4. 지방소득세 = 소득세 × 10%</p>
              <p>5. 실수령액 = 세전급여 - (4대보험 + 소득세 + 지방소득세)</p>
              <p>6. 사업주 부담 = 세전급여 + 사업주 부담 4대보험</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

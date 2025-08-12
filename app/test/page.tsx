'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { 
  calculateWorkHours, 
  calculatePayroll, 
  calculateMonthlySalary,
  calculateNetSalary,
  calculateEmployerCost,
  calculateInsurance,
  getComprehensivePayrollExamples 
} from '@/lib/payroll-calculator-new'

export default function TestPage() {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [breakTime, setBreakTime] = useState(60)
  const [hourlyWage, setHourlyWage] = useState(10000)
  const [weeklyHours, setWeeklyHours] = useState(40)
  const [dependents, setDependents] = useState(1)
  const [result, setResult] = useState<any>(null)

  const handleCalculate = () => {
    const workHours = calculateWorkHours(startTime, endTime, breakTime)
    const payroll = calculatePayroll(workHours, hourlyWage, weeklyHours)
    const monthlySalary = calculateMonthlySalary(weeklyHours, hourlyWage)
    const netSalary = calculateNetSalary(monthlySalary.grossSalary, dependents)
    const employerCost = calculateEmployerCost(monthlySalary.grossSalary)
    const insurance = calculateInsurance(monthlySalary.grossSalary)
    
    setResult({
      workHours,
      payroll,
      monthlySalary,
      netSalary,
      employerCost,
      insurance
    })
  }

  const showExamples = () => {
    const examples = getComprehensivePayrollExamples()
    console.log('완전한 급여 계산 예시들:', examples)
    alert('콘솔에서 완전한 급여 계산 예시를 확인하세요!')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">HR 관리 시스템 테스트</h1>
      
      {/* Supabase Auth 테스트 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Supabase Auth 테스트</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Supabase 인증 시스템을 테스트할 수 있는 페이지들입니다. 로그인, 회원가입, 프로필 관리, 디버그 정보 확인 등을 할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/test/login">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-lg">🚪</span>
                <span>로그인 테스트</span>
              </Button>
            </Link>
            <Link href="/test/profile">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-lg">👤</span>
                <span>프로필 페이지</span>
              </Button>
            </Link>
            <Link href="/test/debug">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-lg">🔍</span>
                <span>디버그 정보</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Separator />
      
      {/* 근로계약서 작성 시스템 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>📋 근로계약서 작성 시스템</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            한국 표준 근로계약서를 기반으로 한 실시간 미리보기 및 PDF 생성 시스템입니다. 
            다양한 계약서 유형을 지원하며, 입력과 동시에 미리보기가 업데이트됩니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/test/labor-contract">
              <Button variant="default" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📄</span>
                <span className="font-semibold">근로계약서 작성</span>
                <span className="text-sm text-gray-600">실시간 미리보기 & PDF 생성</span>
              </Button>
            </Link>
            <div className="space-y-2">
              <h4 className="font-semibold">지원하는 계약서 유형:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 정규직 (기간의 정함이 없는 경우)</li>
                <li>• 계약직 (기간의 정함이 있는 경우)</li>
                <li>• 연소근로자 (만 18세 미만)</li>
                <li>• 단시간근로자 (파트타임)</li>
                <li>• 건설일용근로자</li>
                <li>• 외국인근로자</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Separator />
      
      {/* 기존 급여 계산 테스트 섹션 */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">💰 급여 계산 시스템 테스트</h2>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">급여 계산 테스트</h3>
          <Button onClick={showExamples} variant="outline">
            예시 데이터 보기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>근무 정보 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="breakTime">휴게시간 (분)</Label>
                <Input
                  id="breakTime"
                  type="number"
                  value={breakTime}
                  onChange={(e) => setBreakTime(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="hourlyWage">시급 (원)</Label>
                <Input
                  id="hourlyWage"
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="weeklyHours">주간 총 근무시간</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="dependents">부양가족 수</Label>
                <Input
                  id="dependents"
                  type="number"
                  value={dependents}
                  onChange={(e) => setDependents(Number(e.target.value))}
                />
              </div>

              <Button onClick={handleCalculate} className="w-full">
                급여 계산하기
              </Button>
            </CardContent>
          </Card>

          {/* 결과 표시 */}
          <Card>
            <CardHeader>
              <CardTitle>계산 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* 근무시간 분석 */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">📊 근무시간 분석</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>총 근무시간: {result.workHours.totalHours}시간</div>
                      <div>정규시간: {result.workHours.regularHours}시간</div>
                      <div>연장시간: {result.workHours.overtimeHours}시간</div>
                      <div>야간시간: {result.workHours.nightHours}시간</div>
                      <div className="col-span-2">
                        야간근무: {result.workHours.isNightShift ? '예' : '아니오'}
                      </div>
                    </div>
                  </div>

                  {/* 월급 계산 (세전) */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold mb-2">💰 월급 계산 (세전)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>월 총 근무시간:</span>
                        <span>{result.monthlySalary.totalWorkingHours}시간</span>
                      </div>
                      <div className="flex justify-between">
                        <span>월 주휴시간:</span>
                        <span>{result.monthlySalary.holidayHours}시간</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>세전 월급:</span>
                        <span className="text-blue-600">{result.monthlySalary.grossSalary.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>

                  {/* 4대보험료 */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🏥 4대보험료</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-1">근로자 부담</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>국민연금:</span>
                            <span>{result.insurance.employee.nationalPension.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>건강보험:</span>
                            <span>{result.insurance.employee.healthInsurance.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>장기요양:</span>
                            <span>{result.insurance.employee.longTermCare.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>고용보험:</span>
                            <span>{result.insurance.employee.employment.toLocaleString()}원</span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-medium">
                            <span>소계:</span>
                            <span>{result.insurance.employee.total.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">사업주 부담</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>국민연금:</span>
                            <span>{result.insurance.employer.nationalPension.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>건강보험:</span>
                            <span>{result.insurance.employer.healthInsurance.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>장기요양:</span>
                            <span>{result.insurance.employer.longTermCare.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>고용보험:</span>
                            <span>{result.insurance.employer.employment.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>고용안정:</span>
                            <span>{result.insurance.employer.employmentStability.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>산재보험:</span>
                            <span>{result.insurance.employer.workersCompensation.toLocaleString()}원</span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-medium">
                            <span>소계:</span>
                            <span>{result.insurance.employer.total.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 실수령액 */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold mb-2">💵 실수령액 (세후)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>세전 월급:</span>
                        <span>{result.netSalary.grossSalary.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>- 4대보험료:</span>
                        <span>-{result.netSalary.employeeInsurance.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>- 근로소득세:</span>
                        <span>-{result.netSalary.incomeTax.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>- 지방소득세:</span>
                        <span>-{result.netSalary.localIncomeTax.toLocaleString()}원</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>실수령액:</span>
                        <span className="text-green-600">{result.netSalary.netSalary.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>

                  {/* 사업주 총 비용 */}
                  <div className="border rounded-lg p-4 bg-orange-50">
                    <h3 className="font-semibold mb-2">🏢 사업주 총 비용</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>급여:</span>
                        <span>{result.employerCost.salary.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>사업주 보험료:</span>
                        <span>{result.employerCost.employerInsurance.toLocaleString()}원</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>총 비용:</span>
                        <span className="text-orange-600">{result.employerCost.totalCost.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  위의 정보를 입력하고 "급여 계산하기" 버튼을 클릭하세요.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

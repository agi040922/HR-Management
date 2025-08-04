'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">급여 계산 테스트 페이지</h1>
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
                      <span>-{result.netSalary.localTax.toLocaleString()}원</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-red-600">
                      <span>총 공제액:</span>
                      <span>-{result.netSalary.totalDeductions.toLocaleString()}원</span>
                    </div>
                    <hr className="border-2" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>실수령액:</span>
                      <span className="text-green-600">{result.netSalary.netSalary.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>

                {/* 사업주 총 부담 비용 */}
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <h3 className="font-semibold mb-2">🏢 사업주 총 부담 비용</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>근로자 세전 월급:</span>
                      <span>{result.employerCost.grossSalary.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ 사업주 4대보험료:</span>
                      <span>+{result.employerCost.employerInsurance.toLocaleString()}원</span>
                    </div>
                    <hr className="border-2" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>총 부담 비용:</span>
                      <span className="text-yellow-600">{result.employerCost.totalCost.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>

                {/* 일일 급여 계산 (참고용) */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2">📅 일일 급여 계산 (참고용)</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>기본급:</span>
                      <span>{result.payroll.regularPay.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>연장수당:</span>
                      <span>{result.payroll.overtimePay.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>야간수당:</span>
                      <span>{result.payroll.nightPay.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>주휴수당:</span>
                      <span>{result.payroll.holidayPay.toLocaleString()}원</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>일일 총 급여:</span>
                      <span>{result.payroll.totalPay.toLocaleString()}원</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      주휴수당 대상: {result.payroll.isEligibleForHolidayPay ? '예' : '아니오'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                근무 정보를 입력하고 계산 버튼을 눌러주세요
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 빠른 테스트 버튼들 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 테스트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setStartTime('09:00')
                setEndTime('18:00')
                setBreakTime(60)
                setWeeklyHours(40)
              }}
            >
              일반 근무
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStartTime('22:00')
                setEndTime('06:00')
                setBreakTime(0)
                setWeeklyHours(40)
              }}
            >
              야간 근무
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStartTime('08:00')
                setEndTime('21:00')
                setBreakTime(60)
                setWeeklyHours(50)
              }}
            >
              연장 근무
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStartTime('09:00')
                setEndTime('18:00')
                setBreakTime(60)
                setWeeklyHours(10)
              }}
            >
              단시간 근무
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

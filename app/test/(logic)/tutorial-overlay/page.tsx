'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { 
  Users, 
  Calculator, 
  Calendar, 
  Settings, 
  Play,
  RotateCcw,
  SkipForward,
  HelpCircle
} from 'lucide-react';

export default function TutorialOverlayPage() {
  const [runTutorial, setRunTutorial] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [workHours, setWorkHours] = useState('40');
  const [calculationResult, setCalculationResult] = useState<any>(null);

  // 튜토리얼 단계 정의
  const steps = [
    {
      target: '.tutorial-welcome',
      content: '안녕하세요! HR 관리 시스템에 오신 것을 환영합니다. 주요 기능들을 차례대로 안내해드리겠습니다.',
      title: '환영합니다!',
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: '.tutorial-navigation',
      content: '왼쪽 네비게이션에서 모든 주요 기능에 접근할 수 있습니다. 직원 관리, 급여 계산, 일정 관리 등이 있습니다.',
      title: '네비게이션 메뉴',
      placement: 'right' as const,
    },
    {
      target: '.tutorial-employees',
      content: '직원 관리 섹션에서는 신입사원 등록부터 퇴사 처리까지 모든 직원 정보를 관리할 수 있습니다.',
      title: '직원 관리',
      placement: 'bottom' as const,
    },
    {
      target: '.tutorial-employee-list',
      content: '직원 목록에서 각 직원을 클릭하면 상세 정보를 확인할 수 있습니다. 한 명을 선택해보세요!',
      title: '직원 선택',
      placement: 'left' as const,
    },
    {
      target: '.tutorial-payroll',
      content: '급여 계산 기능에서는 근무시간을 입력하면 4대보험과 세금을 자동으로 계산하여 실수령액을 알려드립니다.',
      title: '급여 계산',
      placement: 'top' as const,
    },
    {
      target: '.tutorial-work-hours',
      content: '여기에 주간 근무시간을 입력해보세요. 40시간(풀타임) 또는 20시간(파트타임)을 입력할 수 있습니다.',
      title: '근무시간 입력',
      placement: 'right' as const,
    },
    {
      target: '.tutorial-calculation-result',
      content: '입력한 근무시간을 바탕으로 세전 급여, 공제액, 실수령액이 자동으로 계산되어 표시됩니다.',
      title: '계산 결과',
      placement: 'left' as const,
    },
    {
      target: '.tutorial-settings',
      content: '우상단의 설정 버튼에서 시스템 환경을 개인화할 수 있습니다.',
      title: '시스템 설정',
      placement: 'left' as const,
    },
    {
      target: '.tutorial-complete',
      content: '튜토리얼을 완료했습니다! 이제 실제 기능들을 사용해보세요. 궁금한 점이 있으면 언제든 도움말을 참조하세요.',
      title: '튜토리얼 완료!',
      placement: 'center' as const,
    }
  ];

  // 튜토리얼 콜백 처리
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTutorial(false);
      setStepIndex(0);
      localStorage.setItem('tutorial-completed', 'true');
    }
  };

  // 튜토리얼 시작
  const startTutorial = () => {
    setRunTutorial(true);
    setStepIndex(0);
  };

  // 튜토리얼 재시작
  const resetTutorial = () => {
    setRunTutorial(false);
    setStepIndex(0);
    localStorage.removeItem('tutorial-completed');
    setTimeout(() => {
      setRunTutorial(true);
    }, 100);
  };

  // 급여 계산 함수
  const calculatePayroll = () => {
    const hours = parseInt(workHours) || 0;
    const wage = 10030; // 2025년 최저시급
    
    const grossSalary = hours * wage * 4.33;
    const totalInsurance = Math.floor(grossSalary * 0.134);
    const incomeTax = Math.floor(grossSalary * 0.06);
    const localTax = Math.floor(incomeTax * 0.1);
    const totalDeductions = totalInsurance + incomeTax + localTax;
    const netSalary = grossSalary - totalDeductions;

    setCalculationResult({
      grossSalary,
      totalInsurance,
      incomeTax,
      localTax,
      totalDeductions,
      netSalary
    });
  };

  useEffect(() => {
    calculatePayroll();
  }, [workHours]);

  // 모의 직원 데이터
  const mockEmployees = [
    { id: '1', name: '김철수', position: '개발팀장', status: '재직' },
    { id: '2', name: '이영희', position: '디자이너', status: '재직' },
    { id: '3', name: '박민수', position: '백엔드 개발자', status: '재직' },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Joyride 컴포넌트 */}
      <Joyride
        steps={steps}
        run={runTutorial}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
            beaconSize: 36,
            zIndex: 10000,
          },
          tooltip: {
            fontSize: 16,
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          },
          tooltipTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: '#1f2937',
          },
          tooltipContent: {
            fontSize: 14,
            lineHeight: 1.6,
            color: '#4b5563',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: '600',
          },
          buttonBack: {
            color: '#6b7280',
            fontSize: 14,
            padding: '10px 20px',
            fontWeight: '600',
          },
          buttonSkip: {
            color: '#9ca3af',
            fontSize: 14,
            fontWeight: '600',
          },
        }}
        locale={{
          back: '이전',
          close: '닫기',
          last: '완료',
          next: '다음',
          skip: '건너뛰기',
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />

      <div className="space-y-8">
        {/* 헤더 및 튜토리얼 컨트롤 */}
        <div className="flex justify-between items-center tutorial-welcome">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR 관리 시스템</h1>
            <p className="text-gray-600 mt-2">직원 관리부터 급여 계산까지 한 번에</p>
          </div>
          
          <div className="flex items-center gap-3 tutorial-settings">
            <Button
              onClick={startTutorial}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Play className="w-4 h-4" />
              튜토리얼 시작
            </Button>
            <Button
              onClick={resetTutorial}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              다시보기
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 메인 네비게이션 (모의) */}
        <Card className="tutorial-navigation">
          <CardHeader>
            <CardTitle>주요 기능</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="tutorial-employees p-4 bg-blue-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">직원 관리</h3>
                    <p className="text-sm text-gray-600">신규 등록 및 정보 관리</p>
                  </div>
                </div>
              </div>
              
              <div className="tutorial-payroll p-4 bg-green-50 rounded-lg border-2 border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Calculator className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">급여 계산</h3>
                    <p className="text-sm text-gray-600">자동 급여 및 세금 계산</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">일정 관리</h3>
                    <p className="text-sm text-gray-600">근무 스케줄 최적화</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold">시스템 설정</h3>
                    <p className="text-sm text-gray-600">개인화 및 환경 설정</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 직원 관리 섹션 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  직원 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 tutorial-employee-list">
                  {mockEmployees.map((employee) => (
                    <div 
                      key={employee.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedEmployee === employee.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedEmployee(employee.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {employee.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{employee.name}</h3>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{employee.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedEmployee && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle>선택된 직원 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const employee = mockEmployees.find(e => e.id === selectedEmployee);
                    return employee ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                          {employee.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-lg">{employee.name}</h3>
                        <p className="text-gray-600">{employee.position}</p>
                        <Badge className="bg-green-100 text-green-800 mt-2">{employee.status}</Badge>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 급여 계산 섹션 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  급여 계산기
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="tutorial-work-hours">
                  <label className="text-sm font-medium mb-2 block">주간 근무시간</label>
                  <Input
                    type="number"
                    value={workHours}
                    onChange={(e) => setWorkHours(e.target.value)}
                    placeholder="40"
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    풀타임: 40시간, 파트타임: 20시간
                  </p>
                </div>

                <Button onClick={calculatePayroll} className="w-full">
                  급여 계산하기
                </Button>
              </CardContent>
            </Card>

            {calculationResult && (
              <Card className="tutorial-calculation-result border-green-200">
                <CardHeader>
                  <CardTitle>계산 결과</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">세전 급여</span>
                      <span className="text-lg font-bold text-green-600">
                        {calculationResult.grossSalary.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>4대보험 공제</span>
                      <span className="text-red-600">-{calculationResult.totalInsurance.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>소득세</span>
                      <span className="text-red-600">-{calculationResult.incomeTax.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>지방소득세</span>
                      <span className="text-red-600">-{calculationResult.localTax.toLocaleString()}원</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">실수령액</span>
                      <span className="text-xl font-bold text-blue-600">
                        {calculationResult.netSalary.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 완료 메시지 (숨겨진 요소) */}
        <div className="tutorial-complete opacity-0 pointer-events-none">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">튜토리얼 완료!</h3>
              <p className="text-green-600 mt-2">이제 실제 기능들을 사용해보세요.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

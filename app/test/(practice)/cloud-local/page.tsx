'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Cloud, Monitor, Database, Cpu, Network, HardDrive, Timer, Shield } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CloudLocalTestPage() {
  const [localData, setLocalData] = useState('');
  const [cloudData, setCloudData] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [performanceTest, setPerformanceTest] = useState({
    local: 0,
    cloud: 0,
    network: 0
  });

  // 로컬 스토리지 테스트
  const testLocalStorage = () => {
    const startTime = performance.now();
    
    // 로컬 스토리지에 데이터 저장
    const testData = {
      message: localData,
      timestamp: new Date().toISOString(),
      user: 'test-user'
    };
    
    localStorage.setItem('test-data', JSON.stringify(testData));
    
    // 로컬 스토리지에서 데이터 읽기
    const retrieved = localStorage.getItem('test-data');
    const parsed = retrieved ? JSON.parse(retrieved) : null;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    setPerformanceTest(prev => ({ ...prev, local: duration }));
    
    alert(`로컬 저장 완료!\n소요 시간: ${duration.toFixed(2)}ms\n저장된 데이터: ${parsed?.message}`);
  };

  // 클라우드 데이터베이스 테스트
  const testCloudDatabase = async () => {
    setLoading(true);
    const startTime = performance.now();
    
    try {
      // Supabase에 데이터 저장
      const { data, error } = await supabase
        .from('test_data')
        .insert({
          message: cloudData,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Supabase 오류:', error);
        alert('데이터베이스 연결 오류: ' + error.message);
        return;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setPerformanceTest(prev => ({ ...prev, cloud: duration }));
      
      alert(`클라우드 저장 완료!\n소요 시간: ${duration.toFixed(2)}ms\nID: ${data?.[0]?.id}`);
      
    } catch (error) {
      console.error('클라우드 테스트 오류:', error);
      alert('클라우드 테스트 실패: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // 직원 데이터 로드 (클라우드)
  const loadEmployees = async () => {
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(5);

      if (error) throw error;

      const endTime = performance.now();
      const networkTime = endTime - startTime;
      
      setEmployees(data || []);
      setPerformanceTest(prev => ({ ...prev, network: networkTime }));
      
    } catch (error) {
      console.error('직원 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 클라이언트 사이드 급여 계산 (로컬)
  const calculatePayrollLocal = (workHours: number) => {
    const startTime = performance.now();
    
    const hourlyWage = 10030; // 2025년 최저시급
    const grossPay = workHours * hourlyWage;
    
    // 4대보험 계산 (로컬에서 처리)
    const nationalPension = grossPay * 0.045;
    const healthInsurance = grossPay * 0.03545;
    const employmentInsurance = grossPay * 0.009;
    const industrialAccident = grossPay * 0.007;
    
    // 소득세 계산 (간소화)
    const incomeTax = grossPay * 0.033;
    const localTax = incomeTax * 0.1;
    
    const totalDeductions = nationalPension + healthInsurance + employmentInsurance + incomeTax + localTax;
    const netPay = grossPay - totalDeductions;
    
    const endTime = performance.now();
    const calculationTime = endTime - startTime;
    
    return {
      grossPay,
      deductions: {
        nationalPension,
        healthInsurance,
        employmentInsurance,
        industrialAccident,
        incomeTax,
        localTax,
        total: totalDeductions
      },
      netPay,
      calculationTime
    };
  };

  // 브라우저 정보 수집 (로컬)
  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memory: (navigator as any).deviceMemory || 'Unknown',
      cores: navigator.hardwareConcurrency || 'Unknown'
    };
  };

  const [browserInfo, setBrowserInfo] = useState<any>({});
  const [payrollResult, setPayrollResult] = useState<any>(null);

  useEffect(() => {
    setBrowserInfo(getBrowserInfo());
  }, []);

  const serviceComparison = [
    {
      category: '데이터 저장',
      cloud: {
        service: 'Supabase PostgreSQL',
        pros: ['영구 저장', '다중 사용자 접근', '백업 자동화', '확장성'],
        cons: ['네트워크 의존', '비용 발생', '지연 시간'],
        icon: <Database className="w-5 h-5" />
      },
      local: {
        service: 'LocalStorage/SessionStorage',
        pros: ['빠른 접근', '오프라인 가능', '무료', '개인정보 보호'],
        cons: ['브라우저 종료시 손실', '용량 제한', '단일 사용자'],
        icon: <HardDrive className="w-5 h-5" />
      }
    },
    {
      category: '계산 처리',
      cloud: {
        service: 'Server-side Processing',
        pros: ['강력한 처리 능력', '보안성', '일관된 결과', '복잡한 로직'],
        cons: ['네트워크 지연', '서버 비용', '의존성'],
        icon: <Cloud className="w-5 h-5" />
      },
      local: {
        service: 'Client-side JavaScript',
        pros: ['즉시 처리', '서버 부하 없음', '오프라인 가능', '반응성'],
        cons: ['기기 성능 의존', '보안 취약', '브라우저 제한'],
        icon: <Cpu className="w-5 h-5" />
      }
    },
    {
      category: '사용자 인증',
      cloud: {
        service: 'Supabase Auth',
        pros: ['보안성', '세션 관리', '다중 기기 동기화', '권한 제어'],
        cons: ['네트워크 필요', '서비스 의존', '복잡성'],
        icon: <Shield className="w-5 h-5" />
      },
      local: {
        service: 'Browser Session',
        pros: ['빠른 확인', '오프라인 가능', '간단함'],
        cons: ['보안 취약', '세션 제한', '동기화 불가'],
        icon: <Monitor className="w-5 h-5" />
      }
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">클라우드 vs 로컬 서비스 테스트</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          HR 관리 시스템에서 클라우드와 로컬 서비스의 차이점을 실제로 테스트하고 비교해볼 수 있는 페이지입니다.
          성능, 보안, 사용성 등 다양한 측면에서 두 방식의 장단점을 체험해보세요.
        </p>
      </div>

      {/* 성능 비교 대시보드 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Timer className="w-6 h-6" />
          성능 비교 대시보드
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                로컬 처리
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {performanceTest.local.toFixed(2)}ms
              </div>
              <p className="text-sm text-gray-600">브라우저 내 처리 시간</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                클라우드 처리
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {performanceTest.cloud.toFixed(2)}ms
              </div>
              <p className="text-sm text-gray-600">서버 응답 시간</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                네트워크 지연
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {performanceTest.network.toFixed(2)}ms
              </div>
              <p className="text-sm text-gray-600">데이터 전송 시간</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 실제 테스트 영역 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">실제 테스트 영역</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 로컬 스토리지 테스트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                로컬 스토리지 테스트
              </CardTitle>
              <CardDescription>
                브라우저의 로컬 스토리지에 데이터를 저장하고 읽어오는 테스트
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="로컬에 저장할 데이터를 입력하세요..."
                value={localData}
                onChange={(e) => setLocalData(e.target.value)}
              />
              <Button onClick={testLocalStorage} className="w-full">
                로컬 스토리지에 저장
              </Button>
              <div className="text-xs text-gray-500">
                💡 개발자 도구 → Application → Local Storage에서 확인 가능
              </div>
            </CardContent>
          </Card>

          {/* 클라우드 데이터베이스 테스트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                클라우드 DB 테스트
              </CardTitle>
              <CardDescription>
                Supabase 클라우드 데이터베이스에 데이터를 저장하는 테스트
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="클라우드에 저장할 데이터를 입력하세요..."
                value={cloudData}
                onChange={(e) => setCloudData(e.target.value)}
              />
              <Button 
                onClick={testCloudDatabase} 
                className="w-full"
                disabled={loading}
              >
                {loading ? '저장 중...' : '클라우드 DB에 저장'}
              </Button>
              <div className="text-xs text-gray-500">
                💡 Supabase 대시보드에서 실제 저장된 데이터 확인 가능
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 급여 계산 테스트 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">급여 계산 테스트 (로컬 처리)</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>클라이언트 사이드 급여 계산</CardTitle>
            <CardDescription>
              브라우저에서 직접 급여를 계산하여 즉시 결과를 확인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">주간 근무시간</label>
                <Input
                  type="number"
                  placeholder="40"
                  onChange={(e) => {
                    const hours = parseFloat(e.target.value) || 0;
                    if (hours > 0) {
                      const result = calculatePayrollLocal(hours);
                      setPayrollResult(result);
                    }
                  }}
                />
              </div>
              <Button 
                onClick={() => {
                  const result = calculatePayrollLocal(40);
                  setPayrollResult(result);
                }}
              >
                40시간 기준 계산
              </Button>
            </div>
            
            {payrollResult && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>세전 급여:</strong> {payrollResult.grossPay.toLocaleString()}원
                  </div>
                  <div>
                    <strong>실수령액:</strong> {payrollResult.netPay.toLocaleString()}원
                  </div>
                  <div>
                    <strong>국민연금:</strong> {payrollResult.deductions.nationalPension.toLocaleString()}원
                  </div>
                  <div>
                    <strong>건강보험:</strong> {payrollResult.deductions.healthInsurance.toLocaleString()}원
                  </div>
                  <div>
                    <strong>소득세:</strong> {payrollResult.deductions.incomeTax.toLocaleString()}원
                  </div>
                  <div>
                    <strong>계산 시간:</strong> {payrollResult.calculationTime.toFixed(4)}ms
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 직원 데이터 로드 테스트 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">직원 데이터 로드 테스트 (클라우드)</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Supabase에서 직원 데이터 조회</CardTitle>
            <CardDescription>
              클라우드 데이터베이스에서 실제 직원 데이터를 불러오는 테스트
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={loadEmployees} disabled={loading} className="w-full">
              {loading ? '로딩 중...' : '직원 데이터 로드'}
            </Button>
            
            {employees.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">로드된 직원 목록:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {employees.map((employee: any, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span>{employee.name || '이름 없음'}</span>
                      <Badge variant="outline">{employee.position || '직책 없음'}</Badge>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  네트워크 응답 시간: {performanceTest.network.toFixed(2)}ms
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 브라우저 정보 (로컬) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">브라우저 정보 수집 (로컬)</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>클라이언트 환경 정보</CardTitle>
            <CardDescription>
              JavaScript로 수집할 수 있는 브라우저 및 시스템 정보
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>브라우저:</strong> {browserInfo.userAgent?.split(' ')[0]}</div>
              <div><strong>언어:</strong> {browserInfo.language}</div>
              <div><strong>플랫폼:</strong> {browserInfo.platform}</div>
              <div><strong>온라인 상태:</strong> {browserInfo.onLine ? '온라인' : '오프라인'}</div>
              <div><strong>화면 해상도:</strong> {browserInfo.screenResolution}</div>
              <div><strong>색상 깊이:</strong> {browserInfo.colorDepth}bit</div>
              <div><strong>시간대:</strong> {browserInfo.timezone}</div>
              <div><strong>CPU 코어:</strong> {browserInfo.cores}개</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 서비스 비교 표 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">서비스 비교 분석</h2>
        
        <div className="space-y-6">
          {serviceComparison.map((comparison, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{comparison.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 클라우드 서비스 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {comparison.cloud.icon}
                      <h4 className="font-semibold">클라우드: {comparison.cloud.service}</h4>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">장점</h5>
                      <ul className="text-sm space-y-1">
                        {comparison.cloud.pros.map((pro, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">단점</h5>
                      <ul className="text-sm space-y-1">
                        {comparison.cloud.cons.map((con, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 로컬 서비스 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {comparison.local.icon}
                      <h4 className="font-semibold">로컬: {comparison.local.service}</h4>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">장점</h5>
                      <ul className="text-sm space-y-1">
                        {comparison.local.pros.map((pro, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">단점</h5>
                      <ul className="text-sm space-y-1">
                        {comparison.local.cons.map((con, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 실습 과제 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">실습 과제</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>추가 실험해볼 것들</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• 네트워크를 끊고 로컬 기능들이 여전히 작동하는지 확인</li>
              <li>• 브라우저를 새로고침한 후 로컬 데이터가 유지되는지 확인</li>
              <li>• 다른 브라우저에서 같은 클라우드 데이터에 접근해보기</li>
              <li>• 대용량 데이터로 성능 차이 측정해보기</li>
              <li>• 모바일 기기에서 성능 차이 비교해보기</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

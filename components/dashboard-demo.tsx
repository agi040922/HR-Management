"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal
} from "lucide-react"

// 샘플 데이터
const salaryTrendData = [
  { month: "1월", totalSalary: 45000000, employees: 12 },
  { month: "2월", totalSalary: 47000000, employees: 13 },
  { month: "3월", totalSalary: 48500000, employees: 13 },
  { month: "4월", totalSalary: 52000000, employees: 14 },
  { month: "5월", totalSalary: 54000000, employees: 15 },
  { month: "6월", totalSalary: 56000000, employees: 15 },
]

const departmentSalaryData = [
  { department: "개발팀", salary: 18000000, employees: 6, color: "#8b5cf6" },
  { department: "디자인팀", salary: 12000000, employees: 4, color: "#06b6d4" },
  { department: "마케팅팀", salary: 15000000, employees: 3, color: "#10b981" },
  { department: "인사팀", salary: 8000000, employees: 2, color: "#f59e0b" },
]

const attendanceData = [
  { day: "월", present: 14, absent: 1, late: 0 },
  { day: "화", present: 15, absent: 0, late: 1 },
  { day: "수", present: 13, absent: 2, late: 1 },
  { day: "목", present: 15, absent: 0, late: 0 },
  { day: "금", present: 14, absent: 1, late: 2 },
]

const overtimeData = [
  { week: "1주차", hours: 45 },
  { week: "2주차", hours: 52 },
  { week: "3주차", hours: 38 },
  { week: "4주차", hours: 61 },
]

export function DashboardDemo() {
  const [selectedPeriod, setSelectedPeriod] = useState("이번 달")

  return (
    <div className="space-y-8">
      {/* 상단 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 급여 지출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩56,000,000</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              지난 달 대비 증가
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 직원 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15명</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +7.1%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              신규 채용 2명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 출근율</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              지난 주 대비 감소
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">초과근무 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">196시간</div>
            <div className="flex items-center text-xs text-yellow-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              +15.3%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              이번 달 누적
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 급여 추이 차트 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>급여 지출 추이</CardTitle>
                <CardDescription>최근 6개월간 급여 지출 현황</CardDescription>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="이번 달">이번 달</SelectItem>
                  <SelectItem value="지난 3개월">지난 3개월</SelectItem>
                  <SelectItem value="지난 6개월">지난 6개월</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salaryTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₩${(value / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value: number) => [`₩${value.toLocaleString()}`, "급여 지출"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalSalary" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 부서별 급여 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>부서별 급여 분포</CardTitle>
            <CardDescription>각 부서별 급여 지출 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentSalaryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="salary"
                >
                  {departmentSalaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₩${value.toLocaleString()}`, "급여"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 하단 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 주간 출근 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>주간 출근 현황</CardTitle>
            <CardDescription>이번 주 출근/결근/지각 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="출근" />
                <Bar dataKey="late" fill="#f59e0b" name="지각" />
                <Bar dataKey="absent" fill="#ef4444" name="결근" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 초과근무 추이 */}
        <Card>
          <CardHeader>
            <CardTitle>초과근무 추이</CardTitle>
            <CardDescription>주차별 초과근무 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overtimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}시간`, "초과근무"]} />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 및 알림 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>시스템 내 최근 활동 내역</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">김철수님의 급여가 계산되었습니다</p>
                <p className="text-xs text-muted-foreground">2분 전</p>
              </div>
              <Badge variant="secondary">완료</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">신규 직원 이영희님이 등록되었습니다</p>
                <p className="text-xs text-muted-foreground">1시간 전</p>
              </div>
              <Badge variant="outline">신규</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">박민수님의 초과근무가 승인되었습니다</p>
                <p className="text-xs text-muted-foreground">3시간 전</p>
              </div>
              <Badge className="bg-yellow-500">승인</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">정기 백업이 실패했습니다</p>
                <p className="text-xs text-muted-foreground">6시간 전</p>
              </div>
              <Badge variant="destructive">오류</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 부서별 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>부서별 현황</CardTitle>
            <CardDescription>각 부서의 인원 및 급여 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentSalaryData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    ></div>
                    <div>
                      <p className="font-medium">{dept.department}</p>
                      <p className="text-sm text-muted-foreground">{dept.employees}명</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{dept.salary.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      평균 ₩{Math.round(dept.salary / dept.employees / 10000)}만원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼들 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>자주 사용하는 기능들에 빠르게 접근하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              급여 계산
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              직원 등록
            </Button>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              근무시간 입력
            </Button>
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              급여 명세서
            </Button>
            <Button variant="secondary">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              더보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

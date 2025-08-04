"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

export function ComponentDemo() {
  const [switchValue, setSwitchValue] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [textareaValue, setTextareaValue] = useState("")
  const [selectValue, setSelectValue] = useState("")

  return (
    <div className="space-y-8">
      {/* 버튼 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>버튼 컴포넌트</CardTitle>
          <CardDescription>다양한 스타일과 크기의 버튼들</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">기본 버튼</Button>
            <Button variant="secondary">보조 버튼</Button>
            <Button variant="destructive">삭제 버튼</Button>
            <Button variant="outline">아웃라인 버튼</Button>
            <Button variant="ghost">고스트 버튼</Button>
            <Button variant="link">링크 버튼</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">작은 버튼</Button>
            <Button size="default">기본 크기</Button>
            <Button size="lg">큰 버튼</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled>비활성화</Button>
            <Button loading>로딩 중...</Button>
          </div>
        </CardContent>
      </Card>

      {/* 카드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>카드 컴포넌트</CardTitle>
          <CardDescription>정보를 그룹화하여 표시하는 카드들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>직원 정보</CardTitle>
                <CardDescription>김철수 - 개발팀</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  시니어 개발자로 5년 경력을 보유하고 있습니다.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>급여 정보</CardTitle>
                <CardDescription>2024년 1월</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₩3,500,000</p>
                <p className="text-sm text-muted-foreground">기본급 + 성과급</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>근무 시간</CardTitle>
                <CardDescription>이번 주</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">40시간</p>
                <p className="text-sm text-muted-foreground">정규 근무시간</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 배지 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>배지 컴포넌트</CardTitle>
          <CardDescription>상태나 카테고리를 표시하는 배지들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">정규직</Badge>
            <Badge variant="secondary">계약직</Badge>
            <Badge variant="destructive">퇴사</Badge>
            <Badge variant="outline">인턴</Badge>
            <Badge className="bg-green-500">재직중</Badge>
            <Badge className="bg-yellow-500">휴직</Badge>
            <Badge className="bg-blue-500">신입</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 알림 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 컴포넌트</CardTitle>
          <CardDescription>다양한 타입의 알림 메시지들</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>정보</AlertTitle>
            <AlertDescription>
              새로운 직원이 등록되었습니다.
            </AlertDescription>
          </Alert>
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">성공</AlertTitle>
            <AlertDescription className="text-green-700">
              급여 계산이 완료되었습니다.
            </AlertDescription>
          </Alert>
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">주의</AlertTitle>
            <AlertDescription className="text-yellow-700">
              일부 직원의 근무시간이 부족합니다.
            </AlertDescription>
          </Alert>
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">오류</AlertTitle>
            <AlertDescription className="text-red-700">
              급여 데이터를 불러오는데 실패했습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 폼 컴포넌트 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>폼 컴포넌트</CardTitle>
          <CardDescription>사용자 입력을 받는 다양한 폼 요소들</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inputs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inputs">입력 필드</TabsTrigger>
              <TabsTrigger value="selects">선택 요소</TabsTrigger>
              <TabsTrigger value="switches">스위치</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inputs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">직원 이름</Label>
                  <Input 
                    id="name" 
                    placeholder="이름을 입력하세요"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea 
                  id="description"
                  placeholder="직원에 대한 설명을 입력하세요"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="selects" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>부서</Label>
                  <Select value={selectValue} onValueChange={setSelectValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="부서를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">개발팀</SelectItem>
                      <SelectItem value="design">디자인팀</SelectItem>
                      <SelectItem value="marketing">마케팅팀</SelectItem>
                      <SelectItem value="hr">인사팀</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>직급</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="직급을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intern">인턴</SelectItem>
                      <SelectItem value="junior">주니어</SelectItem>
                      <SelectItem value="senior">시니어</SelectItem>
                      <SelectItem value="lead">팀장</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="switches" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={switchValue}
                  onCheckedChange={setSwitchValue}
                />
                <Label htmlFor="active">재직 상태</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">알림 수신</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="overtime" />
                <Label htmlFor="overtime">초과근무 허용</Label>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 테이블 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>테이블 컴포넌트</CardTitle>
          <CardDescription>데이터를 표 형태로 표시</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>직급</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">급여</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">김철수</TableCell>
                <TableCell>개발팀</TableCell>
                <TableCell>시니어</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">재직중</Badge>
                </TableCell>
                <TableCell className="text-right">₩4,500,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">이영희</TableCell>
                <TableCell>디자인팀</TableCell>
                <TableCell>주니어</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">재직중</Badge>
                </TableCell>
                <TableCell className="text-right">₩3,200,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">박민수</TableCell>
                <TableCell>마케팅팀</TableCell>
                <TableCell>팀장</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-500">휴직</Badge>
                </TableCell>
                <TableCell className="text-right">₩5,000,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      {/* 사용법 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>컴포넌트 사용법</CardTitle>
          <CardDescription>이 컴포넌트들을 프로젝트에서 어떻게 활용할 수 있는지 안내</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">재사용성</h4>
              <p className="text-sm text-muted-foreground">
                모든 컴포넌트는 props를 통해 커스터마이징 가능하며, 
                프로젝트 전반에서 일관된 디자인을 유지할 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">테마 지원</h4>
              <p className="text-sm text-muted-foreground">
                모든 컴포넌트는 현재 적용된 Claude 테마를 따르며, 
                다크모드도 자동으로 지원됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">접근성</h4>
              <p className="text-sm text-muted-foreground">
                shadcn/ui 기반으로 구축되어 웹 접근성 표준을 
                준수합니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">확장성</h4>
              <p className="text-sm text-muted-foreground">
                필요에 따라 새로운 variant나 size를 
                쉽게 추가할 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

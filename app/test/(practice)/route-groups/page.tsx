'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder, FileText, Layout, Users, Settings, Shield } from 'lucide-react';

export default function RouteGroupsTestPage() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const routeGroupExamples = [
    {
      id: 'auth',
      name: '(auth) - 인증 그룹',
      description: '로그인, 회원가입 등 인증 관련 페이지',
      icon: <Shield className="w-5 h-5" />,
      structure: [
        'app/',
        '├── (auth)/',
        '│   ├── layout.tsx',
        '│   ├── login/',
        '│   │   └── page.tsx      # /login',
        '│   └── register/',
        '│       └── page.tsx      # /register',
      ],
      features: [
        'URL에 (auth) 포함되지 않음',
        '인증 전용 레이아웃 적용',
        '중앙 정렬 폼 디자인',
        '로그인 상태 체크'
      ]
    },
    {
      id: 'dashboard',
      name: '(dashboard) - 대시보드 그룹',
      description: '관리자 및 사용자 대시보드 페이지',
      icon: <Layout className="w-5 h-5" />,
      structure: [
        'app/',
        '├── (dashboard)/',
        '│   ├── layout.tsx',
        '│   ├── admin/',
        '│   │   └── page.tsx      # /admin',
        '│   ├── analytics/',
        '│   │   └── page.tsx      # /analytics',
        '│   └── reports/',
        '│       └── page.tsx      # /reports',
      ],
      features: [
        '사이드바 네비게이션',
        '헤더 포함 레이아웃',
        '권한별 접근 제어',
        '실시간 데이터 표시'
      ]
    },
    {
      id: 'hr',
      name: '(hr) - HR 관리 그룹',
      description: 'HR 관련 모든 기능 페이지',
      icon: <Users className="w-5 h-5" />,
      structure: [
        'app/',
        '├── (hr)/',
        '│   ├── layout.tsx',
        '│   ├── employees/',
        '│   │   └── page.tsx      # /employees',
        '│   ├── payroll/',
        '│   │   └── page.tsx      # /payroll',
        '│   └── schedules/',
        '│       └── page.tsx      # /schedules',
      ],
      features: [
        'HR 전용 네비게이션',
        '직원 데이터 접근',
        '급여 계산 도구',
        '일정 관리 기능'
      ]
    },
    {
      id: 'public',
      name: '(public) - 공개 페이지 그룹',
      description: '로그인 없이 접근 가능한 페이지',
      icon: <FileText className="w-5 h-5" />,
      structure: [
        'app/',
        '├── (public)/',
        '│   ├── layout.tsx',
        '│   ├── about/',
        '│   │   └── page.tsx      # /about',
        '│   ├── contact/',
        '│   │   └── page.tsx      # /contact',
        '│   └── help/',
        '│       └── page.tsx      # /help',
      ],
      features: [
        '공개 접근 가능',
        '마케팅 레이아웃',
        'SEO 최적화',
        '랜딩 페이지 스타일'
      ]
    }
  ];

  const implementationSteps = [
    {
      step: 1,
      title: '폴더 구조 생성',
      description: 'app/ 디렉토리에 (그룹명) 폴더 생성',
      code: `mkdir app/(auth)
mkdir app/(dashboard)
mkdir app/(hr)
mkdir app/(public)`
    },
    {
      step: 2,
      title: '레이아웃 파일 생성',
      description: '각 그룹별 layout.tsx 파일 생성',
      code: `// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  )
}`
    },
    {
      step: 3,
      title: '페이지 파일 생성',
      description: '각 그룹 내에 페이지 생성',
      code: `// app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div>
      <h1>로그인</h1>
      {/* 로그인 폼 */}
    </div>
  )
}`
    },
    {
      step: 4,
      title: '네비게이션 설정',
      description: '그룹별 네비게이션 메뉴 구성',
      code: `// components/Navigation.tsx
const getNavItems = (group: string) => {
  switch (group) {
    case 'hr':
      return [
        { href: '/employees', label: '직원 관리' },
        { href: '/payroll', label: '급여 계산' },
        { href: '/schedules', label: '일정 관리' }
      ]
    // ...
  }
}`
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Next.js Route Groups 테스트</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Next.js 13+ App Router의 Route Groups 기능을 실제로 테스트하고 학습할 수 있는 페이지입니다.
          괄호() 폴더를 사용하여 URL에 영향을 주지 않으면서 라우트를 논리적으로 그룹화하는 방법을 배워보세요.
        </p>
      </div>

      {/* Route Groups 예시 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Folder className="w-6 h-6" />
          Route Groups 예시
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routeGroupExamples.map((example) => (
            <Card 
              key={example.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedExample === example.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedExample(example.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {example.icon}
                  {example.name}
                </CardTitle>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">폴더 구조:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {example.structure.join('\n')}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">주요 특징:</h4>
                    <div className="flex flex-wrap gap-2">
                      {example.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 구현 단계 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          구현 단계
        </h2>
        
        <div className="space-y-4">
          {implementationSteps.map((step) => (
            <Card key={step.step}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">{step.step}</Badge>
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                  {step.code}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 실습 영역 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">실습 영역</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Route Groups 테스트</CardTitle>
            <CardDescription>
              아래 버튼들을 클릭하여 실제 Route Groups가 어떻게 작동하는지 확인해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => window.open('/login', '_blank')}
              >
                <Shield className="w-5 h-5" />
                <span>로그인 페이지</span>
                <code className="text-xs">/login</code>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => window.open('/employees', '_blank')}
              >
                <Users className="w-5 h-5" />
                <span>직원 관리</span>
                <code className="text-xs">/employees</code>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => window.open('/payroll', '_blank')}
              >
                <Layout className="w-5 h-5" />
                <span>급여 계산</span>
                <code className="text-xs">/payroll</code>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => window.open('/about', '_blank')}
              >
                <FileText className="w-5 h-5" />
                <span>회사 소개</span>
                <code className="text-xs">/about</code>
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 확인 포인트</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• URL에 (auth), (hr), (public) 등의 그룹명이 포함되지 않는지 확인</li>
                <li>• 각 페이지마다 다른 레이아웃이 적용되는지 확인</li>
                <li>• 브라우저 개발자 도구에서 HTML 구조 비교</li>
                <li>• 네비게이션 메뉴가 그룹별로 다르게 표시되는지 확인</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 학습 자료 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">추가 학습 자료</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>공식 문서</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a 
                href="https://nextjs.org/docs/app/building-your-application/routing/route-groups" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                Next.js Route Groups 공식 문서
              </a>
              <a 
                href="https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                Layouts and Templates
              </a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>실습 과제</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• (mobile) 그룹을 만들어 모바일 전용 레이아웃 구현</li>
                <li>• 중첩 Route Groups 구조 실험</li>
                <li>• 조건부 레이아웃 적용 (사용자 역할별)</li>
                <li>• 메타데이터 그룹별 설정</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

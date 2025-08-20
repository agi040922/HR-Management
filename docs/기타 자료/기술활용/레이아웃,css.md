# Next.js 레이아웃과 글로벌 CSS 완벽 가이드

## 개요
Next.js에서 레이아웃과 CSS를 효과적으로 활용하는 방법을 초보자도 이해할 수 있도록 상세히 설명합니다.

## 레이아웃(Layout) 개념

### 레이아웃이란?
- **정의**: 여러 페이지에서 공통으로 사용되는 UI 구조
- **목적**: 헤더, 사이드바, 푸터 등 반복되는 요소를 한 번만 정의
- **장점**: 코드 재사용, 일관된 디자인, 유지보수 용이

### 기본 구조
```
app/
├── layout.tsx          # 루트 레이아웃 (모든 페이지에 적용)
├── page.tsx           # 홈페이지
├── about/
│   └── page.tsx       # /about 페이지
└── dashboard/
    ├── layout.tsx     # 대시보드 전용 레이아웃
    └── page.tsx       # /dashboard 페이지
```

## 레이아웃 구현 방법

### 1. 루트 레이아웃 (app/layout.tsx)
```typescript
// app/layout.tsx - 모든 페이지에 적용되는 기본 레이아웃
import './globals.css'  // 글로벌 CSS 임포트

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {/* 모든 페이지에 공통으로 표시될 헤더 */}
        <header className="bg-blue-600 text-white p-4">
          <h1>HR 관리 시스템</h1>
          <nav>
            <a href="/" className="mr-4">홈</a>
            <a href="/employees" className="mr-4">직원관리</a>
            <a href="/payroll">급여계산</a>
          </nav>
        </header>

        {/* 페이지별 내용이 여기에 들어감 */}
        <main className="container mx-auto p-4">
          {children}
        </main>

        {/* 모든 페이지에 공통으로 표시될 푸터 */}
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2025 HR 관리 시스템. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}
```

### 2. 중첩 레이아웃 (특정 섹션용)
```typescript
// app/dashboard/layout.tsx - 대시보드 페이지들에만 적용
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* 사이드바 - 대시보드 페이지에만 표시 */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="font-bold mb-4">대시보드 메뉴</h2>
        <ul className="space-y-2">
          <li><a href="/dashboard" className="block p-2 hover:bg-gray-200">개요</a></li>
          <li><a href="/dashboard/analytics" className="block p-2 hover:bg-gray-200">분석</a></li>
          <li><a href="/dashboard/reports" className="block p-2 hover:bg-gray-200">보고서</a></li>
        </ul>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
```

### 3. 조건부 레이아웃
```typescript
// app/layout.tsx - 페이지에 따라 다른 레이아웃 적용
'use client'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isAuthPage) {
    // 로그인/회원가입 페이지는 간단한 레이아웃
    return (
      <html lang="ko">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {children}
          </div>
        </body>
      </html>
    )
  }

  // 일반 페이지는 전체 레이아웃
  return (
    <html lang="ko">
      <body>
        <header>...</header>
        <main>{children}</main>
        <footer>...</footer>
      </body>
    </html>
  )
}
```

## 글로벌 CSS 개념

### 글로벌 CSS란?
- **정의**: 전체 애플리케이션에 적용되는 스타일
- **위치**: 반드시 루트 레이아웃에서만 임포트 가능
- **용도**: 기본 스타일, 리셋 CSS, 공통 클래스 정의

### 1. 기본 글로벌 CSS 설정
```css
/* app/globals.css */

/* CSS 리셋 및 기본 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  color: #333;
}

/* 공통 유틸리티 클래스 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

/* HR 시스템 전용 스타일 */
.employee-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.payroll-table {
  width: 100%;
  border-collapse: collapse;
}

.payroll-table th,
.payroll-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.payroll-table th {
  background-color: #f9fafb;
  font-weight: 600;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
```

### 2. Tailwind CSS와 함께 사용
```css
/* app/globals.css - Tailwind와 커스텀 CSS 조합 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tailwind 기본 스타일 위에 커스텀 스타일 추가 */
@layer base {
  html {
    font-family: 'Noto Sans KR', system-ui, sans-serif;
  }
}

@layer components {
  /* 재사용 가능한 컴포넌트 스타일 */
  .card {
    @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
  }
  
  .btn-custom {
    @apply px-4 py-2 rounded-md font-medium transition-colors duration-200;
  }
  
  .btn-custom-primary {
    @apply btn-custom bg-blue-600 text-white hover:bg-blue-700;
  }
  
  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}

@layer utilities {
  /* 유틸리티 클래스 */
  .text-balance {
    text-wrap: balance;
  }
}
```

## 실제 활용 예시

### 1. HR 시스템 레이아웃 구조
```typescript
// app/layout.tsx - HR 시스템 메인 레이아웃
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <div className="flex h-screen">
          {/* 사이드바 */}
          <Sidebar />
          
          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 헤더 */}
            <Header />
            
            {/* 페이지 콘텐츠 */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

### 2. 사이드바 컴포넌트
```typescript
// components/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Calculator, Calendar, Settings } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { href: '/employees', label: '직원 관리', icon: Users },
    { href: '/payroll', label: '급여 계산', icon: Calculator },
    { href: '/schedule', label: '일정 관리', icon: Calendar },
    { href: '/settings', label: '설정', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">HR 시스템</h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

### 3. 헤더 컴포넌트
```typescript
// components/Header.tsx
'use client'
import { Bell, User, LogOut } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">대시보드</h2>
          <p className="text-sm text-gray-600">오늘도 좋은 하루 되세요!</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 알림 */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">홍길동</span>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
```

## CSS 모듈과 스타일드 컴포넌트

### 1. CSS 모듈 사용법
```css
/* components/EmployeeCard.module.css */
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
}
```

```typescript
// components/EmployeeCard.tsx
import styles from './EmployeeCard.module.css'

interface EmployeeCardProps {
  name: string
  position: string
  department: string
}

export default function EmployeeCard({ name, position, department }: EmployeeCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{name}</h3>
      <p className={styles.subtitle}>{position} • {department}</p>
    </div>
  )
}
```

### 2. 스타일드 컴포넌트 (styled-components)
```typescript
// components/StyledButton.tsx
'use client'
import styled from 'styled-components'

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' && `
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background-color: #f3f4f6;
    color: #374151;
    
    &:hover {
      background-color: #e5e7eb;
    }
  `}
`

export default function CustomButton({ 
  children, 
  variant = 'primary',
  ...props 
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}) {
  return (
    <StyledButton variant={variant} {...props}>
      {children}
    </StyledButton>
  )
}
```

## 반응형 디자인

### 1. 미디어 쿼리 활용
```css
/* app/globals.css */
.responsive-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* 태블릿 */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
  
  .main-content {
    padding: 16px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -250px;
    transition: left 0.3s ease;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .responsive-grid {
    grid-template-columns: 1fr;
  }
}
```

### 2. Tailwind CSS 반응형 클래스
```typescript
// 반응형 레이아웃 예시
export default function ResponsiveLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">직원 수</h3>
        <p className="text-3xl font-bold text-blue-600">150</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">이번 달 급여</h3>
        <p className="text-3xl font-bold text-green-600">₩45,000,000</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow md:col-span-2 lg:col-span-1">
        <h3 className="text-lg font-semibold mb-2">출근율</h3>
        <p className="text-3xl font-bold text-purple-600">95.2%</p>
      </div>
    </div>
  )
}
```

## 다크 모드 구현

### 1. CSS 변수를 활용한 테마
```css
/* app/globals.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
}
```

### 2. 테마 토글 컴포넌트
```typescript
// components/ThemeToggle.tsx
'use client'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
    
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    const theme = newTheme ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
```

## 성능 최적화

### 1. CSS 최적화
```css
/* 효율적인 CSS 작성 */
/* ❌ 비효율적 */
.employee .card .title {
  color: blue;
}

/* ✅ 효율적 */
.employee-title {
  color: blue;
}

/* 애니메이션 최적화 */
.smooth-transition {
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform, opacity;
}

/* GPU 가속 활용 */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### 2. 동적 임포트
```typescript
// 필요할 때만 CSS 로드
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>로딩 중...</p>,
})

// CSS도 동적으로 로드 가능
const loadStyles = async () => {
  if (typeof window !== 'undefined') {
    await import('./heavy-styles.css')
  }
}
```

## 베스트 프랙티스

### 1. 파일 구조
```
app/
├── globals.css          # 글로벌 스타일
├── layout.tsx          # 루트 레이아웃
├── components/
│   ├── ui/             # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── layout/         # 레이아웃 관련 컴포넌트
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
└── styles/
    ├── components.css  # 컴포넌트별 스타일
    └── utilities.css   # 유틸리티 클래스
```

### 2. 네이밍 규칙
```css
/* BEM 방법론 활용 */
.employee-card { }                    /* Block */
.employee-card__title { }             /* Element */
.employee-card--featured { }          /* Modifier */

/* 또는 간단한 네이밍 */
.card { }
.card-title { }
.card-featured { }
```

### 3. 코드 예시
```typescript
// 좋은 레이아웃 구조 예시
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <h1 className="text-xl font-bold">HR 시스템</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu />
            </div>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 HR 관리 시스템</p>
      </footer>
    </div>
  )
}
```

## 결론

레이아웃과 글로벌 CSS는 Next.js 애플리케이션의 기초입니다:

### 레이아웃 핵심 포인트
- **루트 레이아웃**: 모든 페이지에 공통 적용
- **중첩 레이아웃**: 특정 섹션에만 적용
- **조건부 레이아웃**: 페이지별 다른 구조

### CSS 핵심 포인트
- **글로벌 CSS**: 전체 앱에 적용되는 기본 스타일
- **컴포넌트 CSS**: 재사용 가능한 스타일 정의
- **반응형 디자인**: 다양한 화면 크기 대응

이러한 개념을 이해하고 활용하면 일관되고 유지보수하기 쉬운 웹 애플리케이션을 만들 수 있습니다.

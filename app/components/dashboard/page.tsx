"use client"

import { DashboardDemo } from "@/components/dashboard-demo"

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">대시보드 데모</h1>
        <p className="text-muted-foreground text-lg">
          HR 임금관리 시스템의 대시보드 컴포넌트들을 확인해보세요.
        </p>
      </div>
      <DashboardDemo />
    </div>
  )
}

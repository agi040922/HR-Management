"use client"

import { ComponentDemo } from "@/components/component-demo"

export default function ComponentsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">컴포넌트 데모</h1>
        <p className="text-muted-foreground text-lg">
          프로젝트에서 사용할 수 있는 재사용 가능한 컴포넌트들을 확인해보세요.
        </p>
      </div>
      <ComponentDemo />
    </div>
  )
}

export default function Home() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI 임금관리 시스템</h1>
          <p className="text-muted-foreground text-lg">
            효율적인 HR 관리를 위한 통합 솔루션입니다.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">대시보드</h3>
            <p className="text-sm text-muted-foreground mb-4">
              실시간 HR 데이터와 통계를 한눈에 확인하세요.
            </p>
            <a href="/components/dashboard" className="text-primary hover:underline text-sm">
              대시보드 보기 →
            </a>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">컴포넌트</h3>
            <p className="text-sm text-muted-foreground mb-4">
              재사용 가능한 UI 컴포넌트들을 확인하세요.
            </p>
            <a href="/components" className="text-primary hover:underline text-sm">
              컴포넌트 보기 →
            </a>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">직원 관리</h3>
            <p className="text-sm text-muted-foreground mb-4">
              직원 정보와 급여를 체계적으로 관리하세요.
            </p>
            <span className="text-muted-foreground text-sm">
              준비 중...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

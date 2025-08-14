# UI 컴포넌트 구조 정리

## 개요
HR 관리 시스템의 스케줄 템플릿 관리 UI 컴포넌트들을 정리한 문서입니다.

## 페이지 구조
```
app/test/comprehensive/templates/
├── page.tsx              # 메인 템플릿 관리 페이지
├── employees/
│   └── page.tsx          # 직원 관리 페이지
└── breaks/
    └── page.tsx          # 브레이크 시간 설정 페이지
```

## 1. 메인 템플릿 관리 페이지 (`/templates/page.tsx`)

### 주요 기능
- **템플릿 목록 조회 및 관리**
- **새 템플릿 생성 및 편집**
- **요일별 운영시간 설정**
- **시간 슬롯별 직원 배정**
- **템플릿 활성/비활성 상태 관리**

### 컴포넌트 구조
```typescript
export default function TemplatesPage() {
  // 상태 관리
  const { templates, stores, employees, currentStore, ... } = useScheduleTemplates();
  const [formData, setFormData] = useState<TemplateFormData>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WeeklyTemplateData | null>(null);

  // 비즈니스 로직
  const templateService = useMemo(() => 
    new TemplateService(currentStore, employees), 
    [currentStore, employees]
  );

  // 이벤트 핸들러들...
}
```

### 주요 UI 섹션

#### 헤더 영역
```typescript
<div className="flex justify-between items-start">
  <div>
    <h1>주간 스케줄 템플릿 관리</h1>
    <p>반복되는 주간 스케줄을 템플릿으로 관리하세요</p>
  </div>
  <div className="flex space-x-2">
    <Button onClick={() => navigate('/templates/employees')}>직원 관리</Button>
    <Button onClick={() => navigate('/templates/breaks')}>브레이크 시간</Button>
    <Button onClick={() => setShowCreateForm(true)}>새 템플릿</Button>
  </div>
</div>
```

#### 스토어 선택
- 사용자가 소유한 스토어 목록 표시
- 선택된 스토어의 템플릿만 조회
- RLS 정책에 의한 권한 제어

#### 템플릿 목록
- 카드 형태로 템플릿 표시
- 템플릿명, 생성일, 활성 상태 표시
- 편집, 복사, 삭제 액션 버튼

#### 템플릿 편집 폼
- 요일별 탭 구조
- 운영시간 설정 (시작/종료 시간)
- 시간 슬롯별 직원 배정 체크박스
- 실시간 미리보기

### 핵심 이벤트 핸들러

#### `handleOperatingHoursChange`
```typescript
const handleOperatingHoursChange = (day: DayOfWeek, openTime: string | null, closeTime: string | null) => {
  const slotMinutes = currentStore?.time_slot_minutes || 30;
  const newScheduleData = templateService.updateOperatingHours(
    formData.schedule_data,
    day,
    openTime,
    closeTime
  );
  setFormData(prev => ({ ...prev, schedule_data: newScheduleData }));
};
```

#### `toggleEmployeeInSlot`
```typescript
const toggleEmployeeInSlot = (day: DayOfWeek, timeSlot: string, employeeId: number) => {
  const newScheduleData = templateService.toggleEmployeeInSlot(
    formData.schedule_data,
    day,
    timeSlot,
    employeeId
  );
  setFormData(prev => ({ ...prev, schedule_data: newScheduleData }));
};
```

## 2. 직원 관리 페이지 (`/templates/employees/page.tsx`)

### 주요 기능
- **직원 목록 조회**
- **새 직원 추가**
- **직원 정보 수정**
- **직원 활성/비활성 상태 관리**

### UI 구성 요소

#### 직원 목록 카드
```typescript
<Card>
  <CardContent>
    <div className="flex items-center justify-between">
      <div>
        <h3>{employee.name}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <Badge>{employee.position}</Badge>
          <span>시급 {employee.hourly_wage.toLocaleString()}원</span>
          <span>{employee.phone}</span>
          <span>입사일: {employee.start_date}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={employee.is_active ? "default" : "secondary"}>
          {employee.is_active ? '활성' : '비활성'}
        </Badge>
        <Button onClick={() => startEdit(employee)}>편집</Button>
        <Button onClick={() => toggleEmployeeStatus(employee.id, !employee.is_active)}>
          {employee.is_active ? '비활성화' : '활성화'}
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 직원 추가/편집 폼
- 이름, 직책, 시급, 전화번호, 입사일 입력
- 2025년 최저시급(10,030원) 기본값 설정
- 유효성 검증 및 에러 처리

### 핵심 기능

#### 직원 생성/수정
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentStore) return;

  try {
    if (editingEmployee) {
      await editEmployee(editingEmployee.id, formData);
    } else {
      const employeeData = {
        ...formData,
        store_id: currentStore.id,
        is_active: true
      };
      await addEmployee(employeeData);
    }
    resetForm();
  } catch (err) {
    console.error('직원 저장 오류:', err);
  }
};
```

## 3. 브레이크 시간 설정 페이지 (`/templates/breaks/page.tsx`)

### 주요 기능
- **템플릿별 브레이크 시간 관리**
- **요일별 브레이크 시간 설정**
- **미리 정의된 브레이크 템플릿 제공**
- **브레이크 시간 추가/수정/삭제**

### UI 구성 (3단 레이아웃)

#### 1단: 요일 선택
```typescript
<Card>
  <CardHeader><CardTitle>요일 선택</CardTitle></CardHeader>
  <CardContent>
    {DAY_ORDER.map((day) => {
      const daySchedule = selectedTemplate.schedule_data[day];
      const breakCount = daySchedule.break_periods?.length || 0;
      
      return (
        <Button
          key={day}
          variant={selectedDay === day ? "default" : "outline"}
          onClick={() => setSelectedDay(day)}
        >
          <span>{DAY_NAMES[day]}</span>
          <Badge>{breakCount}개</Badge>
        </Button>
      );
    })}
  </CardContent>
</Card>
```

#### 2단: 브레이크 시간 목록
```typescript
<Card>
  <CardHeader>
    <CardTitle>{DAY_NAMES[selectedDay]} 브레이크 시간</CardTitle>
  </CardHeader>
  <CardContent>
    {breakPeriods.map((breakPeriod, index) => (
      <Card key={index}>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4>{breakPeriod.name}</h4>
              <p>{breakPeriod.start} - {breakPeriod.end}</p>
            </div>
            <div>
              <Button onClick={() => startEditBreak(breakPeriod, index)}>편집</Button>
              <Button onClick={() => handleDeleteBreak(index)}>삭제</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </CardContent>
</Card>
```

#### 3단: 브레이크 시간 추가/편집 폼
- 빠른 설정 템플릿 (점심시간, 저녁시간, 휴게시간 등)
- 브레이크 이름, 시작/종료 시간 입력
- 시간 유효성 검증

### 미리 정의된 브레이크 템플릿
```typescript
const BREAK_TEMPLATES: BreakPeriod[] = [
  { name: '점심시간', start: '12:00', end: '13:00' },
  { name: '저녁시간', start: '18:00', end: '19:00' },
  { name: '오후 휴게시간', start: '15:00', end: '15:30' },
  { name: '야간 휴게시간', start: '22:00', end: '22:30' },
  { name: '새벽 휴게시간', start: '03:00', end: '03:30' }
];
```

## 공통 UI 패턴

### 1. 네비게이션 헤더
모든 페이지에 공통으로 적용되는 네비게이션 구조:
```typescript
<div className="flex space-x-2">
  <Button variant="outline" onClick={() => navigate('/templates')}>
    <Calendar className="h-4 w-4" />
    <span>템플릿 관리</span>
  </Button>
  <Button variant="outline" onClick={() => navigate('/templates/employees')}>
    <Users className="h-4 w-4" />
    <span>직원 관리</span>
  </Button>
  <Button variant="outline" onClick={() => navigate('/templates/breaks')}>
    <Clock className="h-4 w-4" />
    <span>브레이크 시간</span>
  </Button>
</div>
```

### 2. 에러 처리 UI
```typescript
{error && (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-2 text-red-700">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={clearError}>
        <X className="h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
)}
```

### 3. 로딩 상태 UI
```typescript
{loading && (
  <div className="text-center py-8 text-gray-500">
    로딩 중...
  </div>
)}
```

### 4. 빈 상태 UI
```typescript
{!loading && items.length === 0 && (
  <div className="text-center py-8">
    <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      데이터가 없습니다
    </h3>
    <p className="text-gray-600 mb-4">
      첫 번째 항목을 추가해보세요
    </p>
    <Button onClick={() => setShowCreateForm(true)}>
      <Plus className="h-4 w-4 mr-2" />
      추가하기
    </Button>
  </div>
)}
```

## 상태 관리 패턴

### 1. 로컬 상태 관리
```typescript
// 폼 데이터
const [formData, setFormData] = useState<FormData>();

// UI 상태
const [showCreateForm, setShowCreateForm] = useState(false);
const [editingItem, setEditingItem] = useState<Item | null>(null);
const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
```

### 2. 전역 상태 관리 (useScheduleTemplates 훅)
```typescript
const {
  // 데이터 상태
  templates, stores, employees, currentStore,
  
  // UI 상태
  loading, error,
  
  // 액션 함수
  loadTemplates, createTemplate, updateTemplate,
  addEmployee, editEmployee, toggleEmployee,
  
  // 유틸리티
  clearError
} = useScheduleTemplates();
```

## 반응형 디자인

### 그리드 레이아웃
```typescript
// 모바일: 1열, 태블릿: 2열, 데스크톱: 3열
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 버튼 그룹
```typescript
// 모바일에서는 세로 배치, 데스크톱에서는 가로 배치
<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
```

## 접근성 (Accessibility)

### 1. 키보드 네비게이션
- 모든 인터랙티브 요소에 적절한 tabindex 설정
- Enter/Space 키로 버튼 활성화 가능

### 2. 스크린 리더 지원
```typescript
<Button aria-label="직원 편집">
  <Edit className="h-4 w-4" />
</Button>

<input
  aria-describedby="hourly-wage-help"
  placeholder="시급 입력"
/>
<p id="hourly-wage-help" className="text-sm text-gray-500">
  2025년 최저시급: 10,030원
</p>
```

### 3. 색상 대비 및 시각적 피드백
- WCAG 2.1 AA 기준 준수
- 색상뿐만 아니라 아이콘과 텍스트로도 상태 표시

## 성능 최적화

### 1. 컴포넌트 메모이제이션
```typescript
const EmployeeCard = memo(({ employee, onEdit, onToggle }) => {
  // 컴포넌트 내용...
});

const TimeSlotGrid = memo(({ schedule, employees, onToggle }) => {
  // 컴포넌트 내용...
});
```

### 2. 콜백 최적화
```typescript
const handleEmployeeToggle = useCallback((employeeId: number, isActive: boolean) => {
  toggleEmployee(employeeId, isActive);
}, [toggleEmployee]);
```

### 3. 가상화 (대량 데이터 처리 시)
```typescript
// react-window 또는 react-virtualized 사용
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={employees.length}
  itemSize={80}
  itemData={employees}
>
  {EmployeeRow}
</List>
```

## 사용자 경험 (UX) 개선

### 1. 즉시 피드백
- 버튼 클릭 시 즉시 로딩 상태 표시
- 성공/실패 토스트 메시지

### 2. 실시간 유효성 검증
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (name: string, value: string) => {
  const newErrors = { ...errors };
  
  if (name === 'hourly_wage' && parseInt(value) < 10030) {
    newErrors[name] = '최저시급 이상이어야 합니다';
  } else {
    delete newErrors[name];
  }
  
  setErrors(newErrors);
};
```

### 3. 자동 저장
```typescript
const debouncedSave = useMemo(
  () => debounce((data: FormData) => {
    updateTemplate(templateId, data.template_name, data.schedule_data);
  }, 1000),
  [updateTemplate, templateId]
);

useEffect(() => {
  if (formData && !isInitialLoad) {
    debouncedSave(formData);
  }
}, [formData, debouncedSave, isInitialLoad]);
```

## 테스트 전략

### 1. 단위 테스트
- 각 컴포넌트의 렌더링 테스트
- 이벤트 핸들러 동작 테스트
- 상태 변경 테스트

### 2. 통합 테스트
- API 호출과 UI 업데이트 연동 테스트
- 페이지 간 네비게이션 테스트

### 3. E2E 테스트
- 전체 워크플로우 테스트
- 사용자 시나리오 기반 테스트

# PDF 생성 오류 해결 가이드

## 문제 상황
```
Error: Attempting to parse an unsupported color function "lab"
```

## 원인 분석
- **Tailwind CSS v4**에서 새로운 색상 시스템이 `lab()` 함수를 사용
- `html2canvas` 라이브러리가 `lab()` 색상 함수를 지원하지 않음
- PDF 생성 시 페이지의 CSS가 html2canvas와 충돌

## 적용된 해결책

### 1. DOM 격리 방식 (iframe 사용)
```typescript
// iframe을 사용하여 Tailwind CSS와 격리된 환경에서 PDF 생성
const iframe = document.createElement('iframe');
iframe.style.position = 'absolute';
iframe.style.left = '-9999px';
// ... iframe에서 PDF 생성
```

### 2. CSS 강제 오버라이드
```css
/* 모든 색상을 안전한 형식으로 강제 */
* {
  color: inherit !important;
  background-color: transparent !important;
  border-color: #000000 !important;
}
```

### 3. html2canvas 옵션 최적화
```typescript
html2canvas: { 
  scale: 1.5,
  useCORS: false,
  allowTaint: false,
  letterRendering: true,
  backgroundColor: '#ffffff',
  logging: false,
  foreignObjectRendering: false
}
```

## 추가 해결 방법 (필요시 적용)

### 방법 1: Tailwind CSS 다운그레이드
```bash
pnpm remove tailwindcss
pnpm add tailwindcss@^3.4.0
```

### 방법 2: 대체 PDF 라이브러리 사용
- `jsPDF` + `html2canvas` 조합
- `puppeteer` (서버사이드)
- `@react-pdf/renderer`

### 방법 3: CSS 변수 오버라이드
```css
:root {
  --tw-color-primary: #000000;
  --tw-color-secondary: #ffffff;
  /* 모든 Tailwind 색상 변수를 hex로 오버라이드 */
}
```

### 방법 4: 개발자 도구에서 lab() 색상 찾기
1. F12 개발자 도구 열기
2. Elements 탭에서 계약서 미리보기 영역 선택
3. Computed 탭에서 "lab(" 검색
4. 해당 CSS 규칙 찾아서 수정

## 현재 상태
- ✅ iframe 격리 방식 적용
- ✅ CSS 강제 오버라이드 적용
- ✅ html2canvas 옵션 최적화
- ⏳ 테스트 필요

## 테스트 방법
1. 계약서 작성 완료
2. "PDF 다운로드" 버튼 클릭
3. 오류 발생 시 브라우저 콘솔 확인
4. 필요시 추가 해결 방법 적용

## 문의사항
- 여전히 오류 발생 시 브라우저 콘솔의 전체 오류 메시지 공유
- 특정 계약서 유형에서만 발생하는지 확인
- 다른 브라우저에서도 동일한 오류인지 테스트

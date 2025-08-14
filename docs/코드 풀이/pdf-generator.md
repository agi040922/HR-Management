# PDF 생성기 (pdf-generator.ts)

## 개요
근로계약서를 PDF 형태로 생성하는 기능을 제공합니다. html2canvas-pro와 jsPDF를 사용하여 고품질 PDF를 생성하며, 한국어와 영문 계약서를 모두 지원합니다.

## 주요 기능

### 1. PDF 생성 함수

#### `generateContractPDF(contract: LaborContract): Promise<void>`
- **목적**: 근로계약서 데이터를 PDF 파일로 변환하여 다운로드
- **사용 라이브러리**:
  - `html2canvas-pro`: 최신 CSS 색상 함수 지원 (lab(), oklch() 등)
  - `jsPDF`: PDF 생성 및 압축
- **처리 과정**:
  1. 임시 DOM 컨테이너 생성 (화면에 보이지 않는 위치)
  2. 계약서 HTML 생성 및 렌더링
  3. html2canvas로 고해상도 이미지 캡처 (scale: 2)
  4. jsPDF로 A4 크기 PDF 생성
  5. 자동 다운로드 실행

- **PDF 설정**:
  - 용지: A4 세로 방향
  - 여백: 좌우 각 10mm
  - 압축: 활성화
  - 이미지 품질: JPEG 95%

### 2. HTML 생성 함수

#### `generateContractHTML(contract: LaborContract): string`
- **목적**: 계약 유형에 따라 적절한 HTML 생성
- **언어 자동 선택**: 계약 유형이 '-en'으로 끝나면 영문, 아니면 한국어

#### `generateKoreanContractHTML(contract: LaborContract): string`
- **목적**: 한국어 근로계약서 HTML 생성
- **특징**:
  - 한국 노동법에 맞는 표준 양식
  - 계약 유형별 맞춤 내용
  - 자동 계산된 급여 및 근로시간 정보 포함
  - 서명란 포함

#### `generateEnglishContractHTML(contract: LaborContract): string`
- **목적**: 영문 근로계약서 HTML 생성
- **특징**:
  - 국제 표준에 맞는 영문 양식
  - 외국인 근로자를 위한 명확한 영문 표기
  - 한국 법령 내용의 영문 번역 포함

### 3. 유틸리티 함수

#### `getEnglishContractTitle(contractType: ContractType): string`
- **목적**: 계약 유형별 영문 제목 반환
- **지원 유형**:
  - `regular-en`: "Employment Contract"
  - `part-time-en`: "Part-time Employment Contract"
  - `fixed-term-en`: "Fixed-term Employment Contract"
  - `foreign-agriculture-en`: "Foreign Worker Employment Contract (Agriculture)"

### 4. 데이터 관리 함수

#### `exportContractAsJSON(contract: LaborContract): void`
- **목적**: 계약서 데이터를 JSON 파일로 내보내기
- **파일명**: `contract_${근로자명}_${날짜}.json`
- **용도**: 데이터 백업, 다른 시스템으로 이전

#### `importContractFromJSON(file: File): Promise<LaborContract>`
- **목적**: JSON 파일에서 계약서 데이터 가져오기
- **검증**: JSON 형식 및 필수 필드 유효성 검사
- **오류 처리**: 파일 형식 오류 시 예외 발생

## CSS 스타일링

### 한국어 계약서 스타일
- **폰트**: 'Noto Sans KR', sans-serif
- **레이아웃**: 표 기반 구조
- **색상**: 전통적인 공문서 스타일
- **여백**: 적절한 인쇄 여백 설정

### 영문 계약서 스타일
- **폰트**: Arial, sans-serif
- **레이아웃**: 섹션 기반 구조
- **색상**: 국제 표준 비즈니스 문서 스타일
- **여백**: 영문 문서 표준 여백

## 사용 예시

```typescript
import { generateContractPDF, exportContractAsJSON } from '@/lib/pdf-generator';

// PDF 생성 및 다운로드
try {
  await generateContractPDF(contract);
  console.log('PDF 생성 완료');
} catch (error) {
  console.error('PDF 생성 실패:', error);
}

// JSON 내보내기
exportContractAsJSON(contract);

// JSON 가져오기
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];
if (file) {
  try {
    const importedContract = await importContractFromJSON(file);
    console.log('계약서 가져오기 완료:', importedContract);
  } catch (error) {
    console.error('파일 가져오기 실패:', error);
  }
}
```

## 기술적 특징

### 1. 최신 CSS 지원
- **html2canvas-pro** 사용으로 모든 최신 CSS 색상 함수 지원
- lab(), oklch(), color-mix() 등 최신 CSS 기능 완벽 지원

### 2. 고품질 렌더링
- **Scale 2**: 고해상도 이미지 생성으로 선명한 PDF
- **CORS 설정**: 외부 리소스 로딩 최적화
- **배경색 보장**: 투명 배경 방지

### 3. 메모리 최적화
- **임시 DOM 정리**: 렌더링 후 즉시 DOM 요소 제거
- **PDF 압축**: 파일 크기 최적화
- **비동기 처리**: UI 블로킹 방지

## 주의사항

1. **브라우저 호환성**: 최신 브라우저에서만 정상 동작
2. **메모리 사용량**: 대용량 계약서의 경우 메모리 사용량 주의
3. **폰트 로딩**: 웹폰트 로딩 완료 후 PDF 생성 권장
4. **인쇄 최적화**: A4 용지 기준으로 최적화됨

## 오류 처리

- **라이브러리 로딩 실패**: 동적 import 오류 처리
- **DOM 렌더링 실패**: html2canvas 오류 처리
- **PDF 생성 실패**: jsPDF 오류 처리
- **파일 다운로드 실패**: 브라우저 제한 처리

# 전자서명 유틸리티 (signature-utils.ts)

## 개요
전자서명 기능을 제공하는 유틸리티 함수들입니다. Canvas 기반 서명 패드, Supabase Storage 연동, 서명 데이터 관리 등의 기능을 포함합니다.

## 주요 기능

### 1. 데이터 타입 정의

#### `SignatureData` 인터페이스
```typescript
interface SignatureData {
  id: string;                    // 서명 고유 ID
  contractId: string;            // 계약서 ID
  signerType: 'employer' | 'employee';  // 서명자 유형
  signerName: string;            // 서명자 이름
  signatureImageUrl: string;     // 서명 이미지 URL
  signedAt: Date;               // 서명 일시
  ipAddress?: string;           // IP 주소 (선택)
  userAgent?: string;           // 브라우저 정보 (선택)
}
```

#### `SignaturePadOptions` 인터페이스
```typescript
interface SignaturePadOptions {
  width: number;          // 서명 패드 너비
  height: number;         // 서명 패드 높이
  backgroundColor: string; // 배경색
  penColor: string;       // 펜 색상
  penWidth: number;       // 펜 두께
}
```

### 2. 이미지 변환 함수

#### `canvasToBase64(canvas: HTMLCanvasElement): string`
- **목적**: Canvas 서명 패드의 내용을 base64 문자열로 변환
- **반환값**: `data:image/png;base64,{데이터}` 형식의 문자열
- **사용 예**: 서명 완료 후 이미지 데이터 추출

#### `base64ToBlob(base64: string): Blob`
- **목적**: base64 문자열을 Blob 객체로 변환
- **용도**: Supabase Storage 업로드를 위한 데이터 변환
- **처리 과정**:
  1. base64 문자열에서 데이터 부분 추출
  2. 바이트 배열로 변환
  3. PNG 형식의 Blob 생성

### 3. Supabase Storage 연동

#### `uploadSignatureToStorage(contractId, signerType, signatureBase64): Promise<string>`
- **목적**: 서명 이미지를 Supabase Storage에 업로드
- **매개변수**:
  - `contractId`: 계약서 ID
  - `signerType`: 서명자 유형 ('employer' | 'employee')
  - `signatureBase64`: base64 형식의 서명 이미지
- **처리 과정**:
  1. base64를 Blob으로 변환
  2. 고유한 파일명 생성 (`{contractId}_{signerType}_{timestamp}.png`)
  3. `labor-contracts` 버킷의 `signatures/` 폴더에 업로드
  4. 공개 URL 반환
- **오류 처리**: 업로드 실패 시 상세 오류 메시지 제공

### 4. 데이터베이스 연동

#### `saveSignatureData(signatureData): Promise<string>`
- **목적**: 서명 데이터를 `contract_signatures` 테이블에 저장
- **저장 데이터**:
  - 계약서 ID, 서명자 정보
  - 서명 이미지 URL, 서명 일시
  - IP 주소, 브라우저 정보 (선택)
- **반환값**: 생성된 서명 레코드의 ID

#### `completeContractSigning(contractId, employerSignature, employeeSignature): Promise<void>`
- **목적**: 계약서 서명 완료 처리
- **기능**:
  1. 고용주와 근로자 서명 모두 확인
  2. 계약서 상태를 'signed'로 업데이트
  3. 서명 완료 일시 기록

#### `getSignedContract(contractId)`
- **목적**: 서명된 계약서 정보 조회
- **반환 데이터**:
  - 계약서 기본 정보
  - 고용주/근로자 서명 정보
  - 서명 일시 및 메타데이터

### 5. 서명 검증

#### `verifySignature(signatureId): Promise<boolean>`
- **목적**: 서명의 무결성 검증
- **검증 항목**:
  - 서명 데이터 존재 여부
  - 이미지 파일 접근 가능성
  - 서명 일시 유효성
- **반환값**: 검증 성공 시 true, 실패 시 false

### 6. 유틸리티 함수

#### `getBrowserInfo()`
- **목적**: 서명 시 브라우저 정보 수집
- **수집 정보**:
  - IP 주소 (클라이언트 측에서는 제한적)
  - User Agent 문자열
  - 타임스탬프
- **용도**: 서명 추적 및 보안 로그

### 7. 기본 설정

#### `DEFAULT_SIGNATURE_OPTIONS`
```typescript
const DEFAULT_SIGNATURE_OPTIONS: SignaturePadOptions = {
  width: 400,              // 기본 너비
  height: 200,             // 기본 높이
  backgroundColor: '#ffffff', // 흰색 배경
  penColor: '#000000',     // 검은색 펜
  penWidth: 2              // 펜 두께 2px
};
```

## 사용 예시

### 1. 서명 패드 구현
```typescript
import { canvasToBase64, uploadSignatureToStorage, saveSignatureData } from '@/lib/signature-utils';

// 서명 완료 처리
const handleSignatureComplete = async (canvas: HTMLCanvasElement) => {
  try {
    // 1. Canvas를 base64로 변환
    const signatureBase64 = canvasToBase64(canvas);
    
    // 2. Storage에 업로드
    const imageUrl = await uploadSignatureToStorage(
      contractId, 
      'employee', 
      signatureBase64
    );
    
    // 3. 데이터베이스에 저장
    const signatureId = await saveSignatureData({
      contractId,
      signerType: 'employee',
      signerName: '홍길동',
      signatureImageUrl: imageUrl,
      signedAt: new Date(),
      ...getBrowserInfo()
    });
    
    console.log('서명 저장 완료:', signatureId);
  } catch (error) {
    console.error('서명 저장 실패:', error);
  }
};
```

### 2. 계약서 서명 완료
```typescript
// 양측 서명 완료 후
await completeContractSigning(
  contractId,
  employerSignatureId,
  employeeSignatureId
);
```

### 3. 서명된 계약서 조회
```typescript
const signedContract = await getSignedContract(contractId);
console.log('서명 정보:', signedContract);
```

## 데이터베이스 스키마

### `contract_signatures` 테이블
```sql
CREATE TABLE contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  signer_type TEXT NOT NULL CHECK (signer_type IN ('employer', 'employee')),
  signer_name TEXT NOT NULL,
  signature_image_url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Supabase Storage 구조

### 버킷: `labor-contracts`
```
labor-contracts/
├── signatures/
│   ├── {contractId}_employer_{timestamp}.png
│   ├── {contractId}_employee_{timestamp}.png
│   └── ...
└── documents/
    └── ...
```

## 보안 고려사항

1. **RLS (Row Level Security)**: 서명 데이터 접근 권한 제어
2. **이미지 검증**: 업로드된 이미지의 유효성 검사
3. **IP 추적**: 서명 시 IP 주소 기록으로 보안 강화
4. **타임스탬프**: 서명 일시 정확한 기록
5. **무결성 검증**: 서명 데이터 변조 방지

## 주의사항

1. **Storage 권한**: Supabase Storage 버킷 권한 설정 필요
2. **이미지 크기**: 서명 이미지 파일 크기 제한 고려
3. **브라우저 호환성**: Canvas API 지원 브라우저에서만 동작
4. **네트워크 오류**: 업로드 실패 시 재시도 로직 구현 권장

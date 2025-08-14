# Supabase Authentication 설정 가이드

## 📋 목차
1. [Site URL 설정](#site-url-설정)
2. [Additional Redirect URLs 설정](#additional-redirect-urls-설정)
3. [실제 서비스 배포 시 설정 변경](#실제-서비스-배포-시-설정-변경)
4. [보안 고려사항](#보안-고려사항)

---

## Site URL 설정

### 🔧 현재 설정
```
Site URL: http://localhost:3000
```

### 📖 의미와 역할

**Site URL**은 Supabase Auth가 **기본 리다이렉트 대상**으로 사용하는 URL입니다.

#### 주요 역할:
1. **기본 리다이렉트**: OAuth 로그인 후 별도 지정이 없으면 이 URL로 리다이렉트
2. **이메일 링크**: 비밀번호 재설정, 이메일 확인 링크의 기본 도메인
3. **CORS 설정**: 브라우저에서 Supabase API 호출 시 허용되는 기본 도메인

#### 왜 `http://localhost:3000`으로 설정했나?
- **로컬 개발 환경**: Next.js 개발 서버의 기본 포트가 3000번
- **테스트 목적**: 로컬에서 인증 기능을 테스트하기 위함
- **개발 편의성**: 별도 도메인 설정 없이 바로 테스트 가능

---

## Additional Redirect URLs 설정

### 🔧 현재 설정
```
Additional Redirect URLs:
- http://localhost:3000/test/profile
- http://localhost:3000/test/login
```

### 📖 의미와 역할

**Additional Redirect URLs**는 OAuth 로그인 후 **허용되는 추가 리다이렉트 대상**들입니다.

#### 주요 역할:
1. **다중 리다이렉트 지원**: 상황에 따라 다른 페이지로 리다이렉트
2. **보안 검증**: 허용되지 않은 URL로의 리다이렉트 차단
3. **사용자 경험**: 로그인 후 적절한 페이지로 이동

#### 왜 이렇게 설정했나?

**`/test/profile` 추가 이유:**
- 로그인 후 바로 프로필 페이지로 이동하고 싶을 때
- 프로필 편집 중 재인증이 필요한 경우
- 사용자가 프로필 관련 작업을 계속할 수 있도록

**`/test/login` 추가 이유:**
- 로그인 실패 시 다시 로그인 페이지로 이동
- 소셜 로그인 후 추가 정보 입력이 필요한 경우
- 로그인 플로우 내에서 페이지 이동

---

## 실제 서비스 배포 시 설정 변경

### 🚀 프로덕션 환경 설정 예시

#### 1. **Site URL 변경**
```
개발: http://localhost:3000
스테이징: https://staging.yourapp.com
프로덕션: https://yourapp.com
```

#### 2. **Additional Redirect URLs 변경**
```
프로덕션 예시:
- https://yourapp.com/dashboard
- https://yourapp.com/profile
- https://yourapp.com/auth/callback
- https://yourapp.com/login
```

### 📝 배포 단계별 설정

#### **스테이징 환경**
```
Site URL: https://staging.yourapp.com
Additional Redirect URLs:
- https://staging.yourapp.com/dashboard
- https://staging.yourapp.com/profile
- https://staging.yourapp.com/auth/callback
```

#### **프로덕션 환경**
```
Site URL: https://yourapp.com
Additional Redirect URLs:
- https://yourapp.com/dashboard
- https://yourapp.com/profile
- https://yourapp.com/auth/callback
- https://yourapp.com/admin (관리자 페이지가 있는 경우)
```

### 🔄 환경별 관리 방법

#### **방법 1: 환경별 Supabase 프로젝트 분리**
```
개발: your-app-dev
스테이징: your-app-staging  
프로덕션: your-app-prod
```

#### **방법 2: 하나의 프로젝트에서 모든 URL 등록**
```
Site URL: https://yourapp.com (프로덕션 우선)

Additional Redirect URLs:
- http://localhost:3000 (개발)
- http://localhost:3000/profile (개발)
- https://staging.yourapp.com (스테이징)
- https://staging.yourapp.com/dashboard (스테이징)
- https://yourapp.com/dashboard (프로덕션)
- https://yourapp.com/profile (프로덕션)
```

---

## 보안 고려사항

### ⚠️ 중요한 보안 규칙

#### 1. **와일드카드 사용 금지**
```
❌ 잘못된 예: https://*.yourapp.com
✅ 올바른 예: https://app.yourapp.com
```

#### 2. **HTTP vs HTTPS**
```
개발: http://localhost:3000 (허용)
프로덕션: https://yourapp.com (필수)
```

#### 3. **불필요한 URL 제거**
- 개발용 URL을 프로덕션에서 제거
- 사용하지 않는 리다이렉트 URL 정리
- 정기적인 URL 목록 검토

### 🛡️ 보안 체크리스트

- [ ] 프로덕션에서 `localhost` URL 제거
- [ ] HTTPS 사용 확인
- [ ] 불필요한 리다이렉트 URL 제거
- [ ] 도메인 소유권 확인
- [ ] 정기적인 설정 검토

---

## 실제 적용 예시

### 🏢 기업용 HR 관리 시스템

```
Site URL: https://hr.company.com

Additional Redirect URLs:
- https://hr.company.com/dashboard
- https://hr.company.com/profile
- https://hr.company.com/admin
- https://hr.company.com/reports
- https://hr.company.com/auth/callback
```

### 🌐 SaaS 서비스

```
Site URL: https://app.yourservice.com

Additional Redirect URLs:
- https://app.yourservice.com/dashboard
- https://app.yourservice.com/settings
- https://app.yourservice.com/billing
- https://admin.yourservice.com/dashboard (관리자 도메인)
```

---

## 📚 추가 참고사항

### 환경변수 관리
```bash
# .env.local (개발)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production (프로덕션)
NEXT_PUBLIC_SITE_URL=https://yourapp.com
```

### Next.js에서 동적 리다이렉트
```typescript
// 환경에 따른 동적 리다이렉트 URL 설정
const getRedirectUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}${path}`
}
```

이 설정들을 통해 안전하고 효율적인 인증 시스템을 구축할 수 있습니다.

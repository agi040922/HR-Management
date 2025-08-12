# Google OAuth 연동 완벽 가이드

## 📋 목차
1. [Google OAuth란 무엇인가?](#google-oauth란-무엇인가)
2. [Google Cloud Console 설정](#google-cloud-console-설정)
3. [Supabase 설정](#supabase-설정)
4. [코드 구현](#코드-구현)
5. [테스트 및 검증](#테스트-및-검증)
6. [실제 서비스 배포 시 주의사항](#실제-서비스-배포-시-주의사항)
7. [문제 해결](#문제-해결)

---

## Google OAuth란 무엇인가?

### 🔐 OAuth의 개념

**OAuth (Open Authorization)**는 사용자가 비밀번호를 직접 제공하지 않고도 다른 웹사이트나 애플리케이션에 자신의 정보에 대한 접근 권한을 부여할 수 있게 해주는 개방형 표준입니다.

### 🎯 Google OAuth를 사용하는 이유

#### **사용자 관점:**
- ✅ **편의성**: 별도 회원가입 없이 Google 계정으로 바로 로그인
- ✅ **보안성**: 비밀번호를 여러 사이트에 입력할 필요 없음
- ✅ **신뢰성**: Google의 강력한 보안 시스템 활용

#### **개발자 관점:**
- ✅ **개발 효율성**: 회원가입/로그인 로직 간소화
- ✅ **사용자 정보**: 이메일, 이름, 프로필 사진 등 기본 정보 자동 획득
- ✅ **보안 부담 감소**: 비밀번호 저장/관리 부담 없음

### 🔄 OAuth 플로우 이해

```
1. 사용자가 "Google로 로그인" 버튼 클릭
2. Google 로그인 페이지로 리다이렉트
3. 사용자가 Google에서 로그인 및 권한 승인
4. Google이 인증 코드와 함께 우리 앱으로 리다이렉트
5. Supabase가 인증 코드를 액세스 토큰으로 교환
6. 사용자 정보를 가져와서 우리 앱에 로그인 처리
```

---

## Google Cloud Console 설정

### 1단계: Google Cloud Console 접속

1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. **프로젝트 선택** 또는 **새 프로젝트 생성**

### 2단계: OAuth 동의 화면 설정

#### **왜 필요한가?**
OAuth 동의 화면은 사용자가 Google로 로그인할 때 보게 되는 권한 요청 화면입니다. 어떤 정보에 접근하는지, 누가 만든 앱인지 등을 사용자에게 알려줍니다.

#### **설정 방법:**

1. **좌측 메뉴** → **APIs & Services** → **OAuth consent screen**
2. **User Type 선택:**
   ```
   개발/테스트: Internal (조직 내부만)
   실제 서비스: External (모든 Google 사용자)
   ```

3. **앱 정보 입력:**
   ```
   App name: HR Management System (또는 원하는 앱 이름)
   User support email: your-email@gmail.com
   Developer contact information: your-email@gmail.com
   ```

4. **스코프 설정:**
   ```
   기본 스코프:
   - .../auth/userinfo.email
   - .../auth/userinfo.profile
   - openid
   ```

### 3단계: OAuth 2.0 클라이언트 ID 생성

#### **왜 필요한가?**
클라이언트 ID와 Secret은 Google이 우리 앱을 식별하는 고유한 키입니다. 이를 통해 Google은 어떤 앱에서 로그인 요청이 왔는지 알 수 있습니다.

#### **설정 방법:**

1. **좌측 메뉴** → **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. **Application type**: `Web application`
4. **Name**: `HR Management - Web Client`

5. **Authorized JavaScript origins** (중요!):
   ```
   개발 환경:
   http://localhost:3000
   
   실제 서비스:
   https://yourdomain.com
   ```

6. **Authorized redirect URIs** (매우 중요!):
   ```
   개발 환경:
   http://localhost:54324/auth/v1/callback
   
   실제 서비스:
   https://your-project-ref.supabase.co/auth/v1/callback
   ```

#### **🚨 Redirect URI 설명**
- **형식**: `https://[supabase-project-ref].supabase.co/auth/v1/callback`
- **찾는 방법**: Supabase 대시보드 → Settings → API → Project URL 확인
- **왜 이 형식인가**: Supabase Auth가 Google로부터 인증 코드를 받는 엔드포인트

### 4단계: 클라이언트 정보 저장

생성 완료 후 다음 정보를 안전하게 저장:
```
Client ID: 123456789-abcdefg.apps.googleusercontent.com
Client Secret: GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## Supabase 설정

### 1단계: Authentication 설정 접속

1. **Supabase 대시보드** → **Authentication** → **Providers**
2. **Google** 찾아서 클릭

### 2단계: Google OAuth 활성화

#### **설정 값 입력:**

```
Enable Google provider: ✅ 체크

Google Client ID: 
123456789-abcdefg.apps.googleusercontent.com

Google Client Secret:
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

#### **왜 이렇게 설정하는가?**

**Context7에서 확인한 Supabase Auth 설정 방식:**
```
EXTERNAL_GOOGLE_ENABLED: true
EXTERNAL_GOOGLE_CLIENT_ID: [Google Client ID]
EXTERNAL_GOOGLE_SECRET: [Google Client Secret]
EXTERNAL_GOOGLE_REDIRECT_URI: [Supabase Callback URL]
```

### 3단계: Redirect URL 확인

Supabase가 자동으로 생성하는 Redirect URL 확인:
```
https://[your-project-ref].supabase.co/auth/v1/callback
```

이 URL이 Google Cloud Console의 **Authorized redirect URIs**와 정확히 일치해야 합니다.

---

## 코드 구현

### 1단계: 기존 로그인 페이지에 Google 로그인 추가

현재 `/test/login` 페이지에 Google 로그인 버튼이 이미 구현되어 있습니다:

```typescript
// app/test/login/page.tsx에서 확인 가능
const handleGoogleLogin = async () => {
  setLoading(true)
  setError('')
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/test/profile`
      }
    })
    
    if (error) {
      setError(`Google 로그인 실패: ${error.message}`)
    }
  } catch (err) {
    setError('예상치 못한 오류가 발생했습니다.')
  } finally {
    setLoading(false)
  }
}
```

### 2단계: useAuth 훅에서 Google 로그인 지원 확인

현재 `useAuth` 훅에 이미 소셜 로그인 기능이 구현되어 있습니다:

```typescript
// hooks/useAuth.ts
const signInWithProvider = async (provider: 'google' | 'github') => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/test/profile`
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error(`${provider} 로그인 오류:`, error)
    return { data: null, error }
  }
}
```

### 3단계: 로그인 후 사용자 정보 처리

Google 로그인 성공 시 자동으로 처리되는 사용자 정보:

```typescript
// Google OAuth로 로그인한 사용자 정보 예시
{
  id: "google-user-uuid",
  email: "user@gmail.com",
  user_metadata: {
    avatar_url: "https://lh3.googleusercontent.com/...",
    email: "user@gmail.com",
    email_verified: true,
    full_name: "홍길동",
    iss: "https://accounts.google.com",
    name: "홍길동",
    picture: "https://lh3.googleusercontent.com/...",
    provider_id: "123456789012345678901",
    sub: "123456789012345678901"
  }
}
```

---

## 테스트 및 검증

### 1단계: 로컬 환경 테스트

1. **개발 서버 실행:**
   ```bash
   npm run dev
   ```

2. **로그인 페이지 접속:**
   ```
   http://localhost:3000/test/login
   ```

3. **Google 로그인 버튼 클릭:**
   - Google 로그인 페이지로 리다이렉트 확인
   - 권한 승인 후 프로필 페이지로 이동 확인

### 2단계: 디버그 정보 확인

브라우저 개발자 도구(F12)에서 확인할 정보:

```javascript
// 콘솔에서 현재 사용자 정보 확인
console.log('Current user:', supabase.auth.getUser())

// 세션 정보 확인
console.log('Session:', supabase.auth.getSession())
```

### 3단계: 데이터베이스 확인

Supabase 대시보드에서 확인:
1. **Authentication** → **Users** → Google 로그인 사용자 생성 확인
2. **Table Editor** → **users** → 자동 프로필 생성 확인

---

## 실제 서비스 배포 시 주의사항

### 1단계: 도메인 설정 업데이트

#### **Google Cloud Console:**
```
Authorized JavaScript origins:
- https://yourdomain.com
- https://www.yourdomain.com

Authorized redirect URIs:
- https://your-project-ref.supabase.co/auth/v1/callback
```

#### **Supabase Authentication Settings:**
```
Site URL: https://yourdomain.com

Additional Redirect URLs:
- https://yourdomain.com/dashboard
- https://yourdomain.com/profile
```

### 2단계: 환경변수 관리

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3단계: OAuth 동의 화면 검증

**개발 → 프로덕션 전환 시:**
1. Google Cloud Console에서 **OAuth consent screen** → **PUBLISH APP**
2. Google 검토 과정 (민감한 스코프 사용 시 필요)
3. 도메인 소유권 확인

---

## 문제 해결

### 🚨 자주 발생하는 오류들

#### **1. "redirect_uri_mismatch" 오류**
```
원인: Google Cloud Console의 Redirect URI와 실제 콜백 URL 불일치
해결: Authorized redirect URIs에 정확한 Supabase 콜백 URL 추가
```

#### **2. "invalid_client" 오류**
```
원인: Client ID 또는 Client Secret 잘못 입력
해결: Google Cloud Console에서 정확한 값 재확인 및 복사
```

#### **3. "access_denied" 오류**
```
원인: 사용자가 권한 승인 거부 또는 OAuth 동의 화면 미설정
해결: OAuth consent screen 설정 완료 확인
```

#### **4. 로그인 후 리다이렉트 실패**
```
원인: Site URL 또는 Additional Redirect URLs 설정 오류
해결: Supabase Authentication Settings에서 URL 확인
```

### 🔧 디버깅 방법

#### **1. Supabase Auth 로그 확인:**
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

#### **2. Google OAuth 설정 확인:**
```bash
# Supabase 설정 확인
curl https://your-project-ref.supabase.co/auth/v1/settings
```

#### **3. 네트워크 탭에서 요청/응답 확인:**
- OAuth 인증 요청 URL 확인
- 콜백 응답 상태 코드 확인
- 에러 메시지 상세 내용 확인

---

## 📚 추가 참고사항

### 보안 고려사항

1. **Client Secret 보안:**
   - 절대 클라이언트 사이드 코드에 노출 금지
   - 환경변수로만 관리
   - 정기적인 로테이션 권장

2. **스코프 최소화:**
   ```
   필수: email, profile, openid
   추가: 필요한 경우에만 요청
   ```

3. **HTTPS 사용:**
   - 프로덕션에서는 반드시 HTTPS 사용
   - 개발 환경에서만 HTTP 허용

### 사용자 경험 개선

1. **로딩 상태 표시:**
   ```typescript
   {loading && <span>Google로 로그인 중...</span>}
   ```

2. **에러 메시지 개선:**
   ```typescript
   const getErrorMessage = (error: string) => {
     switch (error) {
       case 'access_denied':
         return '로그인이 취소되었습니다.'
       case 'invalid_client':
         return '로그인 설정에 문제가 있습니다. 관리자에게 문의하세요.'
       default:
         return '로그인 중 오류가 발생했습니다.'
     }
   }
   ```

이 가이드를 따라하시면 Google OAuth 연동을 완벽하게 구현할 수 있습니다! 🚀

# React Hooks 설명서

이 문서는 HR 관리 시스템에서 사용하는 주요 React Hooks의 구조와 활용법을 설명합니다.

## 1. useAuth Hook

### 개요
`useAuth`는 Supabase Auth를 사용한 사용자 인증 상태를 관리하는 커스텀 훅입니다.

### 주요 기능
- 현재 로그인된 사용자 정보 관리
- 세션 정보 관리  
- 로딩 상태 관리
- 인증 상태 변화 감지
- 다양한 로그인/로그아웃 메서드 제공

### 제공하는 상태
```typescript
{
  // 상태
  user: User | null,           // 현재 로그인된 사용자
  session: Session | null,     // 현재 세션 정보
  loading: boolean,            // 로딩 상태
  isAuthenticated: boolean,    // 로그인 여부 (!!user)
}
```

### 제공하는 메서드
```typescript
{
  // 로그인 메서드들
  signInWithEmail: (email: string, password: string) => Promise<{data, error}>,
  signInWithMagicLink: (email: string, redirectTo?: string) => Promise<{data, error}>,
  signInWithProvider: (provider: 'google' | 'github' | 'facebook', redirectTo?: string) => Promise<{data, error}>,
  
  // 회원가입
  signUp: (email: string, password: string, options?) => Promise<{data, error}>,
  
  // 기타
  signOut: () => Promise<{error}>,
  resetPassword: (email: string, redirectTo?: string) => Promise<{data, error}>,
  updateUser: (updates: {email?, password?, data?}) => Promise<{data, error}>
}
```

### 사용 예시
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading, isAuthenticated, signInWithEmail, signOut } = useAuth();
  
  if (loading) return <div>로딩 중...</div>;
  
  if (!isAuthenticated) {
    return (
      <button onClick={() => signInWithEmail('test@example.com', 'password')}>
        로그인
      </button>
    );
  }
  
  return (
    <div>
      <p>안녕하세요, {user.email}님!</p>
      <button onClick={signOut}>로그아웃</button>
    </div>
  );
}
```

### 활용 범위
- **인증이 필요한 모든 페이지**: 로그인 상태 확인
- **로그인/회원가입 폼**: 인증 메서드 사용
- **보호된 라우트**: 인증 상태에 따른 접근 제어
- **사용자 정보 표시**: 현재 사용자 정보 표시
- **API 호출**: `user.id`를 사용한 데이터 필터링

---

## 2. useUser Hook

### 개요
`useUser`는 사용자 프로필 정보를 관리하는 커스텀 훅입니다. `useAuth`와 함께 사용되어 확장된 사용자 정보를 제공합니다.

### 주요 기능
- 사용자 프로필 정보 조회/생성/업데이트
- 아바타 이미지 업로드/삭제
- 사용자 설정(preferences) 관리
- 시스템 설정(settings) 관리

### 제공하는 상태
```typescript
{
  // 상태
  profile: UserRow | null,     // 사용자 프로필 정보
  loading: boolean,            // 로딩 상태
  uploading: boolean,          // 파일 업로드 상태
}
```

### 제공하는 메서드
```typescript
{
  // 프로필 관리
  fetchProfile: () => Promise<void>,
  createProfile: (additionalData?: Partial<UserInsert>) => Promise<{data, error}>,
  updateProfile: (updates: UserUpdate) => Promise<{data, error}>,
  
  // 아바타 관리
  uploadAvatar: (file: File) => Promise<{data, error}>,
  deleteAvatar: () => Promise<{data, error}>,
  
  // 설정 관리
  updatePreferences: (preferences: Record<string, any>) => Promise<{data, error}>,
  updateSettings: (settings: Record<string, any>) => Promise<{data, error}>
}
```

### 데이터베이스 구조
`users` 테이블 구조:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  display_name VARCHAR(100),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  department VARCHAR(100),
  preferences JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 사용 예시
```typescript
import { useUser } from '@/hooks/useUser';

function ProfilePage() {
  const { 
    profile, 
    loading, 
    updateProfile, 
    uploadAvatar, 
    updatePreferences 
  } = useUser();
  
  if (loading) return <div>로딩 중...</div>;
  
  const handleUpdateProfile = async () => {
    const { data, error } = await updateProfile({
      display_name: '새 이름',
      department: 'IT팀'
    });
    
    if (error) {
      console.error('프로필 업데이트 실패:', error);
    } else {
      console.log('프로필 업데이트 성공:', data);
    }
  };
  
  const handleAvatarUpload = async (file: File) => {
    const { data, error } = await uploadAvatar(file);
    if (!error) {
      console.log('아바타 업로드 성공:', data.url);
    }
  };
  
  return (
    <div>
      <h1>{profile?.display_name || '사용자'}</h1>
      <p>{profile?.department}</p>
      <button onClick={handleUpdateProfile}>프로필 업데이트</button>
    </div>
  );
}
```

### 활용 범위
- **프로필 페이지**: 사용자 정보 표시/수정
- **설정 페이지**: 사용자 설정 관리
- **아바타 관리**: 프로필 이미지 업로드/변경
- **사용자 맞춤화**: 개인 설정에 따른 UI 변경
- **사용자 정보 표시**: 헤더, 사이드바 등에서 사용자 정보 표시

---

## 3. Hooks 간의 관계

### useAuth ↔ useUser 관계
```typescript
// useUser는 내부적으로 useAuth를 사용
const { user, isAuthenticated } = useAuth();

// 사용자가 로그인하면 자동으로 프로필 로드
useEffect(() => {
  if (isAuthenticated && user) {
    fetchProfile(); // user.id를 사용해서 프로필 조회
  }
}, [isAuthenticated, user]);
```

### 데이터 흐름
1. **로그인** → `useAuth`에서 `user` 상태 업데이트
2. **프로필 로드** → `useUser`에서 `user.id`로 프로필 조회
3. **프로필 없음** → 자동으로 기본 프로필 생성
4. **프로필 업데이트** → `users` 테이블 업데이트

---

## 4. 실제 프로젝트에서의 활용 패턴

### 페이지 레벨에서의 사용
```typescript
// 대부분의 페이지에서 기본 패턴
export default function SomePage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  
  if (authLoading || profileLoading) return <Loading />;
  if (!user) return <LoginRequired />;
  
  return <PageContent user={user} profile={profile} />;
}
```

### API 호출에서의 사용
```typescript
// 사용자별 데이터 조회
const { user } = useAuth();

const loadUserStores = async () => {
  if (user) {
    const stores = await getUserStores(user.id); // user.id 활용
    setStores(stores);
  }
};
```

### 조건부 렌더링
```typescript
const { user } = useAuth();
const { profile } = useUser();

return (
  <div>
    {user && <UserInfo user={user} />}
    {profile?.department === 'admin' && <AdminPanel />}
    {profile?.settings?.showAdvanced && <AdvancedOptions />}
  </div>
);
```

---

## 5. 주의사항 및 베스트 프랙티스

### 주의사항
1. **useUser는 useAuth에 의존**: useAuth 없이 단독 사용 불가
2. **자동 프로필 생성**: 첫 로그인 시 프로필이 자동 생성됨
3. **JSONB 필드**: preferences, settings는 객체 형태로 저장
4. **파일 업로드**: 아바타는 Supabase Storage 사용

### 베스트 프랙티스
1. **로딩 상태 처리**: 두 훅 모두 loading 상태 확인
2. **에러 처리**: API 호출 시 항상 error 체크
3. **조건부 렌더링**: user/profile 존재 여부 확인
4. **메모리 누수 방지**: useEffect cleanup 함수 사용

### 성능 최적화
```typescript
// 불필요한 리렌더링 방지
const memoizedUserInfo = useMemo(() => {
  return user ? { id: user.id, email: user.email } : null;
}, [user?.id, user?.email]);

// 조건부 프로필 로드
useEffect(() => {
  if (isAuthenticated && user && !profile) {
    fetchProfile();
  }
}, [isAuthenticated, user, profile]);
```

---

## 6. 확장 가능성

### 추가 가능한 기능
- **역할 기반 권한 관리**: profile에 role 필드 추가
- **팀/조직 관리**: 다중 조직 지원
- **알림 설정**: 개인별 알림 설정 관리
- **테마 설정**: 다크/라이트 모드 등
- **언어 설정**: 다국어 지원

### 커스텀 훅 확장 예시
```typescript
// 권한 관리 훅
export const usePermissions = () => {
  const { profile } = useUser();
  
  const hasPermission = (permission: string) => {
    return profile?.role?.permissions?.includes(permission);
  };
  
  const isAdmin = profile?.role?.name === 'admin';
  const isManager = profile?.role?.name === 'manager';
  
  return { hasPermission, isAdmin, isManager };
};
```

이 문서를 통해 useAuth와 useUser 훅의 구조와 활용법을 이해하고, 프로젝트에서 효과적으로 사용할 수 있습니다.

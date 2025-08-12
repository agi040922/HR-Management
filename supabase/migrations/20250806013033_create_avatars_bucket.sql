-- 아바타 이미지 저장을 위한 Storage 버킷 생성
-- Supabase Storage 설정

-- 주의: 이 마이그레이션은 수동으로 Supabase 대시보드에서 설정해야 할 수 있습니다.
-- 로컬 환경에서 Storage 정책 생성 권한 문제가 발생할 수 있습니다.

-- Step 1: avatars 버킷 생성 (공개 접근 가능)
-- 이 부분은 Supabase 대시보드 > Storage에서 수동으로 생성하세요.
/*
DO $$
BEGIN
  -- 버킷이 존재하지 않으면 생성
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'avatars',
      'avatars',
      true,
      5242880, -- 5MB 제한
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    );
  END IF;
END $$;
*/

-- Step 2: RLS 정책은 Supabase 대시보드에서 수동으로 설정하세요.
-- Storage > avatars 버킷 > Policies 탭에서 다음 정책들을 생성:

/*
정책 1: "Avatar images are publicly accessible"
- 작업: SELECT
- 대상: storage.objects
- 조건: bucket_id = 'avatars'

정책 2: "Users can upload their own avatar"
- 작업: INSERT
- 대상: storage.objects
- 조건: bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]

정책 3: "Users can update their own avatar"
- 작업: UPDATE
- 대상: storage.objects
- 조건: bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]

정책 4: "Users can delete their own avatar"
- 작업: DELETE
- 대상: storage.objects
- 조건: bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
*/

-- 코멘트 추가
COMMENT ON POLICY "Avatar images are publicly accessible" ON storage.objects IS '모든 사용자가 아바타 이미지를 조회할 수 있습니다';
COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS '사용자는 자신의 아바타만 업로드할 수 있습니다';
COMMENT ON POLICY "Users can update their own avatar" ON storage.objects IS '사용자는 자신의 아바타만 수정할 수 있습니다';
COMMENT ON POLICY "Users can delete their own avatar" ON storage.objects IS '사용자는 자신의 아바타만 삭제할 수 있습니다';

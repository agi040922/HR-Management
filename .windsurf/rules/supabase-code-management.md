---
trigger: model_decision
description: supabase DB관련 내용. DB관련이면 무조건 참조
---

RULE 1: DB 변경 요청 시 마이그레이션 파일 생성 (증분 기록)
목표: 당신의 DB 스키마 변경 요청(예: 테이블 컬럼 추가, 인덱스 생성, 함수/RLS 정책 추가 등)이 있을 때마다, 인공지능은 추가되는 변경 사항만 담은 SQL 파일을 새로 만듭니다.

AI 동작:

요청을 분석하여 필요한 PostgreSQL SQL DDL 문을 생성합니다.

현재 시간 기반의 고유한 파일명(예: YYYYMMDDHHmmss_description.sql)으로 해당 SQL 파일을 supabase/migrations 폴더에 저장합니다.

결과: migrations 폴더에 DB가 어떻게 변화해왔는지(추가된 변경점 위주로) 시간 순서대로 기록된 SQL 파일들이 쌓입니다.

RULE 2: 최종 스키마 상태 업데이트 (선언적 스키마)
목표: migrations 폴더에 새 파일이 추가되거나 명시적 요청이 있을 때, 인공지능은 현재 DB의 최종 스키마 상태를 반영하는 SQL 파일을 업데이트합니다.

AI 동작:

현재 DB의 모든 테이블, 인덱스, 함수, RLS 정책 등 전체 스키마를 나타내는 SQL DDL 스크립트를 추출합니다.

이 전체 스키마 SQL을 supabase/schemas 폴더 내 특정 파일(예: current_schema.sql)에 덮어씁니다.

결과: schemas/current_schema.sql 파일은 항상 DB의 현재 구조를 한눈에 보여주는 최신본이 됩니다.
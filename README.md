# gloomy-gene

멜랑콜리(Melancholy) 상태의 사용자가 **도전 행동 + 원자 행동(Atom Action) + 게임화 보상**을 통해 스스로를 재구성하고, 생산적인 주체로 복귀하도록 돕는 인간 중심 행동 변화 플랫폼입니다.

## 빠른 시작

```bash
npm install
npm run dev
```

- 접속: `http://localhost:3000`
- 현재 MVP 저장 방식: 브라우저 `localStorage`
- Supabase 연동 시 재배포 후에도 데이터 유지 가능
- Supabase 연동/배포 절차: `DEPLOY.md` 참고
- 헬스체크: `/api/health`
- 정책 페이지: `/privacy`, `/terms`

## 운영 필수 설정

실서비스 환경에서는 아래가 반드시 필요합니다.

1. Vercel Environment Variables 설정
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  	- `OPENAI_API_KEY`
2. Supabase SQL Editor에서 `supabase/schema.sql` 적용
3. Supabase Authentication > Providers > Google 활성화 (+ Redirect URL 설정)

## 1) 프로젝트 개요

### 비전
- 부정적 심리 상태를 기술 시스템 안에서 "개조 가능한 상태"로 전환한다.
- 평가/비교 중심의 자기관리 대신, **변화 기록 중심의 자기 재조립 경험**을 제공한다.
- 개인 회복 데이터를 사회적 임팩트 지표로 확장해 B2G/B2B 모델로 연결한다.

### 핵심 철학
- 인간은 행동을 통해 자기 효능감을 획득한다.
- 행동은 "거대 목표"가 아닌 "즉시 실행 가능한 최소 단위"로 분해되어야 한다.
- 서비스는 사용자를 판단하지 않고, 오직 변화의 흔적을 저장하고 시각화한다.

---

## 2) 제품 원칙

1. **도전 행동 우선**: 가치 있는 자기 인식은 도전적 행동에서 발생한다.
2. **원자 행동 분해**: 과업을 더 이상 분절할 수 없는 실행 단위로 스키마화한다.
3. **보상은 체크포인트에만**: 너무 사소한 준비 동작은 기록하되 보상에서 제외한다.
4. **평가 금지, 기록 집중**: 상승/하락 대신 `변경됨/유지됨/반복됨` 상태로 표현한다.
5. **자아 재조립 연출**: 로그인부터 성장 루프 전체를 "나를 업그레이드"하는 경험으로 설계한다.

---

## 3) 핵심 기능 기획

## 3.1 도전적 행동 보상 시스템
- 사용자는 "도전 과제(Challenge)"를 생성한다.
- 각 도전 과제는 원자 행동 목록으로 분해된다.
- 원자 행동 완료 시 토큰 보상을 지급한다.

### 원자 행동 보상 기준
- 보상 대상: 최종 과업 달성에 의미 있는 체크포인트
- 보상 제외: 지나치게 기본적인 준비 단계

예시) 목표가 `근처 도서관 가기`인 경우
- 보상 제외: 일어나기, 샤워하기, 옷입기
- 보상 지급: 근처 도서관 검색하기, 도서관 도착하기

## 3.2 로그인 경험 (Self-Reassembly Onboarding)
- 로그인 순간, 사용자는 "미지의 게임"에 진입한다.
- 초기 세팅은 "자아 재조립 등록" 흐름으로 연출한다.
- 첫 도전 과제 설정 → 첫 원자 행동 생성 → 첫 보상 획득까지 끊김 없이 연결한다.

## 3.3 커스터마이징
- 캐릭터, UI 테마, 목표 기록 방식을 사용자 주도로 변경 가능
- 권장 기술:
	- `three.js`: 캐릭터/자아 재조립 3D 시각화
	- `framer-motion`: 행동 완료 시 시각 피드백 연출

## 3.4 대시보드 (심리 상태 시각화)
- 사용자의 변화 데이터를 시계열로 시각화
- 해석/평가 없이 "관찰" 중심으로 제공
- 감정 변동 파고를 수치화해 통제 가능 감각을 지원

## 3.5 버전 기록 (Version Record)
- 인생의 변화를 소프트웨어 버전관리처럼 기록
- 작은 행동 단위를 `commit`처럼 저장
- 상태값(3-state):
	- `Changed` (변경됨): 새로운 활동 변수 감지
	- `Maintained` (유지됨): 핵심 지표 안정 유지
	- `Repeated` (반복됨): 특정 행동 패턴 반복 관찰

## 3.6 철학적 UI
- 비교/평가 대신 존재론적 지지 메시지 제공
- 특정 상태(예: 반복됨)에서 스토아/실존주의 잠언을 맥락적으로 노출
- 메시지는 "행동 정당화"와 "심리적 지지"에 집중

---

## 4) MVP 범위 (우선 개발)

### 반드시 포함
1. 인증/로그인
2. 도전 과제 생성
3. 원자 행동 분해 및 체크
4. 보상 토큰 적립
5. 버전 기록 3상태 저장
6. 개인 대시보드(기본 그래프)

### 2차 확장
- 고급 커스터마이징
- 3D 캐릭터 연출 강화
- 철학적 UI 콘텐츠 엔진
- B2G/B2B 리포팅 대시보드

---

## 5) 기술 스택 제안

- 프론트엔드: No-code + AI 코드 에디터(Copilot/Cursor) + 커스텀 코드
- 백엔드: Supabase (Auth, Postgres, Storage, Realtime)
- 연동: 외부 API 기반 메시지/분석 모듈 확장

---

## 6) 데이터 모델링 (초안)

## 6.1 `users`
- 사용자 캐릭터 정보
- 보유 토큰 잔액
- 현재 버전 정보

주요 필드 예시
- `id` (uuid, pk)
- `nickname` (text)
- `avatar_config` (jsonb)
- `theme_config` (jsonb)
- `token_balance` (int, default 0)
- `current_version_label` (text)
- `created_at`, `updated_at` (timestamptz)

## 6.2 `actions`
- 도전 행동 및 원자 행동 구조 저장
- 완료 시 지급 보상 값 설정

주요 필드 예시
- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id)
- `challenge_title` (text)
- `atom_title` (text)
- `is_rewardable` (boolean)
- `reward_token` (int)
- `status` (text: pending/completed)
- `completed_at` (timestamptz)

## 6.3 `version_history`
- 평가가 아닌 변화 기록 저장

주요 필드 예시
- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id)
- `action_id` (uuid, fk -> actions.id)
- `state` (text: changed/maintained/repeated)
- `note` (text)
- `created_at` (timestamptz)

## 6.4 `social_impact_data`
- 무기력 해소 정도를 수치화해 B2G/B2B 관점 지표 저장

주요 필드 예시
- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id)
- `engagement_score` (numeric)
- `consistency_score` (numeric)
- `recovery_index` (numeric)
- `captured_at` (timestamptz)

---

## 7) 보상 로직 (MVP 규칙)

1. 원자 행동 완료 이벤트 발생
2. `is_rewardable = true`인 경우에만 토큰 지급
3. 토큰 지급 후 `users.token_balance` 누적
4. 동일 행동 중복 보상 방지를 위한 idempotency 키 적용
5. 완료 이벤트를 `version_history`에 함께 커밋

---

## 8) UX 플로우 (요약)

1. 로그인
2. "자아 재조립 등록" 온보딩
3. 도전 과제 생성
4. 원자 행동 자동/수동 분해
5. 행동 완료 → 시각 효과 → 토큰 적립
6. 버전 기록(`변경됨/유지됨/반복됨`) 갱신
7. 대시보드에서 자기 변화 관찰

---

## 9) 구현 로드맵

### Phase 1 (2~4주)
- Supabase 인증/테이블 구축
- 도전 과제 + 원자 행동 CRUD
- 보상 로직 및 토큰 누적
- 버전 기록 저장
- 기본 대시보드

### Phase 2 (4~8주)
- 커스터마이징 고도화
- 애니메이션/3D 연출
- 철학적 UI 메시지 엔진
- 임팩트 지표 리포팅

---

## 10) 운영 원칙

- 타인과의 비교 지표 미노출
- 사용자 상태에 대한 단정적 진단 문구 금지
- 기록 데이터의 주권은 사용자에게 부여
- B2B/B2G 활용 시 개인 식별정보 비식별화 우선

---

## 다음 작업 제안

원하시면 다음 단계로 바로 진행할 수 있습니다.

1. Supabase용 실제 SQL 스키마(`schema.sql`) 생성
2. 상태 전이/보상 정책을 코드 레벨 의사결정표로 문서화
3. MVP 화면 IA(페이지/컴포넌트 트리) 설계 문서 추가

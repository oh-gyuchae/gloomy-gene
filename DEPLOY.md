# 배포 가이드

## 1) 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## 2) Supabase 준비 (권장)

1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Project Settings > API에서 URL/Anon Key 확인
4. `.env.local` 생성
5. Authentication > Providers에서 Google 활성화
6. Authentication > URL Configuration에서 Redirect URL 설정

```bash
cp .env.example .env.local
```

`.env.local`에 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Google Gemini (원자 행동 자동 분해)
GEMINI_API_KEY=...
# Optional
GEMINI_MODEL=gemini-1.5-flash
```

### Supabase Auth 설정 (Google)

1) `Authentication` > `Providers` > `Google` 활성화

- Google OAuth Client ID/Secret을 입력 후 Save

2) `Authentication` > `URL Configuration`

- Site URL
	- 로컬: `http://localhost:3000`
	- 프로덕션: `https://gloomy-gene.vercel.app` (또는 본인 도메인)
- Redirect URLs
	- `http://localhost:3000/auth/callback`
	- `https://gloomy-gene.vercel.app/auth/callback`
	- (커스텀 도메인이 있으면) `https://<your-domain>/auth/callback`

### 보안 메모

- `app_snapshots`는 `authenticated` 사용자만 본인 데이터 접근 가능하도록 RLS 정책이 적용되어 있습니다.
- `schema.sql`을 기존 프로젝트에 재적용할 때 `app_snapshots` 테이블 구조 변경(`device_id` -> `user_id`)이 포함됩니다.

## 3) Vercel 배포

### 방법 A: GitHub 연동 (권장)
1. 저장소를 GitHub에 push
2. Vercel에서 New Project > 저장소 선택
3. Environment Variables에 Supabase 키 입력
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `GEMINI_API_KEY`
4. Deploy

### 방법 B: CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## 4) 배포 후 점검 체크리스트

- 로그인(재조립 등록) 화면 노출 확인
- 도전 과제 생성 및 원자 행동 완료 확인
- 토큰 적립 및 Version Record(변경됨/유지됨/반복됨) 확인
- 브라우저 새로고침/재배포 후에도 기존 데이터가 유지되는지 확인
- `https://<your-domain>/api/health`가 200 응답인지 확인
- 하단 `개인정보 처리방침`, `이용약관` 페이지 접근 확인

## 5) Not Found 방지 확인

- Vercel Project Settings > Framework Preset가 `Next.js`인지 확인
- Root Directory가 저장소 루트(`.`)인지 확인
- `vercel.json`이 포함된 최신 커밋으로 재배포

# 당구 기록 관리 앱 (Billiard Tracker)

## 프로젝트 개요

당구 경기 기록을 저장하고, 통계·인사이트를 제공하는 개인 기록 관리 웹 앱.
자신의 핸디캡 대비 실력을 수치로 파악하고, 다른 유저와 랭킹을 비교할 수 있다.

---

## 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, Mantine UI, React Router v7 |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| 인증 | JWT (jsonwebtoken), bcrypt |
| 배포 | Vercel (Frontend) |

---

## 주요 기능

### 1. 게임 기록 CRUD
- 경기 날짜, 점수(score), 이닝(inning), 승/무/패, 게임 유형(1v1 / 2v2 / 3v3 등), 메모 입력
- 게임 입력 시점의 핸디캡을 스냅샷으로 저장 → 이후 핸디 변경이 과거 기록에 영향 없음
- 캘린더 뷰 및 기간별 필터 지원

### 2. 통계 (Stats)
- 전체 / 기간 지정 / 최근 N판 모드 선택 가능
- 집계 항목: 총 게임 수, 승·무·패, 승률, 이닝당 평균 득점(avg), 최고 avg, 팀전 유형별 분포
- 무승부를 제외한 실질 승률 / 게임 유형별 기대 승률 별도 산출

### 3. 인사이트 (Insights)
핸디캡 대비 현재 실력을 **0~100점** 점수로 환산해 핸디 조정 여부를 제안하는 핵심 기능.

**점수 산식**
- avg 점수 (최대 90점): `90 × (avg / 핸디 기준 max)`
- 승률 점수 (최대 10점): `10 × winRate`
- 합산 100점 만점

**핸디 판정 기준**
| 점수 | 판정 |
|------|------|
| 105+ | 강제 핸디업 |
| 100~105 | +1 권장 |
| 95~100 | 평균보다 약간 높음 |
| 90~95 | 적정 |
| 85~90 | 평균보다 약간 낮음 |
| 80~85 | -1 권장 |
| ~80 미만 | 강제 핸디다운 |

인사이트 카드 구성: 폼 트렌드, 연승/연패 스트릭, 최고·최저 게임, 최근 통계, 팀 유형별 승률, 핸디 스코어 도넛 차트

### 4. 랭킹
- 전체 유저 랭킹 조회
- 정렬 기준 선택 가능
- 내 순위 별도 표시

### 5. 게스트 모드
외부 사용자가 특정 유저의 기록을 **읽기 전용**으로 열람하는 기능.

- 로그인 페이지에서 "게스트 체험" 탭 → 유저 ID 입력으로 접근
- JWT에 `isGuest: true` 플래그 포함, 서버에서 쓰기 요청 차단 (403)
- 프론트에서도 게임 추가/수정/삭제/프로필 편집 UI 비활성화
- 상단 바에 👁️ 게스트 배지 표시

### 6. 어드민 페이지
- 관리자 전용 유저 관리 화면

---

## 아키텍처 특징

**Frontend**
- Feature-based 폴더 구조: `features/games`, `features/insights`, `features/ranking` 등 도메인 단위로 분리
- 각 피처 내부에 `*.api.ts`, `use*.ts` (커스텀 훅), `components/` 계층 구성
- `AuthProvider`로 전역 인증 상태 관리, `RequireAuth` 라우트 가드 적용

**Backend**
- RESTful API 구조: `/api/me`, `/api/me/games`, `/api/stats`, `/api/insights`, `/api/ranking`
- Mongoose 모델에 `toPublic()` 메서드 정의 → password 등 민감 필드 자동 제거
- `userId + gameDate` 복합 인덱스로 게임 목록 조회 최적화
- 에러 핸들링: `HttpError` 커스텀 클래스 + 글로벌 에러 미들웨어

---

## 데이터 모델

**User**
```
email, password(hashed), nickname, handicap(0~200)
```

**Game**
```
userId, score, inning, result(WIN/DRAW/LOSE), gameType(1v1/2v2/...), 
handicapAtGame, gameDate, memo
```

---

## 구현 포인트

- **핸디캡 스냅샷**: 게임 저장 시 `handicapAtGame` 필드에 당시 핸디를 고정 저장 → 이후 핸디 수정이 과거 통계에 영향을 주지 않도록 설계
- **per-game 레이팅**: 게임별로 핸디 기준 밴드(min/max/expected)와 실제 avg를 비교해 0~100 점수 산출. 기대치 대비 초과 득점 보너스 포함
- **게스트 모드 이중 보호**: 프론트 UI 비활성화(UX)와 서버 미들웨어 차단(보안) 이중 적용
- **무승부 처리**: 승률 계산 시 무승부를 분모에서 제외해 실질적인 1v1 승률 산출

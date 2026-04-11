### 프로젝트 개요
이 프로젝트는 빌리아드 게임 기록 및 분석 플랫폼으로, 사용자들이 빌리아드 게임 결과를 기록하고, 개인 핸디캡(Handicap), 레이팅(Rating), 승률 등의 통계를 분석할 수 있는 풀스택 웹 애플리케이션입니다. 빌리아드 초보자부터 고수까지 자신의 실력을 추적하고 개선할 수 있도록 설계되었으며, 팀전/개인전 구분, 날짜별 기록, 메모 기능 등을 지원합니다. 백엔드와 프론트엔드로 분리된 모놀리식 아키텍처를 채택하여 확장성과 유지보수성을 고려했습니다.

### 기술 스택
백엔드: Node.js, Express.js (RESTful API), MongoDB (NoSQL 데이터베이스), Mongoose (ODM), bcrypt (비밀번호 해싱), jsonwebtoken (JWT 인증), cors (CORS 처리), dotenv (환경 변수 관리).

프론트엔드: React (19.x), TypeScript, Vite (빌드 도구), Mantine UI (컴포넌트 라이브러리), Axios (HTTP 클라이언트), React Router (라우팅), Flatpickr (날짜 선택기).

기타 도구: ESLint (코드 품질), Nodemon (개발 서버), Vercel (배포, 프론트엔드용).

배포: 백엔드는 Node.js 서버로 직접 배포 가능 (예: Heroku, AWS), 프론트엔드는 Vercel을 통해 정적 호스팅.

### 아키텍처 설계
전체 구조: MVC (Model-View-Controller) 패턴을 기반으로 백엔드와 프론트엔드를 분리. 백엔드는 API 서버 역할을 하며, 프론트엔드는 SPA(Single Page Application)로 구현.

백엔드 아키텍처:

모델: Mongoose를 사용한 스키마 정의 (User, Game 모델).

컨트롤러: 각 기능별 로직 처리 (auth, games, stats 등).

서비스: 비즈니스 로직 분리 (핸디캡 계산, 레이팅 스코어링, 통계 집계).

미들웨어: 인증, 에러 처리, 관리자 권한 체크.

유틸리티: 날짜 범위 계산, 비동기 핸들러, HTTP 에러 처리.

라우트: RESTful 엔드포인트 정의 (예: /api/auth, /api/me/games).

프론트엔드 아키텍처:

컴포넌트 기반: Mantine UI를 활용한 재사용 가능한 컴포넌트.

피처 기반 폴더링: 각 기능별 모듈화 (auth, games, stats, insights 등).

상태 관리: React Hooks와 Context API (AuthProvider).

API 통합: Axios 인스턴스를 통한 백엔드 연동.

보안: JWT 토큰 기반 인증, 비밀번호 해싱, CORS 설정.

확장성: 모듈화된 구조로 새로운 기능 (예: 팀 매칭, 실시간 채팅) 추가 용이.

### 주요 기능
인증 및 사용자 관리: 회원가입/로그인, JWT 토큰 기반 세션 관리, 프로필 조회/수정.

게임 기록: 점수, 이닝, 결과(WIN/DRAW/LOSE), 게임 타입(1v1, 2v2 등), 날짜, 메모 입력. 핸디캡 자동 계산 및 저장.

통계 분석: 평균 점수, 승률, 최근 N판 성적, 월별/기간별 필터링. 차트 및 배지로 시각화.

인사이트: 핸디캡 벤치마크 기반 점수 계산, 실력 판정 (예: "상급자 수준").

랭킹: 사용자별 핸디캡 순위 조회.

관리자 기능: 사용자 관리, 게임 데이터 수정/삭제.

UI/UX: 반응형 디자인 (모바일/데스크톱), 캘린더 뷰, 탭 기반 네비게이션, 다크 모드 지원 (Mantine 기본).

### 데이터베이스 설계

MongoDB: NoSQL 기반, 유연한 스키마.

User 모델:

필드: email (고유, 소문자), password (해시), nickname (고유), handicap (0-200), timestamps.

메서드: toPublic() - 비밀번호 제외 공개 데이터 반환.

Game 모델:

필드: userId (참조), score, inning, result (enum: WIN/DRAW/LOSE/UNKNOWN), gameType (enum: 1v1/2v2 등), handicapAtGame (게임 당시 핸디캡), gameDate, memo, timestamps.

인덱스: userId + gameDate (최적화된 조회).

메서드: toPublic() - 공개 데이터 반환, extra 필드 (레이팅 등 계산 값 추가).

관계: Game은 User를 참조 (1:N). 통계/인사이트는 Game 데이터를 집계하여 계산.

### API 설계

RESTful 엔드포인트 (프론트엔드 endpoints.ts 기반):

/api/auth/register (POST): 회원가입.

/api/auth/login (POST): 로그인.

/api/me (GET): 내 프로필.

/api/me/games (GET/POST/PUT/DELETE): 게임 CRUD.

/api/me/stats (GET): 통계 조회 (기간/최근 N판 필터).

/api/me/insights (GET): 인사이트 계산.

/api/ranking (GET): 랭킹 조회.

/api/users (GET): 사용자 목록 (관리자).

/api/admin (GET/PUT/DELETE): 관리자 기능.

응답 형식: JSON, 에러 핸들링 (HTTP 상태 코드 + 메시지).

인증: Bearer 토큰 헤더 사용.

### 프론트엔드 설계

페이지 구조: HomePage (대시보드), GamesPage (게임 관리), InsightsPage (분석), RankingPage (랭킹), AdminPage (관리), Auth 관련 페이지.

컴포넌트: 재사용 가능 (StatsSection, GameListWithEdit, GameCalendarCard 등).

상태 관리: useHomeDashboard, useGames 등의 커스텀 훅.

스타일링: Mantine 테마, 반응형 그리드, 아이콘 (Tabler Icons).

네비게이션: BottomNav (모바일), TopBar (데스크톱).

### 배포 및 인프라

백엔드: Node.js 서버, MongoDB Atlas (클라우드 DB) 사용 가능. 환경 변수로 설정 분리.

프론트엔드: Vercel 배포, 정적 빌드.

CI/CD: 간단한 스크립트 기반 (package.json scripts).

성능: 인덱스 최적화, 캐싱 없음 (소규모 앱).


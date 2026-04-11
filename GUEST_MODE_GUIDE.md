# 게스트 모드 기능 가이드

## 개요
게스트 모드를 통해 외부 사용자가 특정 사용자의 당구 기록을 읽기 전용으로 체험할 수 있습니다.
게스트는 데이터를 **조회**할 수는 있지만 **추가, 수정, 삭제는 불가능**합니다.

---

## 백엔드 구현 사항

### 1. 게스트 토큰 생성 엔드포인트
**파일**: `backend/services/auth.service.js`, `backend/controllers/auth.controller.js`, `backend/routes/auth.routes.js`

```
POST /api/auth/guest/:userId
```

- 특정 사용자 ID를 받아 게스트 토큰을 발급합니다.
- JWT 토큰에 `isGuest: true` 플래그를 포함합니다.
- 응답: `{ token, user }`

### 2. 게스트 플래그 인식 미들웨어
**파일**: `backend/middleware/auth.middleware.js`

- 토큰 검증 시 JWT에서 `isGuest` 플래그를 추출
- `req.user`에 저장: `{ userId, isGuest }`

### 3. 쓰기 작업 방지 미들웨어
**파일**: `backend/utils/guestCheck.js`

```javascript
function guestCheckMiddleware(req, res, next) {
  if (req.user?.isGuest) {
    throw new HttpError(403, "Guest mode: write operations not allowed");
  }
  next();
}
```

### 4. 라우트 보호
다음 라우트들에 `guestCheckMiddleware` 적용:

- **me.routes.js**: `PUT /api/me` (프로필 수정)
- **me.games.routes.js**: 
  - `POST /api/me/games` (게임 추가)
  - `PATCH /api/me/games/:id` (게임 수정)
  - `DELETE /api/me/games/:id` (게임 삭제)

---

## 프론트엔드 구현 사항

### 1. Auth 타입 확장
**파일**: `frontend/src/features/auth/types.ts`

```typescript
export type AuthContextValue = {
  user: UserPublic | null;
  loading: boolean;
  isGuest: boolean;  // ✨ 새로 추가
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  guestLogin: (userId: string) => Promise<void>;  // ✨ 새로 추가
  logout: () => void;
  refreshMe: () => Promise<void>;
};
```

### 2. 게스트 로그인 API
**파일**: `frontend/src/features/auth/auth.api.ts`

```typescript
export async function guestLoginApi(userId: string): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>(`/auth/guest/${userId}`);
  return res.data;
}
```

### 3. AuthProvider 업데이트
**파일**: `frontend/src/features/auth/AuthProvider.tsx`

- `isGuest` 상태 추가
- `guestLogin()` 함수 구현
- localStorage에 `isGuest` 플래그 저장/복원
- 로그인/회원가입 시 isGuest 플래그 초기화

### 4. 로그인 페이지 UI
**파일**: `frontend/src/pages/LoginPage.tsx`

- 탭 UI 추가: "일반 로그인" / "게스트 체험"
- 게스트 탭에서 사용자 ID 입력
- "게스트로 조회" 버튼으로 게스트 로그인

### 5. 게스트 모드 UI 비활성화

#### GameUpsertModal (게임 추가/수정)
**파일**: `frontend/src/features/games/components/GameUpsertModal.tsx`

- 게스트 모드 경고 메시지 표시
- 모든 입력 필드 비활성화
- 저장/수정/삭제 버튼 비활성화

#### GameCard (게임 카드)
**파일**: `frontend/src/features/games/components/GameCard.tsx`

- 게스트 모드일 때 수정/삭제 메뉴 숨김

#### AppShellLayout (게임 추가 FAB)
**파일**: `frontend/src/app/AppShellLayout.tsx`

- 게스트 모드일 때 "새 경기 추가" 버튼 클릭 시 경고 메시지 표시

#### TopBar (상단 바)
**파일**: `frontend/src/app/TopBar.tsx`

- 게스트 모드일 때 배지에 "👁️ 게스트:" 표시
- 노란색 배지로 시각적 구분
- 프로필 편집 메뉴 숨김

### 6. 게스트 모드 유틸리티
**파일**: `frontend/src/shared/utils/guestMode.ts`

```typescript
export function checkGuestMode(isGuest: boolean, action: "create" | "update" | "delete"): boolean
export function showGuestModeWarning(): string
```

---

## 사용 흐름

### 1. 게스트 접근 방법
1. 로그인 페이지 방문
2. "게스트 체험" 탭 선택
3. 대상 사용자의 ID 입력 (예: MongoDB ObjectId)
4. "게스트로 조회" 버튼 클릭
5. 해당 사용자의 데이터를 읽기 전용으로 조회

### 2. 게스트 모드에서 가능한 작업
- ✅ 사용자 프로필 조회
- ✅ 게임 기록 조회
- ✅ 통계/분석 데이터 조회
- ✅ 랭킹 조회
- ✅ 모든 페이지 탐색

### 3. 게스트 모드에서 불가능한 작업
- ❌ 게임 기록 추가
- ❌ 게임 기록 수정
- ❌ 게임 기록 삭제
- ❌ 프로필 정보 수정
- ❌ 데이터 변경 관련 모든 작업

### 4. 게스트 로그아웃
- 상단 프로필 메뉴에서 "로그아웃" 선택
- isGuest 플래그 초기화
- 로그인 페이지로 이동

---

## 기술 세부사항

### JWT 토큰 구조
```json
{
  "userId": "ObjectId",
  "isGuest": true,
  "iat": 1234567890,
  "exp": 1234567890 + 30days
}
```

### 에러 응답
게스트가 쓰기 작업을 시도하면:
```json
{
  "statusCode": 403,
  "message": "Guest mode: write operations not allowed"
}
```

### 로컬스토리지
```javascript
localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIs...");
localStorage.setItem("isGuest", "true");
```

---

## 테스트 방법

### 1. 먼저 일반 사용자 생성
```bash
POST /api/auth/register
{
  "email": "test@test.com",
  "password": "password123",
  "nickname": "TestUser",
  "handicap": 20
}
```

응답에서 `user.id` 복사

### 2. 게스트 모드 테스트
```bash
POST /api/auth/guest/{copied_user_id}
```

응답:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "test@test.com",
    "nickname": "TestUser",
    "handicap": 20
  }
}
```

### 3. 프론트엔드 테스트
1. 로그인 페이지 방문
2. "게스트 체험" 탭 클릭
3. User ID 입력
4. "게스트로 조회" 클릭
5. 게임 추가 버튼 클릭 → "게스트 모드에서는 데이터를 추가할 수 없습니다" 경고
6. 기존 게임 카드의 수정/삭제 메뉴 확인 → 메뉴 없음

---

## 향후 개선 사항

1. **게스트 사용자 목록 조회**
   - `/api/admin/users` 엔드포인트에서 공개 사용자 목록 제공

2. **게스트 세션 추적**
   - 게스트 방문 로그 기록
   - 게스트 사용자 통계

3. **게스트 권한 세분화**
   - 특정 데이터만 공개 여부 설정
   - 게스트 접근 범위 제한

4. **공유 링크 생성**
   - 게스트 링크 자동 생성 및 복사
   - 링크를 통한 직접 게스트 로그인

5. **시간 제한 토큰**
   - 게스트 토큰에 짧은 만료 시간 설정
   - 임시 접근 권한 제공

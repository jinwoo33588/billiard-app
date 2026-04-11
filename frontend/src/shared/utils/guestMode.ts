/**
 * 게스트 모드에서 데이터 수정 작업 시 경고 메시지를 표시하는 유틸리티
 */

export function showGuestModeWarning() {
  return "게스트 모드에서는 데이터를 수정할 수 없습니다.";
}

/**
 * API 호출 시 게스트 모드를 체크하고, 쓰기 작업이면 경고를 띄우는 함수
 * @param isGuest - 게스트 모드 여부
 * @param action - "create" | "update" | "delete"
 * @returns 진행 가능 여부
 */
export function checkGuestMode(isGuest: boolean, action: "create" | "update" | "delete"): boolean {
  if (!isGuest) return true; // 게스트가 아니면 진행 가능

  // 게스트 모드에서 쓰기 작업 시도
  alert(showGuestModeWarning());
  return false;
}

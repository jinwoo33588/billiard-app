// 지금은 단순하지만, 나중에 "공개/비공개", "친구만 공개" 같은 정책이 생기면 여기로 이동.

function ensureFound(doc, message = '해당 기록을 찾을 수 없거나 권한이 없습니다.') {
  if (!doc) {
    const e = new Error(message);
    e.status = 404;
    throw e;
  }
  return doc;
}

module.exports = { ensureFound };
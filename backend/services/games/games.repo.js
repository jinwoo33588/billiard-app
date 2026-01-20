// backend/services/games/games.repo.js
// DB 쿼리용
// 다양한 서비스(내 목록/운영자/리포트/배치)가 재사용할 수 있는 “DB  함수”

const Game = require("../../models/Game");

// 게임 리스트 받아오기
function listByUser(userId, {from, to, limit = 100, sort = 'desc'} = {}){
  const q = {userId};

  // 기간 조건이 있으면 q.gameDate를 만들어 넣기
  if(from || to){
    q.gameDate = {};
    if (from) q.gameDate.$gte = from;
    if (to) q.gameDate.$lte = to;
  }

  // 정렬 객체
  const sortObj = { gameDate: sort === 'asc' ? 1 : -1 };
  
  // mongoose query
  return Game.find(q)
    .sort(sortObj)
    .limit(limit)
    .lean();
}

// 게임 1개를 DB에 저장
// 이후에 async 변환 가능(집계 업데이트 추가할때)
function create(gameDoc){
  return Game.create(gameDoc);
}

// 게임 id로 조회할 때, 그 게임이 내 게임인지를 DB 조건으로 강제
function findByIdAndUser(gameId, userId){
  const q = { _id: gameId, userId };        // 내 게임 조건

  return Game.findOne(q).lean();
  // 나중에 최적화 하고 싶으면 return Game.findOne(q).select('score inning result gameType gameDate memo').lean(); 가능
}

//gameId로 특정 게임을 찾되, userId 조건까지 포함해서 “내 게임”만 업데이트
// 업데이트 성공 시 업데이트된 최신 문서를 반환. 존재 안하면 null 번환
function updateByIdAndUser(gameId, userId, payload){
  const q = { _id: gameId, userId };
  const opts = { new: true };         // -> 업데이트 “전” 문서가 반환안되게 방지

  return Game.findOneAndUpdate(q, payload, opts).lean();
}

// gameId로 삭제하되, userId 조건까지 포함해서 내 게임만 삭제
function deleteByIdAndUser(gameId, userId){
  const q = { _id: gameId, userId };

  return Game.findOneAndDelete(q).lean();

}

module.exports = {
   /* 여기에 함수들 */
   listByUser, 
   create, 
   findByIdAndUser,
   updateByIdAndUser,
   deleteByIdAndUser 
};
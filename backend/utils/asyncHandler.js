// backend/utils/asyncHandler.js
// async (req,res)=>{}에서 에러가 나면 try/catch 없이도 에러 핸들러로 넘기게 함

module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


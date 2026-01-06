// backend/services/users/users.service.js

const usersRepo = require('./users.repo');

async function getMe(userId) {
  const user = await usersRepo.findById(userId);
  if (!user) {
    const e = new Error('사용자를 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }
  return user;
}

async function updateMe(userId, payload) {
  const user = await usersRepo.updateById(userId, payload);
  if (!user) {
    const e = new Error('사용자를 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }
  return user;
}

async function getPublicProfile(userId) {
  const user = await usersRepo.findPublicProfileById(userId);
  if (!user) {
    const e = new Error('사용자를 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }
  return user;
}

module.exports = {
  getMe,
  updateMe,
  getPublicProfile,
};
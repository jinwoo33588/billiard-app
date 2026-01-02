const User = require('../../models/User');

function findById(userId) {
  return User.findById(userId).select('-password');
}

function updateById(userId, payload) {
  return User.findByIdAndUpdate(userId, { $set: payload }, { new: true }).select('-password');
}

function findPublicProfileById(userId) {
  return User.findById(userId).select('_id nickname handicap');
}

module.exports = {
  findById,
  updateById,
  findPublicProfileById,
};
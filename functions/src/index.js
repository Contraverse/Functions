const { findDebate } = require('./findDebate');
const { castVote } = require('./castVote');
const { spectate } = require('./spectate');
const leaveConversation = require('./leaveConversation');
const { polls } = require('./polls');
const { likes } = require('./likes');
const { messages } = require('./messages');
const { feedback } = require('./feedback');
const { users } = require('./users');


module.exports = {
  findDebate,
  castVote,
  spectate,
  leaveConversation,
  polls,
  likes,
  messages,
  feedback,
  users
};
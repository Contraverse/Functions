const { findDebate } = require('./findDebate');
const { castVote } = require('./castVote');
const { findSpectate } = require('./spectate');
const leaveConversation = require('./leaveConversation');
const { createPoll } = require('./createPoll');
const { polls } = require('./polls');
const { likes } = require('./likes');
const { messages } = require('./messages');
const { feedback } = require('./feedback');


module.exports = {
  findDebate,
  castVote,
  findSpectate,
  leaveConversation,
  createPoll,
  polls,
  likes,
  messages,
  feedback
};
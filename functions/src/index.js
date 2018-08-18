const { findDebate } = require('./findDebate');
const { castVote } = require('./castVote');
const { findSpectate } = require('./findSpectate');
const leaveConversation = require('./leaveConversation');
const { createPoll } = require('./createPoll');
const { polls } = require('./polls');

module.exports = { findDebate, castVote, findSpectate, leaveConversation, createPoll, polls };
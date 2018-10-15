const { isValidDebate, isValidAnswer } = require('./debate');
const { isValidPoll } = require('./poll');
const { isValidUser } = require('./user');
const { validateRequest } = require('./validateRequest');

module.exports = { isValidDebate, isValidPoll, isValidUser, isValidAnswer, validateRequest };
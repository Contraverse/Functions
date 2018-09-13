const request = require('supertest');
const { api } = require('..');
const { removePoll } = require('./utils');
const { createPoll } = require('../src/polls/methods');

const { QUESTION, ANSWERS } = require('./testData');

describe('Get Polls', () => {
  var POLL_ID;
  before(() => {
    return createPoll(QUESTION, ANSWERS)
      .then(id => POLL_ID = id);
  });

  after(() => {
    return removePoll(POLL_ID);
  });

  it('should get polls', () => {
    return request(api)
      .get('/polls')
      .expect(200)
  })
});
const chai = require('chai');
const chaiHttp = require('chai-http');
const { api } = require('..');
const { removePoll } = require('./utils');
const { createPoll } = require('../src/polls/methods');

const { QUESTION, ANSWERS } = require('./testData');
chai.use(chaiHttp);
const { assert, request } = chai;

describe('Get Polls', () => {
  let POLL_ID;
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
      .then(res => {
        assert.equal(res.status, 200);
      })
  })
});
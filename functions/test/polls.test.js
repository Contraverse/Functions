const { assert } = require('chai');
const { removePoll } = require('./utils');

const { getPolls } = require('../src/polls');
const { createPoll } = require('../src/polls');

const { QUESTION, ANSWERS } = require('./testData');

describe('Get Polls', () => {
  var POLL_ID;
  before(() => {
    return createPoll(QUESTION, ANSWERS)
      .then(id => POLL_ID = id);
  })

  after(() => {
    return removePoll(POLL_ID);
  })

  it('should get polls', () => {
    return getPolls();
  })

  // describe('HTTP', () => {
  //   it('should get polls', () => {
  //
  //   })
  // })
})
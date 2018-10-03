const chai = require('chai');
const chaiHttp = require('chai-http');
const admin = require('firebase-admin');
const { api } = require('..');
const adminUsers = require('../config/adminUsers');
const { createPoll } = require('../src/polls/methods');
const { removePoll } = require('./utils');

chai.use(chaiHttp);
const { assert, request } = chai;

const { QUESTION, ANSWERS, NEW_QUESTION, NEW_ANSWERS } = require('./testData');


describe('Admin', () => {
  var POLL_ID, USER, PASSWORD;

  before(() => {
    USER = Object.keys(adminUsers)[0];
    PASSWORD = adminUsers[USER];
    return createPoll(QUESTION, ANSWERS)
      .then(id => POLL_ID = id);
  });

  after(() => {
    return removePoll(POLL_ID);
  });

  describe('Authentication', () => {
    it('should be unauthenticated', () => {
      return request(api)
        .get('/admin')
        .then(res => {
          assert.equal(res.status, 401);
        });
    });

    it('should be unauthenticated in subpaths', () => {
      return request(api)
        .delete(getPollPath())
        .then(res => {
          assert.equal(res.status, 401);
        })
    });

    it('should be authenticated', () => {
      return request(api)
        .get('/admin')
        .auth(USER, PASSWORD)
        .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Welcome to Admin!');
        });
    })
  });

  describe('Accept Poll', () => {
    it('should accept the poll', () => {
      const db = admin.firestore();
      return request(api)
        .put(getPollPath())
        .auth(USER, PASSWORD)
        .send({ question: NEW_QUESTION, answers: NEW_ANSWERS })
        .then(res => {
          assert.equal(res.status, 200);
          return db.doc(`Polls/${POLL_ID}`)
            .get()
        })
        .then(doc => {
          const poll = doc.data();
          assert.equal(poll.pending, false);
          assert.equal(poll.title, NEW_QUESTION);
          assert.deepEqual(poll.answers, NEW_ANSWERS);
        })
    })
  });

  describe('Delete Poll', () => {
    it('should remove a poll', () => {
      const db = admin.firestore();
      return request(api)
        .delete(getPollPath())
        .auth(USER, PASSWORD)
        .then(res => {
          assert.equal(res.status, 200);
          return Promise.all([
            db.doc(`Polls/${POLL_ID}`).get(),
            db.doc(`Results/${POLL_ID}`).get()
          ])
        })
        .then(([poll, results]) => {
          assert.isFalse(poll.exists);
          assert.isFalse(results.exists);
        })
    })
  });

  function getPollPath() {
    return `/admin/polls/${POLL_ID}`;
  }
});
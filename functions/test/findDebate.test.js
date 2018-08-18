const { assert } = require('chai');
const admin = require('firebase-admin');

const projectConfig = {
  projectId: 'controverse-f770c',
  databaseURL: 'https://controverse-f770c.firebaseio.com'
};

const findDebate = require('../src/findDebate')._findDebate;
const createPoll = require('../src/createPoll')._createPoll;
const { removePoll } = require('./utils');

const { QUESTION, ANSWERS, USER_ID, OPPONENT_ID } = require('./testData');

describe('Find Debate', () => {
  var pollID;
  before(() => {
    return createPoll(QUESTION, ANSWERS)
      .then(id => pollID = id);
  });

  after(() => {
    return removePoll(pollID);
  });

  describe('Test Queue', () => {
    var answer = 0;
    after(() => {
      return admin.firestore()
        .doc(`Polls/${pollID}/Queue${answer}/${USER_ID}`)
        .delete();
    });

    it('should add a user to the queue', () => {
      const db = admin.firestore();
      return findDebate(USER_ID, pollID, answer)
        .then(({ found }) => {
          assert.isFalse(found);
          return db.collection(`Polls/${pollID}/Queue${answer}`).get()
        }).then(snapshot => {
          const queue = snapshot.docs;
          assert.equal(queue.length, 1);
          assert.equal(queue[0].id, USER_ID);
          return true;
        })
    })
  });

  describe('Test Debate Room', () => {
    var answer = 0;
    var opponentAnswer = 1;
    after(() => {
      const db = admin.firestore();
      return db.collection('Debates')
        .where('pollID', '==', pollID).get()
        .then(snapshot => {
          const batch = db.batch();
          snapshot.forEach(doc => batch.delete(doc.ref));
          return batch.commit();
        })
    });

    it('should create a debate room', () => {
      const db = admin.firestore();
      return findDebate(USER_ID, pollID, answer)
        .then(() => findDebate(OPPONENT_ID, pollID, opponentAnswer))
        .then(({ found }) => {
          assert.isTrue(found);
          return db.collection('Debates')
            .where('pollID', '==', pollID).get()
        }).then(snapshot => {
          const debates = snapshot.docs;
          assert.equal(debates.length, 1);

          const debate = debates[0].data();
          assert.equal(debate.pollID, pollID);
          assert.equal(debate.lastMessage, "New Debate!");
          assert.deepEqual(debate.users, { [USER_ID]: true, [OPPONENT_ID]: true });
          return true;
        })
    })
  })
});
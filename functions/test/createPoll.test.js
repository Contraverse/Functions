const { assert } = require('chai');
const admin = require('firebase-admin');
const { removePoll } = require('./utils');

const projectConfig = {
  projectId: 'controverse-f770c',
  databaseURL: 'https://controverse-f770c.firebaseio.com'
};

const test = require('firebase-functions-test')(projectConfig, 'config/auth.json');
const functions = require('../index');

const QUESTION = 'What is your favorite color';
const ANSWERS = ['Red', 'Blue'];

describe('Create Poll', () => {
  var pollID;

  after(() => {
    test.cleanup();

    if (pollID)
      removePoll(pollID);
    else
      console.log('pollID not set');
  });

  it('should create a poll', (done) => {
    const setID = (id) => {
      pollID = id
    };

    const req = {
      body: {
        question: QUESTION,
        answers: ANSWERS
      }
    };
    const res = {
      send: (id) => {
        setID(id);
        const db = admin.firestore();
        const pollRef = db.doc(`Polls/${pollID}`);
        return pollRef.get()
          .then(doc => {
            const poll = doc.data();
            assert.equal(poll.title, QUESTION);
            assert.deepEqual(poll.answers, ANSWERS);
            return pollRef.collection('Queues').get();
          }).then(snapshot => {
            assert.equal(snapshot.docs.length, ANSWERS.length);
            return Promise.all([
              pollRef.collection('Results').doc('totalVotes').get(),
              pollRef.collection('Results').doc('genderVotes').get(),
            ]);
          }).then(docs => {
            const target = Array(ANSWERS.length).fill(0);
            assert.deepEqual(docs[0].data().counts, target);
            assert.deepEqual(docs[1].data().male, target);
            assert.deepEqual(docs[1].data().female, target);
            return done();
          })
      }
    };

    return functions.createPoll(req, res);
  })
});



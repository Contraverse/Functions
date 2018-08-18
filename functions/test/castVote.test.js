const { assert } = require('chai');
const admin = require('firebase-admin');

const projectConfig = {
  projectId: 'controverse-f770c',
  databaseURL: 'https://controverse-f770c.firebaseio.com'
};
admin.initializeApp(projectConfig);

const { removePoll, removeUser } = require('./utils');
const castVote = require('../src/castVote')._castVote;
const createPoll = require('../src/createPoll')._createPoll;
const createUser = require('../src/createUser')._createUser;

const { QUESTION, ANSWERS, GENDER, AVATAR, USERNAME, USER_ID } = require('./testData');

describe('Case Vote', () => {
  var pollID;

  before(() => {
    return createUser(USER_ID, AVATAR, GENDER, USERNAME)
      .then(() => createPoll(QUESTION, ANSWERS))
      .then(id => pollID = id)
  });

  after(() => {
    removePoll(pollID);
    removeUser(USER_ID);
  });

  it('should case a vote', () => {
    const answer = 0;
    return castVote(USER_ID, pollID, answer)
      .then(() => {
        const db = admin.firestore();
        const userRef = db.doc(`Profiles/${USER_ID}`);
        const totalVotesRef = db.doc(`Results/${pollID}`);

        return Promise.all([
          userRef.collection('Polls').doc(pollID).get(),
          totalVotesRef.get(),
        ])
      }).then(docs => {
        const targetVotes = [1, 0];

        const userPolls = docs[0].data();
        assert.deepEqual(userPolls, { answer });

        const totalVotes = docs[1].data();
        assert.deepEqual(totalVotes.counts, targetVotes);

        return true;
      })
  })
});
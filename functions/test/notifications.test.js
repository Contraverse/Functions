const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { api } = require('..');
const sendPollNotifications = require('../src/notifications/polls/methods').sendNotification;
const sendMessageNotifications = require('../src/notifications/chat/methods').sendNotification;
const { createDocument, removeDocument, generateAuthHeader } = require('./utils');


chai.use(chaiHttp);
const { assert, request } = chai;
const { USER_ID, OPPONENT_ID, TOKEN, DEBATE_ID, USERNAME, POLL_ID, QUESTION } = require('./testData');

describe('Notifications', () => {
  before(() => {
    return createDocument(`Profiles/${USER_ID}`);
  });

  describe('Tokens', () => {
    after(() => {
      return removeDocument(getTokenRef());
    });

    it('should submit a token', () => {
      return request(api)
        .post(`/users/${USER_ID}/notifications`)
        .send({ token: TOKEN })
        .then(res => {
          assert.equal(res.status, 200);
          return getTokenRef().get();
        }).then(doc => {
          assert.equal(doc.data().token, TOKEN);
        })
    });

    it('should delete a token', () => {
      return request(api)
        .delete(`/users/${USER_ID}/notifications`)
        .then(res => {
          assert.equal(res.status, 200);
          return getTokenRef().get();
        }).then(doc => {
          assert.isFalse(doc.exists);
        })
    })
  });


  describe('Notifications', () => {
    const db = admin.firestore();
    const TOKEN = 'FAKE_TOKEN';

    before(() => {
      const batch = db.batch();

      batch.set(getUserRef(), { username: USERNAME });
      batch.set(db.doc(`Debates/${DEBATE_ID}`), {
        users: {
          [USER_ID]: { username: USERNAME },
          [OPPONENT_ID]: { username: USERNAME }
        },
        pollID: POLL_ID
      });
      batch.set(db.doc(`Polls/${POLL_ID}`), { title: QUESTION });
      batch.set(db.doc(`Tokens/${USER_ID}`), { token: TOKEN });

      return batch.commit();
    });

    after(() => {
      const batch = db.batch();

      batch.delete(getUserRef());
      batch.delete(db.doc(`Debates/${DEBATE_ID}`));
      batch.delete(db.doc(`Polls/${POLL_ID}`));
      batch.delete(db.doc(`Tokens/${USER_ID}`));

      return batch.commit();
    });

    it('should send a poll notification (no fcm testing)', () => {
      const deliverNotification = sinon.stub();
      return sendPollNotifications(DEBATE_ID, USER_ID, POLL_ID, { deliverNotification })
        .then(() => db.getAll(getUserRef(), getPollNotificationsRef()))
        .then(([userDoc, notificationDoc]) => {
          const user = userDoc.data();
          const notificationCount = notificationDoc.data().count;

          assert.equal(user.notifications, 1);
          assert.equal(notificationCount, 1);
        })
    });

    it('should clear the poll notifications', () => {
      return request(api)
        .post(`/polls/${POLL_ID}/notifications`)
        .set('Authorization', generateAuthHeader(USER_ID))
        .then(res => {
          assert.equal(res.status, 200);
          return db.getAll(getUserRef(), getPollNotificationsRef());
        }).then(([userDoc, notificationDoc]) => {
          const user = userDoc.data();

          assert.equal(user.notifications, 0);
          assert.isFalse(notificationDoc.exists);
        })
    });

    it('should send a message notification (no fcm testing)', () => {
      const deliverNotification = sinon.stub();
      const message = {
        userID: OPPONENT_ID,
        text: 'FAKE_MESSAGE'
      };

      return sendMessageNotifications(DEBATE_ID, message, { deliverNotification })
        .then(() => db.getAll(getUserRef(), getDebateNotificationsRef()))
        .then(([userDoc, notificationDoc]) => {
          const user = userDoc.data();
          const notificationCount = notificationDoc.data().count;

          assert.equal(user.notifications, 1);
          assert.equal(notificationCount, 1);
        })
    });

    it('should clear the message notifications', () => {
      return request(api)
        .post(`/debates/${DEBATE_ID}/notifications`)
        .set('Authorization', generateAuthHeader(USER_ID))
        .then(res => {
          assert.equal(res.status, 200);
          return db.getAll(getUserRef(), getPollNotificationsRef());
        }).then(([userDoc, notificationDoc]) => {
          const user = userDoc.data();

          assert.equal(user.notifications, 0);
          assert.isFalse(notificationDoc.exists);
        })
    });

    function getPollNotificationsRef() {
      return db.doc(`Profiles/${USER_ID}/Notifications/${POLL_ID}`);
    }

    function getDebateNotificationsRef() {
      return db.doc(`Profiles/${USER_ID}/Notifications/${DEBATE_ID}`);
    }

    function getUserRef() {
      return db.doc(`Profiles/${USER_ID}`);
    }
  })
});

function getTokenRef() {
  return admin.firestore()
    .doc(`Tokens/${USER_ID}`);
}

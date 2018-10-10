const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { api } = require('..');
const { sendNotification } = require('../src/debates/notifications/methods');
const { createDocument, removeDocument, generateAuthHeader } = require('./utils');


chai.use(chaiHttp);
const { assert, request } = chai;
const { USER_ID, TOKEN, DEBATE_ID, USERNAME, POLL_ID, QUESTION } = require('./testData');

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


  describe('Message Notifications', () => {
    const db = admin.firestore();
    const TOKEN = 'FAKE_TOKEN';

    before(() => {
      const batch = db.batch();

      batch.set(getUserRef(), { username: USERNAME });
      batch.set(db.doc(`Debates/${DEBATE_ID}`), { test: true });
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

    it('should send a notification (no fcm testing)', () => {
      const deliverNotification = sinon.stub();
      return sendNotification(DEBATE_ID, USER_ID, POLL_ID, { deliverNotification })
        .then(() => db.getAll(getUserRef(), getNotificationsRef()))
        .then(([userDoc, notificationDoc]) => {
          const user = userDoc.data();
          const notificationCount = notificationDoc.data().count;

          assert.equal(user.notifications, 1);
          assert.equal(notificationCount, 1);
        })
    });

    it('should clear the notifications', () => {
      return request(api)
        .post(`/debates/${DEBATE_ID}/notifications`)
        .set('Authorization', generateAuthHeader(USER_ID))
        .then(res => {
          assert.equal(res.status, 200);
          return db.getAll(getUserRef(), getNotificationsRef());
        }).then(([userDoc, notificationDoc]) => {
          const user = userDoc.data();

          assert.equal(user.notifications, 0);
          assert.isFalse(notificationDoc.exists);
        })
    });

    function getNotificationsRef() {
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

const chai = require('chai');
const admin = require('firebase-admin');
const { api } = require('..');
const updateUsersinDebates = require('../src/users/background').helpers._updateUserDocsInDebates;
const { createUser } = require('../src/users/methods');
const { removeUser } = require('./utils');

chai.use(require('chai-http'));
const { assert, request } = chai;
const { USER_ID, AVATAR, USERNAME, DEBATE_ID } = require('./testData');

describe('Users', () => {
  const db = admin.firestore();

  describe('POST', () => {
    after(() => {
      return removeUser(USER_ID);
    });

    it('should create a user', () => {
      return request(api)
        .post('/users')
        .send({ userID: USER_ID, username: USERNAME })
        .then(res => {
          assert.equal(res.status, 200);
          return getUser();
        }).then(user => {
          assert.equal(user.username, USERNAME);
          assert.property(user, 'avatar');
        })
    })
  });

  describe('PUT', () => {
    beforeEach(() => {
      return createUser(USER_ID, AVATAR, USERNAME)
    });

    afterEach(() => {
      return removeUser(USER_ID)
    });

    it('should update an avatar', () => {
      const newAvatar = 'NEW NAME';
      return request(api)
        .put(`/users/${USER_ID}`)
        .send({ avatar: newAvatar })
        .then(res => {
          assert.equal(res.status, 200);
          return getUser()
        }).then(user => {
          assert.equal(user.avatar, newAvatar);
          assert.equal(user.username, USERNAME);
        })
    });

    it('should update a username', () => {
      const newUsername = 'NEW NAME';
      return request(api)
        .put(`/users/${USER_ID}`)
        .send({ username: newUsername })
        .then(res => {
          assert.equal(res.status, 200);
          return getUser()
        }).then(user => {
          assert.equal(user.avatar, AVATAR);
          assert.equal(user.username, newUsername);
        })
    })
  });

  describe('Background', () => {
    const NEW_AVATAR = 'FAKE_NEW_AVATAR';
    before(() => {
      const doc = {
        users: {
          [USER_ID]: { update: true, avatar: AVATAR, username: USERNAME }
        }
      };

      return getDebateRef().set(doc);
    });

    after(() => {
      return getDebateRef().delete();
    });

    it('should update the debate', () => {
      const newUser = { avatar: NEW_AVATAR, username: USERNAME };
      return updateUsersinDebates(USER_ID, newUser)
        .then(() => getDebateRef().get())
        .then(doc => {
          assert.equal(doc.data().users[USER_ID].avatar, NEW_AVATAR);
        })
    });

    function getDebateRef() {
      return db.doc(`Debates/${DEBATE_ID}`);
    }
  })

});

function getUser() {
  const ref = admin.firestore()
    .doc(`Profiles/${USER_ID}`);
  return ref.get()
    .then(doc => doc.data());
}
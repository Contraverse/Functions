const { assert } = require('chai');
const admin = require('firebase-admin');
const request = require('supertest');
const { api } = require('..');
const { createUser } = require('../src/users/methods');
const { removeUser } = require('./utils');

const { USER_ID, AVATAR, USERNAME } = require('./testData');

describe('Users', () => {
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
  })
});

function getUser() {
  const ref = admin.firestore()
    .doc(`Profiles/${USER_ID}`);
  return ref.get()
    .then(doc => doc.data());
}
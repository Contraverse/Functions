const admin = require('firebase-admin');
const { assert, request, use } = require('chai');
const chaiHttp = require('chai-http');
const { api } = require('..');
const { createDocument, removeDocument } = require('./utils');
const { USER_ID, TOKEN } = require('./testData');

use(chaiHttp);

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
    })
  })
});

function getTokenRef() {
  return admin.firestore()
    .doc(`Tokens/${USER_ID}`);
}

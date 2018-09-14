const { assert, use, request } = require('chai');
const chaiHttp = require('chai-http');
const admin = require('firebase-admin');
const { api } = require('..');

use(chaiHttp);

describe('Feedback', () => {
  var UID;
  const MESSAGE = "I think the app is really cool";
  after(() => {
    return admin.storage()
      .bucket().file(getPath())
      .delete();
  });

  it('should send a feeback', () => {
    return request(api)
      .post('/feedback')
      .send({ message: MESSAGE })
      .then(res => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body.uid);

        UID = res.body.uid;
        return admin.storage()
          .bucket().file(getPath())
          .download()
          .then(([file]) => {
            assert.equal(file.toString(), MESSAGE);
          })
      })
  });

  function getPath() {
    return `feedback/${UID}.txt`;
  }
});
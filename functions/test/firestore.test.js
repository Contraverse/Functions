const { assert } = require('chai');
const admin = require('firebase-admin');
require('..');

describe('Firestore', () => {
  const PATHS = ['Test1/doc1', 'Test2/doc2', 'Test3/doc3'];
  before(() => {
    const db = admin.firestore();
    const batch = db.batch();
    PATHS.forEach(path => batch.set(db.doc(path), { test: true }));
    return batch.commit();
  });

  after(() => {
    const db = admin.firestore();
    const batch = db.batch();
    PATHS.forEach(path => batch.delete(db.doc(path)));
    return batch.commit();
  });

  it('should get multiple documents', () => {
    const db = admin.firestore();
    const docs = PATHS.map(path => db.doc(path));
    return db.getAll(...docs).then(docs => {
      docs.forEach(doc => {
        assert.deepEqual(doc.data(), { test: true });
      })
    })
  });

  it('should not throw an error on a weird query', () => {
    const db = admin.firestore();
    const query = db.collection('Avatars')
      .where('x.y.z', '==', true);

    return query.get()
      .then(snapshot => {
        assert.equal(snapshot.docs.length, 0);
      });
  })
});
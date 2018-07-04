const admin = require('firebase-admin');

module.exports = function(req, res) {
    const { userID, pollID } = req.body;
    const db = admin.firestore();
    return db.runTransaction(t => {
        let debates = null;
        return t.get();
    })
}
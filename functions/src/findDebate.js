const admin = require('firebase-admin');

module.exports = function(req, res) {
    const { userID, pollID, category } = req.body;

    const db = admin.firestore();
    const queueRef = db.doc(`Polls/${pollID}/Queues/queues`);
    return db.runTransaction(t => {
        let categories = null;
        let response = null;
        return t.get(queueRef).then(queueSnapshot => {
            categories = queueSnapshot.data();
            const opponentCategory = Object.keys(categories).find(c => c !== category);

            if(categories[opponentCategory].length > 0) {
                const opponentID = categories[opponentCategory].shift();
                response = { found: true, opponentID };
                return Promise.all([
                    t.update(queueRef, categories),
                    setupChatroom(t, db, userID, opponentID, pollID)]);
            }
            else {
                categories[category].push(userID);
                response = { found: false };
                return t.update(queueRef, categories);
            }
        }).then(() => {
            return res.send(JSON.stringify(response));
        });
    })
}

function setupChatroom(t, db, userID, opponentID, pollID) {
    const debate = {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessage: "New Debate!",
        users: {
            [userID]: true,
            [opponentID]: true
        }
    }
    const ref = db.collection('Debates').doc();
    console.log(ref.id);
    return Promise.all([
        t.set(ref, debate),
        t.set(db.doc(`Polls/${pollID}/Debates/${ref.id}`), { active: true })]);
}
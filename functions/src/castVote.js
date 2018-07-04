const firebase = require('firebase-admin');

module.exports = function (req, res) {
    const { userID, pollID, categoryID} = req.body;
    const db = firebase.firestore();
    const userRef = db.collection('Profiles').doc(userID);
    const resultsRef = db.collection('Polls').doc(pollID).collection('Results');
    const totalVotesRef = resultsRef.doc('totalVotes');
    const genderVotesRef = resultsRef.doc('genderVotes');
    return db.runTransaction(t => {
        let user = null;
        let totalVotes = null;
        let genderVotes = null;
        return t.get(userRef).then(doc => {
            user = doc.data();
            return Promise.all([
                t.get(totalVotesRef),
                t.get(genderVotesRef)]);
        }).then(docs => {
            totalVotes = docs[0].data();
            genderVotes = docs[1].data();

            totalVotes.counts[categoryID]++;
            genderVotes[user.gender][categoryID]++;

            return Promise.all([
                t.update(totalVotesRef, totalVotes),
                t.update(genderVotesRef, genderVotes),
                t.set(userRef.collection('Polls').doc(pollID), { category: categoryID })]);
        }).then(() => {
            return res.send('Success');
        })
    })
}
const admin = require('firebase-admin');

function sendMessages(debateID, messages) {
  const db = admin.firestore();
  const batch = db.batch();
  const chatRef = db.doc(`Debates/${debateID}`);
  const messagesRef = chatRef.collection('Messages');
  messages.forEach(message => {
    message.likes = 0;
    batch.set(messagesRef.doc(), message);
  });
  batch.update(chatRef, { lastMessage: messages[messages.length - 1].text });
  return batch.commit();
}

function formatMessages(messages) {
  if (messages === undefined || messages === null)
    return [];
  if (messages.constructor === Array)
    return messages;
  return [messages];
}

module.exports = { sendMessages, formatMessages };
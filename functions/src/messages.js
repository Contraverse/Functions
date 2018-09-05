const admin = require('firebase-admin');

function messages(req, res) {
  const { debateID } = req.query;
  const messages = formatMessages(req.body.messages);
  if(debateID === undefined)
    return res.status(400).send('No debate ID');
  if(messages.length === 0)
    return res.status(400).send('No messages');

  return sendMessages(debateID, messages)
    .then(() => res.status(200).send('OK'));
}

function sendMessages(debateID, messages) {
  const db = admin.firestore();
  const batch = db.batch();
  const chatRef = db.doc(`Debates/${debateID}`);
  const messagesRef = chatRef.collection('Messages');
  messages.forEach(message => {
    message.likes = 0;
    batch.set(messagesRef.doc(), message);
  })
  batch.update(chatRef, { lastMessage: messages[messages.length - 1].text });
  return batch.commit();
}

function formatMessages(messages) {
  if(messages === undefined || messages === null)
    return [];
  if(messages.constructor === Array)
    return messages;
  return [messages];
}

module.exports = { messages, sendMessages };
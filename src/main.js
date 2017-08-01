const irc = require('irc');
const Conversation = require('watson-developer-cloud/conversation/v1');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');

const client = new irc.Client('irc.chat.twitch.tv', config.twitch.username, {
  channels: [`${config.twitch.channel} ${config.twitch.password}`],
  debug: false,
  password: config.twitch.password,
  username: config.twitch.username,
});

const conversation = new Conversation({
  username: config.conversation.username,
  password: config.conversation.password,
  url: config.conversation.url,
  path: { workspace_id: config.conversation.workspace_id },
  version_date: Conversation.VERSION_DATE_2017_04_21,
});

let from = '';
function processResponse(err, response) {
  if (err) {
    console.log(err);
    return;
  }

  client.say(config.twitch.channel, response.output.text[0]);

  MongoClient.connect('mongodb://localhost:27017/tc-db').then(function (db) {
    db.collection('chatters').update({ username: from }, { username: from, context: response.context }, { upsert: true });
  }).catch(function (err) {
    console.log(err);
  });
}

function sendToConversation(messageSender, message) {
  MongoClient.connect('mongodb://localhost:27017/tc-db')
    .then(function (db) {
      db.collection('chatters').findOne({ username: messageSender })
        .then(function (results) {
          if (results === null) {
            conversation.message({
              input: { text: message },
            }, processResponse);
          } else {
            conversation.message({
              input: { text: message },
              context: results.context,
            }, processResponse);
          }
        });
    }).catch(function (err) {
      console.log(err);
    });
}

conversation.message({}, processResponse);

client.addListener('message', (messageSender, messageRecipient, message) => {
  from = messageSender;
  const parsedMessage = message.toLowerCase().trim();

  if (parsedMessage.includes(config.twitch.username)) {
    sendToConversation(messageSender, parsedMessage.replace(config.twitch.username));
  }
});

client.addListener('error', (err) => {
  console.log(err);
});

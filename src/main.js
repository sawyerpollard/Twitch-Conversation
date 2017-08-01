const irc = require('irc');
const Conversation = require('watson-developer-cloud/conversation/v1');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');

const conversation = new Conversation({
  username: config.conversation.username,
  password: config.conversation.password,
  url: config.conversation.url,
  path: { workspace_id: config.conversation.workspace_id },
  version_date: Conversation.VERSION_DATE_2017_04_21,
});

const client = new irc.Client('irc.chat.twitch.tv', config.twitch.username, {
  channels: [`${config.twitch.channel} ${config.twitch.password}`],
  debug: false,
  password: config.twitch.password,
  username: config.twitch.username,
});

function processRequest(username, message) {
  function processResponse(err, response) {
    if (err) {
      console.log(err);
      return;
    }
    client.say(config.twitch.channel, response.output.text[0]);

    MongoClient.connect(config.mongodb.url).then(function (db) {
      db.collection(config.mongodb.collection).update({ username },
        { username, context: response.context }, { upsert: true });
    }).catch(function (err) {
      console.log('MONGODB ERROR: ', err);
      process.exit(1);
    });
  }

  MongoClient.connect(config.mongodb.url)
    .then(function (db) {
      db.collection(config.mongodb.collection).findOne({ username })
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
      console.log('MONGODB ERROR:', err);
      process.exit(1);
    });
}

client.addListener('message', (username, recipient, message) => {
  if (username === config.twitch.username) return;

  const parsedMessage = message.toLowerCase().trim();
  if (parsedMessage.includes(config.twitch.username)) {
    processRequest(username, parsedMessage.replace(config.twitch.username, ''));
  }
});

client.addListener('error', (err) => {
  console.log('IRC ERROR: ', err);
});

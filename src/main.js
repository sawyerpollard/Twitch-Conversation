const IRC = require('irc');
const Conversation = require('watson-developer-cloud/conversation/v1');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');

const ConversationClient = new Conversation({
  username: config.conversation.username,
  password: config.conversation.password,
  url: config.conversation.url,
  path: { workspace_id: config.conversation.workspace_id },
  version_date: Conversation.VERSION_DATE_2017_04_21,
});

const IRCClient = new IRC.Client('irc.chat.twitch.tv', config.twitch.username, {
  channels: [`${config.twitch.channel} ${config.twitch.password}`],
  debug: false,
  password: config.twitch.password,
  username: config.twitch.username,
});

// START: Listen for IRC messages
IRCClient.addListener('message', (username, recipient, raw_message) => {
  let message = raw_message.toLowerCase().trim();
  if (username === config.twitch.username || !message.includes(`@${config.twitch.username}`)) return;
  message = message.replace(`@${config.twitch.username}`, '');

  function processResponse(err, response) {
    if (err) {
      console.log('CONVERSATION ERROR: ', err);
      return;
    }
    if (response.output.actions === 'anything_else') return;

    if (response.output.actions === 'donation_request') {
      let donationValue = 0;
      if (!(typeof response.entities[0] === 'undefined')) {
        donationValue = Number(response.entities[0].value);
      }
      response.context.personalDonationTotal += donationValue;

// START: Set overall donation total
      MongoClient.connect(config.mongodb.url)
        .then(function (db) {
          db.collection(config.mongodb.collection).update({ overallDonationTotal: { $type: 'number' } },
            { $inc: { overallDonationTotal: donationValue } }, { upsert: true });
        }).catch(function (err) {
          console.log('MONGODB ERROR:', err);
          process.exit(1);
        });
// END
    }

// START: Set context
    MongoClient.connect(config.mongodb.url)
      .then(function (db) {
        db.collection(config.mongodb.collection).update({ username },
          {
            $set: { context: response.context },
            $setOnInsert: { username },
          },
          { upsert: true });
      }).catch(function (err) {
        console.log('MONGODB ERROR: ', err);
        process.exit(1);
      });
// END

// START: Check actions and output response
    if (response.output.actions === 'overall_donation_total_request') {
      MongoClient.connect(config.mongodb.url)
        .then(function (db) {
          db.collection(config.mongodb.collection).findOne({ overallDonationTotal: { $type: 'number' } })
            .then(function (results) {
              IRCClient.say(config.twitch.channel, `@${username} $${results.overallDonationTotal} has been donated to the streamer overall.`);
            });
        }).catch(function (err) {
          console.log('MONGODB ERROR:', err);
          process.exit(1);
        });
    } else {
      IRCClient.say(config.twitch.channel, `@${username} ${response.output.text[0]}`);
    }
// END
  }

// START: Send message to Conversation
  MongoClient.connect(config.mongodb.url)
    .then(function (db) {
      db.collection(config.mongodb.collection).findOne({ username })
        .then(function (results) {
          if (results === null) {
            ConversationClient.message({
              input: { text: message },
            }, processResponse);
          } else {
            ConversationClient.message({
              input: { text: message },
              context: results.context,
            }, processResponse);
          }
        });
    }).catch(function (err) {
      console.log('MONGODB ERROR:', err);
      process.exit(1);
    });
// END
});
// END

IRCClient.addListener('error', (err) => {
  console.log('IRC ERROR: ', err);
});

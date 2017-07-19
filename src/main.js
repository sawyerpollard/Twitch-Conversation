const irc = require('irc');
const Conversation = require('watson-developer-cloud/conversation/v1');
const settings = require('./settings.json');
const { LatestContext } = require('./latestcontext');
const { TwitchAPIGetter } = require('./twitchapigetter');

const latestcontext = new LatestContext();

const client = new irc.Client('irc.chat.twitch.tv', settings.twitch.username, {
  channels: [`${settings.twitch.channel} ${settings.twitch.password}`],
  debug: false,
  password: settings.twitch.password,
  username: settings.twitch.username,
});

const conversation = new Conversation({
  username: settings.conversation.username,
  password: settings.conversation.password,
  url: 'https://gateway.watsonplatform.net/conversation/api',
  path: { workspace_id: settings.conversation.workspace_id },
  version_date: Conversation.VERSION_DATE_2017_04_21,
});

function processResponse(err, response) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Response: ' + response.output.text[0]);
  if (response.output.text[0] === 'display_online_mods') {
    client.say(settings.twitch.channel, TwitchAPIGetter.getModList(settings.twitch.channel));
  } else {
    client.say(settings.twitch.channel, response.output.text[0]);
  }
  latestcontext.setContext(response.context);
}

conversation.message({}, processResponse);

client.addListener('message', (from, to, message) => {
  conversation.message({ input: { text: message }, context: latestcontext.getContext() }, processResponse);
  console.log('IRC Recieved Message: ' + message);
});

client.addListener('error', (message) => {
  console.log('Error!');
  console.error(message);
});

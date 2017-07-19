const irc = require('irc');
const Conversation = require('watson-developer-cloud/conversation/v1');
const http = require('http');
const credentials = require('./credentials.json');
let { LatestContext } = require('./latestcontext');

const settings = {
  channels: [credentials.twitch.channel],
  server: 'irc.chat.twitch.tv',
  password: credentials.twitch.password,
  port: 6607,
  secure: false,
  nick: credentials.twitch.nick,

};

let latestcontext = new LatestContext();

function getModList() {
  const url = `http://tmi.twitch.tv/group/user/${credentials.twitch.nick}/chatters`;

  let modList = 'There are no moderators in the chat.';

  http.get(url, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      const modListJSON = JSON.parse(body);

      if (!modListJSON.chatters.moderators.length === 1) {
        modList = 'Online Mods: ';

        for (let i = 0; i < modListJSON.chatters.moderators.length; i++) {
          if (i === modListJSON.chatters.moderators.length - 1) {
            modList = modList.concat(modListJSON.chatters.moderators[i]);
          } else {
            modList = modList.concat(`${modListJSON.chatters.moderators[i]}, `);
          }
        }
      }
    });
  }).on('error', (e) => {
    console.log('Error!');
    console.error(e);
  });
  return modList;
}

const client = new irc.Client(settings.server, settings.nick, {
  channels: [`${settings.channels} ${settings.password}`],
  debug: false,
  password: settings.password,
  username: settings.nick,
});

const conversation = new Conversation({
  username: credentials.conversation.username,
  password: credentials.conversation.password,
  url: 'https://gateway.watsonplatform.net/conversation/api',
  path: { workspace_id: credentials.conversation.workspace_id },
  version_date: Conversation.VERSION_DATE_2017_04_21,
});

function processResponse(err, response) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Response: ' + response.output.text[0]);
  if (response.output.text[0] === 'display_online_mods') {
    client.say(credentials.twitch.channel, getModList());
  } else {
    client.say(credentials.twitch.channel, response.output.text[0]);
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

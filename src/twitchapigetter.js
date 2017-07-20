const http = require('http');
const settings = require('./settings.json');

exports.TwitchAPIGetter = class TwitchAPIGetter {
  static getModList() {
    const url = 'http://tmi.twitch.tv/group/user/con23vb123ot/chatters';

    let modList = 'There are no moderators in the chat.';

    http.get(url, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const modListJSON = JSON.parse(body);
        if (modListJSON.chatters.moderator == null) {
          modList = 'Cannot get mod list.';
        } else if (!modListJSON.chatters.moderators.length === 1) {
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
};

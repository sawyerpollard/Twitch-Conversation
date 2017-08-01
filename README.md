# twitch-conversation
An asynchronous NodeJS app connecting IBM Watson's Conversation and Twitch

# Features
Listens to messages in Twitch chat channels and feeds them to the Conversation service.

Replies with the Conversation response through a connected bot.

Connects to MongoDB to store conversation context for each user.

# Installation
Download the repository and then type "npm install" while in the 'src/' directory.

# Setup
Create and run a MongoDB server. Then create a new database with a new collection.

Create a 'config.json' file in the 'src/' directory. Follow the format below:
```
{
    "twitch": {
        "username": "(Bot's Twitch account username here)",
        "channel": "(Twitch channel for bot to join, prefixed with hastag aka. pound aka. # symbol)",
        "password": "(Bot's Twitch OAuth password here. Find it at http://www.twitchapps.com/tmi/ )"
    },
    "conversation": {
        "username": "(Conversation username here)",
        "password": "(Conversation password)",
        "workspace_id": "(Conversation workspace_id)",
        "url": "(Conversation url)"
    },
    "mongodb": {
        "url": "mongodb://(Address to MongoDB server here, localhost if on same computer as app):(Port, default is 27017)/(MongoDB database name here)",
        "collection": "(MongoDB collection name here)"
    }
}
```


# Usage
You can now start the app by typing "npm start" while in the 'src/' directory.
The bot responds to Twitch messages that contain the Twitch username of the bot.

# twitch-conversation
An asynchronous NodeJS app connecting IBM Watson's Conversation and Twitch

# Features
Listens to messages in Twitch chat channels and feeds them to the Conversation service.

Connects to MongoDB to store conversation context for each user.

# Installation
Download the repository and then type "npm install" while in the 'src/' directory.

# Setup
Create and run a MongoDB server.

Create a 'config.json' file in the 'src/' directory. Follow the format below:
```
{
    "twitch": {
        "username": "(Bot's username here)",
        "channel": "(Channel for bot to join, prefixed with hastag aka. pound aka. # symbol)",
        "password": "(Twitch OAuth password here. Find it at http://www.twitchapps.com/tmi/ )"
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

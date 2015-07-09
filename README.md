# node-telegram-bot
An event driven plugin based NodeJS Telegram Bot.

## Quick Start
To start, set up a bot from <a href="http://telegram.me/botfather">@BotFather</a> and store the key in an environment variable `$TELEGRAM_TOKEN` or alternatively edit the key in `app.js`. Then run `node app.js` or alternatively `nodemon` to begin.

Make sure you get the npm packages first via `npm install`!

## Advanced Configuration
node-telegram-bot utilizes <a href="https://github.com/mast/telegram-bot-api">telegram-bot-api</a> by mast, therefore expects the same parameters to the bot. You can change the default parameters in `app.js`.

## Plugins
This bot utilizes plugins to extend its features. They are stored as `*.js` files in the plugins folder. There are two parts to a plugin: 

1. An `init` function that is called when the bot is started
2. An array of `regex` & a `regexHandler` to handle incoming matches. 

Both can be used either or both at the same time. The only difference is that `regex` and `regexHandler` are only called after the `text-message` event is emitted.

A sample plugin can be found in the `./plugins` folder. 

## Logging
The bot utilizes <a href="https://github.com/winstonjs/winston">Winston</a> logger to log chats and errors. Chat and `info` logs will end up in `./logs/chat.log` while `warn` and `error` will be output via `STDIN`.

## Events
#### Bot startup
Start up events are emitted in the following order: 

1. `bot-starting`
2. `bot-started`
3. `plugins-loading`
  1. `plugin-PLUGIN_NAME-loaded`
4. `plugins-loaded`

#### Payload type handlers
One of the following may be emitted depending on the type of payload received. The original <a href="https://core.telegram.org/bots/api#message">Message</a> object and the Telegram client is returned with each event. For `received-reply` event, the `reply_to_message` property is provided as the first parameter.

1. `received-service-notification`
2. `received-message`
3. `received-forward`
4. `received-reply`

#### Message handlers
One of the following may be emitted depending on the type of message received. The message, the original Message object and the Telegram client is returned with each event.

1. `text-message`
2. `document-message`
3. `photo-message`
4. `sticker-message`
5. `video-message`
6. `contact-message`
7. `location-message`

## Prerequisites

1. NodeJS
2. npm 

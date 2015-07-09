var util = require('util');
var plugin = function () {
    var me = this;
    this.init = function (bot) {
        me.botIdentity = bot._self;
    };

    this.regex = [
        /\/(hello)/,
        /\/(boobs)/,
        /\/(butts)/,
        /\/(spam)/,
        /\/(cake)/
    ];

    this.regexHandler = function (matches, msg, client) {
        if (!util.isArray(matches)) {
            return;
        }

        var command = matches[1].toUpperCase();
        if (command.match(/spam/i)) {
            var occurance = getRandomInt(3,20);
            for (var i=0;i<occurance;i++) {
                sendPrivateReply(STRINGS.SPAM(msg), msg, client);
            }
        } else  if (STRINGS[command]) {
            sendGroupReply(STRINGS.get(command, msg, me.botIdentity, client), msg, client);
        }
    };

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function sendGroupReply(response, msg, client) {
        client.sendMessage({
            chat_id: msg.chat.id,
            text: response
        });
    };

    function sendPrivateReply(response, msg, client) {
        client.sendMessage({
            chat_id: msg.from.id,
            text: response
        });
    };
};

var STRINGS = new (function () {
    this.get = function (cmd, msg, bot, client) {
        return this[cmd].apply(this, [msg, bot, client]);
    };
    this.HELLO = function (msg, bot) {
        return util.format("Hello @%s, I'm %s.", msg.from.username, bot.username);
    };
    this.BOOBS = function (msg) {
        return util.format("No boobs for you @%s!", msg.from.username);
    };
    this.BUTTS = function (msg) {
        return util.format("No butts for you @%s!", msg.from.username);
    };
    this.CAKE = function (msg) {
        return "The cake is a lie";
    };
    this.SPAM = function (msg) {
        return "STOP SPAMMING ME /spam@"+msg.from.username;
    }
    this.DEFAULT = function (msg, bot) { return ""; };
})();

module.exports = new plugin();
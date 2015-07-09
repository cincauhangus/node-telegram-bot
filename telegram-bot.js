var fs = require('fs');
var util = require('util');
var winston = require('winston');

var TelegramApi = require('telegram-bot-api');
var RequireDir = require('require-dir');

var logger = new (winston.Logger)({
    levels: {
        error:99,
        warn:98,
        info:97,
        chat:1
    },
    transports: [
      new (winston.transports.Console)({ level: 'warn' }),
      new (winston.transports.File)({ name:'chat-log', filename: 'logs/chat.log', level: 'info' })
    ]
  });
var TelegramBot = function (params) {
    var me = this;
    me._started = false;
    me._plugins = {};
    
    me.start = function () {
        me.emit('bot-starting');
        me.tgClient = new TelegramApi(params);
        
        me.tgClient.getMe(function (err, msg) {
            if (err) throw err;
            me._started = true;
            me._self = msg;
            
            me.tgClient.on('message', payloadHandler);
            startPlugins();
            me.emit('bot-started', me.tgClient);
            
//             me.on('spam-ok', messageHandler);
        });
    } 
    
//     me.spamLimit = 3;
//     me.spamDuration = 15; //seconds
//     me.banDuration = 60; //seconds
//     me.spamHandler = function (msg) {
//         me.spamCounter = me.spamCounter || {};
//         var template = {firstMsg: 0, countSince: 0};
//         var id = msg.from.id+msg.chat.id;
//         
//         if (!me.spamCounter[id]) {
//             me.spamCounter[id] = template;
//         }
// 
//         if (msg.date-me.spamCounter[id].firstMsg < me.spamDuration) {
//             me.spamCounter[id].countSince++;
//         } else if (me.spamCounter[id].countSince > me.spamLimit && 
//             msg.date-me.spamCounter[id].firstMsg < me.banDuration) {
//             me.spamCounter[id].countSince++;
//         } else {
//             me.spamCounter[id] = template;
//             me.spamCounter[id].firstMsg = msg.date;
//         }
// 
//         if (me.spamCounter[id].countSince > me.spamLimit) {
//             var payload = {
//                 who:msg.from.id, 
//                 where:msg.chat.id, 
//                 count:me.spamCounter[id].countSince, 
//                 started:me.spamCounter[id].firstMsg, 
//                 last:msg.date
//             };
//             me.emit('spam-found', payload, msg);
//             return;
//         }
//         return msg;
//     }
    
    var plainMessageHandler = function (text, msg, client) {
        function processRegex(regex, plugin) {
            var matches = text.match(regex);
            if (util.isArray(matches)) {
                plugin.regexHandler(matches, msg, client);
            }
        };

        for (var key in me._plugins) {
            try {
                var plugin = me._plugins[key];
                if (util.isRegExp(plugin.regex)) {
                    processRegex(plugin.regex, plugin);
                } else if (util.isArray(plugin.regex)) {
                    for (var i=0;i<plugin.regex.length;i++) {
                        if (util.isRegExp(plugin.regex[i])) {
                            processRegex(plugin.regex[i], plugin);
                        }
                    }
                }
            } catch (e) {
                logger.warn("PLUGIN FAILED", {plugin_name:key, error:"Unable to execute RegExp on plainMessageHandler"});
            }
        }
    }

    var startPlugins = function () {
        var plugins = RequireDir('./plugins');
        me.emit("plugins-loading", Object.keys(plugins), plugins);
        for (var key in plugins) {
            try {
                var plugin = plugins[key];
                if (plugin.init || (plugin.regex && plugin.regexHandler)) {
                    plugin.init && plugin.init(me);
                    me._plugins[key] = plugin;
                    me.emit("plugin-"+key+"-loaded");
                } else {
                    throw new Error("Plugin doesn't contain an init function or a regex pattern");
                }
            } catch(err) {
                logger.warn("PLUGIN FAILED", {plugin_name: key, error:err.message});
            }
        }        
        me.emit("plugins-loaded", Object.keys(me._plugins), me._plugins);
    }
    
    var isServiceNotification = function (msg) {
        if (msg.new_chat_participant || msg.left_chat_participant || msg.new_chat_title || 
            msg.new_chat_photo || msg.delete_chat_photo || msg.group_chat_created) {
            return true;
        }
        return false;
    }
    
    var payloadHandler = function (msg) {
        /* log handler */
        logger.chat(msg.text, {payload:msg, msg_timestamp:msg.date, user:msg.from.username, chat:msg.chat.id});
    
        /* spam handler */
//         var msg_clone = msg;
//         me.emit('spam-checking', msg);
//         msg = me.spamHandler(msg);
//         if (!msg) {
//             me.emit('spam-detected', msg_clone);
//             return;
//         }
//         me.emit('spam-ok', msg);
        
        messageHandler(msg);
    };
    
    var messageHandler = function (msg) {
        /* validate intended recipient & strip off */
        
    
        /* message type events */
        if (isServiceNotification(msg)) {
            me.emit('received-service-notification', msg, me.tgClient);
        } else {
            me.emit('received-message', msg, me.tgClient);   
        
            if (msg.forward_from && msg.forward_date) {
                me.emit('received-forward', msg, me.tgClient);
            }
            
            if (msg.reply_to_message) {
                me.emit('received-reply', msg.reply_to_message, msg.text, msg, me.tgClient);
            }
        }     
        
        /* message content events */
        if (msg.text) {
            me.emit('text-message', msg.text, msg, me.tgClient);
            plainMessageHandler(msg.text, msg, me.tgClient);
        }
        
        if (msg.document) {
            me.emit('document-message', msg.document, msg, me.tgClient);
        }
        
        if (msg.photo) {
            me.emit('photo-message', msg.photo, msg, me.tgClient);
        }
        
        if (msg.sticker) {
            me.emit('sticker-message', msg.sticker, msg, me.tgClient);
        }
        
        if (msg.video) {
            me.emit('video-message', msg.video, msg, me.tgClient);
        }
        
        if (msg.contact) {
            me.emit('contact-message', msg.contact, msg, me.tgClient);
        }
        
        if (msg.location) {
            me.emit('location-message', msg.location, msg, me.tgClient);
        }
    };
};

util.inherits(TelegramBot, TelegramApi);
module.exports = TelegramBot;

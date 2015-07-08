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
      new (winston.transports.File)({ name:'chat-log', filename: 'logs/chat.log', level: 'chat' })
    ]
  });
var TelegramBot = function (params) {
    var me = this;
    me._started = false;
    me._plugins = {};
    
    me.start = function () {
        me.emit('botstarting');
        me.tgClient = new TelegramApi(params);
        
        me.tgClient.getMe(function (err, msg) {
            if (err) throw err;
            me._started = true;
            me._self = msg;
            
            me.tgClient.on('message', payloadHandler);
            startPlugins();
            me.emit('botstarted', me.tgClient);
            
            me.on('text-message', plainMessageHandler);
        });
    } 
    
    me.spamHandler = function (msg) {}
    
    var plainMessageHandler = function (text, msg, client) {
        function processRegex(regex, plugin) {
            var matches = text.match(regex);
            if (util.isArray(matches)) plugin.regexHandler(matches, msg, client);
        };
        for (var key in me._plugins) {
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
            
        }
    }

    var startPlugins = function () {
        var plugins = RequireDir('./plugins');        
        me.emit("pluginsloading", Object.keys(plugins), plugins);
        for (var key in plugins) {
            try {
                var plugin = plugins[key];
                if (plugin.init || plugin.regex) {
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
        me.emit("pluginsloaded");
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
        me.spamHandler(msg);
    
        /* message type events */
        if (isServiceNotification(msg)) {
            me.emit('recieved-service-notification', msg, me.tgClient);
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
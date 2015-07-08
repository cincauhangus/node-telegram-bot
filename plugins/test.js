var plugin = function () {
    this.init = function (bot) {
        console.log("Plugin initialization completed.");
    };
    this.regex = [/\/test/];
    this.regexHandler = function (matches, msg, bot) {
        console.log("Handling regex match.");
        bot.sendMessage({
            chat_id: msg.from.id,
            text: "Test is successful"
        })
    };
}

module.exports = new plugin();
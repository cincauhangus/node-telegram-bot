var plugin = function () {
    this.init = function (bot) {
        console.log("TEST: Plugin initialization completed.");
    };
    this.regex = [/\/test/];
    this.regexHandler = function (matches, msg, bot) {
        console.log("TEST: Handling regex match.");
        bot.sendMessage({
            chat_id: msg.from.id,
            text: "Test is successful"
        })
    };
}

module.exports = new plugin();
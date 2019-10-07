const request = require("request-promise");

module.exports = {
    example: "subscribe #reddit to http://www.reddit.com/.rss",
    execute: async (message, client) => {
        let channel = message.guild.channels.get(message.args[0].substr(2, message.args[0].length - 3));
        if (!channel) channel = message.channel;

        const url = message.args.find((arg) => arg.startsWith("http"));
        if (!url) return message.channel.send("You didn't supply a URL!");

        const data = await request(url);
        if (data.toString().includes("<rss") || data.toString().includes("<feed")) {
            client.rssManager.subscribeTo(channel, url);
            return message.channel.send("Subscribed!");
        } else {
            return message.channel.send("I couldn't find any feed to subscribe to, sorry! I only recognize RSS feeds at the moment.");
        }
    }
};

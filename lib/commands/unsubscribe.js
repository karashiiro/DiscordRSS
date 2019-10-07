module.exports = {
    example: "unsubscribe #reddit from http://www.reddit.com/.rss",
    execute: async (message, client) => {
        let channel = message.guild.channels.get(message.args[0].substr(2, message.args[0].length - 3));
        if (!channel) channel = message.channel;

        const url = message.args.find((arg) => arg.startsWith("http"));
        if (!url) return message.channel.send("You didn't supply a URL!");

        client.rssManager.unsubscribeFrom(channel, url);
        return message.channel.send("Unsubscribed!");
    }
};

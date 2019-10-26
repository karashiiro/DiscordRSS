const { mod_roles } = require("../../config.json");

module.exports = {
    example: "unsubscribe #reddit from http://www.reddit.com/.rss",
    execute: async (message, client) => {
        let channel = message.guild.channels.get(message.args[0].substr(2, message.args[0].length - 3));
        if (!channel) channel = message.channel;

        const member = message.member || await channel.guild.fetchMember(message.author.id);

        // Permissions check
        if (!member.roles.some((r) => mod_roles.includes(r.name)))
            return console.log(`User ${message.author.tag} has insufficient permissions to subscribe to an RSS feed in guild` +
                ` ${channel.guild.name}.`);

        const url = message.args.find((arg) => arg.startsWith("http"));
        if (!url) return message.channel.send("You didn't supply a URL!");

        client.rssManager.unsubscribeFrom(channel, url);
        return message.channel.send("Unsubscribed!");
    }
};

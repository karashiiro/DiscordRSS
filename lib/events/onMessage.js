const compact = require("lodash.compact");

module.exports = async (client, message) => {
    // Validation
    if (!client) {
        return message.channel.send("No client.");
    }
    if (message.author.id === client.user.id) return;

    const { prefix } = require("../../config.json");
    if (!message.content.startsWith(prefix)) return;

    // Message breakdown
    message.args = compact(message.content.split(/\s+/g));
    const commandName = message.args[0].toLowerCase().slice(prefix.length);
    message.args = message.args.slice(1);

    // Fetch command
    let command;
    try {
        command = require(`../commands/${commandName}`);
    } catch {
        return;
    }

    // Run command
    command.execute(message, client)
};

module.exports.eventName = "message";

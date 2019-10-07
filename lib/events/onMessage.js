const commands = new Map();
const notCommands = new Map();

module.exports = async (client, message) => {
    // Validation
    if (!client) {
        return message.channel.send("No client.");
    }
    if (message.author.id === client.user.id) return;

    const { prefix } = require("../../config.json");
    if (!message.content.startsWith(prefix)) return;

    // Message breakdown
    message.args = message.content.split(/\s+/g);
    const commandName = message.args[0].toLowerCase().slice(prefix.length);
    message.args = message.args.slice(1);

    // Fetch command
    let command;
    if (commands.get(commandName)) {
        command = commands.get(commandName);
    } else if (notCommands.get(commandName)) {
        return;
    } else {
        try {
            command = require(`../commands/${commandName}`);
            commands.set(commandName, command);
        } catch {
            notCommands.set(commandName, true);
            return;
        }
    }

    // Run command
    command.execute(message, client)
};

module.exports.eventName = "message";

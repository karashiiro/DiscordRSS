// Dependencies
const Discord              = require("discord.js");

const onMessage            = require("./lib/events/onMessage");
const onReady              = require("./lib/events/onReady");

const RSSManager           = require("./lib/subsystem/RSSManager");

const ensureConfig         = require("./lib/util/ensureConfig");

// Config load/creation
const { token } = ensureConfig("./config.json");

// Bot client initialization
const client = new Discord.Client();

// Client events
client.events = [onMessage, onReady];
for (let i = 0; i < client.events.length; i++) {
    const e = client.events[i];
    const boundEvent = client.on(e.eventName, e.bind(null, client));
    // Replaces raw function with event listener
    client.events[i] = boundEvent;
}

// Log in and set up subsystems
client.login(token)
.then(() => {
    client.guild = client.guilds.first();
    client.rssManager = new RSSManager(client, "./rss");
})
.catch(console.error);

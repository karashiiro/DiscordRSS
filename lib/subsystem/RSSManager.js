const compact = require("lodash.compact");
const fs = require("fs");
const isEqual = require("lodash.isequal");
const moment = require("moment");
const path = require("path");
const RichEmbed = require("discord.js").RichEmbed;
const RSSParser = require("rss-parser");
const util = require("util");

const to = require("../util/to");

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

class RSSManager {
    constructor(client, folderLocation) {
        this.client = client;
        this.folderLocation = path.join(__dirname, "../..", folderLocation);

        this.rssParser = new RSSParser();

        if (!fs.existsSync(this.folderLocation)) {
            fs.mkdirSync(this.folderLocation);
        }

        this.feeds = [];

        this.load();
    }

    async subscribeTo(channel, url) {
        // Fetch current feed data
        const [err, feed] = await to(this.rssParser.parseURL(url));
        if (err) return message.channel.send(err.message + "!");

        // Get and sort all existing feeds
        let files = await readdir(this.folderLocation);
        files = files.sort((a, b) => {
            if (a === b) return 0;
            return a < b ? -1 : 1;
        });

        // If the feed in the supplied channel already exists then return
        for (const file of files) {
            const fileData = JSON.parse(await readFile(path.join(this.folderLocation, file)));
            if (fileData.channel === channel.id && fileData.url === url) {
                return;
            }
        }

        // Otherwise increment the filename by 1 to save it
        const nextFileName = files.length > 0 ? parseInt(files[files.length - 1].replace(/[^0-9]+/g, "")) + 1 + ".json" : "0.json";

        // Add it to the list of running feeds
        this.feeds.push(nextFileName);

        // Subscription format
        const feedData = {
            channel: channel.id,
            url,
            fileName: nextFileName,
            feed
        };

        // Save to disk
        await writeFile(path.join(this.folderLocation, nextFileName), JSON.stringify(feedData));

        // Add to RSS subscription rotation
        this.fetch(feedData);
    }

    async unsubscribeFrom(channel, url) {
        let files = await readdir(this.folderLocation);

        for (const file of files) {
            const fullPath = path.join(this.folderLocation, file);
            const fileData = JSON.parse(await readFile(fullPath));
            if (fileData.channel === channel.id && fileData.url === url) {
                this.feeds.splice(this.feeds.indexOf(file), 1);
                return await unlink(fullPath);
            }
        }
    }

    async load() {
        const files = (await readdir(this.folderLocation)).filter((fileName) => fileName.endsWith(".json"));
        for (const file of files) {
            const feedData = JSON.parse(await readFile(path.join(this.folderLocation, file)));
            this.feeds.push(file);
            this.fetch(feedData, true);
        }
    }

    async fetch(feedData, now) {
        setTimeout(async () => {
            if (this.feeds.indexOf(feedData.fileName) === -1) return;

            const channel = this.client.channels.get(feedData.channel);

            if (!channel) return;

            const [err, newFeed] = await to(this.rssParser.parseURL(feedData.url));
            if (err) channel.send(err.message + "!");

            // If there are new items
            if (!isEqual(feedData.feed.items, newFeed.items)) {
                // Filter for the new items
                const newItems = compact(newFeed.items.map((newItem) => {
                    const hasItem = feedData.feed.items.find((oldItem) => isEqual(oldItem, newItem));

                    if (!hasItem) {
                        return newItem;
                    }
                }));

                // Make Discord embeds for each one
                const embeds = await this.makeEmbeds(newItems, newFeed);
                for (const embed of embeds) {
                    // Send to the channel
                    channel.send(embed);
                }

                // Update the saved data
                feedData.feed = newFeed;
                await writeFile(path.join(this.folderLocation, feedData.fileName), JSON.stringify(feedData));
            }

            this.fetch(feedData);
        }, now ? 0 : 60000);
    }

    async makeEmbeds(items, feed) {
        const embeds = []

        for (const item of items) {
            let embed = new RichEmbed().setColor("ORANGE");

            if (item.author) embed = embed.setAuthor(item.author);
            if (item.category) embed = embed.addField("Category:", item.category);
            if (item.description) embed = embed.setDescription(item.description.slice(0, 2048));
            if (feed.image && feed.image.description) embed = embed.setFooter(feed.image.description);
            if (feed.image && feed.image.url) embed = embed.setImage(feed.image.url);
            if (item.link) {
                if (item.link.match(/(?:http).+(?::\/\/).+\..+/g)) {
                    embed = embed.setURL(item.link)
                } else {
                    embed = embed.setURL(feed.link)
                }
            };
            if (item.pubDate) {
                if (item.isoDate) {
                    embed = embed.setTimestamp(moment(item.isoDate).toDate());
                } else if (!item.pubDate.includes("+")) {
                    embed = embed.setTimestamp(moment(item.pubDate).toDate());
                } else {
                    embed = embed.setTimestamp(moment.utc(item.pubDate).toDate());
                }
            }
            if (item.title) embed = embed.setTitle(item.title.slice(0, 256));

            embeds.push(embed);
        }
        return embeds;
    }
}

module.exports = RSSManager;

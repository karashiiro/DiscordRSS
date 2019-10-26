# DiscordRSS
A simple bot that pumps RSS feeds into channels. It checks for feed updates every minute.

## Installation

Make sure you have a bot token for the Discord API.

Download the program and Node.js v10+, and run `npm install` to set it up. Then just run the batch file or `node .` to start it.

## Configuration
Set `mod_roles` in the configuration file generated on the first run to an array including roles authorized
to modify server clocks. This has some default values that may or may not work out of the box.

## Usage

Subscribe the current channel to a feed:
`^subscribe <RSS URL>`

Unsubscribe the current channel from a feed:
`^unsubscribe <RSS URL>`

Subscribe a channel to a feed:
`^subscribe <channel> <RSS URL>`

Unsubscribe a channel from a feed:
`^unsubscribe <channel> <RSS URL>`

Feeds are saved in `rss/`, so you can delete them manually if you want to (make sure to restart the bot if you do it this way!).
